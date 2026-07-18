import { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
      <div>
        <h1 className="page-title" style={{ marginBottom: subtitle ? '8px' : '0' }}>{title}</h1>
        {subtitle && <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
