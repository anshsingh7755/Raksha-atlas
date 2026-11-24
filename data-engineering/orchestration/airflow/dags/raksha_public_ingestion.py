"""Airflow adapter for the isolated Python pipeline; install Airflow separately."""
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.bash import BashOperator

with DAG(
    dag_id="raksha_public_rss_ingestion",
    description="Dry-run public RSS metadata collection; Node pipeline remains active.",
    start_date=datetime(2026, 1, 1),
    schedule="0 * * * *",
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["raksha-atlas", "public-data"],
) as dag:
    collect = BashOperator(
        task_id="collect_rss_dry_run",
        bash_command="cd {{ var.value.raksha_data_engineering_path }} && python -m pipeline.main --collect-rss",
    )
