import React, { useMemo } from "react";

interface Moment {
  timestamp: string | number | Date; 
  [key: string]: any; 
}

interface StreakCounterProps {
  moments: Moment[];
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ moments }) => {
  const streakCount = useMemo(() => {
    if (!moments || moments.length === 0) return 0;

    const dateSet = new Set(
      moments.map((m) => {
        const d = new Date(m.timestamp);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
      }).filter(Boolean)
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
  }, [moments]);

  if (streakCount === 0) return null;

  return (
    <div className={`streak-badge ${streakCount >= 7 ? "elite-streak" : ""}`}>
      <span className="fire-emoji">🔥</span>
      <span>{streakCount} Day Streak</span>
    </div>
  );
};