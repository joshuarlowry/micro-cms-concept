import React from "react";

interface PlainTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PlainTextEditor: React.FC<PlainTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "16px",
        border: "2px solid #ddd",
        borderRadius: "6px",
        boxSizing: "border-box",
      }}
    />
  );
};
