import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface ContentItemAdmin {
  key: string;
  type: string;
  label: string;
  current_draft?: string;
  current_published?: string;
}

interface Revision {
  id: string;
  key: string;
  mode: string;
  type: string;
  value: string;
  full_value: string;
  created_at: string;
  created_by: string;
}

interface FAQItem {
  question: string;
  answer_md: string;
}

// Content structure definition - what's editable and how it's labeled
const contentStructure: Record<string, Record<string, { key: string; label: string }[]>> = {
  "Home Page": {
    "Hero Section": [
      { key: "home.hero.title", label: "Title" },
      { key: "home.hero.subtitle", label: "Subtitle" },
      { key: "home.hero.body_md", label: "Body Content" },
    ],
    "Call to Action": [
      { key: "home.cta.label", label: "Button Label" },
      { key: "home.wizards.section_title", label: "Wizards Section Title" },
      { key: "home.wizards.wizard1.label", label: "Wizard 1 Button Label" },
      { key: "home.wizards.wizard2.label", label: "Wizard 2 Button Label" },
    ],
  },
  "FAQ Page": {
    "Content": [
      { key: "faq.items", label: "FAQ Items" },
    ],
  },
  "About Page": {
    "Content": [
      { key: "about.page.body_md", label: "Page Content" },
    ],
  },
  "Wizard 1: Secure Access": {
    "Step 1": [
      { key: "wizard.secure_access_setup.step.1.header.title", label: "Title" },
      { key: "wizard.secure_access_setup.step.1.header.subtitle", label: "Subtitle" },
      { key: "wizard.secure_access_setup.step.1.body.intro_md", label: "Introduction" },
      { key: "wizard.secure_access_setup.step.1.callout.note_md", label: "Note Callout" },
      { key: "wizard.secure_access_setup.step.1.footer.next_label", label: "Next Button" },
      { key: "wizard.secure_access_setup.step.1.footer.back_label", label: "Back Button" },
    ],
    "Step 2": [
      { key: "wizard.secure_access_setup.step.2.header.title", label: "Title" },
      { key: "wizard.secure_access_setup.step.2.body.intro_md", label: "Introduction" },
      { key: "wizard.secure_access_setup.step.2.body.options_help_md", label: "Options Help" },
      { key: "wizard.secure_access_setup.step.2.callout.caution_md", label: "Caution Callout" },
      { key: "wizard.secure_access_setup.step.2.footer.next_label", label: "Next Button" },
      { key: "wizard.secure_access_setup.step.2.footer.back_label", label: "Back Button" },
    ],
    "Step 3": [
      { key: "wizard.secure_access_setup.step.3.header.title", label: "Title" },
      { key: "wizard.secure_access_setup.step.3.body.review_intro_md", label: "Review Introduction" },
      { key: "wizard.secure_access_setup.step.3.callout.confirmation_md", label: "Confirmation Callout" },
      { key: "wizard.secure_access_setup.step.3.footer.confirm_label", label: "Confirm Button" },
      { key: "wizard.secure_access_setup.step.3.footer.back_label", label: "Back Button" },
      { key: "wizard.secure_access_setup.step.3.success.title", label: "Success Title" },
      { key: "wizard.secure_access_setup.step.3.success.body_md", label: "Success Message" },
    ],
  },
  "Wizard 2: Data Import": {
    "Step 1": [
      { key: "wizard.data_import_quickstart.step.1.header.title", label: "Title" },
      { key: "wizard.data_import_quickstart.step.1.body.intro_md", label: "Introduction" },
      { key: "wizard.data_import_quickstart.step.1.body.constraints_md", label: "Constraints" },
      { key: "wizard.data_import_quickstart.step.1.footer.next_label", label: "Next Button" },
      { key: "wizard.data_import_quickstart.step.1.footer.back_label", label: "Back Button" },
    ],
    "Step 2": [
      { key: "wizard.data_import_quickstart.step.2.header.title", label: "Title" },
      { key: "wizard.data_import_quickstart.step.2.body.intro_md", label: "Introduction" },
      { key: "wizard.data_import_quickstart.step.2.body.example_md", label: "Example" },
      { key: "wizard.data_import_quickstart.step.2.callout.tip_md", label: "Tip Callout" },
      { key: "wizard.data_import_quickstart.step.2.footer.next_label", label: "Next Button" },
      { key: "wizard.data_import_quickstart.step.2.footer.back_label", label: "Back Button" },
    ],
    "Step 3": [
      { key: "wizard.data_import_quickstart.step.3.header.title", label: "Title" },
      { key: "wizard.data_import_quickstart.step.3.body.validation_intro_md", label: "Validation Introduction" },
      { key: "wizard.data_import_quickstart.step.3.callout.common_errors_md", label: "Common Errors" },
      { key: "wizard.data_import_quickstart.step.3.footer.import_label", label: "Import Button" },
      { key: "wizard.data_import_quickstart.step.3.footer.back_label", label: "Back Button" },
      { key: "wizard.data_import_quickstart.step.3.success.title", label: "Success Title" },
      { key: "wizard.data_import_quickstart.step.3.success.body_md", label: "Success Message" },
    ],
  },
};

// Get all keys from the structure
const getAllKeys = (): string[] => {
  const keys: string[] = [];
  Object.values(contentStructure).forEach((sections) => {
    Object.values(sections).forEach((items) => {
      items.forEach((item) => keys.push(item.key));
    });
  });
  return keys;
};

export default function Admin() {
  const contentContext = useContent();
  const [selected, setSelected] = useState<ContentItemAdmin | null>(null);
  const [editValue, setEditValue] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  
  // Two-level navigation state
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const allKeys = getAllKeys();
  const categories = Object.keys(contentStructure);

  // Helper to infer type from key name
  const inferType = (key: string): string => {
    if (key.endsWith("_md")) return "markdown";
    if (key === "faq.items") return "rich_json";
    return "plain";
  };

  useEffect(() => {
    contentContext.fetchContent(allKeys);
  }, []);

  // Get sections for selected category
  const sections = selectedCategory ? Object.keys(contentStructure[selectedCategory] || {}) : [];
  
  // Get items for selected section
  const currentItems = selectedCategory && selectedSection 
    ? (contentStructure[selectedCategory]?.[selectedSection] || [])
    : [];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSection("");
    setSelected(null);
  };

  const handleSectionChange = (section: string) => {
    setSelectedSection(section);
    setSelected(null);
  };

  const handleSelectItem = async (item: { key: string; label: string }) => {
    const value = contentContext.content[item.key]?.value || "";
    const type = contentContext.content[item.key]?.type || inferType(item.key);
    
    const contentItem: ContentItemAdmin = {
      key: item.key,
      type,
      label: item.label,
      current_draft: value,
      current_published: value,
    };
    
    setSelected(contentItem);
    setEditValue(value);
    setShowRevisions(false);
    setSaveStatus("");
    setEditorTab("edit");

    // Parse FAQ items if this is the FAQ key
    if (item.key === "faq.items") {
      try {
        const parsed = value ? JSON.parse(value) : [];
        setFaqItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setFaqItems([]);
      }
    }

    // Fetch revisions for this key
    const revs = await contentContext.getRevisions(item.key);
    setRevisions(revs);
  };

  // FAQ editor helpers
  const updateFaqItem = (index: number, field: "question" | "answer_md", value: string) => {
    const updated = [...faqItems];
    updated[index] = { ...updated[index], [field]: value };
    setFaqItems(updated);
    setEditValue(JSON.stringify(updated, null, 2));
  };

  const addFaqItem = () => {
    const updated = [...faqItems, { question: "", answer_md: "" }];
    setFaqItems(updated);
    setEditValue(JSON.stringify(updated, null, 2));
  };

  const removeFaqItem = (index: number) => {
    const updated = faqItems.filter((_, i) => i !== index);
    setFaqItems(updated);
    setEditValue(JSON.stringify(updated, null, 2));
  };

  const moveFaqItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqItems.length - 1) return;
    const updated = [...faqItems];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFaqItems(updated);
    setEditValue(JSON.stringify(updated, null, 2));
  };

  const handleSaveDraft = async () => {
    if (!selected) return;
    try {
      setSaveStatus("Saving...");
      await contentContext.saveContent(selected.key, selected.type, editValue);
      setSaveStatus("✓ Draft saved!");
      setTimeout(() => setSaveStatus(""), 2000);
      setSelected({ ...selected, current_draft: editValue });
    } catch (error) {
      setSaveStatus("✗ Error saving draft");
    }
  };

  const handlePublish = async () => {
    if (!selected) return;
    try {
      setSaveStatus("Publishing...");
      await contentContext.publishContent(selected.key, editValue);
      setSaveStatus("✓ Published!");
      setTimeout(() => setSaveStatus(""), 2000);
      setSelected({ ...selected, current_published: editValue, current_draft: undefined });
    } catch (error) {
      setSaveStatus("✗ Error publishing");
    }
  };

  const handleRestore = async (revisionId: string, mode: string) => {
    if (!selected) return;
    try {
      setSaveStatus("Restoring...");
      await contentContext.restoreRevision(selected.key, revisionId, mode);
      setSaveStatus(`✓ Restored to ${mode}!`);
      setTimeout(() => setSaveStatus(""), 2000);
      const revs = await contentContext.getRevisions(selected.key);
      setRevisions(revs);
    } catch (error) {
      setSaveStatus("✗ Error restoring");
    }
  };

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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Content Editor</h1>
        <p className="subtitle">Edit content for pages and wizards</p>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Category Dropdown */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
              1. Select Page or Wizard
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={dropdownStyle}
            >
              <option value="">-- Choose a page --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Section Dropdown - only show if category has multiple sections */}
          {selectedCategory && sections.length > 1 && (
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
                2. Select Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                style={dropdownStyle}
              >
                <option value="">-- Choose a section --</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          )}

          {/* Auto-select section if only one */}
          {selectedCategory && sections.length === 1 && !selectedSection && (
            <>{handleSectionChange(sections[0])}</>
          )}

          {/* Content Items List */}
          {selectedSection && currentItems.length > 0 && (
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#555" }}>
                {sections.length > 1 ? "3. Select Field to Edit" : "2. Select Field to Edit"}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {currentItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      border: selected?.key === item.key ? "2px solid #0066cc" : "2px solid #ddd",
                      borderRadius: "6px",
                      backgroundColor: selected?.key === item.key ? "#f0f7ff" : "#fff",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: selected?.key === item.key ? "600" : "400",
                      color: selected?.key === item.key ? "#0066cc" : "#333",
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

      {/* Editor */}
      {selected && (
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1em" }}>
              {selected.label}
            </h3>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85em" }}>
              {selected.type === "markdown" ? "Markdown content" : selected.type === "rich_json" ? "Structured data" : "Plain text"}
            </p>
          </div>

          <div style={{ marginTop: "16px" }}>
            {selected.type === "plain" ? (
              <div>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Enter text..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "16px",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ) : selected.type === "markdown" ? (
              <div>
                <div className="editor-tabs">
                  <button 
                    className={`editor-tab ${editorTab === "edit" ? "active" : ""}`}
                    onClick={() => setEditorTab("edit")}
                  >
                    Editor
                  </button>
                  <button 
                    className={`editor-tab ${editorTab === "preview" ? "active" : ""}`}
                    onClick={() => setEditorTab("preview")}
                  >
                    Preview
                  </button>
                </div>
                
                <div className="editor-split">
                  <div className={`editor-pane ${editorTab === "edit" ? "active" : ""}`}>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Enter markdown content..."
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
                  <div className={`editor-pane ${editorTab === "preview" ? "active" : ""}`}>
                    <div style={{ 
                      border: "1px solid #ddd", 
                      borderRadius: "4px", 
                      padding: "12px", 
                      minHeight: "250px", 
                      overflow: "auto", 
                      backgroundColor: "#fafafa" 
                    }}>
                      <MarkdownRenderer content={editValue} />
                    </div>
                  </div>
                </div>
              </div>
            ) : selected.key === "faq.items" ? (
              <div>
                <p style={{ marginBottom: "16px", color: "#666" }}>
                  {faqItems.length} question{faqItems.length !== 1 ? "s" : ""}
                </p>
                
                {faqItems.map((item, index) => (
                  <div key={index} style={{
                    border: "2px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "16px",
                    backgroundColor: "#fafafa",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <strong style={{ color: "#0066cc" }}>Question {index + 1}</strong>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => moveFaqItem(index, "up")}
                          disabled={index === 0}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.5 : 1,
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            background: "#fff",
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFaqItem(index, "down")}
                          disabled={index === faqItems.length - 1}
                          style={{
                            padding: "4px 8px",
                            fontSize: "14px",
                            cursor: index === faqItems.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === faqItems.length - 1 ? 0.5 : 1,
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            background: "#fff",
                          }}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFaqItem(index)}
                          style={{
                            padding: "4px 10px",
                            fontSize: "14px",
                            cursor: "pointer",
                            border: "1px solid #dc3545",
                            borderRadius: "4px",
                            background: "#fff",
                            color: "#dc3545",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85em", color: "#666" }}>
                        Question
                      </label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => updateFaqItem(index, "question", e.target.value)}
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
                      <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85em", color: "#666" }}>
                        Answer (markdown supported)
                      </label>
                      <textarea
                        value={item.answer_md}
                        onChange={(e) => updateFaqItem(index, "answer_md", e.target.value)}
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
                  onClick={addFaqItem}
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
            ) : (
              <div>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder='Enter JSON...'
                  style={{ 
                    width: "100%", 
                    minHeight: "200px", 
                    fontFamily: "monospace", 
                    fontSize: "14px",
                    padding: "12px",
                    border: "2px solid #ddd",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            <div className="button-group" style={{ marginTop: "16px" }}>
              <button className="primary" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button className="primary" onClick={handlePublish}>
                Publish
              </button>
            </div>

            {saveStatus && (
              <p style={{ marginTop: "12px", color: saveStatus.includes("✗") ? "#dc3545" : "#28a745", fontWeight: "500" }}>
                {saveStatus}
              </p>
            )}
          </div>

          <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
            <button
              onClick={() => setShowRevisions(!showRevisions)}
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
              {showRevisions ? "▼" : "▶"} Revision History ({revisions.length})
            </button>

            {showRevisions && (
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
                            onClick={() => handleRestore(rev.id, rev.mode === "published" ? "draft" : "published")}
                            style={{ flexShrink: 0 }}
                          >
                            Restore
                          </button>
                        </div>
                        <p className="revision-preview">
                          {rev.value.substring(0, 80)}{rev.value.length > 80 ? "..." : ""}
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
        </div>
      )}

      {!selected && selectedCategory && selectedSection && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
          <p>Select a field above to start editing</p>
        </div>
      )}

      {!selectedCategory && (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
          <p style={{ fontSize: "1.1em" }}>Select a page or wizard above to get started</p>
        </div>
      )}
    </div>
  );
}
