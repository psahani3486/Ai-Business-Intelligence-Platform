"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProductsPage() {
  const { data: recommendations, isLoading: loading, isError } = useQuery({
    queryKey: ['product_recommendations'],
    queryFn: async () => {
      const res = await api.get('/recommendations/products');
      return res.data;
    }
  });

  if (loading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-blue)' }}>Loading Recommendations...</div>
    </div>;
  }

  if (isError || !recommendations) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-rose)' }}>Failed to load recommendations</div>
    </div>;
  }

  return (
    <main className="page-container">
      <PageHeader 
        title="Product Analytics" 
        subtitle="AI-driven product recommendations and inventory insights" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-4">
          <KPICard title="Total Products" value="32,951" trend="Active Catalog" isPositive={true} icon={<Package />} delay={0.1} />
        </div>
        <div className="col-span-4">
          <KPICard title="Top Category" value="Bed Bath Table" trend="12% of Revenue" isPositive={true} icon={<TrendingUp />} delay={0.2} />
        </div>
        <div className="col-span-4">
          <KPICard title="Low Stock Alerts" value="142" trend="Requires Action" isPositive={false} icon={<AlertTriangle />} delay={0.3} />
        </div>

        <div className="card col-span-12" style={{ marginTop: '24px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Top AI Cross-Sell Recommendations</h3>
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {recommendations.map((rec: any, idx: number) => (
              <div key={idx} style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: '20px',
                animation: `fadeInUp 0.5s ease-out ${(idx + 3) * 0.1}s backwards`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {rec.category}
                  </span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Match: {rec.score}
                  </span>
                </div>
                <h4 style={{ fontWeight: 500, marginBottom: '8px' }}>{rec.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Collaborative filtering item-similarity match.
                </p>
              </div>
            ))}
            {!loading && recommendations.length === 0 && (
              <div style={{ padding: '20px', color: 'var(--text-muted)' }}>No recommendations found.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
