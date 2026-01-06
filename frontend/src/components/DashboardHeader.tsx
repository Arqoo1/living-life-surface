import React from "react";
import { StreakCounter } from "./StreakCounter";

export const DashboardHeader = ({ d }: { d: any }) => (
  <header className="dashboard-header">
    <div className="left-section">
      <h1>Life Stream</h1>
      <StreakCounter moments={d.moments} />

      <div className="view-toggle-container">
        {["focus", "editor"].map((mode) => (
          <button
            key={mode}
            onClick={() => d.setViewMode(mode)}
            className={`toggle-button ${d.viewMode === mode ? "active" : ""}`}
          >
            {mode}
          </button>
        ))}
      </div>

      <button
        className="manage-button"
        onClick={() => d.setIsSettingsOpen(true)}
      >
        ⚙️ Manage
      </button>
    </div>

    <div className="sync-status">
      <div className={`sync-indicator ${d.isSyncing ? "syncing" : ""}`} />
      <span>{d.isSyncing ? "Syncing..." : `Synced: ${d.syncMessage}`}</span>
    </div>
  </header>
);
