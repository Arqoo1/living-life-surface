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
          if (resultType === "category" || resultType === "track") {
            setIsAnalyzing(false);
          }

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
          }

          if (resultType === "category" || resultType === "track") {
            if (results?.scores && results.scores[0] > 0.45) {
              if (resultType === "category") {
                setAiSuggestion({
                  label: results.labels[0],
                  score: results.scores[0],
                });
                setType(results.labels[0]);
              } else if (resultType === "track") {
                setTrack(results.labels[0]);
              }
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


    worker.current.postMessage({
      content: content.trim(),
      type: "discovery",
    });
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
    <div className="moment-input-container">
      <div className="ai-status">
        <div className={`dot ${isAiLoading ? "loading" : "active"}`} />
        <span>
          {isAiLoading
            ? `Calibrating AI: ${downloadProgress}%`
            : "AI Intelligence Active"}
        </span>
      </div>

      <div className="chip-row">
        {availableTypes.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={type === t ? "type-active" : ""}
          >
            {getTypeIcon(t)} {t}
          </button>
        ))}
        <button
          onClick={() => {
            const n = prompt("Name?");
            if (n) onAddType?.(n);
          }}
          className="add-btn"
        >
          + Type
        </button>
      </div>

      <div className="chip-row">
        {tracks.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setTrack(t.name)}
            className={track === t.name ? "track-active" : ""}
            style={{ fontSize: "0.7rem" }}
          >
            {t.name}
          </button>
        ))}
        <button
          onClick={() => {
            const n = prompt("Track?");
            if (n) onAddTrack?.(n);
          }}
          className="add-btn"
          style={{ fontSize: "0.7rem" }}
        >
          + Track
        </button>
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className={isPulsing ? "pulsing" : ""}
        />

        {newSuggestion && (
          <div className="ai-badge">
            Add "{newSuggestion}" as
            <span className="action" onClick={() => handleCreateFromAi("type")}>
              Type
            </span>
            or
            <span
              className="action"
              onClick={() => handleCreateFromAi("track")}
            >
              Track
            </span>
            <span className="close" onClick={() => setNewSuggestion(null)}>
              ×
            </span>
          </div>
        )}

        {aiSuggestion && aiSuggestion.label !== type && !newSuggestion && (
          <div className="ai-badge">
            Select "{aiSuggestion.label}"?
            <span
              className="action"
              onClick={() => {
                setType(aiSuggestion.label);
                setAiSuggestion(null);
              }}
            >
              Yes
            </span>
            <span className="close" onClick={() => setAiSuggestion(null)}>
              ×
            </span>
          </div>
        )}

        {!isAiLoading && content.length > 5 && (
          <button
            type="button"
            onClick={handleMagicAi}
            disabled={isAnalyzing}
            className="magic-ai-btn"
          >
            {isAnalyzing ? "..." : "✨"}
          </button>
        )}

        <button
          type="submit"
          className={`submit-btn ${isPulsing ? "pulsing" : ""}`}
        >
          {isPulsing ? "✓" : "Pulse"}
        </button>
      </form>
    </div>
  );
};
