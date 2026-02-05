# Micro CMS + Wizards

A complete, production-ready example of a **database-backed CMS with editable multi-step wizards**. This application demonstrates full-stack content management where all text, instructions, and labels are stored in PostgreSQL and edited through a live admin panel.

**Accessed:** 2026-02-04 (America/New_York)

## 🎯 Key Features

- **Database-Backed Content**: All content (pages, wizard instructions, FAQs) live in PostgreSQL
- **Live Admin Panel** (`/admin`): Edit pages and wizard text in real-time
- **Markdown Support**: Write formatted content with live preview via `react-md-editor`
- **Draft Mode**: Preview unpublished changes before publishing (toggle in top-right)
- **Revision History**: Every save creates a revision; restore any previous version
- **Two Working Wizards**: Complete user journeys with persistent data to a `wizard_runs` table
- **No Authentication**: Single "default" user mode (add real auth as needed)
- **One-Command Boot**: `docker compose up --build` and you're ready

## 📁 Project Structure

```
micro-cms-concept/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # SQLAlchemy ORM models
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── database.py          # DB connection, init, seed
│   │   ├── crud.py              # Data access layer
│   │   ├── api/
│   │   │   ├── content.py       # Content endpoints
│   │   │   └── wizards.py       # Wizard run endpoints
│   │   └── __init__.py
│   ├── alembic/
│   │   ├── env.py               # Alembic runtime config
│   │   ├── script.py.mako       # Migration template
│   │   ├── versions/
│   │   │   ├── 001_initial_schema.py  # Schema migration
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── MarkdownRenderer.tsx  # Safe markdown rendering
│   │   ├── context/
│   │   │   └── ContentContext.tsx    # Global content state
│   │   ├── hooks/
│   │   │   └── useContent.ts         # Content hook
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Admin.tsx             # Edit everything here
│   │   │   ├── Wizard1Step1.tsx      # Secure Access Setup: Step 1
│   │   │   ├── Wizard1Step2.tsx      # Secure Access Setup: Step 2
│   │   │   ├── Wizard1Step3.tsx      # Secure Access Setup: Step 3
│   │   │   ├── Wizard2Step1.tsx      # Data Import Quickstart: Step 1
│   │   │   ├── Wizard2Step2.tsx      # Data Import Quickstart: Step 2
│   │   │   └── Wizard2Step3.tsx      # Data Import Quickstart: Step 3
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   └── .gitignore
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 24.13.0 + Python 3.14.3 for local development

### Run Everything

```bash
docker compose up --build
```

Then:
- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API**: http://localhost:8000
- **API Health**: http://localhost:8000/health

The database will auto-initialize with migrations and seed data on first run.

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

export DATABASE_URL="postgresql://cms_user:cms_password@localhost/micro_cms"
python -m alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## 📖 Site Routes

### Public Pages

- **`/`** – Home splash (hero section, CTA, feature list)
- **`/faq`** – FAQ items (editable JSON array)
- **`/about`** – About page (markdown)

### Wizards

**Secure Access Setup** (3-step wizard)
- **`/wizard/secure-access/step-1`** – Choose account recovery method
- **`/wizard/secure-access/step-2`** – Enable 2FA
- **`/wizard/secure-access/step-3`** – Review & confirm
- Saves to `wizard_runs` table on completion

**Data Import Quickstart** (3-step wizard)
- **`/wizard/data-import/step-1`** – Select data source (paste CSV or upload)
- **`/wizard/data-import/step-2`** – Map columns to required fields
- **`/wizard/data-import/step-3`** – Validate & import
- Saves to `wizard_runs` table on completion

### Admin

- **`/admin`** – Content editor panel
  - Edit all pages and wizard instructions
  - View and restore revision history
  - Save draft and publish separately
  - Live markdown preview

## 🗄️ Database Schema

### `content_entries`
```sql
key          TEXT PRIMARY KEY
type         ENUM('plain', 'markdown', 'rich_json')
current_draft     TEXT (nullable)
current_published TEXT (nullable)
updated_at   TIMESTAMP
updated_by   TEXT (default: "default")
```

### `content_revisions`
```sql
id         UUID PRIMARY KEY
key        TEXT FOREIGN KEY -> content_entries.key
mode       ENUM('draft', 'published')
type       ENUM('plain', 'markdown', 'rich_json')
value      TEXT
created_at TIMESTAMP
created_by TEXT (default: "default")
```

### `wizard_runs`
```sql
id         UUID PRIMARY KEY
wizard_id  TEXT (e.g., "secure_access_setup", "data_import_quickstart")
step       TEXT (current step number/state)
data       TEXT (JSON string of collected form data)
completed  BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

## 📝 Content Keys

All content is identified by stable string keys following this pattern:

### Pages
- `home.hero.title` (plain)
- `home.hero.subtitle` (plain)
- `home.hero.body_md` (markdown)
- `home.cta.label` (plain)
- `home.cta.href` (plain)
- `about.page.body_md` (markdown)
- `faq.items` (rich_json: array of `{question, answer_md}`)

### Wizards
Pattern: `wizard.<wizard_id>.step.<n>.<section>.<field>`

**Example for Wizard 1, Step 1:**
- `wizard.secure_access_setup.step.1.header.title` (plain)
- `wizard.secure_access_setup.step.1.body.intro_md` (markdown)
- `wizard.secure_access_setup.step.1.callout.note_md` (markdown)
- `wizard.secure_access_setup.step.1.footer.next_label` (plain)

All wizard steps follow the same pattern. See `backend/app/database.py` for the complete list of seed keys.

## 🎨 Draft Mode & Preview

**How it works:**

1. **Toggle Draft Mode**: Use the "📝 Preview Draft" button in the top-right (only visible when in Published mode)
2. **Admin Editing**: When you save a draft in `/admin`, it's stored in `content_entries.current_draft`
3. **Live Preview**: Switch to Draft mode to see unpublished changes across all pages and wizards
4. **Publish**: The "🚀 Publish" button copies `current_draft` → `current_published`
5. **Visual Indicator**: A yellow banner shows when Draft mode is active

## 🔄 Versioning & Restore

Every change creates a new row in `content_revisions`:

- **Save Draft** → creates a `mode='draft'` revision
- **Publish** → creates a `mode='published'` revision
- **Restore** → fetches an old revision and creates a **new** revision marked as a restore (history is never deleted)

**To restore:**
1. Open `/admin` and select a content item
2. Click "▶ Revision History" to expand
3. Select any previous version and click "Restore"
4. Choose restore to `draft` or `published`

## 📦 Tech Stack

### Frontend
- **React 19.2.4** – UI framework
- **Vite 7.3.1** – Build tool
- **TypeScript 5.9.3** – Type safety
- **react-md-editor 4.0.4** – Markdown editing with live preview
- **DOMPurify 3.0.6** – HTML sanitization
- **marked 11.1.1** – Markdown parsing

### Backend
- **FastAPI 0.128.0** – Web framework
- **SQLAlchemy 2.0.46** – ORM
- **Alembic 1.18.3** – Database migrations
- **PostgreSQL 18** – Database

### DevOps
- **Docker & Compose** – Containerization
- **Node.js 24.13.0** – Frontend runtime
- **Python 3.14.3** – Backend runtime

## 🔐 Security Notes

### Safe Markdown Rendering

The `MarkdownRenderer` component:
- Parses markdown with `marked`
- Sanitizes output with DOMPurify
- Allows only safe tags: `<p>`, `<a>`, `<ul>`, `<ol>`, `<li>`, `<strong>`, `<em>`, `<code>`, `<pre>`, `<h2>`, `<h3>`, `<blockquote>`, `<hr>`, `<br>`
- Blocks raw HTML and JavaScript

### No Authentication

This demo uses a single "default" user. To add real auth:

1. Add auth middleware to FastAPI (e.g., JWT tokens)
2. Update `created_by`/`updated_by` fields to track actual users
3. Add role-based access control in `/admin`
4. Protect API endpoints with `@require_auth` decorator

## 🛠️ Common Tasks

### Add a New Content Key

1. **Create the entry** in `backend/app/database.py` (search `seed_entries`):
   ```python
   {"key": "my.new.key", "type": "markdown"},
   ```

2. **Add seed value** in same file (search `seed_values`):
   ```python
   "my.new.key": ("markdown", "My default content here"),
   ```

3. **Use in frontend**:
   ```tsx
   const { content, fetchContent } = useContent();
   useEffect(() => {
     fetchContent(["my.new.key"]);
   }, []);
   const value = content["my.new.key"]?.value || "fallback";
   ```

4. **Restart containers**:
   ```bash
   docker compose up --build
   ```

### Add a New Page

1. Create a new component in `frontend/src/pages/YourPage.tsx`
2. Import and add a route in `App.tsx`
3. Create content keys for the page
4. Add to seed data in backend

### Add a New Wizard Step

1. Create step page in `frontend/src/pages/WizardXStepY.tsx`
2. Add routes in `App.tsx`
3. Create content keys following the naming convention
4. Seed content in backend
5. Update navigation links

## 📊 Content Type Guidelines

### `"plain"`
- Plain text, no formatting
- Max: 2000 characters
- Use for: titles, labels, short text

### `"markdown"`
- Markdown syntax (headers, lists, bold, italic, links, code blocks)
- Max: 50,000 characters
- Use for: long-form content, instructions, descriptions
- Rendered safely with `MarkdownRenderer`

### `"rich_json"`
- JSON objects/arrays
- Max: 50,000 characters
- Use for: FAQ items `[{question, answer_md}]`, structured data
- Validate schema in backend before saving

## 🐛 Troubleshooting

### Database Connection Error
```
ERROR: connect to db:5432 failed
```
→ Ensure PostgreSQL container is healthy: `docker compose ps`

### API Not Responding
```
api_1  | Address already in use: ('0.0.0.0', 8000)
```
→ Kill the process: `lsof -ti:8000 | xargs kill -9` or use a different port

### Migrations Failed
```
Alembic error: unable to connect to database
```
→ Wait for DB to start: `docker compose logs db` and check for "database system is ready"

### Styles Not Loading
→ Rebuild: `docker compose down && docker compose up --build`

## 📚 Learn More

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [react-md-editor](https://github.com/uiwjs/react-md-editor)
- [DOMPurify](https://github.com/cure53/DOMPurify)

## 📄 License

This example is provided as-is for educational and demonstration purposes.

---

**Happy building! 🚀**
