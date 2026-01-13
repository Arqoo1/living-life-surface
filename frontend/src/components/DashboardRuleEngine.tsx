import React from "react";
import { RuleEditor } from "./RuleEditor";

interface DashboardRuleEngineProps {
  editorDraft: string;
  setEditorDraft: (val: string) => void;
  handleSaveRules: () => void;
  saveLoading: boolean;
  onShowAlert: (msg: string) => void;
}

export const DashboardRuleEngine: React.FC<DashboardRuleEngineProps> = ({
  editorDraft,
  setEditorDraft,
  handleSaveRules,
  saveLoading,
  onShowAlert,
}) => {
  const onSaveClick = () => {
    handleSaveRules();
    onShowAlert("Logic Rules Re-compiled");
  };

  return (
    <section className="rules-engine">
      <div className="rules-header">
        <div className="rules-title-group">
          <h2>Rules Engine</h2>
          <span className="intel-badge">INTELLIGENCE ACTIVE</span>
        </div>
        <button
          className="save-btn"
          onClick={onSaveClick}
          disabled={saveLoading}
        >
          {saveLoading ? "Saving..." : "Save Rules"}
        </button>
      </div>
      <RuleEditor code={editorDraft} onSave={(val) => setEditorDraft(val)} />
    </section>
  );
};
