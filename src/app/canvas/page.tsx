"use client";

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { LiveOrderTicker, RevenueWaterfallChart, ActivityHeatmap } from '@/components/charts/AdvancedCharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Clock, Zap, Map, BarChart } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayout = [
  { i: 'live-ticker', x: 0, y: 0, w: 4, h: 4 },
  { i: 'revenue-chart', x: 4, y: 0, w: 8, h: 4 },
  { i: 'waterfall-chart', x: 0, y: 4, w: 6, h: 5 },
  { i: 'heatmap-chart', x: 6, y: 4, w: 6, h: 5 },
  { i: 'metric-1', x: 0, y: 9, w: 4, h: 2 },
  { i: 'metric-2', x: 4, y: 9, w: 4, h: 2 },
  { i: 'metric-3', x: 8, y: 9, w: 4, h: 2 },
];

const mockRevenueData = [
  { time: '10:00', rev: 1200 },
  { time: '11:00', rev: 1400 },
  { time: '12:00', rev: 1100 },
  { time: '13:00', rev: 1800 },
  { time: '14:00', rev: 1500 },
  { time: '15:00', rev: 2100 },
];

export default function CanvasPage() {
  const [layout, setLayout] = useState<any[]>(defaultLayout);
  const [mounted, setMounted] = useState(false);
  const [waterfallData, setWaterfallData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('bi-canvas-layout');
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {}
    }

    // Fetch real data
    const fetchRealData = async () => {
      try {
        const [waterfallRes, heatmapRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/waterfall'),
          fetch('http://localhost:8000/api/dashboard/heatmap')
        ]);
        if (waterfallRes.ok) setWaterfallData(await waterfallRes.json());
        if (heatmapRes.ok) setHeatmapData(await heatmapRes.json());
      } catch (err) {
        console.error("Failed to fetch canvas data", err);
      }
    };
    fetchRealData();
  }, []);

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    localStorage.setItem('bi-canvas-layout', JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    setLayout(defaultLayout);
    localStorage.removeItem('bi-canvas-layout');
  };

  if (!mounted) return null;

  return (
    <main className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHeader 
          title="Drag & Drop BI Canvas" 
          subtitle="Customize your layout. Changes are automatically saved." 
        />
        <button 
          onClick={resetLayout}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Reset Layout
        </button>
      </div>
      
      <div style={{ marginTop: '24px', minHeight: '600px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed var(--border-color)', padding: '16px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={onLayoutChange}
          isDraggable={true}
          isResizable={true}
          margin={[16, 16]}
        >
          <div key="live-ticker" className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-amber)" /> Live Orders
            </h3>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <LiveOrderTicker />
            </div>
          </div>
          
          <div key="revenue-chart" className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Intraday Revenue</h3>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              <ResponsiveContainer>
                <LineChart data={mockRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)' }} />
                  <Line type="monotone" dataKey="rev" stroke="var(--accent-blue)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div key="metric-1" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Sessions</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>1,248</div>
            <div style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem' }}>+12% vs avg</div>
          </div>

          <div key="metric-2" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Conversion Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>4.2%</div>
            <div style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem' }}>+0.5% vs avg</div>
          </div>

          <div key="metric-3" className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Avg Processing Time</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>1.2s</div>
            <div style={{ color: 'var(--accent-rose)', fontSize: '0.875rem' }}>+0.2s vs avg</div>
          </div>
          
          <div key="waterfall-chart" className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart size={18} color="var(--accent-blue)" /> Revenue Bridge
            </h3>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              {waterfallData.length > 0 ? <RevenueWaterfallChart data={waterfallData} /> : <div style={{ color: 'var(--text-muted)' }}>Loading waterfall...</div>}
            </div>
          </div>

          <div key="heatmap-chart" className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={18} color="var(--accent-amber)" /> User Activity Heatmap
            </h3>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
              {heatmapData.length > 0 ? <ActivityHeatmap data={heatmapData} /> : <div style={{ color: 'var(--text-muted)' }}>Loading heatmap...</div>}
            </div>
          </div>
        </ResponsiveGridLayout>
      </div>
    </main>
  );
}
