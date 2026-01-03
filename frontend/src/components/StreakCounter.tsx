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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#fb923c",
        fontSize: "0.85rem",
        fontWeight: "bold",
        backgroundColor: "rgba(251, 146, 60, 0.1)",
        padding: "4px 12px",
        borderRadius: "20px",
        border: "1px solid rgba(251, 146, 60, 0.2)",
        animation: streakCount >= 7 ? "glow 2s infinite" : "none",
      }}
    >
      <span style={{ fontSize: "1rem" }}>🔥</span>
      <span>{streakCount} Day Streak</span>

      <style>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(251, 146, 60, 0.2); }
          50% { box-shadow: 0 0 15px rgba(251, 146, 60, 0.5); }
          100% { box-shadow: 0 0 5px rgba(251, 146, 60, 0.2); }
        }
      `}</style>
    </div>
  );
};
