"use client";

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Send, Bot, User, Database, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
  analysis?: any;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Business Intelligence assistant. You can ask me questions about your revenue, customers, churn, or products in plain English, and I'll generate the SQL, execute it, and analyze the results for you."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate API call with Generative UI support
    setTimeout(() => {
      const isRevenueQuery = userMsg.content.toLowerCase().includes('revenue');
      
      const assistantMsg: Message & { uiComponent?: any } = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Here is the analysis based on your query.",
        sql: isRevenueQuery 
          ? "SELECT category_name, SUM(total_revenue) as revenue FROM agg_category_performance GROUP BY category_name ORDER BY revenue DESC LIMIT 5;"
          : "SELECT customer_state, COUNT(*) as count FROM dim_customers GROUP BY customer_state ORDER BY count DESC LIMIT 5;",
        uiComponent: isRevenueQuery ? {
          type: 'BarChart',
          data: [
            { name: 'Health & Beauty', value: 245000 },
            { name: 'Computers', value: 180000 },
            { name: 'Bed Bath', value: 165000 },
            { name: 'Sports', value: 140000 },
            { name: 'Furniture', value: 120000 }
          ]
        } : null,
        analysis: {
          summary: isRevenueQuery 
            ? "Your top performing categories are Health & Beauty, Computers & Accessories, and Bed Bath & Table." 
            : "Most of your customers are located in SP (São Paulo), followed by RJ (Rio de Janeiro) and MG (Minas Gerais).",
          insights: isRevenueQuery
            ? [
              "Health & Beauty generated the highest revenue, driving 15% of total sales.",
              "Computers & Accessories saw a 12% increase compared to last quarter."
            ] : [
              "São Paulo accounts for over 40% of your total customer base.",
              "Consider expanding marketing efforts in RJ to increase market share."
            ]
        }
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))', padding: '32px' }}>
      <PageHeader 
        title="AI Analytics Chat" 
        subtitle="Ask questions in natural language" 
      />
      
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%', 
                background: msg.role === 'user' ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {msg.role === 'user' ? <User size={20} color="#fff" /> : <Bot size={20} color="#fff" />}
              </div>
              
              <div style={{ 
                maxWidth: '70%',
                background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                padding: '16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? 0 : '16px',
                borderTopLeftRadius: msg.role === 'assistant' ? 0 : '16px',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}>
                <div style={{ lineHeight: '1.6' }}>{msg.content}</div>
                
                {msg.analysis && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-emerald)' }}>
                      <BarChart2 size={16} /> Executive Summary
                    </h4>
                    <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>{msg.analysis.summary}</p>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                      {msg.analysis.insights.map((insight: string, i: number) => (
                        <li key={i} style={{ marginBottom: '8px' }}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.sql && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={12} /> GENERATED SQL
                    </div>
                    <pre style={{ 
                      background: '#0d1117', padding: '12px', borderRadius: '8px', 
                      fontSize: '0.875rem', overflowX: 'auto', color: '#e6edf3',
                      border: '1px solid #30363d'
                    }}>
                      <code>{msg.sql}</code>
                    </pre>
                  </div>
                )}

                {(msg as any).uiComponent && (msg as any).uiComponent.type === 'BarChart' && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(msg as any).uiComponent.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#fff" />
              </div>
              <div style={{ padding: '16px', color: 'var(--text-muted)' }}>
                Analyzing data...
              </div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '24px', borderTop: 'var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your data... (e.g. 'What were the top 5 product categories by revenue last month?')"
              style={{
                flex: 1,
                padding: '16px 24px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--accent-blue)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !input.trim()) ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
