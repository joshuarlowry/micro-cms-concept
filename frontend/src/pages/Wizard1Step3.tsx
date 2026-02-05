import { useEffect, useState } from "react";
import { useContent } from "../hooks/useContent";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Wizard1Step3() {
  const { content, fetchContent, mode } = useContent();
  const [completed, setCompleted] = useState(false);
  const [wizardData, setWizardData] = useState<any>({});

  const keys = [
    "wizard.secure_access_setup.step.3.header.title",
    "wizard.secure_access_setup.step.3.body.review_intro_md",
    "wizard.secure_access_setup.step.3.callout.confirmation_md",
    "wizard.secure_access_setup.step.3.footer.confirm_label",
    "wizard.secure_access_setup.step.3.footer.back_label",
    "wizard.secure_access_setup.step.3.success.title",
    "wizard.secure_access_setup.step.3.success.body_md",
  ];

  useEffect(() => {
    fetchContent(keys);

    // Combine data from previous steps
    const step1 = JSON.parse(sessionStorage.getItem("wizard1_step1") || "{}");
    const step2 = JSON.parse(sessionStorage.getItem("wizard1_step2") || "{}");
    setWizardData({ ...step1, ...step2 });
  }, [mode]);

  const handleConfirm = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/wizards/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wizard_id: "secure_access_setup",
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
    window.location.pathname = "/wizard/secure-access/step-2";
  };

  const renderProgress = () => (
    <div className="wizard-progress">
      <div className="step">
        <div className="indicator">1</div>
        <span>Recovery</span>
      </div>
      <div className="connector" />
      <div className="step">
        <div className="indicator">2</div>
        <span>2FA</span>
      </div>
      <div className="connector" />
      <div className="step active">
        <div className="indicator">3</div>
        <span>Review</span>
      </div>
    </div>
  );

  if (completed) {
    const successTitle = content["wizard.secure_access_setup.step.3.success.title"]?.value || "✅ Complete!";
    const successBody = content["wizard.secure_access_setup.step.3.success.body_md"]?.value || "";

    return (
      <div className="wizard-container">
        <div className="wizard-header">
          {renderProgress()}
        </div>

        <div className="wizard-success">
          <h2>{successTitle}</h2>
          <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left" }}>
            <MarkdownRenderer content={successBody} />
          </div>
        </div>
      </div>
    );
  }

  const title = content["wizard.secure_access_setup.step.3.header.title"]?.value || "Review Your Settings";
  const reviewIntro = content["wizard.secure_access_setup.step.3.body.review_intro_md"]?.value || "";
  const confirmation = content["wizard.secure_access_setup.step.3.callout.confirmation_md"]?.value || "";
  const confirmLabel = content["wizard.secure_access_setup.step.3.footer.confirm_label"]?.value || "Confirm";
  const backLabel = content["wizard.secure_access_setup.step.3.footer.back_label"]?.value || "Back";

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        {renderProgress()}
        <h2>{title}</h2>
      </div>

      <div className="wizard-body">
        <MarkdownRenderer content={reviewIntro} />

        <div className="wizard-summary">
          <h4>Security Settings Summary</h4>
          <div className="wizard-summary-item">
            <span className="label">Recovery Method</span>
            <span className="value">{wizardData.recovery_method === "email" ? "Email" : wizardData.recovery_method === "security_question" ? "Security Question" : "Not set"}</span>
          </div>
          <div className="wizard-summary-item">
            <span className="label">Two-Factor Method</span>
            <span className="value">{wizardData.two_factor_method === "auth_app" ? "Authenticator App" : wizardData.two_factor_method === "sms" ? "SMS" : "Not set"}</span>
          </div>
        </div>

        {confirmation && (
          <div className="callout" style={{ backgroundColor: "#d4edda", border: "1px solid #28a745" }}>
            <MarkdownRenderer content={confirmation} />
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <button className="secondary" onClick={handleBack} style={{ flex: 1, maxWidth: "200px" }}>
          {backLabel}
        </button>
        <button className="primary" onClick={handleConfirm} style={{ flex: 1, maxWidth: "200px" }}>
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
