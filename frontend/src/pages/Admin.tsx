import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import {
  ContentSelector,
  PlainTextEditor,
  MarkdownEditor,
  FAQEditor,
  FAQItem,
  RevisionHistory,
  Revision,
  EditorActions,
} from "../components/admin";

interface ContentItemAdmin {
  key: string;
  type: string;
  label: string;
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

// Helper to infer type from key name
const inferType = (key: string): string => {
  if (key.endsWith("_md")) return "markdown";
  if (key === "faq.items") return "rich_json";
  return "plain";
};

export default function Admin() {
  const contentContext = useContent();
  const [selected, setSelected] = useState<ContentItemAdmin | null>(null);
  const [editValue, setEditValue] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  // Navigation state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const allKeys = getAllKeys();
  const categories = Object.keys(contentStructure);
  const sections = selectedCategory ? Object.keys(contentStructure[selectedCategory] || {}) : [];
  const currentItems =
    selectedCategory && selectedSection
      ? contentStructure[selectedCategory]?.[selectedSection] || []
      : [];

  // Fetch all content on mount
  useEffect(() => {
    contentContext.fetchContent(allKeys);
  }, []);

  // Auto-select section if only one exists
  useEffect(() => {
    if (selectedCategory && sections.length === 1 && !selectedSection) {
      setSelectedSection(sections[0]);
    }
  }, [selectedCategory, sections, selectedSection]);

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

    setSelected({ key: item.key, type, label: item.label });
    setEditValue(value);
    setSaveStatus("");

    // Parse FAQ items if needed
    if (item.key === "faq.items") {
      try {
        const parsed = value ? JSON.parse(value) : [];
        setFaqItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setFaqItems([]);
      }
    }

    // Fetch revisions
    const revs = await contentContext.getRevisions(item.key);
    setRevisions(revs);
  };

  const handleFAQChange = (items: FAQItem[]) => {
    setFaqItems(items);
    setEditValue(JSON.stringify(items, null, 2));
  };

  const handleSaveDraft = async () => {
    if (!selected) return;
    try {
      setSaveStatus("Saving...");
      await contentContext.saveContent(selected.key, selected.type, editValue);
      setSaveStatus("✓ Draft saved!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
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
    } catch {
      setSaveStatus("✗ Error publishing");
    }
  };

  const handleRestore = async (revisionId: string, targetMode: string) => {
    if (!selected) return;
    try {
      setSaveStatus("Restoring...");
      await contentContext.restoreRevision(selected.key, revisionId, targetMode);
      setSaveStatus(`✓ Restored to ${targetMode}!`);
      setTimeout(() => setSaveStatus(""), 2000);
      const revs = await contentContext.getRevisions(selected.key);
      setRevisions(revs);
    } catch {
      setSaveStatus("✗ Error restoring");
    }
  };

  const renderEditor = () => {
    if (!selected) return null;

    if (selected.type === "plain") {
      return <PlainTextEditor value={editValue} onChange={setEditValue} />;
    }

    if (selected.type === "markdown") {
      return <MarkdownEditor value={editValue} onChange={setEditValue} />;
    }

    if (selected.key === "faq.items") {
      return <FAQEditor items={faqItems} onChange={handleFAQChange} />;
    }

    // Fallback for other JSON types
    return (
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        placeholder="Enter JSON..."
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
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Content Editor</h1>
        <p className="subtitle">Edit content for pages and wizards</p>
      </div>

      <ContentSelector
        categories={categories}
        sections={sections}
        items={currentItems}
        selectedCategory={selectedCategory}
        selectedSection={selectedSection}
        selectedKey={selected?.key || null}
        onCategoryChange={handleCategoryChange}
        onSectionChange={handleSectionChange}
        onItemSelect={handleSelectItem}
      />

      {selected && (
        <div className="card">
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1em" }}>{selected.label}</h3>
            <p style={{ color: "#666", margin: 0, fontSize: "0.85em" }}>
              {selected.type === "markdown"
                ? "Markdown content"
                : selected.type === "rich_json"
                ? "Structured data"
                : "Plain text"}
            </p>
          </div>

          <div style={{ marginTop: "16px" }}>{renderEditor()}</div>

          <EditorActions
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            saveStatus={saveStatus}
          />

          <RevisionHistory revisions={revisions} onRestore={handleRestore} />
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
