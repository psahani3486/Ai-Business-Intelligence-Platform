# Enterprise AI Business Intelligence Platform

![Build Status](https://img.shields.io/github/actions/workflow/status/quantumbi/bi-platform/main.yml?branch=main)
![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Docker Build](https://img.shields.io/badge/docker-passing-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A production-grade, full-stack AI Business Intelligence Platform that combines data engineering, machine learning, LLM-powered natural language analytics, and a premium Next.js dashboard.

##  Features

- **Data Engineering**: Automated ETL pipeline using DuckDB for high-performance analytical queries.
- **Machine Learning**: 
  - Sales Forecasting (XGBoost)
  - Customer Churn Prediction with SHAP explainability
  - Customer Lifetime Value (CLV) prediction
  - Anomaly Detection (Isolation Forest)
  - Product Recommendations (Collaborative Filtering)
- **MLOps**: MLflow integration for tracking experiments, metrics, and models.
- **AI Agent**: Groq-powered natural language to SQL engine. Ask questions in plain English, get executed SQL, data, and executive summaries.
- **Backend API**: FastAPI with 15+ REST endpoints.
- **Frontend Dashboard**: Next.js with a premium dark theme, glassmorphism UI, Framer Motion animations, and Recharts.
- **DevOps**: Docker and Docker Compose ready.

## 📁 Project Structure

- `backend/`: FastAPI application, DuckDB database manager, ML models, and ETL pipeline.
- `frontend/`: Next.js React application with premium styling.
- `data/`: Raw datasets (Olist E-commerce and Telco Churn).
- `mlruns/`: MLflow tracking data.

## 🛠️ Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Run Data Pipeline & Train Models

```bash
# Install backend requirements
pip install -r backend/requirements.txt

# Run the ETL pipeline to ingest data into DuckDB and create features
python backend/etl/pipeline.py

# Train all ML models
python backend/ml/train_all.py
```

### 3. Start the Application using Docker

```bash
docker-compose up --build
```

- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000/docs` (Swagger UI)
- **MLflow Tracking**: `http://localhost:5000`

## 📊 Datasets Used
- **Brazilian E-Commerce Public Dataset by Olist**: Orders, items, customers, and products.
- **Telco Customer Churn Dataset**: Demographics and services for churn prediction.
