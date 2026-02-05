import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Wizard2Step1() {
  const { content, fetchContent, mode } = useContent();
  const [dataSource, setDataSource] = useState<string>("");

  const keys = [
    "wizard.data_import_quickstart.step.1.header.title",
    "wizard.data_import_quickstart.step.1.body.intro_md",
    "wizard.data_import_quickstart.step.1.body.constraints_md",
    "wizard.data_import_quickstart.step.1.footer.next_label",
    "wizard.data_import_quickstart.step.1.footer.back_label",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const handleNext = () => {
    if (dataSource) {
      sessionStorage.setItem("wizard2_step1", JSON.stringify({ data_source: dataSource }));
      window.location.pathname = "/wizard/data-import/step-2";
    }
  };

  const title = content["wizard.data_import_quickstart.step.1.header.title"]?.value || "Select Data Source";
  const intro = content["wizard.data_import_quickstart.step.1.body.intro_md"]?.value || "";
  const constraints = content["wizard.data_import_quickstart.step.1.body.constraints_md"]?.value || "";
  const nextLabel = content["wizard.data_import_quickstart.step.1.footer.next_label"]?.value || "Next";
  const backLabel = content["wizard.data_import_quickstart.step.1.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="step active">
            <div className="indicator">1</div>
            <span>Data Source</span>
          </div>
          <div className="step">
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
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                id="paste"
                name="datasource"
                value="paste_sample"
                checked={dataSource === "paste_sample"}
                onChange={(e) => setDataSource(e.target.value)}
              />
              <label htmlFor="paste">
                <strong>Paste CSV Sample</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Paste your CSV data directly
                </p>
              </label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                id="upload"
                name="datasource"
                value="upload_file"
                checked={dataSource === "upload_file"}
                onChange={(e) => setDataSource(e.target.value)}
              />
              <label htmlFor="upload">
                <strong>Upload File</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Upload a CSV file from your computer
                </p>
              </label>
            </div>
          </div>
        </div>

        {constraints && (
          <div style={{ backgroundColor: "#f0f8ff", border: "1px solid #0066cc", borderRadius: "4px", padding: "15px", marginTop: "20px" }}>
            <MarkdownRenderer content={constraints} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <a href="/" onClick={(e) => { e.preventDefault(); window.location.pathname = "/"; }}>
          <button className="secondary">{backLabel}</button>
        </a>
        <button className="primary" onClick={handleNext} disabled={!dataSource}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
