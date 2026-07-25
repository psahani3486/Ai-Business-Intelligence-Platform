import logging
from fastapi import APIRouter
from backend.api.schemas import KPIData, ChartDataPoint
from backend.database import execute_query
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/kpis", response_model=KPIData)
def get_kpis():
    """Get high-level KPIs for the executive dashboard."""
    logger.info("Fetching executive dashboard KPIs")
    query = """
        SELECT 
            SUM(total_revenue) as revenue,
            SUM(total_profit) as profit,
            SUM(total_orders) as orders,
            SUM(total_customers) as customers,
            SUM(total_revenue) / NULLIF(SUM(total_orders), 0) as aov
        FROM agg_monthly_revenue
    """
    df = execute_query(query)
    
    if df is None or len(df) == 0:
        logger.warning("No revenue aggregation data found for KPIs")
        return KPIData(total_revenue=0, total_orders=0, total_customers=0, avg_order_value=0, revenue_growth_pct=0, total_profit=0, margin_pct=0)
        
    row = df.iloc[0]
    revenue = float(row['revenue'] or 0)
    profit = float(row['profit'] or 0)
    margin = (profit / revenue * 100) if revenue > 0 else 0.0

    # Calculate dynamic MoM revenue growth
    growth_query = "SELECT total_revenue FROM agg_monthly_revenue ORDER BY revenue_month DESC LIMIT 2"
    growth_df = execute_query(growth_query)
    revenue_growth_pct = 0.0
    if growth_df is not None and len(growth_df) >= 2:
        curr_rev = float(growth_df.iloc[0]['total_revenue'] or 0)
        prev_rev = float(growth_df.iloc[1]['total_revenue'] or 0)
        if prev_rev > 0:
            revenue_growth_pct = round(((curr_rev - prev_rev) / prev_rev) * 100, 2)

    return KPIData(
        total_revenue=revenue,
        total_orders=int(row['orders'] or 0),
        total_customers=int(row['customers'] or 0),
        avg_order_value=float(row['aov'] or 0),
        revenue_growth_pct=revenue_growth_pct,
        total_profit=profit,
        margin_pct=margin
    )

@router.get("/revenue-trend", response_model=List[ChartDataPoint])
def get_revenue_trend():
    """Get monthly revenue trend for line chart."""
    query = "SELECT revenue_month, total_revenue FROM agg_monthly_revenue ORDER BY revenue_month"
    df = execute_query(query)
    
    if df is None:
        return []
        
    result = []
    for _, row in df.iterrows():
        # Format date to YYYY-MM
        month_str = str(row['revenue_month'])[:7]
        result.append(ChartDataPoint(name=month_str, value=float(row['total_revenue'])))
        
    return result

@router.get("/category-breakdown", response_model=List[ChartDataPoint])
def get_category_breakdown():
    """Get revenue by product category for donut chart."""
    query = "SELECT category_name, total_revenue FROM agg_category_performance ORDER BY total_revenue DESC LIMIT 10"
    df = execute_query(query)
    
    if df is None:
        return []
        
    result = []
    for _, row in df.iterrows():
        result.append(ChartDataPoint(name=str(row['category_name']), value=float(row['total_revenue'])))
        
    return result
