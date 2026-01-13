export const addXP = async (user, amount) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const lastUpdate = user.lastXpUpdate
    ? user.lastXpUpdate.toISOString().split("T")[0]
    : null;

  let finalAmount = amount;
  if (lastUpdate !== today) {
    finalAmount += 10; // First moment of the day bonus
  }

  // 1. ADD to the total. DO NOT reset user.xp to 0 elsewhere.
  user.xp += finalAmount;
  user.lastXpUpdate = now;

  // 2. CALCULATE Level based on total cumulative XP
  // Level 1: 0-99 XP
  // Level 2: 100-199 XP
  // Level 3: 200-299 XP... and so on.
  const calculatedLevel = Math.floor(user.xp / 100) + 1;

  // 3. Update level only if the new calculation is higher
  if (calculatedLevel > user.level) {
    user.level = calculatedLevel;
  }

  await user.save();
  return user;
};
