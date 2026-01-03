import React, { useMemo } from "react";

interface Moment {
  _id: string;
  type: string;
  timestamp: string;
}

interface StreamInsightsProps {
  moments: Moment[]; // The filtered moments (e.g., for today)
  allMoments: Moment[]; // All moments (for the daily average)
}

export const StreamInsights: React.FC<StreamInsightsProps> = ({
  moments,
  allMoments,
}) => {
  // --- 1. FREQUENCY LOGIC (WITH COMPARISON) ---
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });

    // Calculate All-Time Daily Averages
    const allTimeCounts: Record<string, number> = {};
    allMoments.forEach((m) => {
      allTimeCounts[m.type] = (allTimeCounts[m.type] || 0) + 1;
    });

    const uniqueDays =
      new Set(allMoments.map((m) => new Date(m.timestamp).toDateString()))
        .size || 1;

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        avg: allTimeCounts[type] / uniqueDays,
      }));
  }, [moments, allMoments]);

  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  // --- 2. ACTIVITY HEATMAP LOGIC (REMAINS THE SAME) ---
  const heatmapData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const activity: Record<string, number> = {};
    moments.forEach((m) => {
      const dateKey = new Date(m.timestamp).toISOString().split("T")[0];
      if (days.includes(dateKey)) {
        activity[dateKey] = (activity[dateKey] || 0) + 1;
      }
    });

    return days.map((date) => ({
      date,
      count: activity[date] || 0,
    }));
  }, [moments]);

  if (allMoments.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        marginBottom: "3rem",
      }}
    >
      {/* 1. TYPE DISTRIBUTION + COMPARISON */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            opacity: 0.5,
            marginBottom: "1.2rem",
            textTransform: "uppercase",
          }}
        >
          Type Distribution vs Avg
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {stats.map(({ type, count, avg }) => (
            <div key={type}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                  fontSize: "0.7rem",
                }}
              >
                <span style={{ opacity: 0.8 }}>{type}</span>
                <span>
                  {count}{" "}
                  <span style={{ opacity: 0.3 }}>(avg: {avg.toFixed(1)})</span>
                </span>
              </div>
              <div
                style={{
                  position: "relative",
                  height: "8px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                {/* Average Marker (Vertical line) */}
                <div
                  style={{
                    position: "absolute",
                    left: `${Math.min((avg / maxCount) * 100, 100)}%`,
                    height: "100%",
                    width: "2px",
                    backgroundColor: "rgba(255,255,255,0.3)",
                    zIndex: 2,
                  }}
                />

                {/* Current Bar */}
                <div
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    height: "100%",
                    backgroundColor:
                      count > avg
                        ? "#4ade80"
                        : "var(--moment-color-" +
                          type.toLowerCase() +
                          ", #60a5fa)",
                    transition: "width 1s ease-out",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVITY HEATMAP (Original intact) */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            opacity: 0.5,
            marginBottom: "1.2rem",
            textTransform: "uppercase",
          }}
        >
          Activity (Last 14 Days)
        </h3>
        <div
          style={{
            display: "flex",
            gap: "6px",
            alignItems: "flex-end",
            height: "100px",
          }}
        >
          {heatmapData.map((day) => {
            const opacity = Math.min(day.count * 0.2 + 0.1, 1);
            return (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  title={`${day.count} moments on ${day.date}`}
                  style={{
                    width: "100%",
                    height: `${Math.min(day.count * 15 + 10, 80)}px`,
                    backgroundColor: "#4ade80",
                    opacity: day.count > 0 ? opacity : 0.05,
                    borderRadius: "3px",
                    transition: "all 0.5s ease",
                  }}
                />
                <div
                  style={{
                    fontSize: "0.5rem",
                    opacity: 0.3,
                    writingMode: "vertical-lr",
                  }}
                >
                  {day.date.split("-")[2]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
