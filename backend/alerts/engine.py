import logging
import os
import random
from typing import List
import pandas as pd
from backend.database import execute_query
from backend.alerts.notifiers import send_slack_alert, send_email_alert

logger = logging.getLogger(__name__)

# In-memory mock cache for triggered alerts
_alerts_log = []

def log_alert(metric: str, message: str, severity: str):
    """Logs the alert to memory and dispatches notifications."""
    alert = {
        "metric": metric,
        "message": message,
        "severity": severity,
        "timestamp": pd.Timestamp.now().isoformat()
    }
    _alerts_log.append(alert)
    
    # Keep log small
    if len(_alerts_log) > 100:
        _alerts_log.pop(0)
        
    # Dispatch
    send_slack_alert(message, severity)
    send_email_alert(f"Alert: {metric}", message)

def get_recent_alerts() -> List[dict]:
    return sorted(_alerts_log, key=lambda x: x["timestamp"], reverse=True)

def check_revenue_drops():
    """Checks for steep daily revenue drops."""
    print("Checking revenue drops...")
    query = """
        SELECT ds, y, lag_1 
        FROM features_forecasting 
        ORDER BY ds DESC 
        LIMIT 1
    """
    df = execute_query(query)
    if df is not None and len(df) > 0:
        current = df['y'].iloc[0]
        previous = df['lag_1'].iloc[0]
        
        if previous and previous > 0:
            drop = (previous - current) / previous
            if drop > 0.30: # 30% drop
                msg = f"Revenue dropped by {drop*100:.1f}% from yesterday. Current: ${current:.2f}, Previous: ${previous:.2f}"
                log_alert("Revenue Drop", msg, "high")

def check_inventory_levels():
    """Checks for extremely low inventory levels."""
    print("Checking inventory levels...")
    query = """
        SELECT ds, y 
        FROM features_inventory 
        ORDER BY ds DESC 
        LIMIT 1
    """
    df = execute_query(query)
    if df is not None and len(df) > 0:
        current_sales = df['y'].iloc[0]
        if current_sales > 1000: # Heuristic
            msg = f"High daily sales volume ({current_sales} items) detected. Stock-out risk elevated."
            log_alert("Inventory Alert", msg, "medium")

def check_forecast_accuracy():
    """Mocks checking forecast accuracy."""
    print("Checking forecast accuracy...")
    # In reality, compare yesterday's prediction vs today's actual
    accuracy = random.uniform(0.6, 0.95)
    if accuracy < 0.7:
        msg = f"Forecast accuracy dropped to {accuracy*100:.1f}%. Model retraining might be needed."
        log_alert("Forecast Drift", msg, "medium")

def check_pipeline_failures():
    """Mocks checking ETL pipeline health."""
    print("Checking pipeline health...")
    # Simulate occasional failure
    if random.random() < 0.05:
        log_alert("Pipeline Failure", "ETL Job `create_ml_features` failed in the last run.", "high")

def check_model_drift():
    """Mocks checking data distribution drift."""
    print("Checking model drift...")
    if random.random() < 0.10:
        log_alert("Model Drift", "Detected data distribution shift in Customer CLV features.", "medium")

def run_all_checks():
    """Runs all alert checks."""
    try:
        check_revenue_drops()
        check_inventory_levels()
        check_forecast_accuracy()
        check_pipeline_failures()
        check_model_drift()
    except Exception as e:
        print(f"Error running alert checks: {e}")
