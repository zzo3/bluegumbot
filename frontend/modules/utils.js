const userPoints = {};

function adjustPoints(user, amount) {
  userPoints[user] = (userPoints[user] || 0) + amount;
  if (userPoints[user] < 0) userPoints[user] = 0;
}

export { userPoints, adjustPoints };
