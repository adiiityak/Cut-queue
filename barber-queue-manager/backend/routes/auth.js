import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database.js';
import { 
  generateToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  authenticateUser 
} from '../middleware/auth.js';

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, role = 'customer' } = req.body;

  // Validation
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ 
      error: 'Email, password, first name, and last name are required' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Password must be at least 6 characters long' 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    await client.query(
      'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [userId, email.toLowerCase(), hashedPassword, role]
    );

    // Create customer or barber profile
    if (role === 'customer') {
      const customerId = uuidv4();
      await client.query(
        'INSERT INTO customers (id, user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5)',
        [customerId, userId, firstName, lastName, phone]
      );
    } else if (role === 'barber') {
      const barberId = uuidv4();
      await client.query(
        'INSERT INTO barbers (id, user_id, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5)',
        [barberId, userId, firstName, lastName, phone]
      );
    }

    await client.query('COMMIT');

    // Generate tokens
    const token = generateToken(userId, email, role);
    const refreshToken = generateRefreshToken(userId);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: {
        id: userId,
        email: email.toLowerCase(),
        role,
        firstName,
        lastName,
        phone
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register user. Please try again.' 
    });
  } finally {
    client.release();
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password are required' 
    });
  }

  try {
    // Get user with profile data
    const userQuery = `
      SELECT 
        u.id, u.email, u.password_hash, u.role, u.is_active,
        c.first_name as customer_first_name, c.last_name as customer_last_name, 
        c.phone as customer_phone, c.address as customer_address,
        b.first_name as barber_first_name, b.last_name as barber_last_name,
        b.phone as barber_phone
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      LEFT JOIN barbers b ON u.id = b.user_id
      WHERE u.email = $1
    `;

    const result = await pool.query(userQuery, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        error: 'Account has been deactivated' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Return user data based on role
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.role === 'customer' ? user.customer_first_name : user.barber_first_name,
      lastName: user.role === 'customer' ? user.customer_last_name : user.barber_last_name,
      phone: user.role === 'customer' ? user.customer_phone : user.barber_phone
    };

    if (user.role === 'customer' && user.customer_address) {
      userData.address = user.customer_address;
    }

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      error: 'Refresh token required' 
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get current user data
    const userQuery = 'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true';
    const result = await pool.query(userQuery, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid refresh token' 
      });
    }

    const user = result.rows[0];
    
    // Generate new tokens
    const newToken = generateToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token' 
    });
  }
});

// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userQuery = `
      SELECT 
        u.id, u.email, u.role, u.created_at,
        c.first_name as customer_first_name, c.last_name as customer_last_name, 
        c.phone as customer_phone, c.address as customer_address,
        b.first_name as barber_first_name, b.last_name as barber_last_name,
        b.phone as barber_phone, b.specialties, b.bio
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      LEFT JOIN barbers b ON u.id = b.user_id
      WHERE u.id = $1
    `;

    const result = await pool.query(userQuery, [req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const user = result.rows[0];
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      firstName: user.role === 'customer' ? user.customer_first_name : user.barber_first_name,
      lastName: user.role === 'customer' ? user.customer_last_name : user.barber_last_name,
      phone: user.role === 'customer' ? user.customer_phone : user.barber_phone
    };

    if (user.role === 'customer' && user.customer_address) {
      userData.address = user.customer_address;
    }

    if (user.role === 'barber') {
      userData.specialties = user.specialties;
      userData.bio = user.bio;
    }

    res.json({ user: userData });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile' 
    });
  }
});

// Logout endpoint (optional - mainly for client-side cleanup)
router.post('/logout', authenticateUser, (req, res) => {
  res.json({ 
    message: 'Logout successful' 
  });
});

export default router;