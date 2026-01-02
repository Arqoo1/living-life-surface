import React, { useEffect, useState, useCallback } from "react";
import { getUserRules, updateRule } from "../api/rules";
import { getUserMoments, createMoment, deleteMoment } from "../api/moments";
import { getUserTracks } from "../api/tracks";
import { useUI } from "../context/ThemeContext";
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
  const [loading, setLoading] = useState(true);

  const { executeRules } = useUI();
  const token = localStorage.getItem("token");

  const runRulesEngine = useCallback(
    (currentRules: Rule[], currentMoments: Moment[]) => {
      const latestMoment =
        currentMoments.length > 0
          ? currentMoments[currentMoments.length - 1]
          : null;

      executeRules(currentRules, {
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        lastMoment: latestMoment,
      });
    },
    [executeRules]
  );
  const handleDeleteMoment = async (id: string) => {
    if (!token) return;
    try {
      await deleteMoment(token, id);
      const updatedMoments = moments.filter((m) => m._id !== id);
      setMoments(updatedMoments);

      runRulesEngine(rules, updatedMoments);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const [momentsRes, tracksRes, rulesRes] = await Promise.all([
          getUserMoments(token),
          getUserTracks(token),
          getUserRules(token),
        ]);

        setMoments(momentsRes);
        setTracks(tracksRes);
        setRules(rulesRes);

        runRulesEngine(rulesRes, momentsRes);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, runRulesEngine]);

  const handleRuleChange = async (newContent: string) => {
    if (!rules || rules.length === 0 || !rules[0]._id) return;

    const updatedRules = rules.map((r, index) =>
      index === 0 ? { ...r, content: newContent } : r
    );
    setRules(updatedRules);
    runRulesEngine(updatedRules, moments);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await updateRule(rules[0]._id, { content: newContent }, token);
    } catch (err) {
      console.warn("Database save failed, but UI updated locally:", err);
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
      const updatedMoments = [...moments, newMoment];
      setMoments(updatedMoments);

      runRulesEngine(rules, updatedMoments);
    } catch (err) {
      console.error("Failed to add moment:", err);
    }
  };

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

      {/* Moment Input Section */}
      <section style={{ marginBottom: "3rem" }}>
        <MomentInput onAdd={handleAddMoment} tracks={tracks} />
      </section>

      {/* Tracks Section */}
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

      {/* Moments Section */}
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
                  x{" "}
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

      {/* Monaco Rule Editor Section */}
      <section
        style={{
          marginTop: "5rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", opacity: 0.6, marginBottom: "1.5rem" }}>
          Interface Logic (DSL)
        </h2>

        <div
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <RuleEditor
            code={rules[0]?.content || ""}
            onSave={handleRuleChange}
          />
        </div>

        <div style={{ marginTop: "2rem", opacity: 0.2 }}>
          <h3 style={{ fontSize: "0.8rem" }}>Current Raw Stack:</h3>
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
