import React from "react";

interface TimeTravelProps {
  selectedDate: string | null;
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

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="time-travel-container">
      <header>
        <h3>Timeline</h3>
        <button
          className={`reset-btn ${selectedDate === null ? "active-all" : ""}`}
          onClick={() => onDateSelect(null)}
        >
          {selectedDate === null ? "● Showing All Time" : "Show All"}
        </button>
      </header>

      <div className="days-scroll-row">
        {days.map((date) => {
          const dateStr = date.toISOString().split("T")[0];
          const isActive = selectedDate === dateStr;
          const isToday = todayStr === dateStr;

          return (
            <button
              key={dateStr}
              className={`day-card ${isActive ? "active" : ""}`}
              onClick={() => onDateSelect(isActive ? null : dateStr)}
            >
              <span className="weekday">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="date-num">{date.getDate()}</span>
              {isToday && <div className="today-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
