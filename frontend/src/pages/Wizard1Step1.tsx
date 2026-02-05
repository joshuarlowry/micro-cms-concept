import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Wizard1Step1() {
  const { content, fetchContent, mode } = useContent();
  const [recoveryMethod, setRecoveryMethod] = useState<string>("");

  const keys = [
    "wizard.secure_access_setup.step.1.header.title",
    "wizard.secure_access_setup.step.1.header.subtitle",
    "wizard.secure_access_setup.step.1.body.intro_md",
    "wizard.secure_access_setup.step.1.callout.note_md",
    "wizard.secure_access_setup.step.1.footer.next_label",
    "wizard.secure_access_setup.step.1.footer.back_label",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const handleNext = () => {
    if (recoveryMethod) {
      // Store in session
      sessionStorage.setItem("wizard1_step1", JSON.stringify({ recovery_method: recoveryMethod }));
      window.location.pathname = "/wizard/secure-access/step-2";
    }
  };

  const title = content["wizard.secure_access_setup.step.1.header.title"]?.value || "Choose Account Recovery Method";
  const subtitle = content["wizard.secure_access_setup.step.1.header.subtitle"]?.value || "Protect your account";
  const intro = content["wizard.secure_access_setup.step.1.body.intro_md"]?.value || "";
  const note = content["wizard.secure_access_setup.step.1.callout.note_md"]?.value || "";
  const nextLabel = content["wizard.secure_access_setup.step.1.footer.next_label"]?.value || "Next";
  const backLabel = content["wizard.secure_access_setup.step.1.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="step active">
            <div className="indicator">1</div>
            <span>Recovery</span>
          </div>
          <div className="connector" />
          <div className="step">
            <div className="indicator">2</div>
            <span>2FA</span>
          </div>
          <div className="connector" />
          <div className="step">
            <div className="indicator">3</div>
            <span>Review</span>
          </div>
        </div>
        <h2>{title}</h2>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="wizard-body">
        <MarkdownRenderer content={intro} />

        <div className="form-group" style={{ marginTop: "20px" }}>
          <div className="radio-group">
            <label className="radio-item" htmlFor="email">
              <input
                type="radio"
                id="email"
                name="recovery"
                value="email"
                checked={recoveryMethod === "email"}
                onChange={(e) => setRecoveryMethod(e.target.value)}
              />
              <div>
                <strong>Email Address</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Receive recovery codes via email
                </p>
              </div>
            </label>
            <label className="radio-item" htmlFor="security-question">
              <input
                type="radio"
                id="security-question"
                name="recovery"
                value="security_question"
                checked={recoveryMethod === "security_question"}
                onChange={(e) => setRecoveryMethod(e.target.value)}
              />
              <div>
                <strong>Security Question</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Answer a security question you create
                </p>
              </div>
            </label>
          </div>
        </div>

        {note && (
          <div className="callout note">
            <MarkdownRenderer content={note} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <a href="/" onClick={(e) => { e.preventDefault(); window.location.pathname = "/"; }} style={{ flex: 1, maxWidth: "200px" }}>
          <button className="secondary" style={{ width: "100%" }}>{backLabel}</button>
        </a>
        <button className="primary" onClick={handleNext} disabled={!recoveryMethod} style={{ flex: 1, maxWidth: "200px" }}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
