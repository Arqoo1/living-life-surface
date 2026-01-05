import React, { useState, useRef, useEffect } from "react";

interface MomentInputProps {
  onAdd: (data: any) => void;
  tracks: any[];
  availableTypes: string[];
  onAddTrack?: (name: string) => void;
  onAddType?: (name: string) => void;
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

  // --- AI STATE ---
  const [aiSuggestion, setAiSuggestion] = useState<{
    label: string;
    score: number;
  } | null>(null);
  const [newSuggestion, setNewSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../utils/worker.ts", import.meta.url),
        { type: "module" }
      );

      const onMessage = (e: MessageEvent) => {
        const { status, progress, results, type: resultType, error } = e.data;

        if (status === "progress") {
          const p = progress <= 1 ? progress * 100 : progress;
          setDownloadProgress(Math.round(p));
          if (p >= 99) setIsAiLoading(false);
        }

        if (status === "ready") {
          setIsAiLoading(false);
          setDownloadProgress(100);
          console.log("✅ AI Worker Ready");
        }

        if (status === "complete") {
          setIsAnalyzing(false);

          if (resultType === "discovery") {
            let suggestedWord = "";

            if (results && results.length > 0) {
              suggestedWord = results[0].word.replace("##", "").toLowerCase();
            } else {
              const stopWords = [
                "i",
                "am",
                "is",
                "are",
                "at",
                "the",
                "a",
                "an",
                "was",
                "were",
                "to",
                "be",
                "been",
                "being",
                "with",
                "and",
                "in",
                "on",
                "of",
                "it",
                "my",
                "doing",
              ];
              const cleanWords = content
                .toLowerCase()
                .replace(/[?.!,]/g, "")
                .split(" ")
                .filter((w) => !stopWords.includes(w) && w.length > 2);

              if (cleanWords.length > 0) {
                suggestedWord = cleanWords[cleanWords.length - 1];
              }
            }

            if (suggestedWord) {
              const existsInTypes = availableTypes.some(
                (t) => t.toLowerCase() === suggestedWord
              );
              const existsInTracks = tracks.some(
                (t) => t.name.toLowerCase() === suggestedWord
              );
              const isCurrentlySelected =
                type.toLowerCase() === suggestedWord ||
                track.toLowerCase() === suggestedWord;

              if (!existsInTypes && !existsInTracks && !isCurrentlySelected) {
                console.log("💡 New Discovery Suggestion:", suggestedWord);
                setNewSuggestion(suggestedWord);
              } else {
                console.log("🚫 Filtered existing suggestion:", suggestedWord);
                setNewSuggestion(null);
              }
            }
          } else {
            if (results?.scores && results.scores[0] > 0.6) {
              if (resultType === "category") {
                setAiSuggestion({
                  label: results.labels[0],
                  score: results.scores[0],
                });
                if (results.scores[0] > 0.8) setType(results.labels[0]);
              } else if (resultType === "track") {
                setTrack(results.labels[0]);
              }
            } else if (resultType === "category") {
              console.log(
                `📈 Weak match (${results.scores[0].toFixed(
                  2
                )}). Seeking new...`
              );
              worker.current?.postMessage({
                content: content.trim(),
                type: "discovery",
              });
            }
          }
        }

        if (status === "error") {
          setIsAnalyzing(false);
          console.error("❌ AI Worker Error:", error);
        }
      };

      worker.current.addEventListener("message", onMessage);
      worker.current.postMessage({ status: "init" });
    }

    return () => {
      worker.current?.terminate();
      worker.current = null;
    };
  }, [content, availableTypes, tracks, type, track]); 

  const handleMagicAi = () => {
    if (!worker.current || content.trim().length < 2) return;
    setIsAnalyzing(true);
    setAiSuggestion(null);
    setNewSuggestion(null);

    worker.current.postMessage({
      content: content.trim(),
      categories: availableTypes,
      type: "category",
    });

    const trackNames = tracks?.map((t) => t.name).filter(Boolean);
    if (trackNames && trackNames.length > 0) {
      worker.current.postMessage({
        content: content.trim(),
        categories: trackNames,
        type: "track",
      });
    }
  };

  const handleCreateFromAi = (mode: "type" | "track") => {
    if (!newSuggestion) return;
    if (mode === "type" && onAddType) {
      onAddType(newSuggestion);
      setType(newSuggestion);
    } else if (mode === "track" && onAddTrack) {
      onAddTrack(newSuggestion);
      setTrack(newSuggestion);
    }
    setNewSuggestion(null);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsPulsing(true);
    onAdd({ content, type, track: track ? [track] : ["General"] });
    setContent("");
    setTrack("");
    setAiSuggestion(null);
    setNewSuggestion(null);
    setTimeout(() => setIsPulsing(false), 600);
  };

  return (
    <div style={{ marginBottom: "2rem", transition: "all 0.4s ease" }}>
      <div style={{ fontSize: "10px", opacity: 0.6, marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isAiLoading ? "#f59e0b" : "#4ade80",
            }}
          />
          <span>
            {isAiLoading
              ? `Calibrating AI: ${downloadProgress}%`
              : "AI Intelligence Active"}
          </span>
        </div>
      </div>

      <div style={chipRowStyle}>
        {availableTypes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            style={{
              ...chipStyle,
              borderColor: type === t ? "#4ade80" : "rgba(255,255,255,0.1)",
              color: type === t ? "#4ade80" : "rgba(255,255,255,0.6)",
            }}
          >
            {getTypeIcon(t)} {t}
          </button>
        ))}
        <button
          onClick={() => {
            const n = prompt("Name?");
            if (n) onAddType?.(n);
          }}
          style={addBtnStyle}
        >
          + Type
        </button>
      </div>

      <div style={{ ...chipRowStyle, marginBottom: "20px" }}>
        {tracks.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setTrack(t.name)}
            style={{
              ...chipStyle,
              fontSize: "0.7rem",
              borderColor:
                track === t.name ? "#60a5fa" : "rgba(255,255,255,0.05)",
              color: track === t.name ? "#60a5fa" : "rgba(255,255,255,0.4)",
            }}
          >
            {t.name}
          </button>
        ))}
        <button
          onClick={() => {
            const n = prompt("Track?");
            if (n) onAddTrack?.(n);
          }}
          style={{ ...addBtnStyle, fontSize: "0.7rem" }}
        >
          + Track
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
          }}
        />

        {newSuggestion && (
          <div style={aiBadgeStyle}>
            Add "{newSuggestion}" as
            <span
              onClick={() => handleCreateFromAi("type")}
              style={badgeActionStyle}
            >
              Type
            </span>{" "}
            or
            <span
              onClick={() => handleCreateFromAi("track")}
              style={badgeActionStyle}
            >
              Track
            </span>
            <span
              onClick={() => setNewSuggestion(null)}
              style={{ marginLeft: "10px", opacity: 0.5, cursor: "pointer" }}
            >
              ×
            </span>
          </div>
        )}

        {aiSuggestion && aiSuggestion.label !== type && !newSuggestion && (
          <div style={aiBadgeStyle}>
            Select "{aiSuggestion.label}"?
            <span
              onClick={() => {
                setType(aiSuggestion.label);
                setAiSuggestion(null);
              }}
              style={badgeActionStyle}
            >
              Yes
            </span>
            <span
              onClick={() => setAiSuggestion(null)}
              style={{ marginLeft: "10px", opacity: 0.5, cursor: "pointer" }}
            >
              ×
            </span>
          </div>
        )}

        {!isAiLoading && content.length > 5 && (
          <button
            type="button"
            onClick={handleMagicAi}
            disabled={isAnalyzing}
            style={magicBtnStyle}
          >
            {isAnalyzing ? "..." : "✨"}
          </button>
        )}

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

// Styles (same as before)
const badgeActionStyle: React.CSSProperties = {
  textDecoration: "underline",
  margin: "0 5px",
  cursor: "pointer",
  color: "#000",
  fontWeight: "bold",
};
const magicBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: "125px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "rgba(74, 222, 128, 0.1)",
  border: "1px solid #4ade80",
  color: "#4ade80",
  borderRadius: "6px",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10,
};
const aiBadgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "-45px",
  right: "110px",
  backgroundColor: "#4ade80",
  color: "#000",
  borderRadius: "12px",
  padding: "8px 16px",
  fontSize: "0.8rem",
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  whiteSpace: "nowrap",
  zIndex: 20,
};
const chipRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
  overflowX: "auto",
  paddingBottom: "5px",
};
const chipStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "20px",
  border: "1px solid",
  fontSize: "0.75rem",
  cursor: "pointer",
  background: "transparent",
  whiteSpace: "nowrap",
};
const addBtnStyle: React.CSSProperties = {
  ...chipStyle,
  borderStyle: "dashed",
  borderColor: "#4ade80",
  color: "#fff",
};
const buttonStyle = {
  padding: "0 25px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold" as const,
  cursor: "pointer",
  minWidth: "100px",
};
