import React from "react";

interface DashboardViewProps {
  viewMode: string;
  setViewMode: (mode: "focus" | "editor") => void;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  viewMode,
  setViewMode,
  onOpenSettings,
}) => {
  return (
    <>
      <div className="view-toggles">
        <button
          className={viewMode === "focus" ? "active" : ""}
          onClick={() => setViewMode("focus")}
        >
          Focus
        </button>
        <button
          className={viewMode === "editor" ? "active" : ""}
          onClick={() => setViewMode("editor")}
        >
          Editor
        </button>
      </div>

      <button className="manage-btn" onClick={onOpenSettings}>
        ⚙️ Manage
      </button>
    </>
  );
};
