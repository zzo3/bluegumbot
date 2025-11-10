const socket = new WebSocket("wss://bluegumbot-production.up.railway.app");

socket.onopen = () => {
  console.log("✅ WebSocket 已連線");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "message") {
    showMessage(data.text);
  }

  if (data.type === "effect") {
    triggerEffect(data.name, data.user);
  }

  if (data.type === "gameStatus") {
    updateGameStatus(data.game, data.cafeEnabled);
  }
};

socket.onerror = (err) => {
  console.error("❌ WebSocket 錯誤：", err);
};

socket.onclose = () => {
  console.warn("🔌 WebSocket 已關閉");
};

function showMessage(text) {
  const box = document.getElementById("messageBox");
  box.textContent = text;
  box.style.animation = "none";
  void box.offsetWidth;
  box.style.animation = "fadeInOut 5s ease-in-out";
}

function triggerEffect(name, user) {
  const layer = document.getElementById("effectLayer");
  const effect = document.createElement("div");
  effect.className = `effect-${name}`;
  effect.textContent = `${user} 觸發了 ${name} 特效！`;
  layer.appendChild(effect);
  setTimeout(() => layer.removeChild(effect), 4000);
}

function updateGameStatus(game, cafeEnabled) {
  const status = document.getElementById("gameStatus");
  status.textContent = `目前遊戲：${game}（Cafe 模式：${cafeEnabled ? "開啟" : "關閉"}）`;
}
