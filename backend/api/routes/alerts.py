from fastapi import APIRouter, BackgroundTasks
from typing import List, Dict
from backend.api.schemas import TriggeredAlert, AlertConfig
from backend.alerts.engine import get_recent_alerts, run_all_checks

router = APIRouter()

@router.get("/", response_model=List[TriggeredAlert])
def get_alerts():
    """Get recent alerts from the in-memory cache."""
    alerts = get_recent_alerts()
    # Convert dicts to Pydantic models for validation
    return [TriggeredAlert(**a) for a in alerts]

@router.post("/trigger")
def trigger_alert_checks(background_tasks: BackgroundTasks):
    """Manually trigger background alert checks."""
    background_tasks.add_task(run_all_checks)
    return {"status": "success", "message": "Alert checks triggered in the background."}

@router.post("/config")
def update_alert_config(config: AlertConfig):
    """Update alert configuration thresholds (mock)."""
    # In reality, this would save to a database table
    return {"status": "success", "message": f"Updated config for {config.metric}."}
