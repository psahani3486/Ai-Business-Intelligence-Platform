"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, Download, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState([
    { id: "REP-DEMO-1", name: "Monthly Executive Summary - July 2026", date: "Today, 08:00 AM", isDemo: true }
  ]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/reports/generate', {
        title: "Executive Analytics Summary",
        date_range: "Lifetime",
        include_charts: false
      });
      
      const newReport = {
        id: res.data.report_id,
        name: "Executive Analytics Summary",
        date: new Date().toLocaleString(),
        isDemo: false
      };
      
      setReports([newReport, ...reports]);
      
      // Auto-trigger download
      downloadReport(res.data.report_id);
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (id: string) => {
    if (id.startsWith("REP-DEMO")) {
      alert("This is a demo placeholder report. Please generate a new live report.");
      return;
    }
    window.open(`http://localhost:8000/api/reports/download/${id}`, "_blank");
  };

  return (
    <main className="page-container">
      <PageHeader 
        title="Reports & Alerts" 
        subtitle="Automated PDF generation and alert configurations" 
      />
      
      <div className="dashboard-grid">
        <div className="card col-span-12">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Generated Reports</h3>
            <button 
              onClick={generateReport}
              disabled={isGenerating}
              style={{
                background: 'var(--accent-blue)',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                opacity: isGenerating ? 0.7 : 1
              }}
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isGenerating ? "Generating..." : "Generate PDF"}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reports.map((report, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                    <FileText color="var(--accent-blue)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: '#fff' }}>{report.name}</h4>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Generated: {report.date}</span>
                  </div>
                </div>
                <button 
                  onClick={() => downloadReport(report.id)}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Download size={16} /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
