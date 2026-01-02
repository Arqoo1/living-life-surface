import React, { useEffect, useState } from "react";
import { getUserRules, updateRule } from "../api/rules";
import { useUI } from "../context/ThemeContext";

const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const { executeRules } = useUI();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      getUserRules(token).then((res) => {
        setRules(res);
        executeRules(res); 
      });
    }
  }, [token]);

  const handleSave = async (id: string, newContent: string) => {
    if (!token) return;
    try {
      const updated = await updateRule(id, { content: newContent }, token);
      const updatedRules = rules.map((r) => (r._id === id ? updated : r));
      setRules(updatedRules);
      
      executeRules(updatedRules); 
    } catch (err) {
      console.error("Failed to update rule", err);
    }
  };

  return (
    <div style={{ padding: "2rem", backgroundColor: "var(--bg-main)", minHeight: "100vh" }}>
      <h1 style={{ color: "var(--text-main)" }}>Interface Rules</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {rules.map((rule) => (
          <div key={rule._id}>
            <p style={{ color: "var(--text-main)", opacity: 0.6 }}>Rule ID: {rule._id}</p>
            <textarea
              defaultValue={rule.content}
              onBlur={(e) => handleSave(rule._id, e.target.value)}
              style={{
                width: "100%",
                height: "100px",
                padding: "1rem",
                fontFamily: "monospace",
                fontSize: "1rem",
                backgroundColor: "rgba(0,0,0,0.1)",
                color: "var(--text-main)",
                border: "1px solid var(--text-main)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RulesPage;