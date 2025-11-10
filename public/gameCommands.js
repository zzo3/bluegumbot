import { triggerEffect } from "./websocketBridge.js";

function handleGameCommand(user, message, sendMessage) {
  if (message === "!joincafe") {
    sendMessage(`歡迎 ${user} 光臨咖啡廳☕`);
    triggerEffect("joincafe", user);
  }

  if (message === "!order") {
    sendMessage(`${user} 請稍等，馬上為你準備餐點🍽️`);
    triggerEffect("order", user);
  }

  if (message === "!menu") {
    sendMessage("今日菜單：咖啡、蛋糕、抹茶拿鐵、可麗餅");
  }

  if (message === "!gift") {
    sendMessage(`${user} 贈送了一份禮物 🎁`);
    triggerEffect("gift", user);
  }

  if (message.startsWith("!visit ")) {
    const target = message.split(" ")[1];
    sendMessage(`${user} 正在造訪 ${target} 的咖啡廳 🏠`);
    triggerEffect("visit", user);
  }
}

export { handleGameCommand };
