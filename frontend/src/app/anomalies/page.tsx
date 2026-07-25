"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { AlertOctagon, TrendingDown, Eye, CheckCircle } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';

const fallbackAnomalyTimeline = [
  { name: 'Aug 18', value: 142000, isAnomaly: false },
  { name: 'Aug 19', value: 138000, isAnomaly: false },
  { name: 'Aug 20', value: 155000, isAnomaly: false },
  { name: 'Aug 21', value: 149000, isAnomaly: false },
  { name: 'Aug 22', value: 32450, isAnomaly: true },
  { name: 'Aug 23', value: 161000, isAnomaly: false },
  { name: 'Aug 24', value: 158000, isAnomaly: false }
];

export default function AnomaliesPage() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'Revenue' | 'Inventory' | 'Traffic' | 'Fraud'>('ALL');
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const { data: anomalyTimelineData } = useQuery({
    queryKey: ['anomalies_detect'],
    queryFn: async () => {
      try {
        const res = await api.get('/anomalies/detect');
        return res.data && res.data.length > 0 ? res.data : fallbackAnomalyTimeline;
      } catch {
        return fallbackAnomalyTimeline;
      }
    }
  });

  const anomalyData = anomalyTimelineData || fallbackAnomalyTimeline;

  const allAnomalies = (anomalyData || []).filter((d: any) => d.isAnomaly || d.severity === 'High');
  const activeAnomalies = allAnomalies.filter((_: any, idx: number) => !resolvedIds.includes(`anomaly-${idx}`));

  return (
    <main className="page-container">
      <PageHeader 
        title="Anomaly & Fraud Center" 
        subtitle="Isolation Forest Multi-Feature Outlier Detection (Revenue, Inventory, Traffic, Fraud)" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-4">
          <KPICard title="Active Anomalies" value={activeAnomalies.length.toString()} trend="Past 7 days" isPositive={activeAnomalies.length === 0} icon={<AlertOctagon />} delay={0.1} />
        </div>
        <div className="col-span-4">
          <KPICard title="Revenue at Risk" value="$24.5k" trend="Estimated Exposure" isPositive={false} icon={<TrendingDown />} delay={0.2} />
        </div>
        <div className="col-span-4">
          <KPICard title="Active Detectors" value="Isolation Forest" trend="Real-Time Automated" isPositive={true} icon={<Eye />} delay={0.3} />
        </div>

        <div className="card col-span-12" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Revenue & Order Anomaly Timeline</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Outlier points flagged when statistical score exceeds contamination threshold</p>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {(['ALL', 'Revenue', 'Inventory', 'Traffic', 'Fraud'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: selectedCategory === cat ? 'var(--accent-blue)' : 'transparent',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={anomalyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-card)' }} />
                
                {anomalyData.map((entry: any, index: number) => {
                  if (entry.isAnomaly) {
                    return (
                      <ReferenceDot 
                        key={`anomaly-${index}`}
                        x={entry.name || entry.date} 
                        y={entry.value} 
                        r={8} 
                        fill="var(--accent-rose)" 
                        stroke="rgba(251, 113, 133, 0.4)" 
                        strokeWidth={6}
                      />
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>Detected Anomaly Log & Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allAnomalies.map((anomaly: any, idx: number) => {
                const isResolved = resolvedIds.includes(`anomaly-${idx}`);
                return (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 20px', 
                    background: isResolved ? 'rgba(52, 211, 153, 0.05)' : 'rgba(251, 113, 133, 0.05)', 
                    border: isResolved ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(251, 113, 133, 0.2)',
                    borderRadius: '12px',
                    opacity: isResolved ? 0.6 : 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: isResolved ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 113, 133, 0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {isResolved ? <CheckCircle size={20} color="var(--accent-emerald)" /> : <AlertOctagon size={20} color="var(--accent-rose)" />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{anomaly.metric_type || "Revenue"} Outlier Detected</span>
                          <span className={isResolved ? "badge badge-emerald" : "badge badge-rose"}>
                            {isResolved ? "RESOLVED" : "HIGH SEVERITY"}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {anomaly.date || anomaly.name}: Recorded ${(anomaly.value || 32450).toFixed(2)}. Significant divergence from lag features and historical run-rate.
                        </div>
                      </div>
                    </div>

                    {!isResolved && (
                      <button 
                        className="btn-secondary"
                        onClick={() => setResolvedIds(prev => [...prev, `anomaly-${idx}`])}
                        style={{ padding: '8px 14px', fontSize: '0.75rem' }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
