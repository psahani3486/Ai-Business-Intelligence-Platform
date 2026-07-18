"use client";

import { useEffect, useState } from 'react';
import KPICard from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/charts/Charts';
import { PageHeader } from '@/components/ui/PageHeader';
import { DollarSign, ShoppingCart, Users, Activity } from 'lucide-react';
import api from '@/lib/api';

export default function Dashboard() {
  const [kpis, setKpis] = useState({ total_revenue: 0, total_orders: 0, total_customers: 0, avg_order_value: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch from API:
    // api.get('/dashboard/kpis').then(res => setKpis(res.data));
    // api.get('/dashboard/revenue-trend').then(res => setRevenueData(res.data));
    
    // Simulating API call for demo to show immediate UI
    setTimeout(() => {
      setKpis({
        total_revenue: 15420300,
        total_orders: 98450,
        total_customers: 84320,
        avg_order_value: 156.63
      });
      
      setRevenueData([
        { name: 'Jan', value: 400000 },
        { name: 'Feb', value: 300000 },
        { name: 'Mar', value: 550000 },
        { name: 'Apr', value: 450000 },
        { name: 'May', value: 700000 },
        { name: 'Jun', value: 850000 },
        { name: 'Jul', value: 950000 },
      ] as any);
      
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

  if (loading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-blue)' }}>Loading Analytics...</div>
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
        <div className="col-span-3">
          <KPICard 
            title="Total Revenue" 
            value={formatCurrency(kpis.total_revenue)} 
            trend="12.5%" 
            isPositive={true} 
            icon={<DollarSign />} 
            delay={0.1} 
          />
        </div>
        <div className="col-span-3">
          <KPICard 
            title="Total Orders" 
            value={formatNumber(kpis.total_orders)} 
            trend="8.2%" 
            isPositive={true} 
            icon={<ShoppingCart />} 
            delay={0.2} 
          />
        </div>
        <div className="col-span-3">
          <KPICard 
            title="Active Customers" 
            value={formatNumber(kpis.total_customers)} 
            trend="5.4%" 
            isPositive={true} 
            icon={<Users />} 
            delay={0.3} 
          />
        </div>
        <div className="col-span-3">
          <KPICard 
            title="Avg Order Value" 
            value={formatCurrency(kpis.avg_order_value)} 
            trend="2.1%" 
            isPositive={false} 
            icon={<Activity />} 
            delay={0.4} 
          />
        </div>
        
        <RevenueChart title="Revenue Trend (YTD)" data={revenueData} delay={0.5} />
        
        <div className="card col-span-4" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>AI Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
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
