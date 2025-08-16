import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import { authenticateUser, authorizeRole } from '../middleware/auth.js';
import { broadcastQueueUpdate } from '../utils/websocket.js';

const router = express.Router();

// Get user's appointments
router.get('/my-appointments', authenticateUser, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.estimated_end_time,
        a.status, a.total_price, a.notes, a.queue_position,
        a.created_at, a.updated_at,
        s.id as shop_id, s.name as shop_name, s.address as shop_address,
        s.phone as shop_phone,
        array_agg(
          json_build_object(
            'id', srv.id,
            'name', srv.name,
            'duration', srv.duration_minutes,
            'price', aps.price
          )
        ) as services
      FROM appointments a
      JOIN barber_shops s ON a.shop_id = s.id
      LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
      LEFT JOIN services srv ON aps.service_id = srv.id
      WHERE a.customer_id = (
        SELECT id FROM customers WHERE user_id = $1
      )
    `;

    const queryParams = [req.user.userId];
    let paramCount = 1;

    if (status) {
      query += ` AND a.status = $${++paramCount}`;
      queryParams.push(status);
    }

    query += `
      GROUP BY a.id, s.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    res.json({
      appointments: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appointments' 
    });
  }
});

// Book a new appointment
router.post('/', authenticateUser, authorizeRole(['customer']), async (req, res) => {
  const { 
    shopId, 
    serviceIds, 
    preferredDate, 
    preferredTime, 
    notes,
    barberId 
  } = req.body;

  if (!shopId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ 
      error: 'Shop ID and at least one service are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get customer ID
    const customerQuery = 'SELECT id FROM customers WHERE user_id = $1';
    const customerResult = await client.query(customerQuery, [req.user.userId]);

    if (customerResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Customer profile not found' 
      });
    }

    const customerId = customerResult.rows[0].id;

    // Validate shop exists
    const shopCheck = await client.query(
      'SELECT id, name FROM barber_shops WHERE id = $1 AND is_active = true',
      [shopId]
    );

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Shop not found' 
      });
    }

    // Get services and calculate total price and duration
    const servicesQuery = `
      SELECT s.id, s.name, s.duration_minutes, ss.price
      FROM services s
      JOIN shop_services ss ON s.id = ss.service_id
      WHERE s.id = ANY($1) AND ss.shop_id = $2 AND ss.is_available = true
    `;

    const servicesResult = await client.query(servicesQuery, [serviceIds, shopId]);

    if (servicesResult.rows.length !== serviceIds.length) {
      return res.status(400).json({ 
        error: 'Some services are not available at this shop' 
      });
    }

    const totalPrice = servicesResult.rows.reduce((sum, service) => sum + parseFloat(service.price), 0);
    const totalDuration = servicesResult.rows.reduce((sum, service) => sum + service.duration_minutes, 0);

    // Get current queue position
    const queueQuery = `
      SELECT COALESCE(MAX(queue_position), 0) + 1 as next_position
      FROM appointments
      WHERE shop_id = $1 AND appointment_date = COALESCE($2, CURRENT_DATE)
      AND status IN ('confirmed', 'pending')
    `;

    const queueResult = await client.query(queueQuery, [shopId, preferredDate]);
    const queuePosition = queueResult.rows[0].next_position;

    // Calculate estimated appointment time based on queue
    let appointmentDate = preferredDate || new Date().toISOString().split('T')[0];
    let appointmentTime = preferredTime;
    let estimatedEndTime = null;

    if (!appointmentTime) {
      // Calculate time based on queue position and average service time
      const avgServiceTime = 45; // minutes
      const estimatedStartMinutes = (queuePosition - 1) * avgServiceTime;
      const startTime = new Date();
      startTime.setHours(9, 0, 0, 0); // Assuming shops open at 9 AM
      startTime.setMinutes(startTime.getMinutes() + estimatedStartMinutes);
      appointmentTime = startTime.toTimeString().slice(0, 5);
    }

    if (appointmentTime) {
      const endTime = new Date(`${appointmentDate} ${appointmentTime}`);
      endTime.setMinutes(endTime.getMinutes() + totalDuration);
      estimatedEndTime = endTime.toTimeString().slice(0, 5);
    }

    // Create appointment
    const appointmentId = uuidv4();
    await client.query(
      `INSERT INTO appointments (
        id, customer_id, shop_id, barber_id, appointment_date, appointment_time,
        estimated_end_time, status, total_price, notes, queue_position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        appointmentId, customerId, shopId, barberId, appointmentDate,
        appointmentTime, estimatedEndTime, 'pending', totalPrice, notes, queuePosition
      ]
    );

    // Add appointment services
    for (const service of servicesResult.rows) {
      await client.query(
        'INSERT INTO appointment_services (appointment_id, service_id, price) VALUES ($1, $2, $3)',
        [appointmentId, service.id, service.price]
      );
    }

    await client.query('COMMIT');

    // Broadcast queue update
    broadcastQueueUpdate(shopId);

    // Get the created appointment with full details
    const appointmentQuery = `
      SELECT 
        a.*, s.name as shop_name, s.address as shop_address,
        array_agg(
          json_build_object(
            'id', srv.id,
            'name', srv.name,
            'duration', srv.duration_minutes,
            'price', aps.price
          )
        ) as services
      FROM appointments a
      JOIN barber_shops s ON a.shop_id = s.id
      JOIN appointment_services aps ON a.id = aps.appointment_id
      JOIN services srv ON aps.service_id = srv.id
      WHERE a.id = $1
      GROUP BY a.id, s.id
    `;

    const createdAppointment = await client.query(appointmentQuery, [appointmentId]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: createdAppointment.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Book appointment error:', error);
    res.status(500).json({ 
      error: 'Failed to book appointment' 
    });
  } finally {
    client.release();
  }
});

// Update appointment status (for barbers/admins)
router.put('/:appointmentId/status', authenticateUser, async (req, res) => {
  const { appointmentId } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get appointment details
    const appointmentQuery = `
      SELECT a.*, s.name as shop_name, c.user_id as customer_user_id
      FROM appointments a
      JOIN barber_shops s ON a.shop_id = s.id
      JOIN customers c ON a.customer_id = c.id
      WHERE a.id = $1
    `;

    const appointmentResult = await client.query(appointmentQuery, [appointmentId]);

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Appointment not found' 
      });
    }

    const appointment = appointmentResult.rows[0];

    // Check authorization
    if (req.user.role === 'customer' && appointment.customer_user_id !== req.user.userId) {
      return res.status(403).json({ 
        error: 'You can only modify your own appointments' 
      });
    }

    // Customers can only cancel their own appointments
    if (req.user.role === 'customer' && status !== 'cancelled') {
      return res.status(403).json({ 
        error: 'Customers can only cancel appointments' 
      });
    }

    // Update appointment
    await client.query(
      `UPDATE appointments 
       SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, notes, appointmentId]
    );

    // If cancelling, update queue positions
    if (status === 'cancelled') {
      await client.query(
        `UPDATE appointments 
         SET queue_position = queue_position - 1
         WHERE shop_id = $1 AND appointment_date = $2 
         AND queue_position > $3 AND status IN ('pending', 'confirmed')`,
        [appointment.shop_id, appointment.appointment_date, appointment.queue_position]
      );
    }

    await client.query('COMMIT');

    // Broadcast queue update
    broadcastQueueUpdate(appointment.shop_id);

    res.json({
      message: 'Appointment status updated successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update appointment status error:', error);
    res.status(500).json({ 
      error: 'Failed to update appointment status' 
    });
  } finally {
    client.release();
  }
});

// Get shop queue (for barbers/admins)
router.get('/shop/:shopId/queue', authenticateUser, async (req, res) => {
  const { shopId } = req.params;
  const { date } = req.query;

  try {
    // Verify user has access to this shop
    if (req.user.role === 'barber') {
      const barberShopCheck = await pool.query(
        `SELECT 1 FROM shop_barbers sb
         JOIN barbers b ON sb.barber_id = b.id
         WHERE b.user_id = $1 AND sb.shop_id = $2`,
        [req.user.userId, shopId]
      );

      if (barberShopCheck.rows.length === 0) {
        return res.status(403).json({ 
          error: 'Access denied to this shop' 
        });
      }
    }

    const appointmentDate = date || new Date().toISOString().split('T')[0];

    const queueQuery = `
      SELECT 
        a.id, a.appointment_time, a.estimated_end_time, a.status,
        a.total_price, a.notes, a.queue_position, a.created_at,
        c.first_name, c.last_name, c.phone,
        u.email as customer_email,
        array_agg(
          json_build_object(
            'id', srv.id,
            'name', srv.name,
            'duration', srv.duration_minutes,
            'price', aps.price
          )
        ) as services
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
      LEFT JOIN services srv ON aps.service_id = srv.id
      WHERE a.shop_id = $1 AND a.appointment_date = $2
      AND a.status IN ('pending', 'confirmed', 'in_progress')
      GROUP BY a.id, c.id, u.id
      ORDER BY a.queue_position ASC
    `;

    const result = await pool.query(queueQuery, [shopId, appointmentDate]);

    res.json({
      date: appointmentDate,
      queue: result.rows
    });

  } catch (error) {
    console.error('Get shop queue error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shop queue' 
    });
  }
});

// Cancel appointment
router.delete('/:appointmentId', authenticateUser, async (req, res) => {
  const { appointmentId } = req.params;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get appointment details
    const appointmentQuery = `
      SELECT a.*, c.user_id as customer_user_id
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      WHERE a.id = $1
    `;

    const appointmentResult = await client.query(appointmentQuery, [appointmentId]);

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Appointment not found' 
      });
    }

    const appointment = appointmentResult.rows[0];

    // Check authorization
    if (req.user.role === 'customer' && appointment.customer_user_id !== req.user.userId) {
      return res.status(403).json({ 
        error: 'You can only cancel your own appointments' 
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cannot cancel this appointment' 
      });
    }

    // Update appointment status to cancelled
    await client.query(
      'UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['cancelled', appointmentId]
    );

    // Update queue positions
    await client.query(
      `UPDATE appointments 
       SET queue_position = queue_position - 1
       WHERE shop_id = $1 AND appointment_date = $2 
       AND queue_position > $3 AND status IN ('pending', 'confirmed')`,
      [appointment.shop_id, appointment.appointment_date, appointment.queue_position]
    );

    await client.query('COMMIT');

    // Broadcast queue update
    broadcastQueueUpdate(appointment.shop_id);

    res.json({
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel appointment' 
    });
  } finally {
    client.release();
  }
});

export default router;