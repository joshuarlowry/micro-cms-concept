import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Wizard2Step3() {
  const { content, fetchContent, mode } = useContent();
  const [completed, setCompleted] = useState(false);
  const [validationResults] = useState({
    total_records: 3,
    valid_records: 3,
    invalid_records: 0,
    errors: [] as string[],
  });

  const keys = [
    "wizard.data_import_quickstart.step.3.header.title",
    "wizard.data_import_quickstart.step.3.body.validation_intro_md",
    "wizard.data_import_quickstart.step.3.callout.common_errors_md",
    "wizard.data_import_quickstart.step.3.footer.import_label",
    "wizard.data_import_quickstart.step.3.footer.back_label",
    "wizard.data_import_quickstart.step.3.success.title",
    "wizard.data_import_quickstart.step.3.success.body_md",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const handleImport = async () => {
    try {
      const step1 = JSON.parse(sessionStorage.getItem("wizard2_step1") || "{}");
      const step2 = JSON.parse(sessionStorage.getItem("wizard2_step2") || "{}");
      const wizardData = { ...step1, ...step2, ...validationResults };

      const response = await fetch("/api/wizards/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wizard_id: "data_import_quickstart",
          step: "3",
          data: JSON.stringify(wizardData),
          completed: true,
        }),
      });
      if (response.ok) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Error completing wizard:", error);
    }
  };

  const handleBack = () => {
    window.location.pathname = "/wizard/data-import/step-2";
  };

  if (completed) {
    const successTitle = content["wizard.data_import_quickstart.step.3.success.title"]?.value || "✅ Import Complete!";
    const successBody = content["wizard.data_import_quickstart.step.3.success.body_md"]?.value || "";

    return (
      <div className="wizard-container">
        <div className="wizard-header">
          <div className="wizard-progress">
            <div className="step">
              <div className="indicator">1</div>
              <span>Data Source</span>
            </div>
            <div className="step">
              <div className="indicator">2</div>
              <span>Map Columns</span>
            </div>
            <div className="step active">
              <div className="indicator">3</div>
              <span>Validate & Import</span>
            </div>
          </div>
        </div>

        <div className="wizard-success">
          <h2>{successTitle}</h2>
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            <MarkdownRenderer content={successBody} />
          </div>
        </div>
      </div>
    );
  }

  const title = content["wizard.data_import_quickstart.step.3.header.title"]?.value || "Validate & Import Data";
  const validationIntro = content["wizard.data_import_quickstart.step.3.body.validation_intro_md"]?.value || "";
  const commonErrors = content["wizard.data_import_quickstart.step.3.callout.common_errors_md"]?.value || "";
  const importLabel = content["wizard.data_import_quickstart.step.3.footer.import_label"]?.value || "Import";
  const backLabel = content["wizard.data_import_quickstart.step.3.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="step">
            <div className="indicator">1</div>
            <span>Data Source</span>
          </div>
          <div className="step">
            <div className="indicator">2</div>
            <span>Map Columns</span>
          </div>
          <div className="step active">
            <div className="indicator">3</div>
            <span>Validate & Import</span>
          </div>
        </div>
        <h2>{title}</h2>
      </div>

      <div className="wizard-body">
        <MarkdownRenderer content={validationIntro} />

        <div className="wizard-summary">
          <h4>Validation Results</h4>
          <div className="wizard-summary-item">
            <span className="label">Total Records:</span>
            <span className="value" style={{ color: "#666" }}>{validationResults.total_records}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="label">Valid Records:</span>
            <span className="value" style={{ color: "#28a745" }}>{validationResults.valid_records}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="label">Invalid Records:</span>
            <span className="value" style={{ color: validationResults.invalid_records > 0 ? "#dc3545" : "#28a745" }}>
              {validationResults.invalid_records}
            </span>
          </div>
        </div>

        {commonErrors && (
          <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "15px", marginTop: "20px" }}>
            <MarkdownRenderer content={commonErrors} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button className="secondary" onClick={handleBack}>
          {backLabel}
        </button>
        <button className="primary" onClick={handleImport} disabled={validationResults.invalid_records > 0}>
          {importLabel}
        </button>
      </div>
    </div>
  );
}
