import React, { useState } from "react";

export const MomentInput: React.FC<{
  onAdd: (data: any) => void;
  tracks: any[];
}> = ({ onAdd, tracks }) => {
  const [content, setContent] = useState(""); 
  const [type, setType] = useState("happy");
  const [track, setTrack] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAdd({
      content: content,
      type: type,
      track: track ? [track] : ["General"],
    });

    setContent(""); 
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)} 
        placeholder="What's happening?"
        style={{
          flex: 1,
          padding: "0.8rem",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.05)",
          color: "white",
        }}
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={selectStyle}
      >
        <option value="happy">Happy</option>
        <option value="reflective">Reflective</option>
        <option value="focused">Focused</option>
        <option value="stressed">Stressed</option>
      </select>

      <select
        value={track}
        onChange={(e) => setTrack(e.target.value)}
        style={selectStyle}
      >
        <option value="">Track...</option>
        {tracks.map((t) => (
          <option key={t._id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <button type="submit" style={buttonStyle}>
        Pulse
      </button>
    </form>
  );
};

const selectStyle = {
  background: "#111",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "0 10px",
};
const buttonStyle = {
  padding: "0 20px",
  borderRadius: "8px",
  border: "none",
  background: "#fff",
  color: "#000",
  fontWeight: "bold",
  cursor: "pointer",
};
