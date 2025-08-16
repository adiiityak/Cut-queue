import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all shops with optional filtering and search
router.get('/', optionalAuth, async (req, res) => {
  const { 
    search, 
    latitude, 
    longitude, 
    radius = 50, // km
    sortBy = 'distance',
    limit = 20,
    offset = 0
  } = req.query;

  try {
    let query = `
      SELECT 
        s.id, s.name, s.description, s.phone, s.email,
        s.address, s.city, s.state, s.zip_code,
        s.latitude, s.longitude, s.business_hours,
        s.images, s.rating, s.total_reviews,
        s.created_at, s.updated_at,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('confirmed', 'in_progress')) as current_queue_size
    `;

    // Add distance calculation if coordinates provided
    if (latitude && longitude) {
      query += `, (
        6371 * acos(
          cos(radians($1)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(s.latitude))
        )
      ) as distance`;
    }

    query += `
      FROM barber_shops s
      LEFT JOIN appointments a ON s.id = a.shop_id 
        AND a.appointment_date = CURRENT_DATE
        AND a.status IN ('confirmed', 'in_progress')
      WHERE s.is_active = true
    `;

    const queryParams = [];
    let paramCount = 0;

    // Add coordinates to params if provided
    if (latitude && longitude) {
      queryParams.push(parseFloat(latitude), parseFloat(longitude));
      paramCount = 2;
    }

    // Add search filter
    if (search) {
      query += ` AND (s.name ILIKE $${++paramCount} OR s.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Add radius filter if coordinates provided
    if (latitude && longitude && radius) {
      query += ` AND (
        6371 * acos(
          cos(radians($1)) * cos(radians(s.latitude)) *
          cos(radians(s.longitude) - radians($2)) +
          sin(radians($1)) * sin(radians(s.latitude))
        )
      ) <= $${++paramCount}`;
      queryParams.push(parseFloat(radius));
    }

    query += ` GROUP BY s.id`;

    // Add sorting
    if (sortBy === 'distance' && latitude && longitude) {
      query += ` ORDER BY distance ASC`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY s.rating DESC, s.total_reviews DESC`;
    } else if (sortBy === 'queue') {
      query += ` ORDER BY current_queue_size ASC`;
    } else {
      query += ` ORDER BY s.name ASC`;
    }

    // Add pagination
    query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    // Get services for each shop
    const shops = await Promise.all(result.rows.map(async (shop) => {
      const servicesQuery = `
        SELECT s.id, s.name, s.description, s.duration_minutes, 
               ss.price, ss.is_available
        FROM services s
        JOIN shop_services ss ON s.id = ss.service_id
        WHERE ss.shop_id = $1 AND ss.is_available = true
        ORDER BY ss.price ASC
      `;
      
      const servicesResult = await pool.query(servicesQuery, [shop.id]);
      
      // Calculate estimated wait time based on queue and service times
      const avgServiceTime = servicesResult.rows.length > 0 
        ? servicesResult.rows.reduce((sum, s) => sum + s.duration_minutes, 0) / servicesResult.rows.length
        : 30; // default 30 minutes
      
      const estimatedWaitTime = shop.current_queue_size * avgServiceTime;

      return {
        ...shop,
        services: servicesResult.rows,
        currentWaitTime: Math.max(0, estimatedWaitTime),
        distance: shop.distance ? parseFloat(shop.distance).toFixed(1) : null
      };
    }));

    res.json({
      shops,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: shops.length
      }
    });

  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shops' 
    });
  }
});

// Get specific shop details
router.get('/:shopId', optionalAuth, async (req, res) => {
  const { shopId } = req.params;

  try {
    // Get shop details
    const shopQuery = `
      SELECT 
        s.id, s.name, s.description, s.phone, s.email,
        s.address, s.city, s.state, s.zip_code,
        s.latitude, s.longitude, s.business_hours,
        s.images, s.rating, s.total_reviews,
        s.created_at, s.updated_at,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('confirmed', 'in_progress')) as current_queue_size
      FROM barber_shops s
      LEFT JOIN appointments a ON s.id = a.shop_id 
        AND a.appointment_date = CURRENT_DATE
        AND a.status IN ('confirmed', 'in_progress')
      WHERE s.id = $1 AND s.is_active = true
      GROUP BY s.id
    `;

    const shopResult = await pool.query(shopQuery, [shopId]);

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Shop not found' 
      });
    }

    const shop = shopResult.rows[0];

    // Get services
    const servicesQuery = `
      SELECT s.id, s.name, s.description, s.duration_minutes, 
             ss.price, ss.is_available
      FROM services s
      JOIN shop_services ss ON s.id = ss.service_id
      WHERE ss.shop_id = $1 AND ss.is_available = true
      ORDER BY ss.price ASC
    `;
    
    const servicesResult = await pool.query(servicesQuery, [shopId]);

    // Get barbers
    const barbersQuery = `
      SELECT b.id, b.first_name, b.last_name, b.specialties, b.bio,
             b.rating, b.total_reviews, b.is_available
      FROM barbers b
      JOIN shop_barbers sb ON b.id = sb.barber_id
      WHERE sb.shop_id = $1 AND b.is_active = true
      ORDER BY b.rating DESC
    `;
    
    const barbersResult = await pool.query(barbersQuery, [shopId]);

    // Get recent reviews
    const reviewsQuery = `
      SELECT r.rating, r.comment, r.created_at,
             c.first_name, c.last_name
      FROM reviews r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.shop_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    
    const reviewsResult = await pool.query(reviewsQuery, [shopId]);

    // Calculate estimated wait time
    const avgServiceTime = servicesResult.rows.length > 0 
      ? servicesResult.rows.reduce((sum, s) => sum + s.duration_minutes, 0) / servicesResult.rows.length
      : 30;
    
    const estimatedWaitTime = shop.current_queue_size * avgServiceTime;

    res.json({
      ...shop,
      services: servicesResult.rows,
      barbers: barbersResult.rows,
      reviews: reviewsResult.rows,
      currentWaitTime: Math.max(0, estimatedWaitTime)
    });

  } catch (error) {
    console.error('Get shop details error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shop details' 
    });
  }
});

// Get shop availability for a specific date
router.get('/:shopId/availability', async (req, res) => {
  const { shopId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ 
      error: 'Date parameter is required' 
    });
  }

  try {
    // Get shop business hours
    const shopQuery = 'SELECT business_hours FROM barber_shops WHERE id = $1';
    const shopResult = await pool.query(shopQuery, [shopId]);

    if (shopResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Shop not found' 
      });
    }

    const businessHours = shopResult.rows[0].business_hours;

    // Get existing appointments for the date
    const appointmentsQuery = `
      SELECT appointment_time, estimated_end_time, status
      FROM appointments
      WHERE shop_id = $1 AND appointment_date = $2
      AND status IN ('confirmed', 'in_progress')
      ORDER BY appointment_time ASC
    `;

    const appointmentsResult = await pool.query(appointmentsQuery, [shopId, date]);

    res.json({
      date,
      businessHours,
      bookedSlots: appointmentsResult.rows,
      availableSlots: [] // This would be calculated based on business hours and booked slots
    });

  } catch (error) {
    console.error('Get shop availability error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shop availability' 
    });
  }
});

// Add a review for a shop (requires authentication)
router.post('/:shopId/reviews', authenticateUser, async (req, res) => {
  const { shopId } = req.params;
  const { rating, comment, serviceRating, valueRating, cleanlinessRating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ 
      error: 'Rating must be between 1 and 5' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if shop exists
    const shopCheck = await client.query(
      'SELECT id FROM barber_shops WHERE id = $1 AND is_active = true',
      [shopId]
    );

    if (shopCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Shop not found' 
      });
    }

    // Get customer ID
    const customerQuery = 'SELECT id FROM customers WHERE user_id = $1';
    const customerResult = await client.query(customerQuery, [req.user.userId]);

    if (customerResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Customer profile not found' 
      });
    }

    const customerId = customerResult.rows[0].id;

    // Check if customer has already reviewed this shop
    const existingReview = await client.query(
      'SELECT id FROM reviews WHERE shop_id = $1 AND customer_id = $2',
      [shopId, customerId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You have already reviewed this shop' 
      });
    }

    // Insert review
    const reviewId = uuidv4();
    await client.query(
      `INSERT INTO reviews (id, shop_id, customer_id, rating, comment, 
                           service_rating, value_rating, cleanliness_rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [reviewId, shopId, customerId, rating, comment, 
       serviceRating, valueRating, cleanlinessRating]
    );

    // Update shop rating
    const ratingUpdateQuery = `
      UPDATE barber_shops 
      SET rating = (
        SELECT ROUND(AVG(rating), 1)
        FROM reviews 
        WHERE shop_id = $1
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews 
        WHERE shop_id = $1
      )
      WHERE id = $1
    `;

    await client.query(ratingUpdateQuery, [shopId]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Review added successfully',
      reviewId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add review error:', error);
    res.status(500).json({ 
      error: 'Failed to add review' 
    });
  } finally {
    client.release();
  }
});

export default router;