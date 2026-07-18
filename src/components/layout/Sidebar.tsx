"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  MessageSquare, 
  FileText,
  Grid,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'BI Canvas', path: '/canvas', icon: Grid },
  { name: 'MLOps Registry', path: '/mlops', icon: Cpu },
  { name: 'Sales Analytics', path: '/sales', icon: TrendingUp },
  { name: 'Customer Intel', path: '/customers', icon: Users },
  { name: 'Product Analytics', path: '/products', icon: Package },
  { name: 'Anomaly Center', path: '/anomalies', icon: AlertTriangle },
  { name: 'AI Chat', path: '/chat', icon: MessageSquare },
  { name: 'Reports & Alerts', path: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="app-sidebar" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      borderRight: 'var(--glass-border)',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      padding: '24px 16px',
      zIndex: 40,
      transition: 'transform 0.3s ease'
    }}>
      <div style={{ padding: '0 12px 32px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          AI
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>
          Nexus BI
        </h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link href={item.path} key={item.path}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              >
                <item.icon size={20} color={isActive ? 'var(--accent-blue)' : 'currentColor'} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    style={{ position: 'absolute', right: 16, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ThemeToggle />
        
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: 'var(--glass-border)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>System Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 8px var(--accent-emerald)' }}></div>
            All pipelines operational
          </div>
        </div>
      </div>
    </aside>
  );
}
