# Micro CMS

A lightweight reference implementation for adding editable content to any application. **Change text without deployments.**

## The Problem

Every app has "static" content: page titles, button labels, help text, wizard instructions, FAQ items. Typically this lives in code, meaning every text change requires a developer, a PR, and a deployment.

## The Solution

Add two tables to your database. Now anyone can edit content through a simple admin panel, and changes go live instantly.

```
Before: "Can you change the button text?" → PR → Review → Deploy → Done (hours/days)
After:  "Can you change the button text?" → Admin panel → Save → Done (seconds)
```

## What You Add

### Two Database Tables

That's it. Two tables turn your static strings into editable content:

**`content_entries`** - Your content storage

| Column | Type | Purpose |
|--------|------|---------|
| `key` | `VARCHAR(255) PK` | Unique identifier (e.g., `home.hero.title`) |
| `type` | `ENUM` | `plain`, `markdown`, or `rich_json` |
| `current_draft` | `TEXT` | Work-in-progress value |
| `current_published` | `TEXT` | Live value served to users |
| `updated_at` | `TIMESTAMP` | Last modification time |
| `updated_by` | `VARCHAR(100)` | Who made the change |

**`content_revisions`** - Automatic version history

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `UUID PK` | Revision identifier |
| `key` | `VARCHAR(255) FK` | References content_entries |
| `mode` | `ENUM` | `draft` or `published` |
| `type` | `ENUM` | Content type at time of save |
| `value` | `TEXT` | The actual content |
| `created_at` | `TIMESTAMP` | When this version was saved |
| `created_by` | `VARCHAR(100)` | Who saved it |

Every save creates a revision. You get full history and rollback for free.

### Optional: Wizard Runs Table

If your app has multi-step flows (onboarding, setup wizards, import processes), add a third table to track user progress:

**`wizard_runs`** - Track multi-step flow completions

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `UUID PK` | Run identifier |
| `wizard_id` | `VARCHAR(100)` | Which wizard (e.g., `onboarding`) |
| `step` | `VARCHAR(10)` | Current step |
| `data` | `TEXT` | JSON blob of collected data |
| `completed` | `BOOLEAN` | Whether flow finished |
| `created_at` | `TIMESTAMP` | When started |
| `updated_at` | `TIMESTAMP` | Last activity |

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Database   │────▶│     API      │────▶│   Your App   │
│   (2 tables) │     │  /api/content│     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                                         
       │             ┌──────────────┐            
       └─────────────│ Admin Panel  │            
                     └──────────────┘            
```

1. **Your app** requests content by key: `GET /api/content?keys=home.title,home.subtitle`
2. **API returns** the published values (or drafts in preview mode)
3. **Admin panel** lets editors change content and publish when ready
4. **No deployment needed** - database changes are instant

## Key Naming Convention

Use a hierarchical pattern for organization:

```
<page>.<section>.<field>
<page>.<section>.<field>_md        # markdown content
wizard.<id>.step.<n>.<section>.<field>
```

Examples:
- `home.hero.title` → Homepage hero title
- `home.hero.body_md` → Homepage hero body (markdown)
- `faq.items` → FAQ list (rich_json array)
- `wizard.onboarding.step.1.header.title` → Onboarding step 1 title

## Running This Reference Implementation

### Quick Start

```bash
docker compose up --build
```

Then open:
- **App**: http://localhost:5173
- **Admin**: http://localhost:5173/admin
- **API**: http://localhost:8000

### What's Included

This repo demonstrates the pattern with:

- **React frontend** with content fetching via context
- **FastAPI backend** with content and revision APIs
- **PostgreSQL** with the schema above
- **Admin panel** for editing all content types
- **Draft/publish workflow** with revision history
- **Two example wizards** showing editable multi-step flows

## Integrating Into Your App

### 1. Add the Tables

Run the migration or create tables manually:

```sql
-- Content type enum
CREATE TYPE contenttypeenum AS ENUM ('plain', 'markdown', 'rich_json');
CREATE TYPE revisionmodeenum AS ENUM ('draft', 'published');

-- Main content storage
CREATE TABLE content_entries (
    key VARCHAR(255) PRIMARY KEY,
    type contenttypeenum NOT NULL,
    current_draft TEXT,
    current_published TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'system'
);

-- Revision history
CREATE TABLE content_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) REFERENCES content_entries(key),
    mode revisionmodeenum NOT NULL,
    type contenttypeenum NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'system'
);

CREATE INDEX idx_revisions_key ON content_revisions(key);
CREATE INDEX idx_revisions_created_at ON content_revisions(created_at);
```

### 2. Add API Endpoints

You need three basic endpoints:

```
GET  /api/content?keys=a,b,c&mode=published  → Fetch content
PUT  /api/content/{key}                       → Save draft
POST /api/content/{key}/publish               → Publish draft
```

See `backend/app/api/content.py` for the full implementation.

### 3. Fetch Content in Your App

Replace hardcoded strings with content lookups:

```tsx
// Before
<h1>Welcome to Our App</h1>

// After
const title = content["home.hero.title"]?.value || "Welcome to Our App";
<h1>{title}</h1>
```

The fallback ensures your app works even if content hasn't been seeded yet.

### 4. Build an Admin Panel

Or copy/adapt the one in this repo (`frontend/src/pages/Admin.tsx`). Key features:
- List all content keys
- Edit with appropriate editor (text input, markdown, JSON)
- Save as draft, preview, then publish
- View and restore from revision history

## Content Types

| Type | Use Case | Editor |
|------|----------|--------|
| `plain` | Titles, labels, short text (max 2000 chars) | Single-line input |
| `markdown` | Long-form content, instructions (max 50K chars) | Textarea with preview |
| `rich_json` | Structured data like FAQ items (max 50K chars) | JSON editor |

## Draft Mode

The dual-column design (`current_draft` / `current_published`) enables:

1. **Edit safely** - drafts don't affect live users
2. **Preview changes** - switch your app to draft mode to see pending changes
3. **Publish when ready** - one click copies draft to published
4. **Rollback easily** - restore any revision to draft or published

## Tech Stack (This Implementation)

- **Frontend**: React, TypeScript, Vite
- **Backend**: FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL
- **Containerization**: Docker Compose

Adapt to your stack. The pattern works with any language/framework.

## License

MIT - Use however you like.
