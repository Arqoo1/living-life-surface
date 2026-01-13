import React from "react";

interface BatterySectionProps {
  battery: number;
}

export const BatterySection: React.FC<BatterySectionProps> = ({ battery }) => {
  return (
    <div className={`battery-section ${battery < 20 ? "low" : ""}`}>
      <span>
        {battery < 20 ? "🪫" : "🔋"} {Math.round(battery)}%
      </span>
    </div>
  );
};