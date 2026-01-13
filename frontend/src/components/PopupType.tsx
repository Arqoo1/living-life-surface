import React from "react";

interface PopupTypeProps {
  notification: string | null;
}

export const PopupType: React.FC<PopupTypeProps> = ({ notification }) => {
  if (!notification) return null;

  const isLevelUp = notification.includes("LEVEL");

  return (
    <div className={`engine-popup ${isLevelUp ? "level-up" : "system"}`}>
      <span className="popup-label">
        {isLevelUp ? "⭐ UNLOCKED: " : "⚡ SYSTEM: "}
      </span>
      {notification}
    </div>
  );
};
