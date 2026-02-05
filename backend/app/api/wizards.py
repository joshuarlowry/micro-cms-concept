from fastapi import APIRouter, HTTPException
from app.database import get_db_session
from app.schemas import WizardRunCreate, WizardRunSchema
from app import crud
import json

router = APIRouter()

@router.post("/runs")
def create_wizard_run(run: WizardRunCreate):
    """Create a new wizard run"""
    with get_db_session() as db:
        created_run = crud.create_wizard_run(
            db,
            wizard_id=run.wizard_id,
            step=run.step,
            data=run.data,
            completed=run.completed,
        )
        return {
            "id": created_run.id,
            "wizard_id": created_run.wizard_id,
            "step": created_run.step,
            "data": created_run.data,
            "completed": created_run.completed,
            "created_at": created_run.created_at,
        }

@router.put("/runs/{run_id}")
def update_wizard_run(run_id: str, run: WizardRunCreate):
    """Update a wizard run"""
    try:
        with get_db_session() as db:
            updated_run = crud.update_wizard_run(
                db,
                run_id=run_id,
                step=run.step,
                data=run.data,
                completed=run.completed,
            )
            return {
                "id": updated_run.id,
                "wizard_id": updated_run.wizard_id,
                "step": updated_run.step,
                "data": updated_run.data,
                "completed": updated_run.completed,
                "updated_at": updated_run.updated_at,
            }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/runs/{wizard_id}")
def get_wizard_runs(wizard_id: str, limit: int = 50):
    """Get wizard run records"""
    with get_db_session() as db:
        runs = crud.get_wizard_runs(db, wizard_id, limit)
        return [
            {
                "id": r.id,
                "wizard_id": r.wizard_id,
                "step": r.step,
                "data": r.data,
                "completed": r.completed,
                "created_at": r.created_at,
                "updated_at": r.updated_at,
            }
            for r in runs
        ]
