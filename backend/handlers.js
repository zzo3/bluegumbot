// backend/handlers.js

export function handleAnnouncement(msg, ws, wss) {
  const { content, style } = msg;
  const payload = {
    type: 'announcement',
    content,
    style
  };

  // 廣播給所有連線的 overlay
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });

  console.log('[Handler] Announcement broadcasted:', payload);
}

export function handleAddCommand(msg, ws) {
  const { command, response } = msg;

  // 這裡可以儲存到記憶體或資料庫（未實作）
  console.log('[Handler] Command added:', command, '→', response);

  ws.send(JSON.stringify({
    type: 'confirm',
    message: `指令 ${command} 已新增`
  }));
}

export function handleOverlaySettings(msg, ws, wss) {
  const { fontSize, opacity } = msg;

  const payload = {
    type: 'overlaySettings',
    fontSize,
    opacity
  };

  // 廣播給所有 overlay
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });

  console.log('[Handler] Overlay settings broadcasted:', payload);
}
