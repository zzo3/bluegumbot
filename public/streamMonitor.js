import { startAnnouncements, stopAnnouncements, sendEndMessage } from "./announcer.js";

let isLive = false;
let endTimeout;

function updateStreamStatus(status, platform, config, sendMessage) {
  if (status === "live" && !isLive) {
    isLive = true;
    startAnnouncements(config, sendMessage);
  }

  if (status === "offline" && isLive) {
    isLive = false;
    sendEndMessage(platform, sendMessage);
    stopAnnouncements();
    clearTimeout(endTimeout);
    endTimeout = setTimeout(() => {
      // 停止所有互動功能
    }, 60 * 60 * 1000);
  }
}

export { updateStreamStatus };
