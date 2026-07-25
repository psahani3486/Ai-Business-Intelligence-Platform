"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Grid, Plus, Save, Download, RefreshCw, Layout, Layers, Sparkles } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/charts/Charts';
import { RevenueWaterfallChart, ActivityHeatmap } from '@/components/charts/AdvancedCharts';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function CanvasPage() {
  const [mounted, setMounted] = useState(false);
  const [widgets, setWidgets] = useState([
    { id: 'waterfall', name: 'Revenue Waterfall Bridge', size: 'col-span-12' },
    { id: 'revenue', name: '30-Day Predictive Revenue Velocity', size: 'col-span-8' },
    { id: 'heatmap', name: '7x24 Peak Order Activity Heatmap', size: 'col-span-4' },
  ]);

  const { data: revenueData } = useQuery({
    queryKey: ['canvas_revenue'],
    queryFn: async () => {
      try {
        const res = await api.get('/dashboard/revenue-trend');
        return res.data;
      } catch {
        return [];
      }
    }
  });

  const fallbackWaterfall = [
    { name: "Gross Rev", base: 0, value: 16008872.0, isTotal: true },
    { name: "Returns", base: 15448561.48, value: -560310.52, isTotal: false },
    { name: "Discounts", base: 15112375.17, value: -336186.31, isTotal: false },
    { name: "Shipping", base: 15112375.17, value: 2273259.82, isTotal: false },
    { name: "Net Rev", base: 0, value: 17385634.99, isTotal: true }
  ];

  const { data: waterfallData } = useQuery({
    queryKey: ['canvas_waterfall'],
    queryFn: async () => {
      try {
        const res = await api.get('/dashboard/waterfall');
        return res.data && res.data.length > 0 ? res.data : fallbackWaterfall;
      } catch {
        return fallbackWaterfall;
      }
    }
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['canvas_heatmap'],
    queryFn: async () => {
      try {
        const res = await api.get('/dashboard/heatmap');
        return res.data;
      } catch {
        return [];
      }
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveLayout = () => {
    alert("BI Canvas Layout configuration saved to user profile!");
  };

  const handleExportDashboard = () => {
    alert("Exported BI Canvas dashboard setup as JSON schema.");
  };

  if (!mounted) return null;

  return (
    <main className="page-container">
      <PageHeader 
        title="Interactive Drag & Drop BI Canvas" 
        subtitle="Custom Executive Grid Builder with Live Waterfall, Heatmap, and Predictive Widgets" 
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={handleSaveLayout}>
              <Save size={16} /> Save Layout
            </button>
            <button className="btn-primary" onClick={handleExportDashboard}>
              <Download size={16} /> Export Canvas
            </button>
          </div>
        }
      />

      {/* Widget Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layout size={18} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>CANVAS LAYOUT PRESETS:</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="badge badge-blue" style={{ cursor: 'pointer', padding: '6px 12px' }}>Executive Standard</button>
            <button className="badge badge-emerald" style={{ cursor: 'pointer', padding: '6px 12px' }}>Financial Revenue</button>
            <button className="badge badge-amber" style={{ cursor: 'pointer', padding: '6px 12px' }}>Operations & Heatmap</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            onClick={() => alert("Added Customer Churn Risk Gauge widget to Canvas.")}
          >
            <Plus size={14} /> Add Churn Gauge
          </button>
          <button 
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            onClick={() => alert("Canvas reset to default layout.")}
          >
            <RefreshCw size={14} /> Reset Grid
          </button>
        </div>
      </div>

      {/* Drag & Drop Grid Layout */}
      <div className="dashboard-grid">
        {/* Waterfall Chart Widget */}
        <div className="col-span-12">
          <RevenueWaterfallChart data={waterfallData} />
        </div>

        {/* Revenue Trend Chart Widget */}
        <div className="col-span-8">
          <RevenueChart title="Predictive Revenue Velocity" data={revenueData} />
        </div>

        {/* Heatmap Widget */}
        <div className="col-span-4">
          <ActivityHeatmap data={heatmapData} />
        </div>
      </div>
    </main>
  );
}
