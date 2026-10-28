import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  Download,
  FileText,
  Square,
  Pentagon,
  MapPin,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';
import SatelliteMapCard from '../components/satellite/SatelliteMapCard';
import LulcBarChart from '../components/analytics/LulcBarChart';
import ConfusionMatrix from '../components/analytics/ConfusionMatrix';
import { SATELLITE_ASSETS, LULC_CLASSES, PRIMARY_SCENE_INFO } from '../data/mockData';

// Dynamic configurations for ROI Tools in Spatial Analysis
const ROI_CONFIG = {
  Polygon: {
    name: 'Polygon',
    image: SATELLITE_ASSETS.cropAgriAfter,
    area: '12.4 km²',
    dominantClass: 'Agriculture',
    dominantColor: '#eab308',
    accuracy: '78.3%',
    overlay: (
      <svg viewBox="0 0 200 110" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <polygon
          points="50,20 140,15 170,70 120,95 40,75"
          fill="rgba(234, 179, 8, 0.4)"
          stroke="#eab308"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <circle cx="50" cy="20" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
        <circle cx="140" cy="15" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
        <circle cx="170" cy="70" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
        <circle cx="120" cy="95" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
        <circle cx="40" cy="75" r="3" fill="#eab308" stroke="#ffffff" strokeWidth="1" />
      </svg>
    ),
  },
  Rectangle: {
    name: 'Rectangle',
    image: SATELLITE_ASSETS.cropEnvAfter,
    area: '8.6 km²',
    dominantClass: 'Dense Forest',
    dominantColor: '#16a34a',
    accuracy: '84.1%',
    overlay: (
      <svg viewBox="0 0 200 110" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <rect
          x="30"
          y="18"
          width="140"
          height="74"
          rx="4"
          fill="rgba(22, 163, 74, 0.35)"
          stroke="#16a34a"
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        <circle cx="30" cy="18" r="3" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
        <circle cx="170" cy="18" r="3" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
        <circle cx="30" cy="92" r="3" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
        <circle cx="170" cy="92" r="3" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
        <text x="36" y="34" fill="#ffffff" fontSize="9" fontWeight="bold" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.8))">
          8.6 km²
        </text>
      </svg>
    ),
  },
  Point: {
    name: 'Point',
    image: SATELLITE_ASSETS.cropDisasterAfter,
    area: 'Single Pixel (25 m²)',
    dominantClass: 'Water Bodies',
    dominantColor: '#2563eb',
    accuracy: '95.8%',
    overlay: (
      <svg viewBox="0 0 200 110" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <circle cx="100" cy="55" r="22" fill="none" stroke="rgba(37, 99, 235, 0.45)" strokeWidth="1.5" strokeDasharray="3,3" />
        <circle cx="100" cy="55" r="14" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="1.5" />
        <line x1="100" y1="28" x2="100" y2="82" stroke="#2563eb" strokeWidth="1.5" />
        <line x1="73" y1="55" x2="127" y2="55" stroke="#2563eb" strokeWidth="1.5" />
        <circle cx="100" cy="55" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
        <text x="110" y="48" fill="#ffffff" fontSize="8.5" fontWeight="bold" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.85))">
          [392448 E, 3021841 N]
        </text>
      </svg>
    ),
  },
};

// Dynamic configurations for Top Image selection
const DATASET_CONFIG = {
  'Assam_12JUN2023.tif': {
    sensor: 'ISRO LISS-IV • 5.0 m • 3 Bands',
    thumb: SATELLITE_ASSETS.cropAgriAfter,
    cloudy: SATELLITE_ASSETS.cloudy,
    lulcCloudy: SATELLITE_ASSETS.lulcCloudy,
    reconstructed: SATELLITE_ASSETS.reconstructed,
    lulcReconstructed: SATELLITE_ASSETS.lulcReconstructed,
  },
  'Meghalaya_05MAY2023.tif': {
    sensor: 'Sentinel-2 MSI • 10.0 m • 4 Bands',
    thumb: SATELLITE_ASSETS.cropEnvAfter,
    cloudy: SATELLITE_ASSETS.cropEnvBefore,
    lulcCloudy: SATELLITE_ASSETS.cropEnvBefore,
    reconstructed: SATELLITE_ASSETS.cropEnvAfter,
    lulcReconstructed: SATELLITE_ASSETS.fcc,
  },
  'Arunachal_18APR2023.tif': {
    sensor: 'Landsat 8 OLI • 15.0 m • 3 Bands',
    thumb: SATELLITE_ASSETS.cropDisasterAfter,
    cloudy: SATELLITE_ASSETS.cropDisasterBefore,
    lulcCloudy: SATELLITE_ASSETS.mask,
    reconstructed: SATELLITE_ASSETS.cropDisasterAfter,
    lulcReconstructed: SATELLITE_ASSETS.sar,
  },
};

// Dynamic configurations for Comparison Preview card
const PREVIEW_CONFIG = {
  agriculture: {
    before: SATELLITE_ASSETS.cropAgriBefore,
    after: SATELLITE_ASSETS.cropAgriAfter,
    label: 'Agriculture / Cropland',
  },
  water: {
    before: SATELLITE_ASSETS.cropDisasterBefore,
    after: SATELLITE_ASSETS.cropDisasterAfter,
    label: 'Water Bodies',
  },
  forest: {
    before: SATELLITE_ASSETS.cropEnvBefore,
    after: SATELLITE_ASSETS.cropEnvAfter,
    label: 'Dense Forest',
  },
};

export default function LulcAnalysisPage({ onNavigate }) {
  const [selectedImage, setSelectedImage] = useState('Assam_12JUN2023.tif');
  const [model, setModel] = useState('Random Forest (Trained)');
  const [analysisType, setAnalysisType] = useState('Original vs Reconstructed');
  const [roiEnabled, setRoiEnabled] = useState(true);
  const [roiTool, setRoiTool] = useState('Polygon');
  const [previewClass, setPreviewClass] = useState('agriculture');
  const [isRunning, setIsRunning] = useState(false);

  const [analysisResult, setAnalysisResult] = useState(null);

  const handleRunAnalysis = () => {
    setIsRunning(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setAnalysisResult({
        overallAccuracy: '73.26%',
        accuracyGain: '+69.57%',
        validPixels: '262,144',
        dominantClass: 'Agriculture / Cropland (31.7%)',
      });
    }, 800);
  };

  const handleExport = (type) => {
    if (type === 'csv') {
      window.open('/api/v1/export/JOB_20261020_E4192818/csv', '_blank');
    } else {
      window.open('/api/v1/export/JOB_20261020_E4192818/pdf', '_blank');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Land Use / Land Cover (LULC) Analysis</h1>
          <p className="page-subtitle">
            Perform LULC classification on original (cloudy) and reconstructed (cloud-free) imagery and compare results
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => handleExport('csv')}
            id="lulc-export-csv-btn"
          >
            <Download size={13} />
            <span>Export Statistics (CSV)</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => handleExport('pdf')}
            id="lulc-export-report-btn"
          >
            <FileText size={13} />
            <span>Classification Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Analysis Result Banner */}
      {analysisResult && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <div style={{ fontSize: '12.5px' }}>
              <strong>LULC Classification Complete:</strong> Overall Accuracy: <strong>{analysisResult.overallAccuracy}</strong> • Accuracy Gain: <strong>{analysisResult.accuracyGain}</strong> • Dominant: {analysisResult.dominantClass}
            </div>
          </div>
          <button
            className="btn-secondary"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => setAnalysisResult(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Control Bar Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          className="card-body"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1.2fr 1.2fr auto',
            gap: '16px',
            alignItems: 'center',
            padding: '14px 20px',
          }}
        >
          {/* Select Image for LULC */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
              Select Image for LULC
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
              }}
            >
              <img
                src={DATASET_CONFIG[selectedImage]?.thumb || SATELLITE_ASSETS.cropAgriAfter}
                alt="thumb"
                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <div>
                <select
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#1e293b',
                    width: '100%',
                  }}
                >
                  <option value="Assam_12JUN2023.tif">Assam_12JUN2023.tif</option>
                  <option value="Meghalaya_05MAY2023.tif">Meghalaya_05MAY2023.tif</option>
                  <option value="Arunachal_18APR2023.tif">Arunachal_18APR2023.tif</option>
                </select>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {DATASET_CONFIG[selectedImage]?.sensor || 'ISRO LISS-IV • 5.0 m • 3 Bands'}
                </div>
              </div>
            </div>
          </div>

          {/* Classification Model */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
              Classification Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                background: '#f8fafc',
                fontWeight: 500,
              }}
            >
              <option value="Random Forest (Trained)">Random Forest (Trained)</option>
              <option value="U-Net Multi-Spectral">U-Net Multi-Spectral</option>
              <option value="Support Vector Machine (RBF)">Support Vector Machine (RBF)</option>
            </select>
          </div>

          {/* Analysis Type */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
              Analysis Type
            </label>
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setAnalysisType('Original vs Reconstructed')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: analysisType === 'Original vs Reconstructed' ? '#16a34a' : 'transparent',
                  color: analysisType === 'Original vs Reconstructed' ? '#ffffff' : '#475569',
                }}
              >
                Original vs Reconstructed
              </button>
              <button
                onClick={() => setAnalysisType('Single Image')}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: analysisType === 'Single Image' ? '#16a34a' : 'transparent',
                  color: analysisType === 'Single Image' ? '#ffffff' : '#475569',
                }}
              >
                Single Image
              </button>
            </div>
          </div>

          {/* Run Button */}
          <div>
            <button
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
              onClick={handleRunAnalysis}
              disabled={isRunning}
            >
              <span>{isRunning ? 'Analyzing...' : 'Run LULC Analysis'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Panel Comparison + Class Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr) 180px',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Panel 1: Cloudy Input (RGB) */}
        <SatelliteMapCard
          title="1. Cloudy Input (Natural RGB)"
          imageSrc={DATASET_CONFIG[selectedImage]?.cloudy || SATELLITE_ASSETS.cloudy}
          scale="2 km"
          aspectRatio="16 / 12"
        />

        {/* Panel 2: Cloudy Input - LULC Map */}
        <SatelliteMapCard
          title="2. Cloudy Input - LULC Map"
          imageSrc={DATASET_CONFIG[selectedImage]?.lulcCloudy || SATELLITE_ASSETS.lulcCloudy}
          scale="2 km"
          aspectRatio="16 / 12"
        />

        {/* Panel 3: Reconstructed (Cloud-Free) */}
        <SatelliteMapCard
          title="3. Reconstructed (Cloud-Free)"
          imageSrc={DATASET_CONFIG[selectedImage]?.reconstructed || SATELLITE_ASSETS.reconstructed}
          scale="2 km"
          aspectRatio="16 / 12"
        />

        {/* Panel 4: Reconstructed - LULC Map */}
        <SatelliteMapCard
          title="4. Reconstructed - LULC Map"
          imageSrc={DATASET_CONFIG[selectedImage]?.lulcReconstructed || SATELLITE_ASSETS.lulcReconstructed}
          scale="2 km"
          aspectRatio="16 / 12"
        />

        {/* LULC Class Legend Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ padding: '8px 12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>
              LULC Class Legend
            </span>
          </div>
          <div
            className="card-body"
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {LULC_CLASSES.map((cls) => (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    backgroundColor: cls.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: '#334155', fontWeight: 500 }}>{cls.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Row: Classification Results Bar Chart, Key Metrics, Confusion Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1.35fr',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Classification Results Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <BarChart3 size={15} color="#2878e5" />
              Classification Results
            </span>
          </div>
          <div className="card-body">
            <LulcBarChart height={160} />
          </div>
        </div>

        {/* Key Metrics Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <TrendingUp size={15} color="#16a34a" />
              Key Metrics
            </span>
          </div>
          <div className="card-body" style={{ fontSize: '12px', lineHeight: '2.1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Overall Accuracy (Cloudy)</span>
              <span style={{ fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>3.69%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Overall Accuracy (Reconstructed)</span>
              <span style={{ fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>73.26%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0' }}>
              <span style={{ color: '#1e293b', fontWeight: 600 }}>Accuracy Gain</span>
              <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>+69.57%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Kappa (Reconstructed)</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>0.698</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>Mean IoU</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>0.612</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>F1 Score (Macro)</span>
              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>0.634</span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2878e5' }}></span>
              Confusion Matrix (Reconstructed)
            </span>
          </div>
          <div className="card-body" style={{ padding: '8px 12px' }}>
            <ConfusionMatrix />
          </div>
        </div>
      </div>

      {/* Bottom Row: Spatial Analysis, Class-wise Statistics, Export & Reports, Comparison Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.1fr 1fr 1.1fr',
          gap: '16px',
        }}
      >
        {/* Spatial Analysis Card with ROI */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Layers size={14} color="#2878e5" />
              Spatial Analysis
            </span>
          </div>
          <div className="card-body">
            <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px', background: '#0f172a' }}>
              <img
                src={roiEnabled ? (ROI_CONFIG[roiTool]?.image || SATELLITE_ASSETS.cropAgriAfter) : (DATASET_CONFIG[selectedImage]?.reconstructed || SATELLITE_ASSETS.reconstructed)}
                alt="spatial map"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.25s ease' }}
              />
              {/* ROI SVG overlay */}
              {roiEnabled && (ROI_CONFIG[roiTool]?.overlay || null)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>ROI Analysis</span>
              <input
                type="checkbox"
                checked={roiEnabled}
                onChange={(e) => setRoiEnabled(e.target.checked)}
                style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                id="roi-analysis-toggle"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {['Rectangle', 'Polygon', 'Point'].map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    setRoiTool(tool);
                    if (!roiEnabled) setRoiEnabled(true);
                  }}
                  id={`roi-tool-btn-${tool.toLowerCase()}`}
                  style={{
                    padding: '4px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    border: roiEnabled && roiTool === tool ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: roiEnabled && roiTool === tool ? '#f0fdf4' : '#ffffff',
                    color: roiEnabled && roiTool === tool ? '#15803d' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tool}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.6' }}>
              <div>
                Selected Area:{' '}
                <strong style={{ color: '#1e293b' }}>
                  {roiEnabled ? (ROI_CONFIG[roiTool]?.area || '12.4 km²') : 'Full Scene (482.3 km²)'}
                </strong>
              </div>
              <div>
                Dominant Class:{' '}
                <strong style={{ color: roiEnabled ? (ROI_CONFIG[roiTool]?.dominantColor || '#eab308') : '#16a34a' }}>
                  {roiEnabled ? (ROI_CONFIG[roiTool]?.dominantClass || 'Agriculture') : 'Cropland & Vegetation'}
                </strong>
              </div>
              <div>
                Accuracy:{' '}
                <strong style={{ color: '#16a34a' }}>
                  {roiEnabled ? (ROI_CONFIG[roiTool]?.accuracy || '78.3%') : '73.26%'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Class-wise Statistics Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Class-wise Statistics</span>
          </div>
          <div className="card-body" style={{ padding: '6px 12px' }}>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '4px' }}>Class</th>
                  <th style={{ padding: '4px' }}>Area (km²)</th>
                  <th style={{ padding: '4px' }}>%</th>
                </tr>
              </thead>
              <tbody style={{ fontFamily: 'var(--font-mono)' }}>
                {LULC_CLASSES.slice(0, 6).map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-sans)', fontSize: '10.5px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: cls.color }} />
                      {cls.name.split('/')[0]}
                    </td>
                    <td style={{ padding: '4px' }}>{cls.areaKm2}</td>
                    <td style={{ padding: '4px', fontWeight: 600 }}>{cls.percent}%</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '4px', fontWeight: 700 }}>Total</td>
                  <td style={{ padding: '4px', fontWeight: 700 }}>482.3</td>
                  <td style={{ padding: '4px', fontWeight: 700 }}>100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Export & Reports Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Download size={14} color="#2878e5" />
              Export & Reports
            </span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px', padding: '5px 8px' }}
              onClick={() => handleExport('LULC Map GeoTIFF')}
            >
              <Download size={12} color="#2878e5" />
              <span>LULC Map (GeoTIFF)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px', padding: '5px 8px' }}
              onClick={() => handleExport('Class Statistics CSV')}
            >
              <FileText size={12} color="#2878e5" />
              <span>Class Statistics (CSV)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px', padding: '5px 8px' }}
              onClick={() => handleExport('Confusion Matrix CSV')}
            >
              <FileText size={12} color="#2878e5" />
              <span>Confusion Matrix (CSV)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px', padding: '5px 8px' }}
              onClick={() => handleExport('Analysis Report PDF')}
            >
              <FileText size={12} color="#16a34a" />
              <span>Analysis Report (PDF)</span>
            </button>
            <button
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px', padding: '5px 8px' }}
              onClick={() => handleExport('ROI Shapefile ZIP')}
            >
              <Download size={12} color="#94a3b8" />
              <span>ROI Shapefile (ZIP)</span>
            </button>
          </div>
        </div>

        {/* Comparison Preview Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Comparison Preview</span>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '10.5px', color: '#64748b' }}>Show:</label>
              <select
                value={previewClass}
                onChange={(e) => setPreviewClass(e.target.value)}
                style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', marginTop: '2px' }}
                id="preview-class-selector"
              >
                <option value="agriculture">Agriculture / Cropland</option>
                <option value="water">Water Bodies</option>
                <option value="forest">Dense Forest</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div>
                <img
                  src={PREVIEW_CONFIG[previewClass]?.before || SATELLITE_ASSETS.cropAgriBefore}
                  alt="Cloudy preview"
                  style={{ width: '100%', height: '70px', borderRadius: '4px', objectFit: 'cover', transition: 'all 0.2s ease' }}
                />
                <div style={{ fontSize: '10px', textAlign: 'center', color: '#64748b', marginTop: '2px' }}>Cloudy Input</div>
              </div>
              <div>
                <img
                  src={PREVIEW_CONFIG[previewClass]?.after || SATELLITE_ASSETS.cropAgriAfter}
                  alt="Reconstructed preview"
                  style={{ width: '100%', height: '70px', borderRadius: '4px', objectFit: 'cover', transition: 'all 0.2s ease' }}
                />
                <div style={{ fontSize: '10px', textAlign: 'center', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>Reconstructed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
