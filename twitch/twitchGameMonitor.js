import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

let cachedToken = null;
let tokenExpiry = 0;

async function getAppAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60000) {
    return cachedToken; // 使用快取 token（提前 60 秒刷新）
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials"
    })
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("無法取得 Twitch App Access Token");
  }

  cachedToken = data.access_token;
  tokenExpiry = now + data.expires_in * 1000;
  return cachedToken;
}

async function fetchCurrentGame() {
  const token = await getAppAccessToken();

  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_USERNAME}`, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Authorization": `Bearer ${token}`
    }
  });

  const userData = await userRes.json();
  const userId = userData.data?.[0]?.id;
  if (!userId) return null;

  const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      "Authorization": `Bearer ${token}`
    }
  });

  const streamData = await streamRes.json();
  return streamData.data?.[0]?.game_name || null;
}

export { fetchCurrentGame };
