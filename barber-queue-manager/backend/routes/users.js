import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  const { 
    firstName, 
    lastName, 
    phone, 
    address, 
    city, 
    state, 
    zipCode,
    specialties, 
    bio 
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (req.user.role === 'customer') {
      // Update customer profile
      const updateQuery = `
        UPDATE customers 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            address = COALESCE($4, address),
            city = COALESCE($5, city),
            state = COALESCE($6, state),
            zip_code = COALESCE($7, zip_code),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $8
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        firstName, lastName, phone, address, city, state, zipCode, req.user.userId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Customer profile not found' 
        });
      }

    } else if (req.user.role === 'barber') {
      // Update barber profile
      const updateQuery = `
        UPDATE barbers 
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            specialties = COALESCE($4, specialties),
            bio = COALESCE($5, bio),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $6
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        firstName, lastName, phone, specialties, bio, req.user.userId
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Barber profile not found' 
        });
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  } finally {
    client.release();
  }
});

// Change password
router.put('/password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      error: 'Current password and new password are required' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      error: 'New password must be at least 6 characters long' 
    });
  }

  try {
    // Get current password hash
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [req.user.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.userId]
    );

    res.json({
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password' 
    });
  }
});

// Get user preferences
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const preferencesQuery = `
      SELECT preferences FROM users WHERE id = $1
    `;

    const result = await pool.query(preferencesQuery, [req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    res.json({
      preferences: result.rows[0].preferences || {}
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch preferences' 
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateUser, async (req, res) => {
  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ 
      error: 'Valid preferences object is required' 
    });
  }

  try {
    await pool.query(
      'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [JSON.stringify(preferences), req.user.userId]
    );

    res.json({
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      error: 'Failed to update preferences' 
    });
  }
});

// Upload profile image (placeholder - would integrate with cloud storage)
router.post('/profile-image', authenticateUser, async (req, res) => {
  // This would typically integrate with AWS S3, Cloudinary, etc.
  // For now, return a placeholder response
  
  res.json({
    message: 'Profile image upload endpoint (to be implemented with cloud storage)',
    imageUrl: 'https://via.placeholder.com/150'
  });
});

// Delete user account
router.delete('/account', authenticateUser, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ 
      error: 'Password confirmation is required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify password
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [req.user.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Incorrect password' 
      });
    }

    // Cancel all future appointments
    await client.query(
      `UPDATE appointments 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE customer_id IN (
         SELECT id FROM customers WHERE user_id = $1
       ) AND appointment_date >= CURRENT_DATE
       AND status IN ('pending', 'confirmed')`,
      [req.user.userId]
    );

    // Soft delete user account
    await client.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [req.user.userId]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: 'Failed to delete account' 
    });
  } finally {
    client.release();
  }
});

// Get user statistics (for dashboard)
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    if (req.user.role === 'customer') {
      // Customer statistics
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed_appointments,
          COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed')) as upcoming_appointments,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments,
          COALESCE(SUM(total_price) FILTER (WHERE status = 'completed'), 0) as total_spent
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        WHERE c.user_id = $1
      `;

      const result = await pool.query(statsQuery, [req.user.userId]);
      
      res.json({
        stats: result.rows[0]
      });

    } else if (req.user.role === 'barber') {
      // Barber statistics
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') as completed_appointments,
          COUNT(DISTINCT a.id) FILTER (WHERE a.status IN ('pending', 'confirmed', 'in_progress')) as upcoming_appointments,
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(DISTINCT r.id) as total_reviews
        FROM barbers b
        LEFT JOIN appointments a ON b.id = a.barber_id
        LEFT JOIN reviews r ON b.id = r.barber_id
        WHERE b.user_id = $1
      `;

      const result = await pool.query(statsQuery, [req.user.userId]);
      
      res.json({
        stats: result.rows[0]
      });
    }

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics' 
    });
  }
});

// Get user notifications
router.get('/notifications', authenticateUser, async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  try {
    const notificationsQuery = `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(notificationsQuery, [
      req.user.userId, 
      parseInt(limit), 
      parseInt(offset)
    ]);

    res.json({
      notifications: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications' 
    });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticateUser, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        error: 'Notification not found' 
      });
    }

    res.json({
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read' 
    });
  }
});

export default router;