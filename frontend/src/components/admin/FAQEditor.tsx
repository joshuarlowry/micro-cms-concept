import type { FC, CSSProperties } from "react";

export interface FAQItem {
  question: string;
  answer_md: string;
}

interface FAQEditorProps {
  items: FAQItem[];
  onChange: (items: FAQItem[]) => void;
}

export const FAQEditor: FC<FAQEditorProps> = ({ items, onChange }) => {
  const updateItem = (index: number, field: "question" | "answer_md", value: string) => {
    const updated = [...items];
    const existing = updated[index];
    if (existing) {
      updated[index] = { ...existing, [field]: value };
      onChange(updated);
    }
  };

  const addItem = () => {
    onChange([...items, { question: "", answer_md: "" }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;
    const updated = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const currentItem = updated[index];
    const swapItem = updated[newIndex];
    if (currentItem && swapItem) {
      updated[index] = swapItem;
      updated[newIndex] = currentItem;
      onChange(updated);
    }
  };

  const buttonStyle: CSSProperties = {
    padding: "4px 8px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    background: "#fff",
    cursor: "pointer",
  };

  return (
    <div>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        {items.length} question{items.length !== 1 ? "s" : ""}
      </p>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            border: "2px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
            backgroundColor: "#fafafa",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <strong style={{ color: "#0066cc" }}>Question {index + 1}</strong>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                style={{
                  ...buttonStyle,
                  cursor: index === 0 ? "not-allowed" : "pointer",
                  opacity: index === 0 ? 0.5 : 1,
                }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                style={{
                  ...buttonStyle,
                  cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                  opacity: index === items.length - 1 ? 0.5 : 1,
                }}
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  ...buttonStyle,
                  border: "1px solid #dc3545",
                  color: "#dc3545",
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{ display: "block", marginBottom: "4px", fontSize: "0.85em", color: "#666" }}
            >
              Question
            </label>
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(index, "question", e.target.value)}
              placeholder="Enter the question..."
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "15px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{ display: "block", marginBottom: "4px", fontSize: "0.85em", color: "#666" }}
            >
              Answer (markdown supported)
            </label>
            <textarea
              value={item.answer_md}
              onChange={(e) => updateItem(index, "answer_md", e.target.value)}
              placeholder="Enter the answer..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "15px",
          cursor: "pointer",
          border: "2px dashed #0066cc",
          borderRadius: "8px",
          background: "#f0f7ff",
          color: "#0066cc",
          fontWeight: "500",
        }}
      >
        + Add FAQ Item
      </button>
    </div>
  );
};
