import React from "react";

interface MomentCardProps {
  m: any;
  onDelete: (id: string) => void;
}

export const MomentCard: React.FC<MomentCardProps> = ({ m, onDelete }) => {
  return (
    <div
      className="moment-card"
      style={
        {
          "--dynamic-bg": `var(--moment-color-${m.type.toLowerCase()}, rgba(255, 255, 255, 0.02))`,
        } as React.CSSProperties
      }
    >
      <button className="delete-btn" onClick={() => onDelete(m._id)}>
        ✕
      </button>

      <div className="card-header">
        <div className="meta-group">
          <strong>{m.type}</strong>
          {m.track.map((t: string) => (
            <span key={t} className="track-tag">
              #{t}
            </span>
          ))}
        </div>
        <small className="timestamp">
          {new Date(m.timestamp).toLocaleTimeString()}
        </small>
      </div>

      <p className="content">{m.content}</p>
    </div>
  );
};
