import React, { useEffect } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Home() {
  const { content, fetchContent, mode } = useContent();

  const keys = [
    "home.hero.title",
    "home.hero.subtitle",
    "home.hero.body_md",
    "home.cta.label",
    "home.cta.href",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const heroTitle = content["home.hero.title"]?.value || "Welcome to Micro CMS";
  const heroSubtitle = content["home.hero.subtitle"]?.value || "A powerful content management system";
  const heroBody = content["home.hero.body_md"]?.value || "";
  const ctaLabel = content["home.cta.label"]?.value || "Get Started";
  const ctaHref = content["home.cta.href"]?.value || "/";

  return (
    <div className="page">
      <div className="page-header">
        <h1>{heroTitle}</h1>
        <p className="subtitle">{heroSubtitle}</p>
      </div>

      <div className="card">
        {heroBody && <MarkdownRenderer content={heroBody} />}

        <h3 style={{ marginTop: "24px", marginBottom: "16px" }}>Try Our Wizards</h3>
        <div className="button-group" style={{ flexWrap: "wrap" }}>
          <a href="/wizard/secure-access/step-1" style={{ textDecoration: "none" }}>
            <button className="primary">
              🔐 Secure Access Setup
            </button>
          </a>
          <a href="/wizard/data-import/step-1" style={{ textDecoration: "none" }}>
            <button className="primary">
              📊 Data Import Quickstart
            </button>
          </a>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>About This App</h2>
        <div className="card">
          <h3>🎯 Purpose</h3>
          <p>
            This is a fully functional CMS + wizards demo showing how to build database-backed, editable
            content that powers multiple pages and multi-step forms.
          </p>

          <h3>🔑 Key Features</h3>
          <ul>
            <li><strong>Database-Backed Content</strong>: All content is stored in PostgreSQL</li>
            <li><strong>Live Editing</strong>: Edit content in the <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/admin"; }}>/admin</a> panel</li>
            <li><strong>Markdown Support</strong>: Write formatted content with markdown</li>
            <li><strong>Draft Mode</strong>: Preview changes before publishing (see top right)</li>
            <li><strong>Versioning</strong>: Full revision history and restore capability</li>
            <li><strong>Two Working Wizards</strong>: Complete user journeys with persistent data</li>
          </ul>

          <h3>🚀 Quick Start</h3>
          <p>
            Everything you need to edit is accessible via the <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/admin"; }}><strong>/admin</strong></a> panel. Try:
          </p>
          <ul>
            <li>Edit this homepage content</li>
            <li>Go to <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = "/faq"; }}>/faq</a> and edit FAQ items</li>
            <li>Edit wizard instructions at each step</li>
            <li>Use draft mode to preview unpublished changes</li>
            <li>View revision history and restore old versions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
