import React from "react";

interface XpSectionProps {
  level: number | null; 
  xp: number | null; 
  isLevelUpAnimating: boolean;
}

export const XpSection: React.FC<XpSectionProps> = ({
  level,
  xp,
  isLevelUpAnimating,
}) => {
  const safeXP = xp ?? 0;
  const safeLevel = level ?? 1;
  const relativeXP = safeXP % 100;

  return (
    <div className="xp-section">
      <div className="xp-stats">
        <span
          className={`level-text ${isLevelUpAnimating ? "animate-bump" : ""}`}
        >
          LVL {safeLevel}
        </span>
        <span className="xp-count">{relativeXP} / 100 XP</span>
      </div>
      <div className="xp-bar-container">
        <div className="xp-bar-fill" style={{ width: `${relativeXP}%` }} />
      </div>
    </div>
  );
};
