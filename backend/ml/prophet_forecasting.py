import logging
import pandas as pd
from prophet import Prophet
import mlflow
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from backend.database import execute_query

logger = logging.getLogger(__name__)

def train_prophet_model(table_name: str = "features_forecasting", model_name: str = "prophet_forecasting_model", target_col: str = "y", run_name: str = "revenue_forecasting_prophet"):
    """Trains a Prophet model for time series forecasting."""
    logger.info(f"Training Prophet Model: {model_name} from {table_name} (Target: {target_col})...")
    
    # We use features_forecasting which has 'ds' and 'y'
    df = execute_query(f"SELECT ds, {target_col} as y FROM {table_name} ORDER BY ds")
    
    if df is None or len(df) == 0:
        logger.error(f"Error: No data found in {table_name}")
        return None
        
    df = df.dropna().reset_index(drop=True)
    
    train_size = len(df) - 30
    if train_size <= 0:
        print("Not enough data to train Prophet.")
        return None
        
    train_df = df.iloc[:train_size]
    test_df = df.iloc[train_size:]
    
    with mlflow.start_run(run_name=run_name):
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        
        mlflow.log_param("yearly_seasonality", True)
        mlflow.log_param("weekly_seasonality", True)
        
        model.fit(train_df)
        
        forecast = model.predict(test_df[['ds']])
        
        y_test = test_df['y'].values
        predictions = forecast['yhat'].values
        
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        mape = mean_absolute_percentage_error(y_test, predictions)
        
        mlflow.log_metric("rmse", rmse)
        mlflow.log_metric("mape", mape)
        
        print(f"{model_name} Trained. RMSE: {rmse:.2f}, MAPE: {mape:.2f}")
        
        # Log model
        mlflow.prophet.log_model(model, model_name)
        
    return model

def train_customer_growth_prophet_models():
    models = {}
    table = "features_customer_metrics_daily"
    # New Customers
    models['new_customers'] = train_prophet_model(
        table, "customer_growth_new_prophet", target_col="new_customers", run_name="customer_growth_new_prophet"
    )
    # Returning Customers
    models['returning_customers'] = train_prophet_model(
        table, "customer_growth_returning_prophet", target_col="returning_customers", run_name="customer_growth_returning_prophet"
    )
    # MAU
    models['mau'] = train_prophet_model(
        table, "customer_growth_mau_prophet", target_col="mau", run_name="customer_growth_mau_prophet"
    )
    # Growth Rate
    models['growth_rate'] = train_prophet_model(
        table, "customer_growth_rate_prophet", target_col="growth_rate", run_name="customer_growth_rate_prophet"
    )
    return models

if __name__ == "__main__":
    import os
    tracking_uri = os.environ.get("MLFLOW_TRACKING_URI", "./mlruns")
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("BI_Platform_Models")
    train_prophet_model()
    train_customer_growth_prophet_models()
