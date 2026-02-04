from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ContentEntry, ContentRevision, WizardRun, RevisionModeEnum, ContentTypeEnum
from app.schemas import ContentCreate, ContentUpdate

def get_content(db: Session, key: str, mode: str = "published"):
    """Get content by key, returning draft if mode=draft and draft exists, else published"""
    entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
    if not entry:
        return None

    if mode == "draft" and entry.current_draft is not None:
        return {"type": entry.type, "value": entry.current_draft}
    elif entry.current_published is not None:
        return {"type": entry.type, "value": entry.current_published}
    else:
        return {"type": entry.type, "value": None}

def get_content_batch(db: Session, keys: list, mode: str = "published"):
    """Get multiple content entries at once"""
    result = {}
    for key in keys:
        content = get_content(db, key, mode)
        if content:
            result[key] = content
    return result

def save_draft(db: Session, key: str, content_type: str, value: str):
    """Save a draft version of content"""
    entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
    if not entry:
        raise ValueError(f"Content key '{key}' not found")

    # Update draft
    entry.current_draft = value
    entry.updated_at = datetime.utcnow()
    entry.updated_by = "default"

    # Create revision
    revision = ContentRevision(
        key=key,
        mode=RevisionModeEnum.draft,
        type=content_type,
        value=value,
        created_by="default",
    )
    db.add(revision)
    db.commit()

    return entry

def publish_content(db: Session, key: str, value: str = None):
    """Publish content from draft or use provided value"""
    entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
    if not entry:
        raise ValueError(f"Content key '{key}' not found")

    # Use provided value or current draft
    publish_value = value if value is not None else entry.current_draft
    if publish_value is None:
        raise ValueError(f"No draft content to publish for key '{key}'")

    # Update published
    entry.current_published = publish_value
    entry.updated_at = datetime.utcnow()
    entry.updated_by = "default"

    # Create revision
    revision = ContentRevision(
        key=key,
        mode=RevisionModeEnum.published,
        type=entry.type,
        value=publish_value,
        created_by="default",
    )
    db.add(revision)
    db.commit()

    return entry

def get_revisions(db: Session, key: str, limit: int = 20):
    """Get revision history for a content key"""
    revisions = (
        db.query(ContentRevision)
        .filter(ContentRevision.key == key)
        .order_by(ContentRevision.created_at.desc())
        .limit(limit)
        .all()
    )
    return revisions

def restore_revision(db: Session, key: str, revision_id: str, target_mode: str):
    """Restore a previous revision"""
    # Get the revision to restore
    revision = db.query(ContentRevision).filter(
        ContentRevision.id == revision_id,
        ContentRevision.key == key,
    ).first()

    if not revision:
        raise ValueError(f"Revision '{revision_id}' not found for key '{key}'")

    entry = db.query(ContentEntry).filter(ContentEntry.key == key).first()
    if not entry:
        raise ValueError(f"Content key '{key}' not found")

    # Create a new revision recording the restore
    new_revision = ContentRevision(
        key=key,
        mode=target_mode,
        type=revision.type,
        value=revision.value,
        created_by="default",
    )

    # Update the appropriate field
    if target_mode == "draft":
        entry.current_draft = revision.value
    else:
        entry.current_published = revision.value

    entry.updated_at = datetime.utcnow()
    entry.updated_by = "default"

    db.add(new_revision)
    db.commit()

    return entry

def create_wizard_run(db: Session, wizard_id: str, step: str, data: str = None, completed: bool = False):
    """Create a wizard run record"""
    run = WizardRun(
        wizard_id=wizard_id,
        step=step,
        data=data,
        completed=completed,
    )
    db.add(run)
    db.commit()
    return run

def update_wizard_run(db: Session, run_id: str, step: str = None, data: str = None, completed: bool = None):
    """Update a wizard run record"""
    run = db.query(WizardRun).filter(WizardRun.id == run_id).first()
    if not run:
        raise ValueError(f"Wizard run '{run_id}' not found")

    if step is not None:
        run.step = step
    if data is not None:
        run.data = data
    if completed is not None:
        run.completed = completed

    run.updated_at = datetime.utcnow()
    db.commit()
    return run

def get_wizard_runs(db: Session, wizard_id: str, limit: int = 50):
    """Get wizard run records"""
    runs = (
        db.query(WizardRun)
        .filter(WizardRun.wizard_id == wizard_id)
        .order_by(WizardRun.created_at.desc())
        .limit(limit)
        .all()
    )
    return runs
