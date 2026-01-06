import React, { useMemo, useRef } from "react";

interface Moment {
  timestamp: string;
}

interface VibeHeatmapProps {
  allMoments: Moment[];
  onDateClick: (date: string) => void;
}

export const VibeHeatmap: React.FC<VibeHeatmapProps> = ({
  allMoments,
  onDateClick,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const jumpToToday = () => {
    scrollRef.current?.scrollTo({
      left: scrollRef.current.scrollWidth,
      behavior: "smooth",
    });
  };

  const { gridData, monthLabels } = useMemo(() => {
    const days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const activity: Record<string, number> = {};
    allMoments.forEach((m) => {
      const dateKey = new Date(m.timestamp).toISOString().split("T")[0];
      activity[dateKey] = (activity[dateKey] || 0) + 1;
    });

    const data = days.map((d) => {
      const dateKey = d.toISOString().split("T")[0];
      const count = activity[dateKey] || 0;
      return {
        date: dateKey,
        count,
        monthShort: d.toLocaleString("default", { month: "short" }),
        tooltip: `${count} moments on ${d.toDateString()}`,
      };
    });

    const labels: { month: string; index: number }[] = [];
    data.forEach((d, i) => {
      if (i % 7 === 0) {
        if (
          labels.length === 0 ||
          labels[labels.length - 1].month !== d.monthShort
        ) {
          labels.push({ month: d.monthShort, index: Math.floor(i / 7) });
        }
      }
    });

    return { gridData: data, monthLabels: labels };
  }, [allMoments]);

  const getCellColor = (count: number) => {
    if (count === 0) return "rgba(255, 255, 255, 0.05)";
    const opacity = count < 5 ? 0.2 : count < 10 ? 0.5 : 1;
    return `rgba(74, 222, 128, ${opacity})`;
  };

  return (
    <div className="vibe-heatmap-container">
      <header>
        <div className="title-area">
          <h3>Consistency</h3>
          <button className="jump-btn" onClick={jumpToToday}>
            Today
          </button>
        </div>
        <div className="legend">
          <span>Less</span>
          {[0, 2, 6, 12].map((n) => (
            <div
              key={n}
              className="legend-box"
              style={{ backgroundColor: getCellColor(n) }}
            />
          ))}
          <span>More</span>
        </div>
      </header>

      <div className="scroll-wrapper custom-scrollbar" ref={scrollRef}>
        <div className="day-labels">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <span
              key={day}
              style={{ opacity: [1, 3, 5].includes(i) ? 0.4 : 0 }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="grid-scroller">
          <div className="month-labels">
            {monthLabels.map((label, i) => (
              <span key={i} style={{ left: `${label.index * 14}px` }}>
                {label.month}
              </span>
            ))}
          </div>

          <div className="cells-grid">
            {Array.from({ length: Math.ceil(gridData.length / 7) }).map(
              (_, colIdx) => (
                <div key={colIdx} className="column">
                  {[0, 1, 2, 3, 4, 5, 6].map((rowIdx) => {
                    const day = gridData[colIdx * 7 + rowIdx];
                    if (!day)
                      return <div key={rowIdx} className="empty-spacer" />;
                    return (
                      <div
                        key={day.date}
                        className="cell"
                        title={day.tooltip}
                        onClick={() => onDateClick(day.date)}
                        style={{ backgroundColor: getCellColor(day.count) }}
                      />
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
