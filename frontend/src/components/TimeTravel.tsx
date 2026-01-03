import React from "react";

interface TimeTravelProps {
  selectedDate: string | null; // e.g., "2023-10-25"
  onDateSelect: (date: string | null) => void;
}

export const TimeTravel: React.FC<TimeTravelProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  });

  return (
    <div style={{ marginBottom: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            fontSize: "0.8rem",
            opacity: 0.5,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Timeline
        </h3>
        <button
          onClick={() => onDateSelect(null)}
          style={{
            background: "none",
            border: "none",
            color: selectedDate === null ? "#4ade80" : "#fff",
            fontSize: "0.7rem",
            cursor: "pointer",
            opacity: selectedDate === null ? 1 : 0.5,
          }}
        >
          {selectedDate === null ? "● Showing All Time" : "Show All"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {days.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const isActive = selectedDate === dateStr;
          const isToday = new Date().toISOString().split("T")[0] === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(isActive ? null : dateStr)}
              style={{
                minWidth: "60px",
                padding: "10px",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: isActive ? "#4ade80" : "rgba(255,255,255,0.1)",
                backgroundColor: isActive
                  ? "rgba(74, 222, 128, 0.1)"
                  : "rgba(255,255,255,0.02)",
                color: isActive ? "#4ade80" : "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: "0.6rem",
                  opacity: 0.5,
                  marginBottom: "4px",
                }}
              >
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span style={{ fontSize: "1rem", fontWeight: "bold" }}>
                {date.getDate()}
              </span>
              {isToday && (
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "#4ade80",
                    marginTop: "4px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
