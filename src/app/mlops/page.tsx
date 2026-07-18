"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Cpu, CheckCircle2, Clock, GitBranch, Terminal } from 'lucide-react';
import api from '@/lib/api';

export default function MLOpsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/mlops/models');
        setModels(res.data);
      } catch (err) {
        console.error("Error fetching models:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <main className="page-container">
      <PageHeader 
        title="MLOps Registry" 
        subtitle="Monitor predictive models and analytics pipelines in real-time." 
      />

      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading models...</div>
        ) : models.map((model, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#fff' }}>{model.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Clock size={12} /> {new Date(model.start_time).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ 
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: model.status === 'FINISHED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: model.status === 'FINISHED' ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                {model.status === 'FINISHED' && <CheckCircle2 size={12} />}
                {model.status}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="var(--accent-emerald)" /> Performance Metrics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.keys(model.metrics).length === 0 && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No metrics logged for this run.</div>
                )}
                {Object.entries(model.metrics).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{key}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
                      {typeof value === 'number' ? value.toFixed(4) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitBranch size={14} color="var(--accent-amber)" /> Lifecycle Stage
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {model.lifecycle_stage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
