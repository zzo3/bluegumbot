let customInterval, gameInterval, firstGameTimeout;

function startAnnouncements(config, sendMessage) {
  stopAnnouncements();

  if (config.enableCustomAnnouncements) {
    customInterval = setInterval(() => {
      sendMessage(config.customAnnouncementText);
    }, config.customAnnouncementInterval * 60 * 1000);
  }

  firstGameTimeout = setTimeout(() => {
    sendGameAnnouncement(config, sendMessage);
    gameInterval = setInterval(() => {
      sendGameAnnouncement(config, sendMessage);
    }, config.gameAnnouncementInterval * 60 * 1000);
  }, config.gameFirstDelay * 60 * 1000);
}

function sendGameAnnouncement(config, sendMessage) {
  const emojiList = config.gameEmojis.split(",").map(e => e.trim());
  const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
  const msg = `${emoji} 正在遊玩：${config.gameTitle}（${config.gameGenre}）`;
  sendMessage(msg);
}

function sendEndMessage(platform, sendMessage) {
  const emoji = platform === "kick" ? "💚" : "💜";
  sendMessage(`感謝陪伴！我們下次直播見 ${emoji}`);
}

function stopAnnouncements() {
  clearInterval(customInterval);
  clearInterval(gameInterval);
  clearTimeout(firstGameTimeout);
}

export { startAnnouncements, stopAnnouncements, sendEndMessage };
