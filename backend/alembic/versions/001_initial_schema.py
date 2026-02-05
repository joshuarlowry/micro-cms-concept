"""Initial schema creation

Revision ID: 001
Revises:
Create Date: 2026-02-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create ENUM types using raw SQL with IF NOT EXISTS
    op.execute("CREATE TYPE contenttypeenum AS ENUM ('plain', 'markdown', 'rich_json')")
    op.execute("CREATE TYPE revisionmodeenum AS ENUM ('draft', 'published')")

    # Create content_entries table
    op.create_table(
        "content_entries",
        sa.Column("key", sa.String(255), nullable=False, primary_key=True),
        sa.Column("type", postgresql.ENUM("plain", "markdown", "rich_json", name="contenttypeenum", create_type=False), nullable=False),
        sa.Column("current_draft", sa.Text(), nullable=True),
        sa.Column("current_published", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("updated_by", sa.String(100), nullable=True),
    )
    op.create_index(op.f("ix_content_entries_key"), "content_entries", ["key"])

    # Create content_revisions table
    op.create_table(
        "content_revisions",
        sa.Column("id", sa.String(36), nullable=False, primary_key=True),
        sa.Column("key", sa.String(255), nullable=False),
        sa.Column("mode", postgresql.ENUM("draft", "published", name="revisionmodeenum", create_type=False), nullable=False),
        sa.Column("type", postgresql.ENUM("plain", "markdown", "rich_json", name="contenttypeenum", create_type=False), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.ForeignKeyConstraint(["key"], ["content_entries.key"]),
    )
    op.create_index(op.f("ix_content_revisions_id"), "content_revisions", ["id"])
    op.create_index(op.f("ix_content_revisions_key"), "content_revisions", ["key"])
    op.create_index(op.f("ix_content_revisions_created_at"), "content_revisions", ["created_at"])

    # Create wizard_runs table
    op.create_table(
        "wizard_runs",
        sa.Column("id", sa.String(36), nullable=False, primary_key=True),
        sa.Column("wizard_id", sa.String(100), nullable=False),
        sa.Column("step", sa.String(10), nullable=False),
        sa.Column("data", sa.Text(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index(op.f("ix_wizard_runs_id"), "wizard_runs", ["id"])
    op.create_index(op.f("ix_wizard_runs_wizard_id"), "wizard_runs", ["wizard_id"])
    op.create_index(op.f("ix_wizard_runs_created_at"), "wizard_runs", ["created_at"])


def downgrade():
    op.drop_index(op.f("ix_wizard_runs_created_at"), table_name="wizard_runs")
    op.drop_index(op.f("ix_wizard_runs_wizard_id"), table_name="wizard_runs")
    op.drop_index(op.f("ix_wizard_runs_id"), table_name="wizard_runs")
    op.drop_table("wizard_runs")

    op.drop_index(op.f("ix_content_revisions_created_at"), table_name="content_revisions")
    op.drop_index(op.f("ix_content_revisions_key"), table_name="content_revisions")
    op.drop_index(op.f("ix_content_revisions_id"), table_name="content_revisions")
    op.drop_table("content_revisions")

    op.drop_index(op.f("ix_content_entries_key"), table_name="content_entries")
    op.drop_table("content_entries")
