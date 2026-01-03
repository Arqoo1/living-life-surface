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
    if (scrollRef.current) {
      // Scrolls all the way to the right (latest date)
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
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
      const friendlyDate = `${getOrdinal(d.getDate())} ${d.toLocaleString(
        "default",
        { month: "long" }
      )}`;

      return {
        date: dateKey,
        count,
        tooltip: `${count} ${
          count === 1 ? "moment" : "moments"
        } on ${friendlyDate}`,
        monthShort: d.toLocaleString("default", { month: "short" }),
      };
    });

    const labels: { month: string; index: number }[] = [];
    data.forEach((d, i) => {
      if (i % 7 === 0) {
        const monthName = d.monthShort;
        if (
          labels.length === 0 ||
          labels[labels.length - 1].month !== monthName
        ) {
          labels.push({ month: monthName, index: Math.floor(i / 7) });
        }
      }
    });

    return { gridData: data, monthLabels: labels };
  }, [allMoments]);

  const getCellColor = (count: number) => {
    const baseGreen = "74, 222, 128";
    if (count === 0) return "rgba(255, 255, 255, 0.05)";
    if (count < 5) return `rgba(${baseGreen}, 0.2)`;
    if (count < 10) return `rgba(${baseGreen}, 0.5)`;
    return `rgba(${baseGreen}, 1)`;
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        padding: "1.5rem",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1.2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h3
            style={{
              fontSize: "0.8rem",
              opacity: 0.5,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Consistency
          </h3>
          <button
            onClick={jumpToToday}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.6rem",
              padding: "2px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Today
          </button>
        </div>

        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <span style={{ fontSize: "0.6rem", opacity: 0.3 }}>Less</span>
          {[0, 2, 6, 12].map((n) => (
            <div
              key={n}
              style={{
                width: "9px",
                height: "9px",
                backgroundColor: getCellColor(n),
                borderRadius: "1px",
              }}
            />
          ))}
          <span style={{ fontSize: "0.6rem", opacity: 0.3 }}>More</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{ display: "flex", overflowX: "auto", paddingBottom: "10px" }}
        className="custom-scrollbar"
      >
        {/* Left Side: Days */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: "12px",
            marginTop: "20px",
            height: "95px",
            position: "sticky",
            left: 0,
            backgroundColor: "#0a0a0a",
            zIndex: 10,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <span
              key={day}
              style={{
                fontSize: "0.6rem",
                opacity: [1, 3, 5].includes(i) ? 0.4 : 0,
                lineHeight: "11px",
              }}
            >
              {day}
            </span>
          ))}
        </div>

        <div style={{ minWidth: "850px" }}>
          {/* Top: Months */}
          <div
            style={{ display: "flex", height: "20px", position: "relative" }}
          >
            {monthLabels.map((label, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${label.index * 14}px`,
                  fontSize: "0.65rem",
                  opacity: 0.5,
                  fontWeight: 300,
                }}
              >
                {label.month}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: "3px" }}>
            {Array.from({ length: Math.ceil(gridData.length / 7) }).map(
              (_, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((rowIdx) => {
                    const dataIdx = colIndex * 7 + rowIdx;
                    const day = gridData[dataIdx];
                    if (!day)
                      return (
                        <div
                          key={rowIdx}
                          style={{ width: "11px", height: "11px" }}
                        />
                      );

                    return (
                      <div
                        key={day.date}
                        title={day.tooltip}
                        onClick={() => onDateClick(day.date)}
                        style={{
                          width: "11px",
                          height: "11px",
                          backgroundColor: getCellColor(day.count),
                          borderRadius: "2px",
                          cursor: "pointer",
                          transition: "all 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.25)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
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
