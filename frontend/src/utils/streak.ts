// utils/streak.ts
export const calculateStreak = (moments: any[]) => {
  if (!moments || moments.length === 0) return 0;

  const dateSet = new Set(
    moments.map((m) => new Date(m.timestamp).toISOString().split("T")[0])
  );

  let streak = 0;
  let checkDate = new Date();

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dateSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};
