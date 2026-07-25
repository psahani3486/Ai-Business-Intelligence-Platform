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
  Cpu,
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navGroups = [
  {
    title: 'ANALYTICS & CANVAS',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'BI Canvas', path: '/canvas', icon: Grid, badge: 'PRO' },
      { name: 'Sales Analytics', path: '/sales', icon: TrendingUp },
    ]
  },
  {
    title: 'PREDICTIVE INTEL',
    items: [
      { name: 'MLOps Registry', path: '/mlops', icon: Cpu, badge: 'MLflow' },
      { name: 'Customer Intel', path: '/customers', icon: Users },
      { name: 'Product Analytics', path: '/products', icon: Package },
      { name: 'Anomaly Center', path: '/anomalies', icon: AlertTriangle, badge: '12', badgeColor: 'var(--accent-rose)' },
    ]
  },
  {
    title: 'ASSISTANT & REPORTS',
    items: [
      { name: 'AI Chat Assistant', path: '/chat', icon: MessageSquare, badge: 'AI' },
      { name: 'Reports & Alerts', path: '/reports', icon: FileText },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  const closeMobileSidebar = () => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('sidebar-open');
    }
  };

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
      background: 'rgba(7, 11, 20, 0.98)',
      backdropFilter: 'blur(20px)',
      padding: '24px 16px',
      zIndex: 40,
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Brand Header & Mobile Close Button */}
      <div style={{ padding: '0 8px 24px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
          }}>
            AI
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Nexus BI <Sparkles size={14} color="var(--accent-amber)" />
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Enterprise Intelligence</span>
          </div>
        </div>

        <button 
          onClick={closeMobileSidebar}
          className="mobile-menu-btn"
          aria-label="Close Sidebar"
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer',
            display: 'none',
            padding: '4px'
          }}
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <div style={{ 
              fontSize: '0.6875rem', 
              fontWeight: 800, 
              color: 'var(--text-muted)', 
              letterSpacing: '0.1em', 
              padding: '0 12px 8px 12px',
              textTransform: 'uppercase'
            }}>
              {group.title}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link href={item.path} key={item.path} onClick={closeMobileSidebar}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--accent-blue)' : '3px solid transparent',
                      transition: 'all 0.2s ease',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <item.icon size={18} color={isActive ? 'var(--accent-blue)' : 'currentColor'} />
                        <span style={{ fontSize: '0.875rem' }}>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span className="badge" style={{ 
                          fontSize: '0.6875rem', 
                          padding: '2px 6px',
                          background: item.badgeColor || 'rgba(56, 189, 248, 0.15)',
                          color: item.badgeColor ? '#fff' : 'var(--accent-blue)',
                          border: 'none'
                        }}>
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <motion.div 
                          layoutId="sidebar-active"
                          style={{ position: 'absolute', right: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)' }}>
        <ThemeToggle />
        
        <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" /> System Operational
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div className="pulse-dot"></div>
            All 16 Services Healthy
          </div>
        </div>
      </div>
    </aside>
  );
}
