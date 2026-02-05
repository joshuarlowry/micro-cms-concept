import React, { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

export default function Wizard1Step2() {
  const { content, fetchContent, mode } = useContent();
  const [twoFactorMethod, setTwoFactorMethod] = useState<string>("");

  const keys = [
    "wizard.secure_access_setup.step.2.header.title",
    "wizard.secure_access_setup.step.2.body.intro_md",
    "wizard.secure_access_setup.step.2.body.options_help_md",
    "wizard.secure_access_setup.step.2.callout.caution_md",
    "wizard.secure_access_setup.step.2.footer.next_label",
    "wizard.secure_access_setup.step.2.footer.back_label",
  ];

  useEffect(() => {
    fetchContent(keys);
  }, [mode]);

  const handleNext = () => {
    if (twoFactorMethod) {
      const step1Data = JSON.parse(sessionStorage.getItem("wizard1_step1") || "{}");
      sessionStorage.setItem("wizard1_step2", JSON.stringify({ two_factor_method: twoFactorMethod }));
      window.location.pathname = "/wizard/secure-access/step-3";
    }
  };

  const handleBack = () => {
    window.location.pathname = "/wizard/secure-access/step-1";
  };

  const title = content["wizard.secure_access_setup.step.2.header.title"]?.value || "Enable Two-Factor Authentication";
  const intro = content["wizard.secure_access_setup.step.2.body.intro_md"]?.value || "";
  const options = content["wizard.secure_access_setup.step.2.body.options_help_md"]?.value || "";
  const caution = content["wizard.secure_access_setup.step.2.callout.caution_md"]?.value || "";
  const nextLabel = content["wizard.secure_access_setup.step.2.footer.next_label"]?.value || "Next";
  const backLabel = content["wizard.secure_access_setup.step.2.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="step">
            <div className="indicator">1</div>
            <span>Recovery Method</span>
          </div>
          <div className="step active">
            <div className="indicator">2</div>
            <span>2FA</span>
          </div>
          <div className="step">
            <div className="indicator">3</div>
            <span>Review</span>
          </div>
        </div>
        <h2>{title}</h2>
      </div>

      <div className="wizard-body">
        <MarkdownRenderer content={intro} />

        {options && (
          <div style={{ marginTop: "20px", backgroundColor: "#f0f8ff", border: "1px solid #0066cc", borderRadius: "4px", padding: "15px" }}>
            <MarkdownRenderer content={options} />
          </div>
        )}

        <div className="form-group" style={{ marginTop: "20px" }}>
          <div className="radio-group">
            <div className="radio-item">
              <input
                type="radio"
                id="auth-app"
                name="2fa"
                value="auth_app"
                checked={twoFactorMethod === "auth_app"}
                onChange={(e) => setTwoFactorMethod(e.target.value)}
              />
              <label htmlFor="auth-app">
                <strong>Authenticator App</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Use an app like Google Authenticator (recommended)
                </p>
              </label>
            </div>
            <div className="radio-item">
              <input
                type="radio"
                id="sms"
                name="2fa"
                value="sms"
                checked={twoFactorMethod === "sms"}
                onChange={(e) => setTwoFactorMethod(e.target.value)}
              />
              <label htmlFor="sms">
                <strong>SMS</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", color: "#666" }}>
                  Receive codes via text message
                </p>
              </label>
            </div>
          </div>
        </div>

        {caution && (
          <div style={{ backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px", padding: "15px", marginTop: "20px" }}>
            <MarkdownRenderer content={caution} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button className="secondary" onClick={handleBack}>
          {backLabel}
        </button>
        <button className="primary" onClick={handleNext} disabled={!twoFactorMethod}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
