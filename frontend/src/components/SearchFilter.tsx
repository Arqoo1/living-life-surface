import React, { useEffect, useRef } from "react";

interface SearchFilterProps {
  value: string;
  onChange: (val: string) => void;
  onExport: () => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  onExport,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  // Global Hotkey: Cmd/Ctrl + K to Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ marginBottom: "2rem", display: "flex", gap: "10px" }}>
      <div style={{ position: "relative", flex: 1 }}>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search... (⌘K)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.8rem 1.2rem",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "0.9rem",
            outline: "none",
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#fff",
              opacity: 0.5,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <button
        onClick={onExport}
        style={{
          padding: "0 1.2rem",
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.2)",
          borderRadius: "10px",
          color: "#4ade80",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        }}
      >
        ✨ Export CSV
      </button>
    </div>
  );
};
