import os
from contextlib import contextmanager
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://cms_user:cms_password@db:5432/micro_cms")

engine = create_engine(
    DATABASE_URL,
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize the database with migrations and seed data"""
    # Run migrations via alembic
    import subprocess
    import sys

    try:
        # Run alembic upgrade
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd="/app",
            capture_output=True,
            text=True,
        )
        print("Alembic migrations:", result.stdout)
        if result.returncode != 0:
            print("Alembic error:", result.stderr)
    except Exception as e:
        print(f"Error running migrations: {e}")

    # Seed initial data
    from app.models import ContentEntry, ContentRevision, WizardRun

    with get_db_session() as db:
        # Check if data already exists
        existing = db.query(ContentEntry).first()
        if existing:
            return  # Data already seeded

        # Seed content entries with initial published values
        seed_entries = [
            # Home page
            {"key": "home.hero.title", "type": "plain"},
            {"key": "home.hero.subtitle", "type": "plain"},
            {"key": "home.hero.body_md", "type": "markdown"},
            {"key": "home.cta.label", "type": "plain"},
            {"key": "home.cta.href", "type": "plain"},
            # FAQ page
            {"key": "faq.items", "type": "rich_json"},
            # About page
            {"key": "about.page.body_md", "type": "markdown"},
            # Wizard 1: Secure Access Setup
            {"key": "wizard.secure_access_setup.step.1.header.title", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.1.header.subtitle", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.1.body.intro_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.1.callout.note_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.1.footer.next_label", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.1.footer.back_label", "type": "plain"},

            {"key": "wizard.secure_access_setup.step.2.header.title", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.2.body.intro_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.2.body.options_help_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.2.callout.caution_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.2.footer.next_label", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.2.footer.back_label", "type": "plain"},

            {"key": "wizard.secure_access_setup.step.3.header.title", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.3.body.review_intro_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.3.callout.confirmation_md", "type": "markdown"},
            {"key": "wizard.secure_access_setup.step.3.footer.confirm_label", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.3.footer.back_label", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.3.success.title", "type": "plain"},
            {"key": "wizard.secure_access_setup.step.3.success.body_md", "type": "markdown"},

            # Wizard 2: Data Import Quickstart
            {"key": "wizard.data_import_quickstart.step.1.header.title", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.1.body.intro_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.1.body.constraints_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.1.footer.next_label", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.1.footer.back_label", "type": "plain"},

            {"key": "wizard.data_import_quickstart.step.2.header.title", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.2.body.intro_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.2.body.example_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.2.callout.tip_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.2.footer.next_label", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.2.footer.back_label", "type": "plain"},

            {"key": "wizard.data_import_quickstart.step.3.header.title", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.3.body.validation_intro_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.3.callout.common_errors_md", "type": "markdown"},
            {"key": "wizard.data_import_quickstart.step.3.footer.import_label", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.3.footer.back_label", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.3.success.title", "type": "plain"},
            {"key": "wizard.data_import_quickstart.step.3.success.body_md", "type": "markdown"},
        ]

        # Seed values
        seed_values = {
            # Home
            "home.hero.title": ("plain", "Welcome to Micro CMS"),
            "home.hero.subtitle": ("plain", "A powerful, simple content management system"),
            "home.hero.body_md": ("markdown", "# Your Content, Your Control\n\n- Manage all content from one place\n- Edit pages, wizards, and FAQs instantly\n- See live previews before publishing\n\n**Try the wizards below to experience full-stack content management.**"),
            "home.cta.label": ("plain", "Start Wizard"),
            "home.cta.href": ("plain", "/wizard/secure-access/step-1"),

            # FAQ
            "faq.items": ("rich_json", '[{"question": "What is a wizard?", "answer_md": "A wizard is a multi-step form that guides users through a process. Both wizards in this app have fully editable instructional text!"}, {"question": "Can I edit wizard instructions?", "answer_md": "Yes! Go to **/admin** and search for `wizard.` keys. All text on every wizard step is editable and supports **Markdown**."}, {"question": "How do versioning and restore work?", "answer_md": "Every change creates a revision. You can view the revision history and restore any previous version. Restore creates a new revision, so no history is lost."}]'),

            # About
            "about.page.body_md": ("markdown", "# About Micro CMS\n\nMicro CMS is a lightweight, database-backed content management system designed for:\n\n- **Flexibility**: Support for plain text, markdown, and rich JSON content\n- **Safety**: Multi-step versioning, revision history, and easy rollback\n- **Integration**: Batch content fetching for efficient page rendering\n- **Simplicity**: Single-user mode with no authentication overhead\n\n## Features\n\n- **Admin UI** at `/admin` for managing all content\n- **Live preview mode** to see draft changes before publishing\n- **Markdown editing** with live preview\n- **Full-stack wizards** with persistent data\n- **Revision history** and restore functionality\n\nPowered by React, FastAPI, and PostgreSQL."),

            # Wizard 1: Secure Access Setup
            "wizard.secure_access_setup.step.1.header.title": ("plain", "Choose Account Recovery Method"),
            "wizard.secure_access_setup.step.1.header.subtitle": ("plain", "Protect your account with recovery options"),
            "wizard.secure_access_setup.step.1.body.intro_md": ("markdown", "Account recovery is essential for regaining access if you forget your password.\n\nChoose at least one recovery method:"),
            "wizard.secure_access_setup.step.1.callout.note_md": ("markdown", "> **Note**: You can set up both recovery methods for extra security."),
            "wizard.secure_access_setup.step.1.footer.next_label": ("plain", "Next: Enable 2FA"),
            "wizard.secure_access_setup.step.1.footer.back_label": ("plain", "Back"),

            "wizard.secure_access_setup.step.2.header.title": ("plain", "Enable Two-Factor Authentication"),
            "wizard.secure_access_setup.step.2.body.intro_md": ("markdown", "Two-factor authentication (2FA) adds an extra security layer. You'll need:\n\n1. Your password\n2. A verification code from your chosen method\n\nChoose your preferred method:"),
            "wizard.secure_access_setup.step.2.body.options_help_md": ("markdown", "- **Authenticator App** (recommended): Use apps like Google Authenticator, Authy, or Microsoft Authenticator\n- **SMS**: Receive codes via text message"),
            "wizard.secure_access_setup.step.2.callout.caution_md": ("markdown", "⚠️ **Keep backup codes safe**: You'll receive 10 one-time backup codes. Store them securely."),
            "wizard.secure_access_setup.step.2.footer.next_label": ("plain", "Next: Review & Confirm"),
            "wizard.secure_access_setup.step.2.footer.back_label": ("plain", "Back"),

            "wizard.secure_access_setup.step.3.header.title": ("plain", "Review & Confirm Setup"),
            "wizard.secure_access_setup.step.3.body.review_intro_md": ("markdown", "Please review your security settings below:"),
            "wizard.secure_access_setup.step.3.callout.confirmation_md": ("markdown", "✅ You're about to enable advanced account security. You'll need your 2FA method every time you sign in."),
            "wizard.secure_access_setup.step.3.footer.confirm_label": ("plain", "Confirm & Enable Security"),
            "wizard.secure_access_setup.step.3.footer.back_label": ("plain", "Back"),
            "wizard.secure_access_setup.step.3.success.title": ("plain", "✅ Account Security Enabled"),
            "wizard.secure_access_setup.step.3.success.body_md": ("markdown", "Your account is now protected!\n\n- Recovery method is configured\n- 2FA is active\n- Backup codes were sent to your email\n\nKeep your backup codes in a safe place. [Return to home](/.)"),

            # Wizard 2: Data Import Quickstart
            "wizard.data_import_quickstart.step.1.header.title": ("plain", "Select Data Source"),
            "wizard.data_import_quickstart.step.1.body.intro_md": ("markdown", "Choose how you'd like to provide your data:"),
            "wizard.data_import_quickstart.step.1.body.constraints_md": ("markdown", "- CSV format with headers\n- Maximum 10,000 rows per import\n- Supported file types: `.csv`"),
            "wizard.data_import_quickstart.step.1.footer.next_label": ("plain", "Next: Map Columns"),
            "wizard.data_import_quickstart.step.1.footer.back_label": ("plain", "Back"),

            "wizard.data_import_quickstart.step.2.header.title": ("plain", "Map Your Data Columns"),
            "wizard.data_import_quickstart.step.2.body.intro_md": ("markdown", "We detected the following columns in your data. Map them to the required fields:"),
            "wizard.data_import_quickstart.step.2.body.example_md": ("markdown", "Example CSV format:\n\n```\nfull_name,email_address,department\nAlice Johnson,alice@example.com,Engineering\nBob Smith,bob@example.com,Sales\nCarol White,carol@example.com,Marketing\n```"),
            "wizard.data_import_quickstart.step.2.callout.tip_md": ("markdown", "💡 **Tip**: Ensure your headers exactly match the required fields for automatic mapping."),
            "wizard.data_import_quickstart.step.2.footer.next_label": ("plain", "Next: Validate & Import"),
            "wizard.data_import_quickstart.step.2.footer.back_label": ("plain", "Back"),

            "wizard.data_import_quickstart.step.3.header.title": ("plain", "Validate & Import Data"),
            "wizard.data_import_quickstart.step.3.body.validation_intro_md": ("markdown", "Review the validation results:"),
            "wizard.data_import_quickstart.step.3.callout.common_errors_md": ("markdown", "**Common issues**:\n- Missing email addresses\n- Duplicate entries\n- Invalid department names\n\nFix these issues in your CSV and try again."),
            "wizard.data_import_quickstart.step.3.footer.import_label": ("plain", "Confirm & Import"),
            "wizard.data_import_quickstart.step.3.footer.back_label": ("plain", "Back"),
            "wizard.data_import_quickstart.step.3.success.title": ("plain", "✅ Import Successful"),
            "wizard.data_import_quickstart.step.3.success.body_md": ("markdown", "Your data has been imported successfully!\n\n- 3 records imported\n- 0 errors\n- Import completed at 2:34 PM\n\nYour data is now available for use. [Return to home](/.)"),
        }

        for entry_config in seed_entries:
            entry = ContentEntry(
                key=entry_config["key"],
                type=entry_config["type"],
            )
            db.add(entry)

        db.commit()

        # Now populate published values
        for key, (content_type, value) in seed_values.items():
            entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
            if entry:
                entry.current_published = value
                revision = ContentRevision(
                    key=key,
                    mode="published",
                    type=content_type,
                    value=value,
                    created_by="default",
                )
                db.add(revision)

        db.commit()

        # Add a couple of draft variations for demo
        draft_variations = {
            "home.hero.title": "Welcome to Micro CMS (Draft Edit Example)",
            "wizard.secure_access_setup.step.1.body.intro_md": "**[DRAFT]** Account recovery is essential for regaining access if you forget your password.\n\nChoose at least one recovery method:\n\n*This is an example of how draft mode shows before publishing.*",
        }

        for key, draft_value in draft_variations.items():
            entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
            if entry:
                entry.current_draft = draft_value
                revision = ContentRevision(
                    key=key,
                    mode="draft",
                    type=entry.type,
                    value=draft_value,
                    created_by="default",
                )
                db.add(revision)

        db.commit()

        # Seed wizard runs
        run1 = WizardRun(
            wizard_id="secure_access_setup",
            step=3,
            data='{"recovery_method": "email", "two_factor_method": "auth_app"}',
            completed=True,
        )
        run2 = WizardRun(
            wizard_id="data_import_quickstart",
            step=3,
            data='{"records": 3, "errors": 0}',
            completed=True,
        )
        db.add(run1)
        db.add(run2)
        db.commit()
