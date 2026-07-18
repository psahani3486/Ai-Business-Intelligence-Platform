"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { AlertOctagon, TrendingDown, Eye } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot 
} from 'recharts';

export default function AnomaliesPage() {
  const { data: anomalyData, isLoading: loading, isError } = useQuery({
    queryKey: ['anomalies_detect'],
    queryFn: async () => {
      const res = await api.get('/anomalies/detect');
      return res.data.reverse();
    }
  });

  if (loading) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-blue)' }}>Detecting Anomalies...</div>
    </div>;
  }

  if (isError || !anomalyData) {
    return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ color: 'var(--accent-rose)' }}>Failed to load anomaly data</div>
    </div>;
  }

  const anomalyCount = anomalyData.filter((d: any) => d.isAnomaly).length;

  return (
    <main className="page-container">
      <PageHeader 
        title="Anomaly Center" 
        subtitle="Isolation Forest fraud and revenue anomaly detection" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-4">
          <KPICard title="Detected Anomalies" value={anomalyCount.toString()} trend="Past 7 days" isPositive={anomalyCount === 0} icon={<AlertOctagon />} delay={0.1} />
        </div>
        <div className="col-span-4">
          <KPICard title="Revenue at Risk" value="$24.5k" trend="Estimated" isPositive={false} icon={<TrendingDown />} delay={0.2} />
        </div>
        <div className="col-span-4">
          <KPICard title="Models Active" value="Isolation Forest" trend="Real-time Monitoring" isPositive={true} icon={<Eye />} delay={0.3} />
        </div>

        <div className="card col-span-12" style={{ marginTop: '24px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Revenue Anomaly Timeline (Past 7 Days)</h3>
          
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={anomalyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent-blue)" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--bg-card)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--accent-blue)' }}
                />
                
                {/* Highlight Anomalies */}
                {anomalyData.map((entry: any, index: number) => {
                  if (entry.isAnomaly) {
                    return (
                      <ReferenceDot 
                        key={`anomaly-${index}`}
                        x={entry.name} 
                        y={entry.value} 
                        r={8} 
                        fill="var(--accent-rose)" 
                        stroke="rgba(244, 63, 94, 0.3)" 
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
            <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '16px' }}>Anomaly Log</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {anomalyData.filter((d: any) => d.isAnomaly).map((anomaly: any, idx: number) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px', 
                  background: 'rgba(244, 63, 94, 0.05)', 
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                  borderRadius: '8px'
                }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <AlertOctagon size={20} color="var(--accent-rose)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Revenue Anomaly Detected</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {anomaly.name}: Recorded ${(anomaly.value).toFixed(2)}. This deviates significantly from historical patterns and lag features.
                    </div>
                  </div>
                </div>
              ))}
              {!loading && anomalyData.filter((d: any) => d.isAnomaly).length === 0 && (
                <div style={{ padding: '16px', color: 'var(--text-muted)' }}>No anomalies detected in the current timeframe.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
