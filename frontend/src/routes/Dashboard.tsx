import React, { useEffect, useState, useCallback } from "react";
import { fetchRulesWithCSS, updateRule } from "../api/rules";
import { getUserMoments, createMoment, deleteMoment } from "../api/moments";
import { getUserTracks } from "../api/tracks";
import { RuleEditor } from "../components/RuleEditor";
import { MomentInput } from "../components/MomentInput";

interface Moment {
  _id: string;
  type: string;
  content: string;
  track: string[];
  timestamp: string;
  customStyle?: any;
}

interface Track {
  _id: string;
  name: string;
  color: string;
}

interface Rule {
  _id: string;
  content: string;
}

const Dashboard: React.FC = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [editorDraft, setEditorDraft] = useState<string>(""); // Local draft for typing
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const token = localStorage.getItem("token") || "";

  //inject CSS variables into the DOM
  const injectCSS = (cssVariables: Record<string, string>) => {
    Object.entries(cssVariables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, String(value));
    });
  };

  const applyCSS = useCallback(async () => {
    if (!token) return;
    try {
      const { cssVariables } = await fetchRulesWithCSS(token);
      injectCSS(cssVariables);
    } catch (err) {
      console.error("Failed to fetch/apply CSS variables:", err);
    }
  }, [token]);

  const handleDeleteMoment = async (id: string) => {
    if (!token) return;
    try {
      await deleteMoment(token, id);
      setMoments((prev) => prev.filter((m) => m._id !== id));
      applyCSS();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleAddMoment = async (momentData: {
    type: string;
    content: string;
    track: string[];
  }) => {
    if (!token) return;
    try {
      const newMoment = await createMoment(token, momentData);
      setMoments((prev) => [...prev, newMoment]);
      applyCSS();
    } catch (err) {
      console.error("Failed to add moment:", err);
    }
  };

  // 1. Updates the draft as you type (no API call)
  const handleRuleChange = (newContent: string) => {
    setEditorDraft(newContent);
  };

  // 2. Persists to DB and triggers Python evaluation
  const handleSaveRules = async () => {
    if (!token || !rules[0]?._id) return;
    setSaveLoading(true);
    try {
      // Update the DB
      await updateRule(token, rules[0]._id, editorDraft);

      // Fetch the newly evaluated CSS from Python
      const rulesRes = await fetchRulesWithCSS(token);

      // Update states
      setRules(rulesRes.rules);
      injectCSS(rulesRes.cssVariables);

      console.log("Rules saved and CSS applied");
    } catch (err) {
      console.error("Failed to save rules:", err);
      alert("Error saving rules. Check your syntax.");
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [momentsRes, tracksRes, rulesRes] = await Promise.all([
          getUserMoments(token),
          getUserTracks(token),
          fetchRulesWithCSS(token),
        ]);

        setMoments(momentsRes);
        setTracks(tracksRes);
        setRules(rulesRes.rules);
        setEditorDraft(rulesRes.rules[0]?.content || "");
        injectCSS(rulesRes.cssVariables);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading)
    return (
      <p style={{ textAlign: "center", color: "var(--text-main)" }}>
        Loading dashboard...
      </p>
    );

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "var(--bg-main)",
        color: "var(--text-main)",
        minHeight: "100vh",
        transition: "background-color 1.5s ease, color 1.5s ease",
      }}
    >
      <h1 style={{ marginBottom: "2rem", fontWeight: 300 }}>Life Stream</h1>

      <section style={{ marginBottom: "3rem" }}>
        <MomentInput onAdd={handleAddMoment} tracks={tracks} />
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "1rem" }}>
          Tracks
        </h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {tracks.map((t) => (
            <div
              key={t._id}
              style={{
                padding: "0.4rem 1rem",
                backgroundColor: t.color,
                borderRadius: "20px",
                color: "#fff",
                fontSize: "0.85rem",
              }}
            >
              {t.name}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "1rem" }}>
          Moments
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {moments
            .slice()
            .reverse()
            .map((m) => (
              <div
                key={m._id}
                style={{
                  position: "relative",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  marginBottom: "1rem",
                  backgroundColor: `var(--moment-color-${m.type}, rgba(255, 255, 255, 0.03))`,
                  transition: "background-color 0.5s ease",
                }}
              >
                <button
                  onClick={() => handleDeleteMoment(m._id)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    right: "20px",
                    background: "none",
                    border: "none",
                    color: "inherit",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                  }}
                >
                  x
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <strong
                    style={{
                      opacity: 0.5,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {m.type}
                  </strong>
                  <small style={{ opacity: 0.4, fontSize: "0.75rem" }}>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <p
                  style={{
                    fontSize: "1.2rem",
                    margin: "0.8rem 0",
                    lineHeight: "1.4",
                  }}
                >
                  {m.content}
                </p>
              </div>
            ))}
        </div>
      </section>

      <section
        style={{
          marginTop: "5rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", opacity: 0.6 }}>
            Interface Logic (DSL)
          </h2>
          <button
            onClick={handleSaveRules}
            disabled={saveLoading}
            style={{
              backgroundColor: saveLoading ? "#333" : "#fff",
              color: "#000",
              border: "none",
              padding: "0.5rem 1.5rem",
              borderRadius: "6px",
              cursor: saveLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "0.8rem",
            }}
          >
            {saveLoading ? "Evaluating..." : "Save & Apply Rules"}
          </button>
        </div>

        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <RuleEditor code={editorDraft} onSave={handleRuleChange} />
        </div>

        <div style={{ marginTop: "2rem", opacity: 0.2 }}>
          <h3 style={{ fontSize: "0.8rem" }}>Last Saved Version:</h3>
          {rules.map((r) => (
            <code
              key={r._id}
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontFamily: "monospace",
              }}
            >
              {r.content}
            </code>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
