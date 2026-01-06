import React from "react";
import { useDashboard } from "../hooks/useDashboard";

// Components
import { RuleEditor } from "../components/RuleEditor";
import { MomentInput } from "../components/MomentInput";
import { StreamInsights } from "../components/StreamInsights";
import { SearchFilter } from "../components/SearchFilter";
import { StreakCounter } from "../components/StreakCounter";
import { VibeHeatmap } from "../components/VibeHeatmap";
import { TimeTravel } from "../components/TimeTravel";
import { SettingsModal } from "../components/SettingsModal";
import { MomentCard } from "../components/MomentCard";

const Dashboard: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const d = useDashboard(token);

  if (d.loading && d.moments.length === 0) {
    return <p className="loading-screen">Connecting to Stream...</p>;
  }

  return (
    <div className="dashboard-container">
      <SettingsModal
        isOpen={d.isSettingsOpen}
        onClose={() => d.setIsSettingsOpen(false)}
        tracks={d.tracks}
        onDeleteTrack={d.handleDeleteTrack}
        types={d.availableTypes}
        onDeleteType={d.handleDeleteType}
      />

      <header className="main-header">
        <div className="header-left">
          <h1>Life Stream</h1>
          <StreakCounter moments={d.moments} />

          <div className="view-toggles">
            <button
              className={d.viewMode === "focus" ? "active" : ""}
              onClick={() => d.setViewMode("focus")}
            >
              Focus
            </button>
            <button
              className={d.viewMode === "editor" ? "active" : ""}
              onClick={() => d.setViewMode("editor")}
            >
              Editor
            </button>
          </div>

          <button
            className="manage-btn"
            onClick={() => d.setIsSettingsOpen(true)}
          >
            ⚙️ Manage
          </button>
        </div>

        <div className="sync-status">
          <div className={`sync-spinner ${d.isSyncing ? "syncing" : ""}`} />
          <span>{d.isSyncing ? "Syncing..." : `Synced: ${d.syncMessage}`}</span>
        </div>
      </header>

      <section style={{ marginBottom: "2rem" }}>
        <MomentInput
          onAdd={d.handleAddMoment}
          tracks={d.tracks}
          availableTypes={d.availableTypes}
          onAddTrack={d.handleAddTrack}
          onAddType={d.handleAddType}
        />
      </section>

      <TimeTravel
        selectedDate={d.selectedDate}
        onDateSelect={d.setSelectedDate}
      />
      <SearchFilter
        value={d.searchQuery}
        onChange={d.setSearchQuery}
        onExport={d.handleExportCSV}
      />
      <StreamInsights allMoments={d.moments} moments={d.filteredMoments} />
      <VibeHeatmap
        allMoments={d.moments}
        onDateClick={(date) => d.setSelectedDate(date)}
      />

      <section className="moments-section">
        <div className="section-header">
          <h2>
            {d.selectedDate ? `Moments for ${d.selectedDate}` : "Moments"}
          </h2>
          {d.selectedDate && (
            <button
              className="clear-filter-btn"
              onClick={() => d.setSelectedDate(null)}
            >
              ✕ Clear Filter
            </button>
          )}
        </div>

        <div className="moments-list">
          {d.filteredMoments.map((m) => (
            <MomentCard key={m._id} m={m} onDelete={d.handleDeleteMoment} />
          ))}
        </div>
      </section>

      {d.viewMode === "editor" && (
        <section className="rules-engine">
          <div className="rules-header">
            <h2>Rules Engine</h2>
            <button
              className="save-btn"
              onClick={d.handleSaveRules}
              disabled={d.saveLoading}
            >
              {d.saveLoading ? "Saving..." : "Save Rules"}
            </button>
          </div>
          <RuleEditor
            code={d.editorDraft}
            onSave={(val) => d.setEditorDraft(val)}
          />
        </section>
      )}
    </div>
  );
};

export default Dashboard;
