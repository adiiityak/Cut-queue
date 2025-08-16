import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import shopsRoutes from './routes/shops.js';
import appointmentsRoutes from './routes/appointments.js';
import usersRoutes from './routes/users.js';
import healthRoutes from './routes/health.js';

// Import database and utilities
import { initDatabase } from './config/database.js';
import { initWebSocketServer, broadcastQueueUpdate, broadcastToShop } from './utils/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// WebSocket Setup for real-time updates
const wss = new WebSocketServer({ server });

// Initialize WebSocket server reference for utilities
initWebSocketServer(wss);

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_queue':
          ws.shopId = data.shopId;
          ws.userId = data.userId;
          broadcastQueueUpdate(data.shopId);
          break;
          
        case 'leave_queue':
          broadcastQueueUpdate(data.shopId);
          break;
          
        case 'appointment_update':
          broadcastToShop(data.shopId, {
            type: 'appointment_update',
            appointment: data.appointment
          });
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// WebSocket broadcast functions are now in utils/websocket.js

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('Database connected successfully');
    
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();