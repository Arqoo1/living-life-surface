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
    <div className="search-filter-container">
      <div className="search-input-wrapper">
        <input
          ref={searchRef}
          type="text"
          placeholder="Search... (⌘K)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            className="clear-btn"
            onClick={() => onChange("")}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <button className="export-btn" onClick={onExport}>
        ✨ Export CSV
      </button>
    </div>
  );
};
