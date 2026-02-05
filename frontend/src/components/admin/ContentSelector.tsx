import React from "react";

interface ContentItem {
  key: string;
  label: string;
}

interface ContentSelectorProps {
  categories: string[];
  sections: string[];
  items: ContentItem[];
  selectedCategory: string;
  selectedSection: string;
  selectedKey: string | null;
  onCategoryChange: (category: string) => void;
  onSectionChange: (section: string) => void;
  onItemSelect: (item: ContentItem) => void;
}

const dropdownStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: "16px",
  border: "2px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "#fff",
  cursor: "pointer",
  marginBottom: "12px",
};

export const ContentSelector: React.FC<ContentSelectorProps> = ({
  categories,
  sections,
  items,
  selectedCategory,
  selectedSection,
  selectedKey,
  onCategoryChange,
  onSectionChange,
  onItemSelect,
}) => {
  const showSectionDropdown = selectedCategory && sections.length > 1;
  const stepNumber = showSectionDropdown ? 3 : 2;

  return (
    <div className="card" style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Category Dropdown */}
        <div>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
            1. Select Page or Wizard
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={dropdownStyle}
          >
            <option value="">-- Choose a page --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Section Dropdown */}
        {showSectionDropdown && (
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
              2. Select Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">-- Choose a section --</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        )}

        {/* Content Items List */}
        {selectedSection && items.length > 0 && (
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
              {stepNumber}. Select Field to Edit
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onItemSelect(item)}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    border: selectedKey === item.key ? "2px solid #0066cc" : "2px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: selectedKey === item.key ? "#f0f7ff" : "#fff",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: selectedKey === item.key ? "600" : "400",
                    color: selectedKey === item.key ? "#0066cc" : "#333",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
