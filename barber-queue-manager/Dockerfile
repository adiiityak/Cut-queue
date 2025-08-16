# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install bun
RUN npm install -g bun

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build frontend
RUN bun run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install bun in production image
RUN npm install -g bun

# Copy package files
COPY package.json bun.lock* ./

# Install production dependencies only
RUN bun install --production

# Copy backend source
COPY backend ./backend

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist ./dist

# Copy database files
COPY database ./database

# Create uploads directory
RUN mkdir -p uploads

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["bun", "run", "backend/server.js"]