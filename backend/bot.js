// backend/bot.js

import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import {
  handleAnnouncement,
  handleAddCommand,
  handleOverlaySettings
} from './handlers.js';

dotenv.config();

console.log('[Bot] Starting bot.js...'); // 啟動診斷

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: PORT });

console.log(`[Bot] WebSocket server running on port ${PORT}`);

wss.on('connection', (ws) => {
  console.log('[Bot] Client connected');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('[Bot] Received:', msg);

      switch (msg.type) {
        case 'announcement':
          handleAnnouncement(msg, ws, wss);
          break;
        case 'addCommand':
          handleAddCommand(msg, ws);
          break;
        case 'overlaySettings':
          handleOverlaySettings(msg, ws, wss);
          break;
        default:
          console.warn('[Bot] Unknown message type:', msg.type);
      }
    } catch (err) {
      console.error('[Bot] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[Bot] Client disconnected');
  });
});
