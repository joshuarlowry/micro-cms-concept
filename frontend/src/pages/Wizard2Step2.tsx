import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Wizard2Step2() {
  const { content, fetchContent, mode } = useContent();
  const [mappings, setMappings] = useState({
    full_name: "Name",
    email_address: "Email",
    department: "Department",
  });

  const keys = [
    "wizard.data_import_quickstart.step.2.header.title",
    "wizard.data_import_quickstart.step.2.body.intro_md",
    "wizard.data_import_quickstart.step.2.body.example_md",
    "wizard.data_import_quickstart.step.2.callout.tip_md",
    "wizard.data_import_quickstart.step.2.footer.next_label",
    "wizard.data_import_quickstart.step.2.footer.back_label",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const handleNext = () => {
    sessionStorage.setItem("wizard2_step2", JSON.stringify({ column_mappings: mappings }));
    window.location.pathname = "/wizard/data-import/step-3";
  };

  const handleBack = () => {
    window.location.pathname = "/wizard/data-import/step-1";
  };

  const title = content["wizard.data_import_quickstart.step.2.header.title"]?.value || "Map Your Columns";
  const intro = content["wizard.data_import_quickstart.step.2.body.intro_md"]?.value || "";
  const example = content["wizard.data_import_quickstart.step.2.body.example_md"]?.value || "";
  const tip = content["wizard.data_import_quickstart.step.2.callout.tip_md"]?.value || "";
  const nextLabel = content["wizard.data_import_quickstart.step.2.footer.next_label"]?.value || "Next";
  const backLabel = content["wizard.data_import_quickstart.step.2.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="step">
            <div className="indicator">1</div>
            <span>Data Source</span>
          </div>
          <div className="step active">
            <div className="indicator">2</div>
            <span>Map Columns</span>
          </div>
          <div className="step">
            <div className="indicator">3</div>
            <span>Validate & Import</span>
          </div>
        </div>
        <h2>{title}</h2>
      </div>

      <div className="wizard-body">
        <MarkdownRenderer content={intro} />

        <div className="form-group" style={{ marginTop: "20px" }}>
          <div style={{ backgroundColor: "#f9f9f9", border: "1px solid #ddd", borderRadius: "4px", padding: "15px" }}>
            <h4 style={{ margin: "0 0 15px 0" }}>Column Mappings</h4>
            <div style={{ display: "grid", gap: "15px" }}>
              {Object.entries(mappings).map(([field, value]) => (
                <div key={field}>
                  <label style={{ fontWeight: "500", marginBottom: "5px", display: "block" }}>
                    {field.replace(/_/g, " ")} (required)
                  </label>
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => setMappings({ ...mappings, [field]: e.target.value })}
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {example && (
          <div style={{ backgroundColor: "#f9f9f9", border: "1px solid #ddd", borderRadius: "4px", padding: "15px", marginTop: "20px" }}>
            <MarkdownRenderer content={example} />
          </div>
        )}

        {tip && (
          <div style={{ backgroundColor: "#fffbea", border: "1px solid #f1c232", borderRadius: "4px", padding: "15px", marginTop: "20px" }}>
            <MarkdownRenderer content={tip} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button className="secondary" onClick={handleBack}>
          {backLabel}
        </button>
        <button className="primary" onClick={handleNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
