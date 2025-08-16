// WebSocket utilities
let websocketServer = null;

// Initialize WebSocket server reference
export function initWebSocketServer(wss) {
  websocketServer = wss;
}

// Broadcast queue update to all clients for a specific shop
export function broadcastQueueUpdate(shopId) {
  if (!websocketServer) return;
  
  websocketServer.clients.forEach((client) => {
    if (client.readyState === 1 && client.shopId === shopId) {
      client.send(JSON.stringify({
        type: 'queue_update',
        shopId: shopId,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Broadcast data to all clients for a specific shop
export function broadcastToShop(shopId, data) {
  if (!websocketServer) return;
  
  websocketServer.clients.forEach((client) => {
    if (client.readyState === 1 && client.shopId === shopId) {
      client.send(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Broadcast to specific user
export function broadcastToUser(userId, data) {
  if (!websocketServer) return;
  
  websocketServer.clients.forEach((client) => {
    if (client.readyState === 1 && client.userId === userId) {
      client.send(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Get connected clients count for a shop
export function getShopClientsCount(shopId) {
  if (!websocketServer) return 0;
  
  let count = 0;
  websocketServer.clients.forEach((client) => {
    if (client.readyState === 1 && client.shopId === shopId) {
      count++;
    }
  });
  return count;
}