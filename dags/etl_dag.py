import sys
import os
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

# Ensure the backend module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.etl.pipeline import run_pipeline

default_args = {
    'owner': 'quantumbi',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'enterprise_bi_etl_pipeline',
    default_args=default_args,
    description='A simple DAG to run the core ETL pipeline',
    schedule_interval='@daily',
    start_date=datetime(2023, 1, 1),
    catchup=False,
    tags=['etl', 'ingestion'],
) as dag:

    run_core_etl = PythonOperator(
        task_id='run_core_etl',
        python_callable=run_pipeline,
    )

    run_core_etl
