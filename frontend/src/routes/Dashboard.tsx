import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { fetchRulesWithCSS, updateRule } from "../api/rules";
import { getUserMoments, createMoment, deleteMoment } from "../api/moments";
import { getUserTracks, createTrack, deleteTrack } from "../api/tracks";
import { RuleEditor } from "../components/RuleEditor";
import { MomentInput } from "../components/MomentInput";
import { StreamInsights } from "../components/StreamInsights";
import { SearchFilter } from "../components/SearchFilter";
import { StreakCounter } from "../components/StreakCounter";
import { VibeHeatmap } from "../components/VibeHeatmap";
import { TimeTravel } from "../components/TimeTravel";
import { db } from "../db";

// --- Sub-component: Settings Modal ---
const SettingsModal = ({
  isOpen,
  onClose,
  tracks,
  onDeleteTrack,
  types,
  onDeleteType,
}: any) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          backgroundColor: "#16161a",
          padding: "2rem",
          borderRadius: "15px",
          width: "90%",
          maxWidth: "400px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 300 }}>
            Stream Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "1.2rem",
              cursor: "pointer",
              opacity: 0.5,
            }}
          >
            ✕
          </button>
        </div>

        <h3
          style={{
            fontSize: "0.7rem",
            opacity: 0.4,
            marginTop: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Your Tracks
        </h3>
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            marginBottom: "1rem",
          }}
        >
          {tracks.length === 0 ? (
            <p style={{ fontSize: "0.8rem", opacity: 0.3, padding: "10px 0" }}>
              No tracks found.
            </p>
          ) : (
            tracks.map((track: any) => (
              <div
                key={track._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: track.color || "#4ade80",
                    }}
                  />
                  # {track.name}
                </span>
                <button
                  onClick={() => onDeleteTrack(track._id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff4d4d",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    opacity: 0.8,
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <h3
          style={{
            fontSize: "0.7rem",
            opacity: 0.4,
            marginTop: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Active Types
        </h3>
        <p style={{ fontSize: "0.65rem", opacity: 0.4, marginBottom: "10px" }}>
          Derived from your history & session
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {types.map((type: string) => (
            <span
              key={type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "5px",
                fontSize: "0.75rem",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {type}
              <button
                onClick={() => onDeleteType(type)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4d4d",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.6,
                }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "2rem",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#fff",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const moments =
    useLiveQuery(() => db.moments.reverse().sortBy("timestamp"), []) || [];
  const rules = useLiveQuery(() => db.rules.toArray(), []) || [];

  const [tracks, setTracks] = useState<any[]>([]);
  const [editorDraft, setEditorDraft] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>("Never synced");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"focus" | "editor">("focus");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- NEW CHANGE: LOCAL STATE FOR TYPED CATEGORIES ---
  const [customTypes, setCustomTypes] = useState<string[]>([]);

  const token = localStorage.getItem("token") || "";

  // --- UPDATED: MERGE DEFAULT, DB, AND NEWLY TYPED TYPES ---
  const availableTypes = useMemo(() => {
    const typesInData = moments.map((m) => m.type.toLowerCase());
    const defaults = ["happy", "reflective", "focused", "stressed"];
    const unique = Array.from(
      new Set([...defaults, ...typesInData, ...customTypes])
    );
    return unique;
  }, [moments, customTypes]);

  const filteredMoments = moments.filter((m) => {
    const query = searchQuery.toLowerCase();
    const momentDate = new Date(m.timestamp).toISOString().split("T")[0];
    const matchesDate = selectedDate ? momentDate === selectedDate : true;
    const matchesSearch =
      m.content.toLowerCase().includes(query) ||
      m.type.toLowerCase().includes(query) ||
      m.track.some((t: string) => t.toLowerCase().includes(query));

    return matchesDate && matchesSearch;
  });

  const handleExportCSV = () => {
    if (moments.length === 0) return;
    const headers = [
      "Day",
      "Date",
      "Time",
      "Category",
      "Moment Content",
      "Vibes/Tracks",
    ];
    const rows = moments.map((m) => {
      const d = new Date(m.timestamp);
      return [
        d.toLocaleDateString("en-US", { weekday: "long" }),
        d.toLocaleDateString("en-US"),
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        m.type.toUpperCase(),
        `"${m.content.replace(/"/g, '""')}"`,
        `"${m.track.join(" | ")}"`,
      ];
    });
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Life_Stream_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateSyncRelativeTime = useCallback(() => {
    if (!lastSynced) return;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
    if (diff < 5) setSyncMessage("Just now");
    else if (diff < 60) setSyncMessage("Seconds ago");
    else setSyncMessage(`${Math.floor(diff / 60)}m ago`);
  }, [lastSynced]);

  useEffect(() => {
    const interval = setInterval(updateSyncRelativeTime, 60000);
    updateSyncRelativeTime();
    return () => clearInterval(interval);
  }, [updateSyncRelativeTime]);

  const injectCSS = (cssVariables: Record<string, string>) => {
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, String(value));
    });
  };

  const applyCSS = useCallback(async () => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const { cssVariables } = await fetchRulesWithCSS(token);
      injectCSS(cssVariables);
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [token]);

  const handleDeleteMoment = async (id: string) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      await db.moments.delete(id);
      await deleteMoment(token, id);
      applyCSS();
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMoment = async (momentData: any) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const newMoment = await createMoment(token, momentData);
      await db.moments.add(newMoment);
      applyCSS();
      setLastSynced(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- UPDATED: SAVE NEWLY TYPED TYPE TO LOCAL STATE IMMEDIATELY ---
  const handleAddType = (typeName: string) => {
    const normalized = typeName.trim().toLowerCase();
    if (normalized && !availableTypes.includes(normalized)) {
      setCustomTypes((prev) => [...prev, normalized]);
    }
  };

  const handleDeleteType = async (typeName: string) => {
    if (!window.confirm(`Delete all moments marked as "${typeName}"?`)) return;

    setIsSyncing(true);
    try {
      const momentsToDelete = moments.filter(
        (m) => m.type.toLowerCase() === typeName.toLowerCase()
      );

      await db.moments
        .filter((m) => m.type.toLowerCase() === typeName.toLowerCase())
        .delete();

      if (token && momentsToDelete.length > 0) {
        await Promise.all(
          momentsToDelete.map((m) => deleteMoment(token, m._id))
        );
      }

      // Also remove from local customTypes state if it exists there
      setCustomTypes((prev) =>
        prev.filter((t) => t.toLowerCase() !== typeName.toLowerCase())
      );

      applyCSS();
      setLastSynced(new Date());
    } catch (err) {
      console.error("Failed to delete type:", err);
      alert("Could not delete type. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddTrack = async (trackName: string) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const savedTrack = await createTrack(token, trackName);
      setTracks((prev) => [...prev, savedTrack]);
      setLastSynced(new Date());
    } catch (err) {
      console.error("Error creating track:", err);
      alert("Failed to save track to server.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (!window.confirm("Delete this track permanently?")) return;

    setIsSyncing(true);
    try {
      setTracks((prev) => prev.filter((t) => t._id !== trackId));
      if (token) {
        await deleteTrack(token, trackId);
      }
      setLastSynced(new Date());
    } catch (err) {
      console.error("Failed to delete track:", err);
      alert("Could not delete track. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveRules = async () => {
    if (!token || !rules[0]?._id) return;
    setSaveLoading(true);
    setIsSyncing(true);
    try {
      await updateRule(token, rules[0]._id, editorDraft);
      const res = await fetchRulesWithCSS(token);
      if (res.rules[0]) await db.rules.put(res.rules[0]);
      injectCSS(res.cssVariables);
      setLastSynced(new Date());
    } catch (err) {
      alert("Error saving rules.");
    } finally {
      setSaveLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const syncData = async () => {
      if (!token) return;
      setIsSyncing(true);
      try {
        const [mRes, tRes, rRes] = await Promise.all([
          getUserMoments(token),
          getUserTracks(token),
          fetchRulesWithCSS(token),
        ]);
        await db.transaction("rw", db.moments, db.rules, async () => {
          await db.moments.clear();
          await db.moments.bulkAdd(mRes);
          await db.rules.clear();
          await db.rules.bulkAdd(rRes.rules);
        });
        setTracks(tRes);
        if (!editorDraft || (rules[0] && editorDraft === rules[0].content)) {
          setEditorDraft(rRes.rules[0]?.content || "");
        }
        injectCSS(rRes.cssVariables);
        setLastSynced(new Date());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    };
    syncData();
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, [token, editorDraft]);

  if (loading && moments.length === 0)
    return (
      <p
        style={{
          textAlign: "center",
          color: "var(--text-main)",
          marginTop: "20vh",
        }}
      >
        Connecting...
      </p>
    );

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
        minHeight: "100vh",
      }}
    >
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        tracks={tracks}
        onDeleteTrack={handleDeleteTrack}
        types={availableTypes}
        onDeleteType={handleDeleteType}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h1 style={{ margin: 0, fontWeight: 300 }}>Life Stream</h1>
          <StreakCounter moments={moments} />

          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "20px",
              padding: "2px",
            }}
          >
            <button
              onClick={() => setViewMode("focus")}
              style={{
                padding: "4px 12px",
                borderRadius: "18px",
                border: "none",
                fontSize: "0.7rem",
                cursor: "pointer",
                backgroundColor:
                  viewMode === "focus"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                color: viewMode === "focus" ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              Focus
            </button>
            <button
              onClick={() => setViewMode("editor")}
              style={{
                padding: "4px 12px",
                borderRadius: "18px",
                border: "none",
                fontSize: "0.7rem",
                cursor: "pointer",
                backgroundColor:
                  viewMode === "editor"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                color: viewMode === "editor" ? "#fff" : "rgba(255,255,255,0.4)",
              }}
            >
              Editor
            </button>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)",
              padding: "4px 10px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.7rem",
              transition: "all 0.2s ease",
            }}
          >
            ⚙️ Manage
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255,255,255,0.05)",
            padding: "5px 12px",
            borderRadius: "15px",
            fontSize: "0.8rem",
          }}
        >
          <div
            className="sync-spinner"
            style={{
              width: "12px",
              height: "12px",
              border: "2px solid rgba(74, 222, 128, 0.2)",
              borderTop: "2px solid #4ade80",
              borderRadius: "50%",
              animation: isSyncing ? "spin 1s linear infinite" : "none",
            }}
          />
          <span>{isSyncing ? "Syncing..." : `Synced: ${syncMessage}`}</span>
        </div>
      </div>

      <section style={{ marginBottom: "2rem" }}>
        <MomentInput
          onAdd={handleAddMoment}
          tracks={tracks}
          availableTypes={availableTypes}
          onAddTrack={handleAddTrack}
          onAddType={handleAddType}
        />
      </section>

      <TimeTravel selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <SearchFilter
        value={searchQuery}
        onChange={setSearchQuery}
        onExport={handleExportCSV}
      />
      <StreamInsights allMoments={moments} moments={filteredMoments} />
      <VibeHeatmap
        allMoments={moments}
        onDateClick={(date) => setSelectedDate(date)}
      />

      <section style={{ marginTop: "3rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", opacity: 0.6, margin: 0 }}>
            {selectedDate
              ? `Moments for ${new Date(selectedDate).toLocaleDateString()}`
              : searchQuery
              ? `Results (${filteredMoments.length})`
              : "Moments"}
          </h2>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "15px",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              ✕ Clear Filter
            </button>
          )}
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
        >
          {filteredMoments.map((m) => (
            <div
              key={m._id}
              style={{
                position: "relative",
                padding: "1.2rem",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                backgroundColor: `var(--moment-color-${m.type.toLowerCase()}, rgba(255, 255, 255, 0.02))`,
              }}
            >
              <button
                onClick={() => handleDeleteMoment(m._id)}
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  opacity: 0.3,
                }}
              >
                ✕
              </button>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <strong
                    style={{
                      opacity: 0.5,
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.type}
                  </strong>
                  {m.track.map((t: string) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.6rem",
                        color: "#4ade80",
                        opacity: 0.8,
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <small style={{ opacity: 0.4, fontSize: "0.7rem" }}>
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              <p style={{ fontSize: "1.1rem", margin: 0 }}>{m.content}</p>
            </div>
          ))}
          {filteredMoments.length === 0 && (
            <p style={{ textAlign: "center", opacity: 0.3, padding: "2rem" }}>
              No moments found.
            </p>
          )}
        </div>
      </section>

      {viewMode === "editor" && (
        <section
          style={{
            marginTop: "4rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "2rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "0.9rem", opacity: 0.5 }}>Rules Engine</h2>
            <button
              onClick={handleSaveRules}
              disabled={saveLoading}
              style={{
                backgroundColor: "#fff",
                color: "#000",
                border: "none",
                padding: "0.4rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "bold",
                opacity: saveLoading ? 0.5 : 1,
              }}
            >
              {saveLoading ? "Saving..." : "Save Rules"}
            </button>
          </div>
          <div
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <RuleEditor
              code={editorDraft}
              onSave={(val) => setEditorDraft(val)}
            />
          </div>
        </section>
      )}

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
