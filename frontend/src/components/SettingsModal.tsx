import React from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: any[];
  onDeleteTrack: (id: string) => void;
  types: string[];
  onDeleteType: (type: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tracks,
  onDeleteTrack,
  types,
  onDeleteType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <header>
          <h2>Stream Settings</h2>
          <button className="close-icon-btn" onClick={onClose}>
            ✕
          </button>
        </header>

        <h3>Your Tracks</h3>
        <div className="scroll-list">
          {tracks.map((track: any) => (
            <div key={track._id} className="list-item">
              <span># {track.name}</span>
              <button
                className="remove-btn"
                onClick={() => onDeleteTrack(track._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <h3>Active Types</h3>
        <div className="types-grid">
          {types.map((type: string) => (
            <span key={type} className="type-tag">
              {type}
              <button
                className="delete-type-btn"
                onClick={() => onDeleteType(type)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <button className="done-btn" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};
