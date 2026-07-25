import sys
import os
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.sensors.external_task import ExternalTaskSensor

# Ensure the backend module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.etl.feature_engineering import create_ml_features
from backend.ml.train_all import main as train_models

# We don't have a specific forecasting script that "runs" the forecast other than train_all right now, 
# but if there was a batch inference script, we'd add it here. For now, training includes forecasting training.

default_args = {
    'owner': 'quantumbi',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'enterprise_bi_ml_pipeline',
    default_args=default_args,
    description='A DAG for feature engineering and model training',
    schedule_interval='@daily',
    start_date=datetime(2023, 1, 1),
    catchup=False,
    tags=['mlops', 'training'],
) as dag:

    # Wait for the ETL DAG to complete for the same execution date
    wait_for_etl = ExternalTaskSensor(
        task_id='wait_for_etl',
        external_dag_id='enterprise_bi_etl_pipeline',
        external_task_id='run_core_etl',
        mode='reschedule',
        timeout=3600,
    )

    run_feature_engineering = PythonOperator(
        task_id='run_feature_engineering',
        python_callable=create_ml_features,
    )

    run_model_training = PythonOperator(
        task_id='run_model_training',
        python_callable=train_models,
    )

    wait_for_etl >> run_feature_engineering >> run_model_training
