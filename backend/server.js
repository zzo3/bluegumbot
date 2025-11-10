import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 8080;

// 建立 HTTP server，確保 Railway 有健康檢查回應
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

// 建立 WebSocket server，掛在同一個 HTTP server 上
const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('[WS] New client connected');
  clients.add(ws);

  // 初始訊息
  ws.send(JSON.stringify({ type: 'info', message: 'Connected to overlay server' }));

  ws.on('message', (message) => {
    console.log('[WS] Received:', message.toString());

    // 廣播給所有 client
    for (const client of clients) {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`WS server on :${PORT}`);
});
