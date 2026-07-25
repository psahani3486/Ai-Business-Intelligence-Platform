import sys
import os
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

# Ensure the backend module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.alerts.engine import run_all_checks
from backend.reports.generator import generate_pdf_report

def run_daily_reports():
    """Generates a daily PDF report via Airflow."""
    date_range = datetime.now().strftime("%B %Y")
    report_id, filepath = generate_pdf_report(
        title="Automated Daily Report", 
        date_range=date_range, 
        include_charts=True
    )
    print(f"Generated automated report: {report_id} at {filepath}")

default_args = {
    'owner': 'quantumbi',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'enterprise_bi_operations',
    default_args=default_args,
    description='A DAG for operational alerts and reporting',
    schedule_interval='@hourly', # Run alerts frequently
    start_date=datetime(2023, 1, 1),
    catchup=False,
    tags=['operations', 'alerts'],
) as dag:

    trigger_alerts = PythonOperator(
        task_id='trigger_alerts',
        python_callable=run_all_checks,
    )

    generate_reports = PythonOperator(
        task_id='generate_reports',
        python_callable=run_daily_reports,
    )

    # These can run independently in parallel
    [trigger_alerts, generate_reports]
