from typing import Any
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db_session
from app.schemas import (
    ContentCreate,
    ContentUpdate,
    ContentResponseItem,
    ContentRevisionSchema,
    PublishRequest,
    RestoreRequest,
)
from app import crud

router = APIRouter()

@router.get("")
def get_content_batch(keys: str = Query(...), mode: str = Query("published")) -> dict[str, dict[str, Any]]:
    """Get multiple content entries at once.

    Args:
        keys: Comma-separated list of content keys
        mode: 'published' or 'draft' - if draft, returns draft if exists, else published
    """
    key_list = [k.strip() for k in keys.split(",")]

    with get_db_session() as db:
        content = crud.get_content_batch(db, key_list, mode)

    return content

@router.put("/{key}")
def save_draft(key: str, content: ContentUpdate) -> dict[str, str]:
    """Save a draft version of content"""
    try:
        with get_db_session() as db:
            crud.save_draft(db, key, content.type, content.value)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"status": "draft saved", "key": key}

@router.post("/{key}/publish")
def publish(key: str, request: PublishRequest | None = None) -> dict[str, str]:
    """Publish content"""
    try:
        with get_db_session() as db:
            value = request.value if request else None
            crud.publish_content(db, key, value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"status": "published", "key": key}

@router.get("/{key}/revisions")
def get_revisions(key: str, limit: int = Query(20, le=100)) -> list[dict[str, Any]]:
    """Get revision history for a content key"""
    with get_db_session() as db:
        revisions = crud.get_revisions(db, key, limit)
        # Serialize within the session context to avoid DetachedInstanceError
        result = [
            {
                "id": r.id,
                "key": r.key,
                "mode": r.mode.value,
                "type": r.type.value,
                "value": r.value[:200] + "..." if len(r.value) > 200 else r.value,
                "full_value": r.value,
                "created_at": r.created_at,
                "created_by": r.created_by,
            }
            for r in revisions
        ]
    return result

@router.post("/{key}/restore/{revision_id}")
def restore(key: str, revision_id: str, request: RestoreRequest) -> dict[str, str]:
    """Restore a previous revision"""
    try:
        with get_db_session() as db:
            crud.restore_revision(db, key, revision_id, request.target_mode.value)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"status": "restored", "key": key, "revision_id": revision_id}
