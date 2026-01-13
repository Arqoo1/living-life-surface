import React from "react";

interface SyncStatusProps {
  isSyncing: boolean;
  syncMessage: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isSyncing,
  syncMessage,
}) => {
  return (
    <div className="sync-status">
      <div className={`sync-spinner ${isSyncing ? "syncing" : ""}`} />
      <span>{isSyncing ? "Syncing..." : `Synced: ${syncMessage}`}</span>
    </div>
  );
};
