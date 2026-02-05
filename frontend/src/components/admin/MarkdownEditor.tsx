import React, { useState } from "react";
import { MarkdownRenderer } from "../MarkdownRenderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter markdown content...",
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div>
      <div className="editor-tabs">
        <button
          className={`editor-tab ${activeTab === "edit" ? "active" : ""}`}
          onClick={() => setActiveTab("edit")}
        >
          Editor
        </button>
        <button
          className={`editor-tab ${activeTab === "preview" ? "active" : ""}`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
      </div>

      <div className="editor-split">
        <div className={`editor-pane ${activeTab === "edit" ? "active" : ""}`}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              minHeight: "250px",
              fontFamily: "monospace",
              fontSize: "14px",
              padding: "12px",
              border: "2px solid #ddd",
              borderRadius: "6px",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div className={`editor-pane ${activeTab === "preview" ? "active" : ""}`}>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "12px",
              minHeight: "250px",
              overflow: "auto",
              backgroundColor: "#fafafa",
            }}
          >
            <MarkdownRenderer content={value} />
          </div>
        </div>
      </div>
    </div>
  );
};
