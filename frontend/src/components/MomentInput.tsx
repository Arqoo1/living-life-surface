import React, { useState, useRef } from "react";

interface MomentInputProps {
  onAdd: (data: any) => void;
  tracks: any[];
  availableTypes: string[];
  onAddTrack?: (name: string) => void; // New: callback for Dashboard
  onAddType?: (name: string) => void; // New: callback for Dashboard
}

export const MomentInput: React.FC<MomentInputProps> = ({
  onAdd,
  tracks,
  availableTypes,
  onAddTrack,
  onAddType,
}) => {
  const [content, setContent] = useState("");
  const [type, setType] = useState("happy");
  const [track, setTrack] = useState("");
  const [isPulsing, setIsPulsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getTypeIcon = (typeName: string) => {
    const icons: Record<string, string> = {
      happy: "☀️",
      reflective: "🕯️",
      focused: "🎯",
      stressed: "🌊",
      coding: "💻",
      work: "💼",
    };
    return icons[typeName.toLowerCase()] || "✨";
  };

  const handleAddNewType = () => {
    const newType = prompt("Enter new category name:");
    if (newType && onAddType) {
      const formatted = newType.toLowerCase().trim();
      onAddType(formatted);
      setType(formatted); // Automatically select it
    }
  };

  const handleAddNewTrack = () => {
    const newTrack = prompt("Enter new track name (e.g. Health, Projects):");
    if (newTrack && onAddTrack) {
      const formatted = newTrack.trim();
      onAddTrack(formatted);
      setTrack(formatted); // Automatically select it
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPulsing(true);
    onAdd({
      content: content,
      type: type,
      track: track ? [track] : ["General"],
    });

    setContent("");
    setTimeout(() => setIsPulsing(false), 600);
  };

  return (
    <div style={{ marginBottom: "2rem", transition: "all 0.4s ease" }}>
      {/* 1. DYNAMIC TYPE CHIPS */}
      <div style={chipRowStyle}>
        {availableTypes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              inputRef.current?.focus();
            }}
            style={{
              ...chipStyle,
              borderColor: type === t ? "#4ade80" : "rgba(255,255,255,0.1)",
              backgroundColor:
                type === t
                  ? "rgba(74, 222, 128, 0.1)"
                  : "rgba(255,255,255,0.02)",
              color: type === t ? "#4ade80" : "rgba(255,255,255,0.6)",
            }}
          >
            {getTypeIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        {/* ADD NEW TYPE BUTTON */}
        <button
          onClick={handleAddNewType}
          style={{
            ...chipStyle,
            borderStyle: "dashed",
            borderColor: "#4ade80",
            opacity: 0.6,
            color: "#fff",
            backgroundColor: "transparent",
          }}
        >
          + New Type
        </button>
      </div>

      {/* 2. DYNAMIC TRACK CHIPS */}
      <div style={{ ...chipRowStyle, marginBottom: "20px" }}>
        <span
          style={{
            fontSize: "0.7rem",
            opacity: 0.3,
            alignSelf: "center",
            marginRight: "4px",
          }}
        >
          #
        </span>
        {tracks.map((t) => (
          <button
            key={t._id || t.name}
            type="button"
            onClick={() => {
              setTrack(track === t.name ? "" : t.name);
              inputRef.current?.focus();
            }}
            style={{
              ...chipStyle,
              fontSize: "0.7rem",
              padding: "4px 10px",
              borderColor:
                track === t.name ? "#60a5fa" : "rgba(255,255,255,0.05)",
              backgroundColor:
                track === t.name ? "rgba(96, 165, 250, 0.1)" : "transparent",
              color: track === t.name ? "#60a5fa" : "rgba(255,255,255,0.4)",
            }}
          >
            {t.name}
          </button>
        ))}
        {/* ADD NEW TRACK BUTTON */}
        <button
          onClick={handleAddNewTrack}
          style={{
            ...chipStyle,
            borderStyle: "dashed",
            borderColor: "#4ade80",
            opacity: 0.6,
            fontSize: "0.7rem",
            color: "#fff",
            backgroundColor: "transparent",
          }}
        >
          + New Track
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "10px", position: "relative" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          style={{
            flex: 1,
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: isPulsing ? "#4ade80" : "rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            outline: "none",
            boxShadow: isPulsing ? "0 0 15px rgba(74, 222, 128, 0.2)" : "none",
            transition: "all 0.3s ease",
          }}
        />
        <button
          type="submit"
          style={{
            ...buttonStyle,
            backgroundColor: isPulsing ? "#4ade80" : "#fff",
            color: isPulsing ? "#fff" : "#000",
          }}
        >
          {isPulsing ? "✓" : "Pulse"}
        </button>
      </form>
    </div>
  );
};

const chipRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
  overflowX: "auto",
  paddingBottom: "4px",
  scrollbarWidth: "none",
};

const chipStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "20px",
  border: "1px solid",
  fontSize: "0.75rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "all 0.2s",
};

const buttonStyle = {
  padding: "0 25px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold" as const,
  cursor: "pointer",
  minWidth: "100px",
};
