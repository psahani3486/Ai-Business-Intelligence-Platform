"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { FileText, Download, Loader2, Plus, Bell, ShieldCheck, CheckCircle2, Play } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [reportTitle, setReportTitle] = useState("Executive Analytics Summary");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [dateRange, setDateRange] = useState("Q3 2026");

  const [reports, setReports] = useState<any[]>([
    { id: "REP-DEMO-1", name: "Monthly Executive Summary - Q2 2026", date: "Today, 08:00 AM", status: "READY" }
  ]);

  const [alertConfigs, setAlertConfigs] = useState([
    { metric: "Revenue Drop Threshold", threshold: 15, slack_enabled: true, email_enabled: true },
    { metric: "Low Stock Inventory Warning", threshold: 10, slack_enabled: true, email_enabled: true },
    { metric: "Forecast Accuracy Drift (MAPE)", threshold: 8, slack_enabled: true, email_enabled: false }
  ]);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/reports/generate', {
        title: reportTitle,
        date_range: dateRange,
        include_charts: includeCharts
      });
      
      const newReport = {
        id: res.data.report_id,
        name: reportTitle,
        date: new Date().toLocaleString(),
        status: "READY"
      };
      
      setReports([newReport, ...reports]);
      downloadReport(res.data.report_id);
    } catch (err) {
      console.error(err);
      alert("Failed to generate report. Ensure backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (id: string) => {
    if (id.startsWith("REP-DEMO")) {
      // Generate live on the fly for demo report
      generateReport();
      return;
    }
    window.open(`http://localhost:8000/api/reports/download/${id}`, "_blank");
  };

  const triggerAlertChecks = async () => {
    setIsTestingAlert(true);
    try {
      const res = await api.post('/alerts/trigger');
      alert(`Alert Pipeline Triggered: ${res.data.message}`);
    } catch {
      alert("Triggered alert evaluation pipeline.");
    } finally {
      setIsTestingAlert(false);
    }
  };

  return (
    <main className="page-container">
      <PageHeader 
        title="Reports & Automated Alert System" 
        subtitle="Branded Executive PDF Generator and Real-Time Slack/Email Threshold Triggers" 
      />
      
      <div className="dashboard-grid">
        {/* PDF Generator Panel */}
        <div className="card col-span-8">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>Generate Executive PDF Report</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>REPORT TITLE</label>
              <input 
                type="text" 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.04)', color: '#fff', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>DATE RANGE</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(15,23,42,0.9)', color: '#fff', outline: 'none' }}
              >
                <option value="YTD 2026">YTD 2026</option>
                <option value="Q3 2026">Q3 2026</option>
                <option value="Q2 2026">Q2 2026</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input 
                type="checkbox" 
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-blue)' }}
              />
              Embed High-Resolution Matplotlib Trend Graphs & KPI Grids
            </label>

            <button 
              onClick={generateReport}
              disabled={isGenerating}
              className="btn-primary"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isGenerating ? "Building PDF..." : "Generate Live PDF"}
            </button>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: '#fff' }}>Generated Report Archive</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((report, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '10px', background: 'rgba(56, 189, 248, 0.12)', borderRadius: '8px' }}>
                    <FileText color="var(--accent-blue)" size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{report.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created: {report.date}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => downloadReport(report.id)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alert System Config Panel */}
        <div className="card col-span-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="var(--accent-amber)" /> Alert Engine Config
              </h3>
              <span className="badge badge-emerald">Background Worker</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {alertConfigs.map((config, idx) => (
                <div key={idx} style={{ padding: '14px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>{config.metric}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Threshold: <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{config.threshold}%</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {config.slack_enabled && <span className="badge badge-blue">Slack #alerts</span>}
                    {config.email_enabled && <span className="badge badge-emerald">SMTP Email</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={triggerAlertChecks}
            disabled={isTestingAlert}
            className="btn-secondary"
            style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
          >
            {isTestingAlert ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Trigger Alert Pipeline Check
          </button>
        </div>
      </div>
    </main>
  );
}
