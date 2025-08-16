import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'queuecut',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database with schema and seed data
export async function initDatabase() {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('Database connection established');
    client.release();

    // Check if tables exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('Tables not found, creating database schema...');
      await createSchema();
      console.log('Database schema created successfully');
      
      // Only seed data in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Seeding database with sample data...');
        await seedDatabase();
        console.log('Database seeded successfully');
      }
    } else {
      console.log('Database tables already exist');
    }
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Check if required tables exist
async function checkTablesExist() {
  try {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const result = await pool.query(query);
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Create database schema
async function createSchema() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement.trim());
      }
    }
  } catch (error) {
    console.error('Error creating schema:', error);
    throw error;
  }
}

// Seed database with sample data
async function seedDatabase() {
  try {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seedData = await fs.readFile(seedPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = seedData.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement.trim());
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Utility functions for database queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  await pool.end();
  process.exit(0);
});