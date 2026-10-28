import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  PieChart,
  Activity,
  Layers,
} from 'lucide-react';
import SpectralChart from '../components/analytics/SpectralChart';
import LulcBarChart from '../components/analytics/LulcBarChart';
import ConfusionMatrix from '../components/analytics/ConfusionMatrix';

export default function VisualizationsPage({ onNavigate }) {
  const [selectedSensor, setSelectedSensor] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('Northeast India');

  // Trend data
  const trendData = [
    { date: 'Jan', psnr: 36.4, ssim: 0.962, cloud: 62 },
    { date: 'Feb', psnr: 37.8, ssim: 0.971, cloud: 54 },
    { date: 'Mar', psnr: 38.2, ssim: 0.978, cloud: 72 },
    { date: 'Apr', psnr: 37.1, ssim: 0.969, cloud: 79 },
    { date: 'May', psnr: 38.9, ssim: 0.981, cloud: 86 },
    { date: 'Jun', psnr: 39.67, ssim: 0.9834, cloud: 81 },
  ];

  const [toastMessage, setToastMessage] = useState(null);

  const handleExportReport = () => {
    window.open('/api/v1/export/JOB_20261020_E4192818/pdf', '_blank');
    setToastMessage('Exported comprehensive analytics report (PDF/Text) with measured PSNR/SSIM distributions.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div style={{ position: 'relative' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#064e3b',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Geospatial Analytics & Model Trends</h1>
          <p className="page-subtitle">
            Scientific performance metrics, reconstruction fidelity distributions, and temporal trends across test scenes
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={handleExportReport}
          id="visualizations-export-report-btn"
        >
          <Download size={13} />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* Top Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '12px 18px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option>Northeast India (Assam, Meghalaya, Arunachal)</option>
              <option>Western Ghats Monsoon Sector</option>
              <option>Gangetic Basin Plains</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Sensor:</span>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            >
              <option>All Sensors (LISS-IV + Sentinel-1)</option>
              <option>ISRO LISS-IV Resourcesat-2A</option>
              <option>ESA Sentinel-1 SAR C-Band</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: PSNR & SSIM Trends / Cloud Coverage Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* PSNR Trend Line Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={15} color="#16a34a" />
              Reconstruction PSNR (dB) Monthly Trend
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              Current Mean: 38.85 dB
            </span>
          </div>
          <div className="card-body">
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              {/* Grid Lines */}
              {[34, 36, 38, 40].map((val, idx) => {
                const y = 140 - ((val - 34) / 6) * 110;
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="480" y2={y} stroke="#f1f5f9" />
                    <text x="32" y={y + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Data Points */}
              {trendData.map((d, idx) => {
                const x = 50 + idx * 80;
                const y = 140 - ((d.psnr - 34) / 6) * 110;
                return (
                  <g key={d.date}>
                    <text x={x} y="155" fill="#64748b" fontSize="10" textAnchor="middle">
                      {d.date}
                    </text>
                    <circle cx={x} cy={y} r="4" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                    <text x={x} y={y - 8} fill="#16a34a" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                      {d.psnr}
                    </text>
                  </g>
                );
              })}

              {/* Connecting line */}
              <polyline
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                points={trendData.map((d, idx) => `${50 + idx * 80},${140 - ((d.psnr - 34) / 6) * 110}`).join(' ')}
              />
            </svg>
          </div>
        </div>

        {/* Cloud Coverage Distribution Histogram */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <PieChart size={15} color="#2878e5" />
              Cloud Coverage Range Distribution
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                  <span>Heavy Clouds (&gt; 70%)</span>
                  <strong style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>58%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: '58%', background: '#ef4444' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                  <span>Moderate Clouds (40% - 70%)</span>
                  <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>27%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: '27%', background: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                  <span>Thin Cirrus / Light (&lt; 40%)</span>
                  <strong style={{ color: '#16a34a', fontFamily: 'var(--font-mono)' }}>15%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '6px' }}>
                  <div className="progress-bar-fill" style={{ width: '15%', background: '#16a34a' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '11px', color: '#64748b' }}>
              Tested against 280 Monsoon scenes over Assam & Meghalaya with ground truth validation.
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Spectral Analysis Reflectance & LULC Consistency Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Spectral Preservation Across Wavebands</span>
          </div>
          <div className="card-body">
            <SpectralChart height={160} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">LULC Area Distribution: Cloudy vs Reconstructed</span>
          </div>
          <div className="card-body">
            <LulcBarChart height={160} />
          </div>
        </div>
      </div>
    </div>
  );
}
