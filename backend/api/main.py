from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import dashboard, nlq, forecasts, churn
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title="Enterprise AI Business Intelligence Platform",
    description="API for Analytics, Machine Learning, and LLM-powered insights",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instrument FastAPI for Prometheus
Instrumentator().instrument(app).expose(app)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Enterprise AI BI Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(nlq.router, prefix="/api/nlq", tags=["Natural Language Query"])
app.include_router(forecasts.router, prefix="/api/forecasts", tags=["Forecasts"])
app.include_router(churn.router, prefix="/api/churn", tags=["Churn"])

from backend.api.routes import clv, anomalies, recommendations, reports, alerts, stream, mlops, dashboard_extra
app.include_router(clv.router, prefix="/api/clv", tags=["CLV"])
app.include_router(anomalies.router, prefix="/api/anomalies", tags=["Anomalies"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(stream.router, prefix="/api/stream", tags=["Streaming"])
app.include_router(mlops.router, prefix="/api/mlops", tags=["MLOps"])
app.include_router(dashboard_extra.router, prefix="/api/dashboard", tags=["Dashboard"])
