import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface ContentItemAdmin {
  key: string;
  type: string;
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

export default function Admin() {
  const contentContext = useContent();
  const [allContent, setAllContent] = useState<ContentItemAdmin[]>([]);
  const [selected, setSelected] = useState<ContentItemAdmin | null>(null);
  const [filter, setFilter] = useState("");
  const [editValue, setEditValue] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    // Fetch all known content keys
    const allKeys = [
      // Home
      "home.hero.title",
      "home.hero.subtitle",
      "home.hero.body_md",
      "home.cta.label",
      "home.cta.href",
      // FAQ
      "faq.items",
      // About
      "about.page.body_md",
      // Wizard 1
      "wizard.secure_access_setup.step.1.header.title",
      "wizard.secure_access_setup.step.1.header.subtitle",
      "wizard.secure_access_setup.step.1.body.intro_md",
      "wizard.secure_access_setup.step.1.callout.note_md",
      "wizard.secure_access_setup.step.1.footer.next_label",
      "wizard.secure_access_setup.step.1.footer.back_label",
      "wizard.secure_access_setup.step.2.header.title",
      "wizard.secure_access_setup.step.2.body.intro_md",
      "wizard.secure_access_setup.step.2.body.options_help_md",
      "wizard.secure_access_setup.step.2.callout.caution_md",
      "wizard.secure_access_setup.step.2.footer.next_label",
      "wizard.secure_access_setup.step.2.footer.back_label",
      "wizard.secure_access_setup.step.3.header.title",
      "wizard.secure_access_setup.step.3.body.review_intro_md",
      "wizard.secure_access_setup.step.3.callout.confirmation_md",
      "wizard.secure_access_setup.step.3.footer.confirm_label",
      "wizard.secure_access_setup.step.3.footer.back_label",
      "wizard.secure_access_setup.step.3.success.title",
      "wizard.secure_access_setup.step.3.success.body_md",
      // Wizard 2
      "wizard.data_import_quickstart.step.1.header.title",
      "wizard.data_import_quickstart.step.1.body.intro_md",
      "wizard.data_import_quickstart.step.1.body.constraints_md",
      "wizard.data_import_quickstart.step.1.footer.next_label",
      "wizard.data_import_quickstart.step.1.footer.back_label",
      "wizard.data_import_quickstart.step.2.header.title",
      "wizard.data_import_quickstart.step.2.body.intro_md",
      "wizard.data_import_quickstart.step.2.body.example_md",
      "wizard.data_import_quickstart.step.2.callout.tip_md",
      "wizard.data_import_quickstart.step.2.footer.next_label",
      "wizard.data_import_quickstart.step.2.footer.back_label",
      "wizard.data_import_quickstart.step.3.header.title",
      "wizard.data_import_quickstart.step.3.body.validation_intro_md",
      "wizard.data_import_quickstart.step.3.callout.common_errors_md",
      "wizard.data_import_quickstart.step.3.footer.import_label",
      "wizard.data_import_quickstart.step.3.footer.back_label",
      "wizard.data_import_quickstart.step.3.success.title",
      "wizard.data_import_quickstart.step.3.success.body_md",
    ];

    contentContext.fetchContent(allKeys).then(() => {
      const content = allKeys.map((key) => ({
        key,
        type: contentContext.content[key]?.type || "plain",
        current_draft: contentContext.content[key]?.value || undefined,
        current_published: contentContext.content[key]?.value || undefined,
      }));
      setAllContent(content);
    });
  }, []);

  const filteredContent = allContent.filter((item) =>
    item.key.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = async (item: ContentItemAdmin) => {
    setSelected(item);
    setEditValue(item.current_draft || item.current_published || "");
    setShowRevisions(false);
    setSaveStatus("");
    setSidebarOpen(false); // Close sidebar on mobile
    setEditorTab("edit");

    // Fetch revisions for this key
    const revs = await contentContext.getRevisions(item.key);
    setRevisions(revs);
  };

  const handleSaveDraft = async () => {
    if (!selected) return;
    try {
      setSaveStatus("Saving...");
      await contentContext.saveContent(selected.key, selected.type, editValue);
      setSaveStatus("✓ Draft saved!");
      setTimeout(() => setSaveStatus(""), 2000);

      // Update local state
      const updated = allContent.map((item) =>
        item.key === selected.key ? { ...item, current_draft: editValue } : item
      );
      setAllContent(updated);
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

      // Update local state
      const updated = allContent.map((item) =>
        item.key === selected.key ? { ...item, current_published: editValue, current_draft: undefined } : item
      );
      setAllContent(updated);
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

      // Refresh revisions
      const revs = await contentContext.getRevisions(selected.key);
      setRevisions(revs);

      // Refresh the edit value
      const updatedContent = allContent.map((item) =>
        item.key === selected.key ? { ...item } : item
      );
      setAllContent(updatedContent);
    } catch (error) {
      setSaveStatus("✗ Error restoring");
    }
  };

  const groupedContent = {
    "Home Page": filteredContent.filter((item) => item.key.startsWith("home.")),
    "FAQ Page": filteredContent.filter((item) => item.key.startsWith("faq.")),
    "About Page": filteredContent.filter((item) => item.key.startsWith("about.")),
    "Wizard 1: Secure Access Setup": filteredContent.filter((item) =>
      item.key.startsWith("wizard.secure_access_setup.")
    ),
    "Wizard 2: Data Import Quickstart": filteredContent.filter((item) =>
      item.key.startsWith("wizard.data_import_quickstart.")
    ),
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📝 Admin Panel</h1>
        <p className="subtitle">Edit content for pages and wizards</p>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span>📂 {selected ? selected.key.split(".").slice(-2).join(".") : "Select Content"}</span>
            <span>{sidebarOpen ? "▲" : "▼"}</span>
          </button>
          
          <div className={`sidebar-content ${sidebarOpen ? "open" : ""}`}>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search content..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>

            {Object.entries(groupedContent).map(([group, items]) =>
              items.length > 0 ? (
                <div key={group} style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "8px", fontSize: "0.85em", color: "#0066cc", fontWeight: "600" }}>
                    {group}
                  </h4>
                  <ul>
                    {items.map((item) => (
                      <li key={item.key}>
                        <button
                          className={`content-btn ${selected?.key === item.key ? "active" : ""}`}
                          onClick={() => handleSelect(item)}
                        >
                          {item.key.split(".").pop()}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        </div>

        <div className="admin-content">
          {selected ? (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1em", wordBreak: "break-all" }}>
                  <code style={{ fontSize: "0.9em" }}>{selected.key}</code>
                </h3>
                <p style={{ color: "#666", margin: 0, fontSize: "0.9em" }}>
                  Type: <strong>{selected.type}</strong>
                </p>
              </div>

              <div className="editor-section" style={{ marginTop: "16px" }}>
                {selected.type === "plain" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter plain text"
                  />
                ) : selected.type === "markdown" ? (
                  <div>
                    {/* Tabs for mobile */}
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
                    
                    {/* Split view for desktop, tabs for mobile */}
                    <div className="editor-split">
                      <div className={`editor-pane ${editorTab === "edit" ? "active" : ""}`}>
                        <label style={{ fontWeight: "500", display: "block", marginBottom: "8px", fontSize: "0.9em" }}>
                          Markdown Editor
                        </label>
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Enter markdown..."
                          style={{ width: "100%", minHeight: "250px", fontFamily: "monospace", fontSize: "14px" }}
                        />
                      </div>
                      <div className={`editor-pane ${editorTab === "preview" ? "active" : ""}`}>
                        <label style={{ fontWeight: "500", display: "block", marginBottom: "8px", fontSize: "0.9em" }}>
                          Live Preview
                        </label>
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
                ) : (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter JSON"
                    style={{ width: "100%", minHeight: "200px", fontFamily: "monospace", fontSize: "14px" }}
                  />
                )}

                <div className="button-group">
                  <button className="primary" onClick={handleSaveDraft}>
                    💾 Save Draft
                  </button>
                  <button className="primary" onClick={handlePublish}>
                    🚀 Publish
                  </button>
                </div>

                {saveStatus && (
                  <p style={{ marginTop: "12px", color: saveStatus.includes("✗") ? "#dc3545" : "#28a745", fontWeight: "500" }}>
                    {saveStatus}
                  </p>
                )}
              </div>

              <div className="editor-section">
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
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#666" }}>
              <p style={{ fontSize: "1.1em" }}>👆 Select content to edit</p>
              <p style={{ fontSize: "0.9em", marginTop: "8px" }}>
                Use the menu above to browse content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
