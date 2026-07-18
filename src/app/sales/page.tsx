"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { RevenueChart } from '@/components/charts/Charts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function SalesPage() {
  const { data: forecastData, isLoading, isError } = useQuery({
    queryKey: ['sales_forecast'],
    queryFn: async () => {
      const res = await api.get('/forecasts/revenue');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-blue)' }}>Loading Forecast...</div>
    </div>;
  }

  if (isError || !forecastData) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-rose)' }}>Failed to load sales forecast</div>
    </div>;
  }

  return (
    <main className="page-container">
      <PageHeader 
        title="Sales Analytics & Forecasting" 
        subtitle="Predictive insights driven by XGBoost" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-12">
          <RevenueChart title="30-Day Revenue Forecast" data={forecastData} />
        </div>
      </div>
    </main>
  );
}
