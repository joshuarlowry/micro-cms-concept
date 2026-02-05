import React from "react";

interface EditorActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  saveStatus: string;
  disabled?: boolean;
}

export const EditorActions: React.FC<EditorActionsProps> = ({
  onSaveDraft,
  onPublish,
  saveStatus,
  disabled = false,
}) => {
  return (
    <div>
      <div className="button-group" style={{ marginTop: "16px" }}>
        <button className="primary" onClick={onSaveDraft} disabled={disabled}>
          Save Draft
        </button>
        <button className="primary" onClick={onPublish} disabled={disabled}>
          Publish
        </button>
      </div>

      {saveStatus && (
        <p
          style={{
            marginTop: "12px",
            color: saveStatus.includes("✗") ? "#dc3545" : "#28a745",
            fontWeight: "500",
          }}
        >
          {saveStatus}
        </p>
      )}
    </div>
  );
};
