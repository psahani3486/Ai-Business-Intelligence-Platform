import React, { useEffect, useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
  ComposedChart, Bar
} from 'recharts';
import { Activity, Clock } from 'lucide-react';
import api from '@/lib/api';

const COLORS = ['#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b'];

export const CohortScatterPlot = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>Loading clusters...</div>;
  
  // Group by cluster
  const clusters = Array.from(new Set(data.map(d => d.cluster)));
  
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" dataKey="x" name="Recency" unit=" days" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
          <YAxis type="number" dataKey="y" name="Monetary" unit="$" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
          <ZAxis type="number" dataKey="z" range={[50, 400]} name="Frequency" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          {clusters.map((cName, i) => (
            <Scatter key={cName} name={cName} data={data.filter(d => d.cluster === cName)} fill={COLORS[i % COLORS.length]} opacity={0.8} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryRadarChart = ({ data }: { data: any[] }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Category Perf" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.4} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LiveOrderTicker = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8000/api/stream/live-orders');
    
    eventSource.onmessage = (e) => {
      try {
        const order = JSON.parse(e.data);
        setOrders(prev => [order, ...prev].slice(0, 10)); // Keep last 10
      } catch (err) {
        console.error(err);
      }
    };
    
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflow: 'hidden' }}>
      {orders.length === 0 && <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} className="animate-pulse" /> Waiting for live orders...</div>}
      
      {orders.map((order, idx) => (
        <div key={order.order_id + idx} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px',
          animation: 'fadeInUp 0.3s ease-out backwards'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{order.category}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.city} • {new Date(order.timestamp).toLocaleTimeString()}</div>
          </div>
          <div style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
            ${order.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export const RevenueWaterfallChart = ({ data }: { data: any[] }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
          <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          {/* This uses a trick for waterfall in recharts: a transparent base bar, and then a colored top bar */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a" fill="var(--accent-emerald)">
            {
              data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isTotal ? 'var(--accent-blue)' : (entry.value < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)')} />
              ))
            }
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ActivityHeatmap = ({ data }: { data: number[][] }) => {
  // data is a 7x24 array (days x hours) of activity intensity 0-100
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {data.map((dayData, dayIdx) => (
        <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          <div style={{ width: '30px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>{days[dayIdx]}</div>
          <div style={{ display: 'flex', flex: 1, gap: '2px', height: '100%' }}>
            {dayData.map((val, hrIdx) => {
              // Interpolate color from very dark blue to bright blue
              const opacity = Math.max(0.1, val / 100);
              return (
                <div 
                  key={hrIdx} 
                  title={`Hour: ${hrIdx}, Activity: ${val}`}
                  style={{ 
                    flex: 1, 
                    backgroundColor: `rgba(59, 130, 246, ${opacity})`, 
                    borderRadius: '2px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }} 
                  className="hover:scale-110"
                />
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', marginLeft: '34px', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
        <span>12 AM</span>
        <span>12 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};
