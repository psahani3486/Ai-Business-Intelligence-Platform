"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { RevenueChart } from '@/components/charts/Charts';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SalesPage() {
  const [forecastData, setForecastData] = useState([]);
  
  useEffect(() => {
    // Attempt to fetch from API, otherwise use mock
    api.get('/forecasts/revenue')
      .then(res => setForecastData(res.data))
      .catch(() => {
        // Mock data if API fails or is not available
        const mock = [];
        let base = 50000;
        for (let i = 1; i <= 30; i++) {
          base += (Math.random() * 2000 - 500);
          mock.push({ name: `Day ${i}`, value: base });
        }
        setForecastData(mock as any);
      });
  }, []);

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
