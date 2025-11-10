function connectToKick(channel, onMessage) {
  const ws = new WebSocket(`wss://kick-chat-server/${channel}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
      onMessage(data.user, data.message);
    }
  };
}

export { connectToKick };
