import WebSocket from "ws";
import dotenv from "dotenv";
import { fetchCurrentGame } from "./twitch/twitchGameMonitor.js";
import { handleCommand } from "./public/chatCommands.js";
import { handleGameCommand } from "./public/gameCommands.js";

dotenv.config();

const port = process.env.PORT || 8080;
const wsServer = new WebSocket.Server({ port });

let cafeEnabled = true;
const bannedUsers = new Set();
const clients = new Set();

wsServer.on("connection", (socket) => {
  clients.add(socket);

  socket.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "banListUpdate") {
        bannedUsers.clear();
        data.bannedUsers.forEach(u => bannedUsers.add(u));
      }

      if (data.type === "cafeToggle") {
        cafeEnabled = data.enabled;
      }
    } catch (err) {
      console.error("接收到無效訊息：", err.message);
    }
  });

  socket.on("close", () => {
    clients.delete(socket);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// 每 60 秒查詢 Twitch 遊戲名稱
setInterval(async () => {
  try {
    const game = await fetchCurrentGame();
    cafeEnabled = game === "Not Monday Cafe";
    broadcast({ type: "gameStatus", game, cafeEnabled });
  } catch (err) {
    console.error("Twitch API 錯誤：", err.message);
  }
}, 60000);

// 模擬聊天室訊息處理（可接 Twitch IRC 或其他平台）
function onChat(user, message) {
  if (bannedUsers.has(user)) return;

  handleCommand(user, message, sendMessage, {
    enableEffects: true,
    maxConcurrentEffects: 3
  });

  handleGameCommand(user, message, sendMessage, cafeEnabled);
}

function sendMessage(text) {
  broadcast({ type: "message", text });
}

console.log(`✅ WebSocket server 已啟動於 port ${port}`);
