import { triggerEffect } from "./websocketBridge.js";
import { userPoints, adjustPoints } from "./utils.js";

let badwords = ["fuck", "shit", "bitch", "asshole", "cunt", "bastard", "dick", "damn"];
const warnedUsers = new Set();
const mutedUsers = new Map(); // user → timestamp
const bannedUsers = new Set(); // 永久封鎖名單

const bannedUsers = new Set(JSON.parse(localStorage.getItem("bannedUsers") || "[]"));

function updateBanListUI() {
  const list = document.getElementById("bannedUserList");
  list.innerHTML = "";
  bannedUsers.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    list.appendChild(li);
  });
}

document.getElementById("banUserBtn").onclick = () => {
  const user = document.getElementById("banUserInput").value.trim();
  if (user) {
    bannedUsers.add(user);
    localStorage.setItem("bannedUsers", JSON.stringify([...bannedUsers]));
    updateBanListUI();
  }
};

document.getElementById("unbanUserBtn").onclick = () => {
  const user = document.getElementById("unbanUserInput").value.trim();
  if (user) {
    bannedUsers.delete(user);
    localStorage.setItem("bannedUsers", JSON.stringify([...bannedUsers]));
    updateBanListUI();
  }
};

updateBanListUI();


// 嘗試載入 badwords.json
try {
  const response = await fetch("/badwords.json");
  if (response.ok) {
    const list = await response.json();
    if (Array.isArray(list)) badwords = list.map(w => w.toLowerCase());
  }
} catch (e) {
  console.warn("無法載入 badwords.json，使用預設清單");
}

const cooldowns = {};
const activeEffects = [];

function containsBadword(message) {
  const lower = message.toLowerCase();
  return badwords.some(word => lower.includes(word));
}

function handleCommand(user, message, sendMessage, config) {
  const now = Date.now();

  // 永久封鎖者無法執行任何指令
  if (bannedUsers.has(user)) return;

  // 髒話處理
  if (containsBadword(message)) {
    if (mutedUsers.has(user) && now < mutedUsers.get(user)) {
      return; // 已禁言中，忽略訊息
    }

    if (warnedUsers.has(user)) {
      mutedUsers.set(user, now + 10 * 60 * 1000); // 禁言 10 分鐘
      sendMessage(`${user} 已被禁言 10 分鐘，請保持友善 ☕`);
    } else {
      warnedUsers.add(user);
      sendMessage(`${user}，請注意用詞，這裡是友善的咖啡廳 ☕（再次違規將被禁言）`);
    }
    return;
  }

  // 若使用者在禁言中，忽略所有指令
  if (mutedUsers.has(user) && now < mutedUsers.get(user)) return;

  const [cmd, ...args] = message.trim().split(" ");

  // 管理指令（僅限管理員使用，可擴充驗證）
  if (cmd === "!ban" && args[0]) {
    bannedUsers.add(args[0]);
    sendMessage(`${args[0]} 已被永久封鎖 ❌`);
    return;
  }

  if (cmd === "!unban" && args[0]) {
    bannedUsers.delete(args[0]);
    sendMessage(`${args[0]} 已解除封鎖 ✅`);
    return;
  }

  // 點數查詢
  if (cmd === "!points") {
    sendMessage(`${user} 目前擁有 ${userPoints[user] || 0} 點`);
  }

  // 特效兌換
  if (cmd === "!redeem" && args.length > 0 && config.enableEffects) {
    const effect = args[0];
    const effectConfig = config.effects[effect];
    if (!effectConfig) return;

    if (cooldowns[user] && now - cooldowns[user] < effectConfig.cooldown * 1000) {
      sendMessage(`${user} 特效冷卻中，請稍後再試`);
      return;
    }

    if ((userPoints[user] || 0) < effectConfig.cost) {
      sendMessage(`${user} 點數不足，無法兌換`);
      return;
    }

    if (activeEffects.length >= config.maxConcurrentEffects) {
      sendMessage(`目前特效太多，請稍後再試`);
      return;
    }

    adjustPoints(user, -effectConfig.cost);
    cooldowns[user] = now;
    activeEffects.push(effect);
    triggerEffect(effect, user);
    setTimeout(() => {
      const index = activeEffects.indexOf(effect);
      if (index !== -1) activeEffects.splice(index, 1);
    }, 4000);
  }
}

export { handleCommand };
