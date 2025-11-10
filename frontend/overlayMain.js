// overlayMain.js
const WS_URL = 'wss://bluegumbot-production.up.railway.app';
const chatDiv = document.getElementById('chat');

// 建立 WebSocket 連線
const ws = new WebSocket(WS_URL);

// 連線成功
ws.onopen = () => {
  console.log('[Overlay] Connected to WS');
  chatDiv.innerHTML += '<p class="open">[open] connected</p>';
};

// 收到訊息
ws.onmessage = (event) => {
  try {
    // 嘗試解析 JSON，如果不是 JSON 就顯示原始字串
    let parsed;
    try {
      parsed = JSON.parse(event.data);
    } catch {
      parsed = event.data;
    }

    if (typeof parsed === 'object' && parsed.message) {
      chatDiv.innerHTML += `<p class="msg">[msg] ${parsed.message}</p>`;
    } else {
      chatDiv.innerHTML += `<p class="msg">[msg] ${parsed}</p>`;
    }

    console.log('[Overlay] Message:', parsed);
  } catch (err) {
    console.error('[Overlay] Failed to parse message:', err);
    chatDiv.innerHTML += '<p class="error">[error] parse failed</p>';
  }
};

// 連線關閉
ws.onclose = () => {
  console.log('[Overlay] Disconnected');
  chatDiv.innerHTML += '<p class="close">[close] disconnected</p>';
};

// 錯誤處理
ws.onerror = (err) => {
  console.error('[Overlay] WebSocket error:', err);
  chatDiv.innerHTML += '<p class="error">[error] connection issue</p>';
};
