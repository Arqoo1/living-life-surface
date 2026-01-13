import React from "react";
import { MomentCard } from "./MomentCard";

interface DashboardMomentSectionProps {
  selectedDate: string | null;
  filteredMoments: any[]; 
  setSelectedDate: (date: string | null) => void;
  handleDeleteMoment: (id: string) => void;
}

export const DashboardMomentSection: React.FC<DashboardMomentSectionProps> = ({
  selectedDate,
  filteredMoments,
  setSelectedDate,
  handleDeleteMoment,
}) => {
  return (
    <section className="moments-section">
      <div className="section-header">
        <h2>{selectedDate ? `Moments for ${selectedDate}` : "Moments"}</h2>
        {selectedDate && (
          <button
            className="clear-filter-btn"
            onClick={() => setSelectedDate(null)}
          >
            ✕ Clear Filter
          </button>
        )}
      </div>
      <div className="moments-list">
        {filteredMoments.map((m) => (
          <MomentCard key={m._id} m={m} onDelete={handleDeleteMoment} />
        ))}
      </div>
    </section>
  );
};
