"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import KPICard from '@/components/dashboard/KPICard';
import { RevenueChart, CustomerGrowthChart } from '@/components/charts/Charts';
import { PageHeader } from '@/components/ui/PageHeader';
import { DollarSign, ShoppingCart, Users, Activity } from 'lucide-react';
import api from '@/lib/api';

export default function Dashboard() {
  const [activeModel, setActiveModel] = useState<'xgboost' | 'prophet'>('xgboost');
  
  // Fetch KPIs
  const { data: kpis, isLoading: kpisLoading, isError: kpisError } = useQuery({
    queryKey: ['dashboard_kpis'],
    queryFn: async () => {
      const res = await api.get('/dashboard/kpis');
      return res.data;
    }
  });

  // Fetch Revenue Trend
  const { data: revenueData, isLoading: revenueLoading, isError: revenueError } = useQuery({
    queryKey: ['dashboard_revenue_trend'],
    queryFn: async () => {
      const res = await api.get('/dashboard/revenue-trend');
      return res.data;
    }
  });

  // Fetch Customer Growth Forecast
  const { data: customerGrowth, isLoading: growthLoading, isError: growthError } = useQuery({
    queryKey: ['dashboard_customer_growth'],
    queryFn: async () => {
      const res = await api.get('/forecast/customer-growth');
      return res.data;
    }
  });

  const loading = kpisLoading || revenueLoading || growthLoading;
  const error = kpisError || revenueError || growthError ? "Failed to load dashboard data" : null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  if (loading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-blue)' }}>Loading Analytics...</div>
    </div>;
  }

  if (error || !kpis) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-rose)' }}>{error || "Unknown Error"}</div>
    </div>;
  }

  return (
    <main className="page-container">
      <PageHeader 
        title="Executive Overview" 
        subtitle="Real-time business performance metrics" 
        action={
          <button style={{ 
            background: 'var(--accent-blue)', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Download Report
          </button>
        }
      />
      
      <div className="dashboard-grid">
        <div className="col-span-4">
          <KPICard 
            title="Total Revenue" 
            value={formatCurrency(kpis.total_revenue)} 
            trend="12.5%" 
            isPositive={true} 
            icon={<DollarSign />} 
            delay={0.1} 
          />
        </div>
        <div className="col-span-4">
          <KPICard 
            title="Total Profit" 
            value={formatCurrency(kpis.total_profit)} 
            trend="8.1%" 
            isPositive={true} 
            icon={<DollarSign />} 
            delay={0.15} 
          />
        </div>
        <div className="col-span-4">
          <KPICard 
            title="Profit Margin" 
            value={`${kpis.margin_pct.toFixed(2)}%`} 
            trend="2.0%" 
            isPositive={true} 
            icon={<Activity />} 
            delay={0.2} 
          />
        </div>
        <div className="col-span-4">
          <KPICard 
            title="Total Orders" 
            value={formatNumber(kpis.total_orders)} 
            trend="8.2%" 
            isPositive={true} 
            icon={<ShoppingCart />} 
            delay={0.25} 
          />
        </div>
        <div className="col-span-4">
          <KPICard 
            title="Active Customers" 
            value={formatNumber(kpis.total_customers)} 
            trend="5.4%" 
            isPositive={true} 
            icon={<Users />} 
            delay={0.3} 
          />
        </div>
        <div className="col-span-4">
          <KPICard 
            title="Avg Order Value" 
            value={formatCurrency(kpis.avg_order_value)} 
            trend="2.1%" 
            isPositive={false} 
            icon={<Activity />} 
            delay={0.35} 
          />
        </div>
        
        <RevenueChart title="Revenue Trend (YTD)" data={revenueData} delay={0.5} />
        
        {customerGrowth && (
          <>
            <div className="card col-span-4" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Model Comparison (RMSE)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Metric</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>XGBoost</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Prophet</span>
                </div>
                {['new', 'returning', 'mau'].map((metric) => (
                  <div key={metric} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{metric}</span>
                    <span style={{ color: (customerGrowth.metrics?.xgboost?.[metric] || 0) < (customerGrowth.metrics?.prophet?.[metric] || 0) ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                      {(customerGrowth.metrics?.xgboost?.[metric] || 0).toFixed(2)}
                    </span>
                    <span style={{ color: (customerGrowth.metrics?.prophet?.[metric] || 0) < (customerGrowth.metrics?.xgboost?.[metric] || 0) ? 'var(--accent-emerald)' : 'var(--text-secondary)' }}>
                      {(customerGrowth.metrics?.prophet?.[metric] || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setActiveModel(activeModel === 'xgboost' ? 'prophet' : 'xgboost')}
                    style={{ 
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Switch to {activeModel === 'xgboost' ? 'Prophet' : 'XGBoost'} View
                  </button>
                </div>
              </div>
            </div>
            
            <CustomerGrowthChart 
              title="30-Day Customer Growth Forecast" 
              data={activeModel === 'xgboost' ? customerGrowth.xgboost : customerGrowth.prophet} 
              delay={0.6}
              modelType={activeModel}
            />
          </>
        )}
        
        <div className="card col-span-12" style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>AI Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid var(--accent-emerald)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Revenue Optimization</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Based on current trajectory, increasing marketing spend by 15% in Q3 could yield a 22% revenue lift.</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.1)', borderLeft: '4px solid var(--accent-rose)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Churn Risk Alert</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>124 high-value customers show signs of churn. Suggested action: Send targeted retention offers.</div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--accent-amber)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Inventory Warning</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Top selling item 'Premium Headphones' will stock out in 14 days based on current run rate.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
