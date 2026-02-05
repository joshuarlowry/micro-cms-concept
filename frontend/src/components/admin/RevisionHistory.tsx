import React, { useState } from "react";

export interface Revision {
  id: string;
  key: string;
  mode: string;
  type: string;
  value: string;
  created_at: string;
  created_by: string;
}

interface RevisionHistoryProps {
  revisions: Revision[];
  onRestore: (revisionId: string, targetMode: string) => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({ revisions, onRestore }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "none",
          color: "#0066cc",
          cursor: "pointer",
          fontSize: "1em",
          fontWeight: "500",
          padding: "8px 0",
          minHeight: "44px",
          textAlign: "left",
        }}
      >
        {expanded ? "▼" : "▶"} Revision History ({revisions.length})
      </button>

      {expanded && (
        <div style={{ marginTop: "12px" }}>
          {revisions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {revisions.map((rev) => (
                <div key={rev.id} className="revision-item">
                  <div className="revision-header">
                    <div className="revision-info">
                      <p style={{ margin: 0, fontWeight: "500" }}>
                        {rev.mode === "published" ? "🚀" : "📝"} {rev.mode.toUpperCase()}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85em", color: "#666" }}>
                        {new Date(rev.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="secondary"
                      onClick={() =>
                        onRestore(rev.id, rev.mode === "published" ? "draft" : "published")
                      }
                      style={{ flexShrink: 0 }}
                    >
                      Restore
                    </button>
                  </div>
                  <p className="revision-preview">
                    {rev.value.substring(0, 80)}
                    {rev.value.length > 80 ? "..." : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No revisions yet</p>
          )}
        </div>
      )}
    </div>
  );
};
