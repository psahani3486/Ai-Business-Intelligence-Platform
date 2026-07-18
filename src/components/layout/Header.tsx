import { Bell, Search, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(8px)',
      borderBottom: 'var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '8px 16px', width: '300px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Ask a question or search..." 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: '#fff', 
            outline: 'none',
            width: '100%',
            fontSize: '0.875rem'
          }} 
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-rose)', width: '8px', height: '8px', borderRadius: '50%' }}></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderLeft: 'var(--glass-border)', paddingLeft: '20px' }}>
          <UserCircle size={28} color="var(--text-secondary)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Executive User</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
