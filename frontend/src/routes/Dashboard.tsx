import React from "react";
import { useDashboard } from "../hooks/useDashboard";
import { useBattery } from "../hooks/useBattery";
import { useNotifications } from "../hooks/useNotifications";
import { useLevelUp } from "../hooks/useLevelUp";

import {
  MomentInput,
  StreamInsights,
  SearchFilter,
  StreakCounter,
  VibeHeatmap,
  TimeTravel,
  SettingsModal,
  XpSection,
  BatterySection,
  DashboardView,
  DashboardRuleEngine,
  DashboardMomentSection,
  PopupType,
  SyncStatus,
} from "../components";

const Dashboard: React.FC = () => {
  const token = localStorage.getItem("token") || "";
  const d = useDashboard(token);

  const { engineNotification, showEngineAlert } = useNotifications();
  const battery = useBattery(() => showEngineAlert("Power State Updated"));

  useLevelUp(d.level, (lvl) =>
    showEngineAlert(`LEVEL UP! You reached Level ${lvl}`)
  );

  if (d.loading && d.moments.length === 0) {
    return <p className="loading-screen">Connecting to Stream...</p>;
  }

  return (
    <div className="dashboard-container">
      <PopupType notification={engineNotification} />

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
          <XpSection
            level={d.level}
            xp={d.xp}
            isLevelUpAnimating={!!engineNotification?.includes("LEVEL")}
          />
          <BatterySection battery={battery} />
          <DashboardView
            viewMode={d.viewMode}
            setViewMode={d.setViewMode}
            onOpenSettings={() => d.setIsSettingsOpen(true)}
          />
        </div>

        <SyncStatus isSyncing={d.isSyncing} syncMessage={d.syncMessage} />
      </header>

      <section className="input-section">
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

      <DashboardMomentSection
        selectedDate={d.selectedDate}
        filteredMoments={d.filteredMoments}
        setSelectedDate={d.setSelectedDate}
        handleDeleteMoment={d.handleDeleteMoment}
      />

      {d.viewMode === "editor" && (
        <DashboardRuleEngine
          editorDraft={d.editorDraft}
          setEditorDraft={d.setEditorDraft}
          handleSaveRules={d.handleSaveRules}
          saveLoading={d.saveLoading}
          onShowAlert={showEngineAlert}
        />
      )}
    </div>
  );
};

export default Dashboard;
