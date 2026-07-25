import logging
import os
import pandas as pd
import numpy as np
import mlflow
import torch
import lightning.pytorch as pl
from pytorch_forecasting import TimeSeriesDataSet, TemporalFusionTransformer
from pytorch_forecasting.data import GroupNormalizer
from pytorch_forecasting.metrics import QuantileLoss
from sklearn.metrics import mean_squared_error, mean_absolute_percentage_error
from backend.database import execute_query

logger = logging.getLogger(__name__)

def train_tft_model():
    logger.info("Training Temporal Fusion Transformer (TFT) Forecasting Model...")
    
    # 1. Load Data
    df = execute_query("SELECT * FROM features_forecasting ORDER BY ds")
    if df is None or len(df) == 0:
        logger.error("Error: No data found in features_forecasting")
        return None
        
    df = df.dropna().reset_index(drop=True)
    df['ds'] = pd.to_datetime(df['ds'])
    
    # TFT requires time_idx (int) and group_id (str)
    df['time_idx'] = np.arange(len(df))
    df['group'] = 'revenue'
    
    # Convert categoricals
    df['day_of_week'] = df['day_of_week'].astype(str)
    df['month'] = df['month'].astype(str)
    
    # 2. Define Dataset
    max_prediction_length = 30
    max_encoder_length = 60
    
    # Ensure we have enough data
    if len(df) <= max_prediction_length + max_encoder_length:
        print("Not enough data to train TFT.")
        return None
        
    training_cutoff = df["time_idx"].max() - max_prediction_length
    
    training_dataset = TimeSeriesDataSet(
        df[lambda x: x.time_idx <= training_cutoff],
        time_idx="time_idx",
        target="y",
        group_ids=["group"],
        min_encoder_length=max_encoder_length // 2,
        max_encoder_length=max_encoder_length,
        min_prediction_length=1,
        max_prediction_length=max_prediction_length,
        static_categoricals=["group"],
        time_varying_known_categoricals=["day_of_week", "month"],
        time_varying_known_reals=["time_idx"],
        time_varying_unknown_categoricals=[],
        time_varying_unknown_reals=["y", "lag_1", "lag_7", "lag_30"],
        target_normalizer=GroupNormalizer(
            groups=["group"], transformation="softplus"
        ),
        add_relative_time_idx=True,
        add_target_scales=True,
        add_encoder_length=True,
    )
    
    validation_dataset = TimeSeriesDataSet.from_dataset(
        training_dataset, df, predict=True, stop_randomization=True
    )
    
    batch_size = 32
    train_dataloader = training_dataset.to_dataloader(train=True, batch_size=batch_size, num_workers=0)
    val_dataloader = validation_dataset.to_dataloader(train=False, batch_size=batch_size, num_workers=0)
    
    # 3. Define and Train Model
    with mlflow.start_run(run_name="revenue_forecasting_tft"):
        pl.seed_everything(42)
        
        tft = TemporalFusionTransformer.from_dataset(
            training_dataset,
            learning_rate=0.03,
            hidden_size=16,
            attention_head_size=1,
            dropout=0.1,
            hidden_continuous_size=8,
            output_size=7,  # QuantileLoss has 7 quantiles by default
            loss=QuantileLoss(),
            log_interval=10,
            reduce_on_plateau_patience=4,
        )
        
        trainer = pl.Trainer(
            max_epochs=10,
            accelerator="cpu",
            gradient_clip_val=0.1,
            limit_train_batches=30,
            enable_model_summary=False,
            logger=False, # Disable lightning logger to avoid conflicts
            enable_checkpointing=False,
        )
        
        # Pytorch forecasting's TemporalFusionTransformer inherits from BaseModel which inherits from pl.LightningModule
        # Sometimes there's a type mismatch if multiple lightning packages are installed.
        trainer.fit(
            tft,
            train_dataloaders=train_dataloader,
            val_dataloaders=val_dataloader,
        )
        
        # 4. Evaluate
        actuals = torch.cat([y[0] for x, y in iter(val_dataloader)])
        predictions = tft.predict(val_dataloader)
        
        # predictions are shape [1, 30] for validation, actuals [1, 30]
        y_test = actuals.numpy().flatten()
        preds = predictions.numpy().flatten()
        
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        mape = mean_absolute_percentage_error(y_test, preds)
        
        mlflow.log_param("max_encoder_length", max_encoder_length)
        mlflow.log_metric("rmse", rmse)
        mlflow.log_metric("mape", mape)
        
        print(f"TFT Model Trained. RMSE: {rmse:.2f}, MAPE: {mape:.2f}")
        
        # Log model
        mlflow.pytorch.log_model(tft, "tft_forecasting_model")
        
    return tft

if __name__ == "__main__":
    import os
    tracking_uri = os.environ.get("MLFLOW_TRACKING_URI", "./mlruns")
    mlflow.set_tracking_uri(tracking_uri)
    mlflow.set_experiment("BI_Platform_Models")
    train_tft_model()
