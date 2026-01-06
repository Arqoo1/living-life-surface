import React, { useMemo } from "react";

interface Moment {
  _id: string;
  type: string;
  timestamp: string;
}

interface StreamInsightsProps {
  moments: Moment[];
  allMoments: Moment[];
}

export const StreamInsights: React.FC<StreamInsightsProps> = ({
  moments,
  allMoments,
}) => {
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    moments.forEach((m) => {
      counts[m.type] = (counts[m.type] || 0) + 1;
    });

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

    return days.map((date) => ({ date, count: activity[date] || 0 }));
  }, [moments]);

  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  if (allMoments.length === 0) return null;

  return (
    <div className="insights-grid">
      {/* 1. TYPE DISTRIBUTION */}
      <div className="insight-card">
        <h3>Type Distribution vs Avg</h3>
        <div className="stats-list">
          {stats.map(({ type, count, avg }) => (
            <div key={type} className="stat-item">
              <div className="stat-header">
                <span className="type-label">{type}</span>
                <span className="count-label">
                  {count}{" "}
                  <span className="avg-sub">(avg: {avg.toFixed(1)})</span>
                </span>
              </div>
              <div className="progress-container">
                <div
                  className="avg-marker"
                  style={{ left: `${Math.min((avg / maxCount) * 100, 100)}%` }}
                />
                <div
                  className={`current-bar ${
                    count > avg ? "above-avg" : "below-avg"
                  }`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVITY HEATMAP */}
      <div className="insight-card">
        <h3>Activity (Last 14 Days)</h3>
        <div className="heatmap-container">
          {heatmapData.map((day) => (
            <div key={day.date} className="heatmap-day">
              <div
                title={`${day.count} moments on ${day.date}`}
                className={`bar ${day.count === 0 ? "empty" : ""}`}
                style={{
                  height: `${Math.min(day.count * 15 + 10, 80)}px`,
                  opacity:
                    day.count > 0 ? Math.min(day.count * 0.2 + 0.1, 1) : 0.05,
                }}
              />
              <div className="date-label">{day.date.split("-")[2]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
