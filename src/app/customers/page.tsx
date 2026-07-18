"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import KPICard from '@/components/dashboard/KPICard';
import { UserMinus, ShieldAlert, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function CustomersPage() {
  const [churnPredictions, setChurnPredictions] = useState<any[]>([]);
  const [clvSegments, setClvSegments] = useState<any>({ "High Value": 0, "Medium Value": 0, "Low Value": 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/churn/predictions'),
      api.get('/clv/segments')
    ]).then(([churnRes, clvRes]) => {
      setChurnPredictions(churnRes.data);
      setClvSegments(clvRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalHighValue = clvSegments["High Value"] || 0;
  const highRiskCount = churnPredictions.filter(p => p.prediction === 'High Risk').length;

  return (
    <main className="page-container">
      <PageHeader 
        title="Customer Intelligence" 
        subtitle="Churn predictions and Lifetime Value segments" 
      />
      
      <div className="dashboard-grid">
        <div className="col-span-4">
          <KPICard title="High Churn Risk (Top 20)" value={highRiskCount.toString()} trend="Action Needed" isPositive={false} icon={<UserMinus />} delay={0.1} />
        </div>
        <div className="col-span-4">
          <KPICard title="High Value Customers" value={totalHighValue.toLocaleString()} trend="Predicted by XGBoost" isPositive={true} icon={<Award />} delay={0.2} />
        </div>
        <div className="col-span-4">
          <KPICard title="Total At-Risk Evaluated" value={churnPredictions.length.toString()} trend="Models Active" isPositive={false} icon={<ShieldAlert />} delay={0.3} />
        </div>
        
        <div className="card col-span-12" style={{ marginTop: '24px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Top At-Risk Customers (Powered by XGBoost & SHAP)</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Customer ID</th>
                  <th style={{ padding: '12px' }}>Risk Score</th>
                  <th style={{ padding: '12px' }}>Prediction</th>
                  <th style={{ padding: '12px' }}>Top Risk Factors (SHAP)</th>
                </tr>
              </thead>
              <tbody>
                {churnPredictions.map((pred, idx) => (
                  <tr key={pred.customer_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{pred.customer_id}</td>
                    <td style={{ padding: '12px', color: pred.risk_score > 0.7 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                      {(pred.risk_score * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: pred.risk_score > 0.7 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                        color: pred.risk_score > 0.7 ? 'var(--accent-rose)' : 'var(--accent-amber)', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' 
                      }}>
                        {pred.prediction}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                      {pred.top_factors.map((f: any) => `${f.name}: ${f.value}`).join(' | ')}
                    </td>
                  </tr>
                ))}
                {!loading && churnPredictions.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No churn data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
