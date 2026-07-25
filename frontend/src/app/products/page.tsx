"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { Package, TrendingUp, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProductsPage() {
  const { data: recommendations, isLoading: loadingRecs } = useQuery({
    queryKey: ['product_recommendations'],
    queryFn: async () => {
      const res = await api.get('/recommendations/products');
      return res.data;
    }
  });

  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory_forecast'],
    queryFn: async () => {
      const res = await api.get('/forecasts/inventory');
      return res.data;
    }
  });

  const loading = loadingRecs || loadingInventory;

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Loading Inventory & Product Intelligence...</div>
      </div>
    );
  }

  const items = inventoryData?.items || [];
  const highRiskCount = inventoryData?.summary?.high_risk_items || 0;
  const totalReorderUnits = inventoryData?.summary?.recommended_reorder_units || 0;

  return (
    <main className="page-container">
      <PageHeader 
        title="Product & Inventory Intelligence" 
        subtitle="30-Day Demand Forecasting, Safety Stock Rules, and Cross-Sell Recommendations" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-3">
          <KPICard title="Catalog Items" value="32,951" trend="Active SKUs" isPositive={true} icon={<Package />} delay={0.1} />
        </div>
        <div className="col-span-3">
          <KPICard title="Stockout Risk Alerts" value={highRiskCount.toString()} trend="Action Required" isPositive={highRiskCount === 0} icon={<AlertTriangle />} delay={0.2} />
        </div>
        <div className="col-span-3">
          <KPICard title="Reorder Quantity" value={totalReorderUnits.toLocaleString()} trend="30-Day Buffer" isPositive={true} icon={<ShieldCheck />} delay={0.3} />
        </div>
        <div className="col-span-3">
          <KPICard title="Top Category" value="Electronics" trend="18.4% Revenue Share" isPositive={true} icon={<TrendingUp />} delay={0.4} />
        </div>

        {/* Inventory Demand Forecasting Table */}
        <div className="card col-span-12" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Inventory Demand & Safety Stock Forecast</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Calculated using 95% Service Level (Z=1.65) and 7-day Lead Time Buffer</p>
            </div>
            <span className="badge badge-blue">Real-Time Forecast</span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '850px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px' }}>Product ID</th>
                  <th style={{ padding: '14px' }}>Category</th>
                  <th style={{ padding: '14px' }}>Current Stock</th>
                  <th style={{ padding: '14px' }}>30-Day Demand</th>
                  <th style={{ padding: '14px' }}>Safety Stock Buffer</th>
                  <th style={{ padding: '14px' }}>Recommended Reorder</th>
                  <th style={{ padding: '14px' }}>Stockout Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const isRisk = item.current_stock < item.safety_stock;
                  return (
                    <tr key={item.product_id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product_id}</td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{item.product_category}</td>
                      <td style={{ padding: '14px', fontWeight: 600, color: isRisk ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                        {item.current_stock} units
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>{item.inventory_demand} units</td>
                      <td style={{ padding: '14px', color: 'var(--accent-amber)' }}>{item.safety_stock} units</td>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--accent-blue)' }}>{item.reorder_quantity} units</td>
                      <td style={{ padding: '14px' }}>
                        <span className={isRisk ? "badge badge-rose" : "badge badge-emerald"}>
                          {item.expected_stockout_date}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cross-Sell Recommendations */}
        <div className="card col-span-12">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>Collaborative Filtering Cross-Sell Recommendations</h3>
          <div className="dashboard-grid">
            {(recommendations || []).map((rec: any, idx: number) => (
              <div key={idx} className="col-span-4" style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-blue">{rec.category}</span>
                    <span className="badge badge-emerald">Match {rec.score}</span>
                  </div>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>{rec.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    High co-purchase frequency based on customer order history.
                  </p>
                </div>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Target Campaign <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
