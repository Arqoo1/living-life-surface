import React, { useMemo } from "react";

interface Moment {
  timestamp: string;
}

interface StreakCounterProps {
  moments: Moment[];
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ moments }) => {
  const streakCount = useMemo(() => {
    if (moments.length === 0) return 0;

    // Get unique dates (YYYY-MM-DD)
    const dateSet = new Set(
      moments.map((m) => new Date(m.timestamp).toISOString().split("T")[0])
    );

    let streak = 0;
    let checkDate = new Date(); // Start today

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dateSet.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Stop if a day is missed
        break;
      }
    }
    return streak;
  }, [moments]);

  if (streakCount === 0) return null;

  return (
    <div className={`streak-badge ${streakCount >= 7 ? "elite-streak" : ""}`}>
      <span className="fire-emoji">🔥</span>
      <span>{streakCount} Day Streak</span>
    </div>
  );
};
