from fastapi import APIRouter, HTTPException
from backend.api.schemas import ChartDataPoint
from typing import List
import pandas as pd
import numpy as np
from datetime import timedelta
from backend.database import execute_query
from backend.ml.utils import get_latest_model
from backend.monitoring import track_inference_time

router = APIRouter()

# Lazy load model
_forecast_model = None

def get_model():
    global _forecast_model
    if _forecast_model is None:
        _forecast_model = get_latest_model("forecasting_model")
    return _forecast_model

@router.get("/revenue", response_model=List[ChartDataPoint])
@track_inference_time("xgboost_forecast")
def get_revenue_forecast():
    """Get revenue forecast for the next 30 days using XGBoost."""
    model = get_model()
    
    query = """
        SELECT ds, y, lag_1, lag_7, lag_30, day_of_week, month 
        FROM features_forecasting 
        ORDER BY ds DESC 
        LIMIT 30
    """
    df = execute_query(query)
    
    if df is None or len(df) == 0:
        return []
        
    df = df.sort_values('ds').reset_index(drop=True)
    last_date = pd.to_datetime(df['ds'].iloc[-1])
    
    forecasts = []
    
    # If model failed to load, return mock data
    if model is None:
        last_val = df['y'].iloc[-1]
        for i in range(1, 31):
            future_date = last_date + timedelta(days=i)
            forecasts.append(ChartDataPoint(
                name=future_date.strftime('%Y-%m-%d'),
                value=float(last_val * 1.01) # simple 1% growth fallback
            ))
        return forecasts
        
    # Generate 30 days of future predictions using autoregressive simulation
    current_lag_1 = df['y'].iloc[-1]
    current_lag_7 = df['y'].iloc[-7] if len(df) >= 7 else df['y'].iloc[0]
    current_lag_30 = df['y'].iloc[-30] if len(df) >= 30 else df['y'].iloc[0]
    
    for i in range(1, 31):
        future_date = last_date + timedelta(days=i)
        
        # Prepare feature row for model
        feature_row = pd.DataFrame([{
            'lag_1': current_lag_1,
            'lag_7': current_lag_7,
            'lag_30': current_lag_30,
            'day_of_week': future_date.dayofweek,
            'month': future_date.month
        }])
        
        pred_val = model.predict(feature_row)[0]
        pred_val = max(0, float(pred_val))
        
        forecasts.append(ChartDataPoint(
            name=future_date.strftime('%Y-%m-%d'),
            value=pred_val
        ))
        
        # Update lags for next autoregressive step
        current_lag_30 = current_lag_7
        current_lag_7 = current_lag_1
        current_lag_1 = pred_val
        
    return forecasts

_prophet_model = None

def get_prophet_model():
    global _prophet_model
    if _prophet_model is None:
        _prophet_model = get_latest_model("prophet_forecasting_model")
    return _prophet_model

from backend.api.schemas import ProphetForecastResponse, ProphetDataPoint
import mlflow
from mlflow.tracking import MlflowClient

@router.get("/prophet", response_model=ProphetForecastResponse)
@track_inference_time("prophet_forecast")
def get_prophet_forecast():
    """Get revenue forecast for the next 30 days using Prophet."""
    model = get_prophet_model()
    
    query = "SELECT ds, y FROM features_forecasting ORDER BY ds DESC LIMIT 30"
    df = execute_query(query)
    if df is None or len(df) == 0:
        return ProphetForecastResponse(forecast=[], metrics={})
        
    df = df.sort_values('ds').reset_index(drop=True)
    last_ds = pd.to_datetime(df['ds'].iloc[-1])
    last_y = float(df['y'].iloc[-1])
    
    future_dates = [last_ds + timedelta(days=i) for i in range(1, 31)]
    
    if model is None:
        # Fallback simulation with confidence bounds if MLflow model artifact is absent
        forecasts = []
        for i, future_date in enumerate(future_dates, start=1):
            yhat = last_y * (1.0 + (i * 0.002))
            forecasts.append(ProphetDataPoint(
                ds=future_date.strftime('%Y-%m-%d'),
                yhat=yhat,
                yhat_lower=yhat * 0.92,
                yhat_upper=yhat * 1.08,
                trend=yhat
            ))
        return ProphetForecastResponse(forecast=forecasts, metrics={"rmse": 0.0, "mape": 0.0})
        
    future_df = pd.DataFrame({'ds': future_dates})
    forecast_df = model.predict(future_df)
    
    forecasts = []
    for _, row in forecast_df.iterrows():
        forecasts.append(ProphetDataPoint(
            ds=row['ds'].strftime('%Y-%m-%d'),
            yhat=float(row['yhat']),
            yhat_lower=float(row['yhat_lower']),
            yhat_upper=float(row['yhat_upper']),
            trend=float(row['trend'])
        ))
        
    # Get metrics from MLflow run
    metrics = {}
    try:
        client = MlflowClient()
        experiment = client.get_experiment_by_name("BI_Platform_Models")
        if experiment:
            runs = client.search_runs(
                experiment_ids=[experiment.experiment_id],
                filter_string="tags.mlflow.runName = 'revenue_forecasting_prophet'",
                order_by=["start_time DESC"],
                max_results=1
            )
            if runs and runs[0].data.metrics:
                metrics = runs[0].data.metrics
    except Exception as e:
        print(f"Error fetching Prophet metrics: {e}")
        
    return ProphetForecastResponse(
        forecast=forecasts,
        metrics=metrics
    )

_tft_model = None

def get_tft_model():
    global _tft_model
    if _tft_model is None:
        _tft_model = get_latest_model("tft_forecasting_model")
    return _tft_model

from backend.api.schemas import TFTForecastResponse, TFTDataPoint

@router.get("/tft", response_model=TFTForecastResponse)
@track_inference_time("tft_forecast")
def get_tft_forecast():
    """Get revenue forecast for the next 30 days using Temporal Fusion Transformer."""
    model = get_tft_model()
    
    # Query all historical data for the TFT encoder
    query = "SELECT * FROM features_forecasting ORDER BY ds"
    df = execute_query(query)
    
    if df is None or len(df) == 0:
        return TFTForecastResponse(forecast=[], metrics={})
        
    df = df.dropna().reset_index(drop=True)
    df['ds'] = pd.to_datetime(df['ds'])
    
    last_ds = df['ds'].iloc[-1]
    last_y = float(df['y'].iloc[-1])
    future_dates = [last_ds + timedelta(days=i) for i in range(1, 31)]
    
    if model is None:
        # Cold start simulation with quantiles (P10, P50, P90)
        forecasts = []
        for i, future_date in enumerate(future_dates, start=1):
            yhat = last_y * (1.0 + (i * 0.002))
            forecasts.append(TFTDataPoint(
                ds=future_date.strftime('%Y-%m-%d'),
                yhat=yhat,
                yhat_lower=yhat * 0.90,
                yhat_upper=yhat * 1.10
            ))
        return TFTForecastResponse(forecast=forecasts, metrics={"rmse": 0.0, "mape": 0.0})
    df['time_idx'] = np.arange(len(df))
    df['group'] = 'revenue'
    df['day_of_week'] = df['day_of_week'].astype(str)
    df['month'] = df['month'].astype(str)
    
    # We need to construct the decoder input
    # Get last known state
    last_ds = df['ds'].iloc[-1]
    last_time_idx = df['time_idx'].iloc[-1]
    
    # Create 30 days of future predictions data structure
    future_dates = [last_ds + timedelta(days=i) for i in range(1, 31)]
    future_time_idx = [last_time_idx + i for i in range(1, 31)]
    
    future_df = pd.DataFrame({
        'ds': future_dates,
        'time_idx': future_time_idx,
        'group': 'revenue',
        'y': 0.0, # dummy
        'lag_1': 0.0,
        'lag_7': 0.0,
        'lag_30': 0.0,
        'day_of_week': [str(d.dayofweek) for d in future_dates],
        'month': [str(d.month) for d in future_dates]
    })
    
    # TFT predict requires combining history and future
    combined_df = pd.concat([df, future_df], ignore_index=True)
    
    # Try prediction using pytorch_forecasting predict
    try:
        import torch
        predictions = model.predict(combined_df, mode="quantiles")
        # predictions are shape [1, 30, 7] for quantiles 
        # (typically [0.02, 0.1, 0.25, 0.5, 0.75, 0.9, 0.98])
        preds_tensor = predictions[0]
        
        forecasts = []
        for i, row in future_df.iterrows():
            quantiles = preds_tensor[i].numpy()
            yhat = float(quantiles[3]) # Median / 50%
            yhat_lower = float(quantiles[1]) # 10%
            yhat_upper = float(quantiles[5]) # 90%
            
            forecasts.append(TFTDataPoint(
                ds=row['ds'].strftime('%Y-%m-%d'),
                yhat=yhat,
                yhat_lower=yhat_lower,
                yhat_upper=yhat_upper
            ))
            
        metrics = {}
        client = MlflowClient()
        experiment = client.get_experiment_by_name("BI_Platform_Models")
        if experiment:
            runs = client.search_runs(
                experiment_ids=[experiment.experiment_id],
                filter_string="tags.mlflow.runName = 'revenue_forecasting_tft'",
                order_by=["start_time DESC"],
                max_results=1
            )
            if runs:
                metrics = runs[0].data.metrics
                
        return TFTForecastResponse(forecast=forecasts, metrics=metrics)
    except Exception as e:
        print(f"Error during TFT prediction: {e}")
        return TFTForecastResponse(forecast=[], metrics={})

from backend.api.schemas import CustomerGrowthForecastResponse, CustomerGrowthDataPoint

@router.get("/customer-growth", response_model=CustomerGrowthForecastResponse)
def get_customer_growth_forecast():
    """Get customer growth forecast (New, Returning, MAU, Growth Rate) for the next 30 days using XGBoost and Prophet."""
    
    # 1. Load models
    xgb_models = {
        'new_customers': get_latest_model("customer_growth_new_xgb"),
        'returning_customers': get_latest_model("customer_growth_returning_xgb"),
        'mau': get_latest_model("customer_growth_mau_xgb"),
        'growth_rate': get_latest_model("customer_growth_rate_xgb")
    }
    prophet_models = {
        'new_customers': get_latest_model("customer_growth_new_prophet"),
        'returning_customers': get_latest_model("customer_growth_returning_prophet"),
        'mau': get_latest_model("customer_growth_mau_prophet"),
        'growth_rate': get_latest_model("customer_growth_rate_prophet")
    }
    
    query = "SELECT * FROM features_customer_metrics_daily ORDER BY ds DESC LIMIT 30"
    df = execute_query(query)
    
    today = pd.Timestamp.now()
    if df is None or len(df) == 0:
        # Cold start fallback generator for customer growth
        xgb_fallback = []
        prophet_fallback = []
        for i in range(1, 31):
            future_ds = (today + timedelta(days=i)).strftime('%Y-%m-%d')
            xgb_fallback.append(CustomerGrowthDataPoint(
                ds=future_ds, new_customers=120.0 + i, returning_customers=450.0 + (i*2), mau=5200.0 + (i*10), growth_rate=5.2
            ))
            prophet_fallback.append(CustomerGrowthDataPoint(
                ds=future_ds, new_customers=115.0 + i, returning_customers=445.0 + (i*2), mau=5180.0 + (i*10), growth_rate=5.0
            ))
        metrics_fallback = {
            'xgboost': {'new': 12.4, 'returning': 18.2, 'mau': 150.5},
            'prophet': {'new': 14.1, 'returning': 21.0, 'mau': 165.2}
        }
        return CustomerGrowthForecastResponse(xgboost=xgb_fallback, prophet=prophet_fallback, metrics=metrics_fallback)
        
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.sort_values('ds').reset_index(drop=True)
    
    last_ds = df['ds'].iloc[-1]
    
    xgb_forecasts = []
    prophet_forecasts = []
    
    # Generate 30 days future dataframe for prophet
    future_dates = [last_ds + timedelta(days=i) for i in range(1, 31)]
    future_df = pd.DataFrame({'ds': future_dates})
    
    prophet_preds = {}
    for metric, model in prophet_models.items():
        if model is not None:
            pred_df = model.predict(future_df)
            prophet_preds[metric] = pred_df['yhat'].values
        else:
            prophet_preds[metric] = np.zeros(30)
            
    # XGBoost requires iterative autoregressive prediction
    # Get last known lags
    current_state = {
        'lag_1_new': df['new_customers'].iloc[-1],
        'lag_7_new': df['new_customers'].iloc[-7] if len(df) >= 7 else 0,
        'lag_1_returning': df['returning_customers'].iloc[-1],
        'lag_7_returning': df['returning_customers'].iloc[-7] if len(df) >= 7 else 0,
        'lag_1_dau': df['dau'].iloc[-1]
    }
    
    # Simple history buffer for lag_7
    history_new = df['new_customers'].tail(7).tolist()
    history_returning = df['returning_customers'].tail(7).tolist()
    
    xgb_preds = {'new_customers': [], 'returning_customers': [], 'mau': [], 'growth_rate': []}
    
    for i in range(30):
        current_date = future_dates[i]
        day_of_week = current_date.dayofweek
        
        # Predict New
        if xgb_models['new_customers']:
            x_new = pd.DataFrame({
                'lag_1_new': [current_state['lag_1_new']],
                'lag_7_new': [current_state['lag_7_new']],
                'day_of_week': [day_of_week]
            })
            pred_new = float(xgb_models['new_customers'].predict(x_new)[0])
        else:
            pred_new = 0.0
            
        # Predict Returning
        if xgb_models['returning_customers']:
            x_ret = pd.DataFrame({
                'lag_1_returning': [current_state['lag_1_returning']],
                'lag_7_returning': [current_state['lag_7_returning']],
                'day_of_week': [day_of_week]
            })
            pred_ret = float(xgb_models['returning_customers'].predict(x_ret)[0])
        else:
            pred_ret = 0.0
            
        # Predict MAU
        if xgb_models['mau']:
            x_mau = pd.DataFrame({
                'lag_1_dau': [current_state['lag_1_dau']],
                'day_of_week': [day_of_week]
            })
            pred_mau = float(xgb_models['mau'].predict(x_mau)[0])
        else:
            pred_mau = 0.0
            
        # Predict Growth Rate
        if xgb_models['growth_rate']:
            x_gr = pd.DataFrame({
                'lag_1_new': [current_state['lag_1_new']],
                'lag_1_returning': [current_state['lag_1_returning']],
                'day_of_week': [day_of_week]
            })
            pred_gr = float(xgb_models['growth_rate'].predict(x_gr)[0])
        else:
            pred_gr = 0.0
            
        xgb_preds['new_customers'].append(pred_new)
        xgb_preds['returning_customers'].append(pred_ret)
        xgb_preds['mau'].append(pred_mau)
        xgb_preds['growth_rate'].append(pred_gr)
        
        # Update state for next iteration
        current_state['lag_1_new'] = pred_new
        current_state['lag_1_returning'] = pred_ret
        # Approximate DAU with (new + returning)
        current_state['lag_1_dau'] = pred_new + pred_ret
        
        history_new.append(pred_new)
        history_returning.append(pred_ret)
        current_state['lag_7_new'] = history_new[-7]
        current_state['lag_7_returning'] = history_returning[-7]
        
    for i in range(30):
        prophet_forecasts.append(CustomerGrowthDataPoint(
            ds=future_dates[i].strftime('%Y-%m-%d'),
            new_customers=prophet_preds['new_customers'][i],
            returning_customers=prophet_preds['returning_customers'][i],
            mau=prophet_preds['mau'][i],
            growth_rate=prophet_preds['growth_rate'][i]
        ))
        
        xgb_forecasts.append(CustomerGrowthDataPoint(
            ds=future_dates[i].strftime('%Y-%m-%d'),
            new_customers=xgb_preds['new_customers'][i],
            returning_customers=xgb_preds['returning_customers'][i],
            mau=xgb_preds['mau'][i],
            growth_rate=xgb_preds['growth_rate'][i]
        ))
        
    metrics = {
        'xgboost': {},
        'prophet': {}
    }
    
    # Retrieve metrics for a comprehensive view
    client = MlflowClient()
    experiment = client.get_experiment_by_name("BI_Platform_Models")
    if experiment:
        for metric, run_name in [('new', 'customer_growth_new_xgb'), ('returning', 'customer_growth_returning_xgb'), ('mau', 'customer_growth_mau_xgb')]:
            runs = client.search_runs(experiment_ids=[experiment.experiment_id], filter_string=f"tags.mlflow.runName = '{run_name}'", order_by=["start_time DESC"], max_results=1)
            if runs and runs[0].data.metrics:
                metrics['xgboost'][metric] = runs[0].data.metrics.get('rmse', 0)
                
        for metric, run_name in [('new', 'customer_growth_new_prophet'), ('returning', 'customer_growth_returning_prophet'), ('mau', 'customer_growth_mau_prophet')]:
            runs = client.search_runs(experiment_ids=[experiment.experiment_id], filter_string=f"tags.mlflow.runName = '{run_name}'", order_by=["start_time DESC"], max_results=1)
            if runs and runs[0].data.metrics:
                metrics['prophet'][metric] = runs[0].data.metrics.get('rmse', 0)
                
    return CustomerGrowthForecastResponse(
        xgboost=xgb_forecasts,
        prophet=prophet_forecasts,
        metrics=metrics
    )

from backend.api.schemas import InventoryForecastResponse, InventoryItemForecast

@router.get("/inventory", response_model=InventoryForecastResponse)
def get_inventory_forecast():
    """Get inventory demand forecast, safety stock, reorder quantity, and expected stock-out date."""
    query = """
        SELECT 
            p.product_id,
            COALESCE(c.product_category_name_english, p.product_category_name, 'general') as category,
            COUNT(i.order_id) as total_units_sold,
            STDDEV_SAMP(i.price) as price_variance
        FROM dim_products p
        LEFT JOIN product_category_name_translation c ON p.product_category_name = c.product_category_name
        LEFT JOIN olist_order_items i ON p.product_id = i.product_id
        GROUP BY 1, 2
        LIMIT 10
    """
    df = execute_query(query)
    items = []
    
    if df is not None and not df.empty:
        today = pd.Timestamp.now()
        for _, row in df.iterrows():
            units_sold = float(row['total_units_sold'] or 10)
            daily_demand = max(1.0, units_sold / 30.0)
            inventory_demand = round(daily_demand * 30.0, 2) # 30 day projected demand
            safety_stock = round(1.65 * np.sqrt(7) * (daily_demand * 0.2), 2) # Z=1.65 (95% service level), L=7 days lead time
            reorder_quantity = round(inventory_demand + safety_stock, 2)
            
            # Simulated stock level
            current_stock = float(np.random.randint(15, 60))
            days_until_stockout = max(1, int(current_stock / daily_demand)) if daily_demand > 0 else 30
            stockout_date = (today + timedelta(days=days_until_stockout)).strftime('%Y-%m-%d')
            
            items.append(InventoryItemForecast(
                product_id=str(row['product_id'])[:8],
                product_category=str(row['category']).replace('_', ' ').title(),
                inventory_demand=inventory_demand,
                safety_stock=safety_stock,
                reorder_quantity=reorder_quantity,
                expected_stockout_date=stockout_date,
                current_stock=current_stock
            ))
            
    summary = {
        "total_items_analyzed": len(items),
        "high_risk_items": len([i for i in items if i.current_stock < i.safety_stock]),
        "recommended_reorder_units": sum(i.reorder_quantity for i in items)
    }
    
    return InventoryForecastResponse(items=items, summary=summary)
