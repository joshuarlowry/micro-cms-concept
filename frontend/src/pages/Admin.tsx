import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import MDEditor from "@uiw/react-md-editor";

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
        <h1>📝 Content Admin Panel</h1>
        <p className="subtitle">Edit all content for pages and wizards</p>
      </div>

      <div className="admin-container">
        <div className="admin-sidebar">
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
              <div key={group} style={{ marginBottom: "25px" }}>
                <h4 style={{ marginBottom: "10px", fontSize: "0.9em", color: "#0066cc" }}>
                  {group}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <li key={item.key} style={{ marginBottom: "5px" }}>
                      <button
                        className={selected?.key === item.key ? "active" : ""}
                        onClick={() => handleSelect(item)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px",
                          borderRadius: "4px",
                          backgroundColor: selected?.key === item.key ? "#0066cc" : "#f0f0f0",
                          color: selected?.key === item.key ? "white" : "#333",
                          border: "1px solid " + (selected?.key === item.key ? "#0066cc" : "#ddd"),
                          cursor: "pointer",
                          fontSize: "0.85em",
                          fontWeight: "500",
                        }}
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

        <div className="admin-content">
          {selected ? (
            <div>
              <h3 style={{ marginTop: 0 }}>
                Editing: <code>{selected.key}</code>
              </h3>
              <p style={{ color: "#666", marginBottom: "15px" }}>
                Type: <strong>{selected.type}</strong>
              </p>

              <div className="editor-section">
                <h4>Edit Content</h4>

                {selected.type === "plain" ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter plain text"
                    style={{ width: "100%", padding: "10px" }}
                  />
                ) : selected.type === "markdown" ? (
                  <div style={{ border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden" }}>
                    <MDEditor
                      value={editValue}
                      onChange={(val) => setEditValue(val || "")}
                      preview="live"
                      visibleDragbar={true}
                      height={400}
                    />
                  </div>
                ) : (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter JSON"
                    style={{ width: "100%", minHeight: "200px", padding: "10px" }}
                  />
                )}

                <div className="button-group" style={{ marginTop: "15px" }}>
                  <button className="primary" onClick={handleSaveDraft}>
                    💾 Save Draft
                  </button>
                  <button className="primary" onClick={handlePublish}>
                    🚀 Publish
                  </button>
                </div>

                {saveStatus && (
                  <p style={{ marginTop: "10px", color: saveStatus.includes("✗") ? "#dc3545" : "#28a745" }}>
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
                    padding: 0,
                  }}
                >
                  {showRevisions ? "▼" : "▶"} Revision History ({revisions.length})
                </button>

                {showRevisions && (
                  <div style={{ marginTop: "15px" }}>
                    {revisions.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {revisions.map((rev) => (
                          <div
                            key={rev.id}
                            style={{
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              padding: "10px",
                              backgroundColor: "#f9f9f9",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: "500" }}>
                                  {rev.mode === "published" ? "🚀" : "📝"} {rev.mode.toUpperCase()}
                                </p>
                                <p style={{ margin: "5px 0 0 0", fontSize: "0.85em", color: "#666" }}>
                                  {new Date(rev.created_at).toLocaleString()}
                                </p>
                                <p style={{ margin: "5px 0 0 0", fontSize: "0.85em", color: "#999" }}>
                                  {rev.value.substring(0, 100)}...
                                </p>
                              </div>
                              <button
                                className="secondary"
                                onClick={() => handleRestore(rev.id, rev.mode === "published" ? "draft" : "published")}
                                style={{ whiteSpace: "nowrap", marginLeft: "10px" }}
                              >
                                Restore
                              </button>
                            </div>
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
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <p>Select a content item from the left to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
