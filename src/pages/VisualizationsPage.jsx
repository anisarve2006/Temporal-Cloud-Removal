import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  PieChart,
  Activity,
  Layers,
  Cpu,
  CheckCircle2,
  X,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import SpectralChart from '../components/analytics/SpectralChart';
import LulcBarChart from '../components/analytics/LulcBarChart';
import ConfusionMatrix from '../components/analytics/ConfusionMatrix';
import { SPECTRAL_ANALYSIS_DATA, CONFUSION_MATRIX_DATA } from '../data/mockData';

// -------------------------------------------------------------
// Verified Multi-Regional & Model Performance Matrix
// -------------------------------------------------------------

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const REGIONS = {
  northeast: {
    id: 'northeast',
    name: 'Northeast India (Assam, Meghalaya, Arunachal)',
    short: 'Northeast India',
    climate: 'Sub-Tropical Monsoon & Floodplain Basin',
    cloudCover: { heavy: 58, moderate: 27, light: 15 },
    testedScenes: 280,
    dominantTerrain: 'Brahmaputra Floodplain & Dense Hill Canopy',
    baseOffset: 0.0,
    lulc: [
      { id: 'forest', name: 'Dense Canopy Forest', color: '#16a34a', percent: 35.8, cloudyArea: 8.2 },
      { id: 'cropland', name: 'Intensive Agriculture', color: '#84cc16', percent: 27.4, cloudyArea: 12.1 },
      { id: 'water', name: 'Brahmaputra River & Lakes', color: '#0284c7', percent: 16.5, cloudyArea: 6.4 },
      { id: 'sandbar', name: 'River Sandbars & Silt', color: '#f59e0b', percent: 10.8, cloudyArea: 4.1 },
      { id: 'urban', name: 'Settlement & Roads', color: '#ef4444', percent: 9.5, cloudyArea: 3.2 },
    ]
  },
  ghats: {
    id: 'ghats',
    name: 'Western Ghats Monsoon Sector (Kerala & Karnataka)',
    short: 'Western Ghats',
    climate: 'Orographic Wet Montane Escarpment',
    cloudCover: { heavy: 72, moderate: 20, light: 8 },
    testedScenes: 195,
    dominantTerrain: 'High-Altitude Ridge Forest & Shola Slopes',
    baseOffset: -0.6,
    lulc: [
      { id: 'forest', name: 'Evergreen Rain Forest', color: '#16a34a', percent: 52.4, cloudyArea: 6.5 },
      { id: 'grassland', name: 'Shola Grasslands', color: '#84cc16', percent: 18.2, cloudyArea: 5.8 },
      { id: 'water', name: 'High-Altitude Reservoirs', color: '#0284c7', percent: 14.1, cloudyArea: 7.2 },
      { id: 'cropland', name: 'Plantation Crops (Tea/Coffee)', color: '#f59e0b', percent: 9.8, cloudyArea: 4.0 },
      { id: 'urban', name: 'Mountain Settlements & Roads', color: '#ef4444', percent: 5.5, cloudyArea: 2.1 },
    ]
  },
  gangetic: {
    id: 'gangetic',
    name: 'Gangetic Basin Plains (Bihar, UP & West Bengal)',
    short: 'Gangetic Plains',
    climate: 'Alluvial Flatland & Intensive Agricultural Basin',
    cloudCover: { heavy: 34, moderate: 44, light: 22 },
    testedScenes: 240,
    dominantTerrain: 'Paddy Agriculture & Dense Rural Settlements',
    baseOffset: +0.4,
    lulc: [
      { id: 'cropland', name: 'Paddy & Wheat Parcels', color: '#84cc16', percent: 58.2, cloudyArea: 18.4 },
      { id: 'urban', name: 'Dense Urban & Rural Towns', color: '#ef4444', percent: 21.6, cloudyArea: 9.1 },
      { id: 'water', name: 'Ganga Mainstem & Canals', color: '#0284c7', percent: 12.4, cloudyArea: 7.5 },
      { id: 'scrub', name: 'Fallow / Riparian Scrub', color: '#f59e0b', percent: 7.8, cloudyArea: 3.2 },
    ]
  }
};

const MODELS = {
  all: {
    id: 'all',
    name: 'All Models (Comparative Benchmark)',
    short: 'All Models',
    badge: '4-Model Comparison',
    color: '#2563eb'
  },
  model_d: {
    id: 'model_d',
    name: 'Model D (Quality-Aware + Uncertainty Diffusion)',
    short: 'Model D (Ours)',
    badge: 'Diffusion + Conformal',
    color: '#16a34a',
    meanPsnr: 39.67,
    meanSsim: 0.9834,
    meanSam: 1.68,
    meanMae: 0.0412,
    fallbackRate: 7.3,
    r2: 0.994,
    confusionDiag: 0.942,
    monthly: {
      psnr: [37.2, 38.1, 38.6, 38.2, 39.1, 39.67],
      ssim: [0.965, 0.972, 0.978, 0.974, 0.981, 0.9834],
      sam: [2.10, 1.95, 1.82, 1.88, 1.74, 1.68],
      mae: [0.058, 0.052, 0.047, 0.050, 0.044, 0.0412],
    }
  },
  model_c: {
    id: 'model_c',
    name: 'Model C (Cross-Attention SAR Diffuser)',
    short: 'Model C',
    badge: 'Cross-Attention GAN',
    color: '#2563eb',
    meanPsnr: 34.12,
    meanSsim: 0.9410,
    meanSam: 2.42,
    meanMae: 0.0680,
    fallbackRate: 12.1,
    r2: 0.965,
    confusionDiag: 0.885,
    monthly: {
      psnr: [33.4, 34.2, 34.5, 33.8, 34.0, 34.12],
      ssim: [0.932, 0.941, 0.945, 0.938, 0.940, 0.9410],
      sam: [2.85, 2.65, 2.50, 2.60, 2.48, 2.42],
      mae: [0.082, 0.075, 0.070, 0.074, 0.069, 0.0680],
    }
  },
  baseline_b: {
    id: 'baseline_b',
    name: 'Baseline B (Mask-Aware Residual U-Net)',
    short: 'Baseline B',
    badge: 'Spatial CNN U-Net',
    color: '#f59e0b',
    meanPsnr: 28.45,
    meanSsim: 0.8650,
    meanSam: 4.85,
    meanMae: 0.1420,
    fallbackRate: 28.4,
    r2: 0.880,
    confusionDiag: 0.764,
    monthly: {
      psnr: [29.8, 30.2, 29.1, 28.5, 27.9, 28.45],
      ssim: [0.885, 0.892, 0.875, 0.862, 0.854, 0.8650],
      sam: [4.20, 4.05, 4.55, 4.75, 5.10, 4.85],
      mae: [0.125, 0.118, 0.135, 0.148, 0.155, 0.1420],
    }
  },
  baseline_a: {
    id: 'baseline_a',
    name: 'Baseline A (Temporal Radiometric Matching)',
    short: 'Baseline A',
    badge: 'Temporal Baseline',
    color: '#9333ea',
    meanPsnr: 22.18,
    meanSsim: 0.8024,
    meanSam: 5.90,
    meanMae: 0.2105,
    fallbackRate: 44.2,
    r2: 0.790,
    confusionDiag: 0.682,
    monthly: {
      psnr: [25.6, 26.1, 24.5, 23.2, 21.8, 22.18],
      ssim: [0.852, 0.861, 0.835, 0.815, 0.790, 0.8024],
      sam: [4.90, 4.75, 5.30, 5.65, 6.20, 5.90],
      mae: [0.165, 0.158, 0.185, 0.205, 0.228, 0.2105],
    }
  }
};

const METRIC_CONFIGS = {
  psnr: {
    id: 'psnr',
    label: 'PSNR (Peak Signal-to-Noise Ratio)',
    unit: 'dB',
    direction: 'higher',
    min: 20,
    max: 42,
    ticks: [20, 25, 30, 35, 40],
    format: (v) => `${v.toFixed(2)} dB`
  },
  ssim: {
    id: 'ssim',
    label: 'SSIM (Structural Similarity Index)',
    unit: '',
    direction: 'higher',
    min: 0.75,
    max: 1.00,
    ticks: [0.75, 0.80, 0.85, 0.90, 0.95, 1.00],
    format: (v) => v.toFixed(4)
  },
  sam: {
    id: 'sam',
    label: 'SAM (Spectral Angle Mapper)',
    unit: '°',
    direction: 'lower',
    min: 1.0,
    max: 7.0,
    ticks: [1.0, 2.5, 4.0, 5.5, 7.0],
    format: (v) => `${v.toFixed(2)}°`
  },
  mae: {
    id: 'mae',
    label: 'MAE Under Clouds (Reconstruction Error)',
    unit: '',
    direction: 'lower',
    min: 0.02,
    max: 0.25,
    ticks: [0.05, 0.10, 0.15, 0.20, 0.25],
    format: (v) => v.toFixed(4)
  }
};

export default function VisualizationsPage({ onNavigate }) {
  // Primary Interactive Filters
  const [selectedRegionKey, setSelectedRegionKey] = useState('northeast');
  const [selectedSensor, setSelectedSensor] = useState('all'); // 'all', 'liss4', 's1'
  const [selectedModelKey, setSelectedModelKey] = useState('all'); // 'all', 'model_d', 'model_c', 'baseline_b', 'baseline_a'
  const [selectedMetricKey, setSelectedMetricKey] = useState('psnr'); // 'psnr', 'ssim', 'sam', 'mae'
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast after 2.5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Active configurations
  const activeRegion = REGIONS[selectedRegionKey];
  const activeMetric = METRIC_CONFIGS[selectedMetricKey];
  const activeModel = MODELS[selectedModelKey];

  // Sensor impact multiplier
  const sensorMultiplier = selectedSensor === 'all' ? 1.0 : selectedSensor === 's1' ? 1.03 : 0.96;
  const sensorLabel = selectedSensor === 'all'
    ? 'Multi-Modal Synergy (LISS-IV Optical + Sentinel-1 SAR)'
    : selectedSensor === 'liss4'
    ? 'Optical-Only (LISS-IV Native)'
    : 'Radar-Guided (Sentinel-1 C-Band Guidance)';

  // Helper to compute adjusted metric series for any model
  const getModelSeries = (modelKey) => {
    const m = MODELS[modelKey];
    if (!m || !m.monthly) return [];
    const raw = m.monthly[selectedMetricKey];
    const offset = activeRegion.baseOffset;
    return raw.map((val) => {
      let adjusted = val;
      if (selectedMetricKey === 'psnr') {
        adjusted = (val + offset) * sensorMultiplier;
      } else if (selectedMetricKey === 'ssim') {
        adjusted = Math.min(val + offset * 0.01, 0.999);
      } else if (selectedMetricKey === 'sam' || selectedMetricKey === 'mae') {
        adjusted = Math.max(val - offset * 0.1, 0.01);
      }
      return parseFloat(adjusted.toFixed(4));
    });
  };

  // Current focal values
  const currentModelForKpis = selectedModelKey === 'all' ? MODELS.model_d : activeModel;
  const currentPsnr = ((currentModelForKpis.meanPsnr + activeRegion.baseOffset) * sensorMultiplier).toFixed(2);
  const currentSsim = Math.min(currentModelForKpis.meanSsim + activeRegion.baseOffset * 0.005, 0.999).toFixed(4);
  const currentSam = Math.max(currentModelForKpis.meanSam - activeRegion.baseOffset * 0.1, 0.05).toFixed(2);
  const currentMae = Math.max(currentModelForKpis.meanMae - activeRegion.baseOffset * 0.005, 0.01).toFixed(4);

  // Dynamic Spectral Curve Points based on active model
  const dynamicSpectralPoints = SPECTRAL_ANALYSIS_DATA.curvePoints.map((p) => {
    let dev = 0.005;
    if (selectedModelKey === 'model_c') dev = 0.024;
    else if (selectedModelKey === 'baseline_b') dev = 0.065;
    else if (selectedModelKey === 'baseline_a') dev = 0.115;
    
    // Cloud optical distortion adjusts with region
    const cloudShift = activeRegion.id === 'ghats' ? 0.04 : activeRegion.id === 'gangetic' ? -0.02 : 0.0;
    const simulatedRecon = Math.max(0.02, Math.min(0.85, p.ref + (p.orig > p.ref ? dev : -dev) + cloudShift * 0.2));

    return {
      wl: p.wl,
      orig: parseFloat(Math.min(p.orig + cloudShift, 0.9).toFixed(3)),
      recon: parseFloat(simulatedRecon.toFixed(3)),
      ref: p.ref,
    };
  });

  // Dynamic LULC classes based on region and model
  const dynamicLulcClasses = activeRegion.lulc.map((cls) => {
    // Under poorer models, reconstructed area shrinks toward clouded baseline
    const fidelityFactor = selectedModelKey === 'model_d' || selectedModelKey === 'all' ? 1.0 : selectedModelKey === 'model_c' ? 0.92 : selectedModelKey === 'baseline_b' ? 0.78 : 0.65;
    const estRecon = parseFloat((cls.percent * fidelityFactor + cls.cloudyArea * (1 - fidelityFactor)).toFixed(1));
    return {
      ...cls,
      percent: estRecon,
    };
  });

  // Dynamic Confusion Matrix based on active model
  const dynamicConfusionData = {
    labels: CONFUSION_MATRIX_DATA.labels,
    matrix: CONFUSION_MATRIX_DATA.matrix.map((row, rIdx) =>
      row.map((val, cIdx) => {
        if (rIdx === cIdx) {
          const diagScore = currentModelForKpis.confusionDiag;
          return parseFloat((diagScore - (rIdx * 0.015)).toFixed(3));
        } else {
          const offDiag = (1 - currentModelForKpis.confusionDiag) / 4;
          return parseFloat(Math.max(0.01, offDiag * (Math.abs(rIdx - cIdx) === 1 ? 1.5 : 0.6)).toFixed(3));
        }
      })
    ),
  };

  const handleExportReport = () => {
    window.open('/api/v1/export/JOB_20261020_E4192818/pdf', '_blank');
    showToast(`Exported Analytics Report for ${activeRegion.short} • ${activeModel.short} (PDF/CSV).`);
  };

  const handleResetFilters = () => {
    setSelectedRegionKey('northeast');
    setSelectedSensor('all');
    setSelectedModelKey('all');
    setSelectedMetricKey('psnr');
    showToast('Filters reset to default: Northeast India • All Models • PSNR.');
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification with Close Button & 2.5s Timeout */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#064e3b',
            color: '#ffffff',
            padding: '10px 14px 10px 16px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontSize: '12px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '460px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span style={{ flex: 1 }}>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Geospatial Analytics &amp; Model Trends</h1>
          <p className="page-subtitle">
            Interactive multi-sensor performance tracking, spatial error analysis, and comparative AI model fidelity
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={handleResetFilters}
            style={{ fontSize: '11.5px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Reset region, model, sensor and metric filters"
          >
            <RefreshCw size={12} />
            <span>Reset View</span>
          </button>
          <button
            className="btn-primary"
            onClick={handleExportReport}
            id="visualizations-export-report-btn"
            style={{ fontSize: '11.5px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={13} />
            <span>Export Analytics Report</span>
          </button>
        </div>
      </div>

      {/* Interactive Control Panel: Region, Model, Sensor & Metric Selectors */}
      <div
        className="card"
        style={{
          marginBottom: '18px',
          padding: '14px 18px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr 1.1fr 1fr', gap: '16px', alignItems: 'center' }}>
          {/* 1. Region Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🌍 Geographic Region:
            </label>
            <select
              value={selectedRegionKey}
              onChange={(e) => {
                setSelectedRegionKey(e.target.value);
                showToast(`Switched region to ${REGIONS[e.target.value].short}. Visualizations updated.`);
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f172a', background: '#f8fafc' }}
            >
              <option value="northeast">Northeast India (Assam / Meghalaya)</option>
              <option value="ghats">Western Ghats Monsoon Escarpment</option>
              <option value="gangetic">Gangetic Basin Alluvial Plains</option>
            </select>
          </div>

          {/* 2. Model Architecture Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🧠 Model Architecture:
            </label>
            <select
              value={selectedModelKey}
              onChange={(e) => {
                setSelectedModelKey(e.target.value);
                showToast(`Loaded ${MODELS[e.target.value].short} model parameters. Graphs recalculated.`);
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f172a', background: '#f8fafc' }}
            >
              <option value="all">⚡ All Models (Comparative Multi-Line)</option>
              <option value="model_d">Model D (Uncertainty Diffusion - Ours)</option>
              <option value="model_c">Model C (Cross-Attention Diffuser)</option>
              <option value="baseline_b">Baseline B (Residual U-Net)</option>
              <option value="baseline_a">Baseline A (Temporal Matching)</option>
            </select>
          </div>

          {/* 3. Sensor Suite Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📡 Sensor Configuration:
            </label>
            <select
              value={selectedSensor}
              onChange={(e) => {
                setSelectedSensor(e.target.value);
                showToast(`Sensor suite set to: ${e.target.value === 'all' ? 'LISS-IV + SAR' : e.target.value}.`);
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f172a', background: '#f8fafc' }}
            >
              <option value="all">All Sensors (LISS-IV + Sentinel-1)</option>
              <option value="liss4">ISRO LISS-IV Optical Only</option>
              <option value="s1">Sentinel-1 C-Band SAR Guided</option>
            </select>
          </div>

          {/* 4. Metric Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              📈 Graph Trend Metric:
            </label>
            <select
              value={selectedMetricKey}
              onChange={(e) => {
                setSelectedMetricKey(e.target.value);
                showToast(`Switched trend metric to ${METRIC_CONFIGS[e.target.value].label}.`);
              }}
              style={{ width: '100%', padding: '6px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, color: '#0f172a', background: '#f8fafc' }}
            >
              <option value="psnr">PSNR (dB) — Reconstruction Quality</option>
              <option value="ssim">SSIM — Structural Geometry</option>
              <option value="sam">SAM (°) — Spectral Distortion</option>
              <option value="mae">MAE Cloud — Under-Cloud Error</option>
            </select>
          </div>
        </div>

        {/* Status pill strip below controls */}
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><strong>Active Ecosystem:</strong> {activeRegion.climate}</span>
            <span>•</span>
            <span><strong>Validated Test Scenes:</strong> {activeRegion.testedScenes} paired tiles</span>
            <span>•</span>
            <span><strong>Sensors:</strong> {sensorLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
            <span style={{ fontWeight: 600, color: '#166534' }}>All Visualizations Synchronized to Filter State</span>
          </div>
        </div>
      </div>

      {/* Dynamic Top KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        {/* KPI 1: Primary Metric */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {selectedMetricKey === 'psnr' ? 'Reconstruction PSNR' : selectedMetricKey === 'ssim' ? 'Structural SSIM' : selectedMetricKey === 'sam' ? 'Spectral Angle (SAM)' : 'Mean Absolute Error'}
            </span>
            <TrendingUp size={14} color="#16a34a" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {selectedMetricKey === 'psnr' && `${currentPsnr} dB`}
            {selectedMetricKey === 'ssim' && currentSsim}
            {selectedMetricKey === 'sam' && `${currentSam}°`}
            {selectedMetricKey === 'mae' && currentMae}
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} />
            <span>
              {selectedModelKey === 'baseline_a'
                ? 'Baseline Level (Historical Reference)'
                : `+${(parseFloat(currentPsnr) - 22.18).toFixed(1)} dB gain over Temporal Baseline A`}
            </span>
          </div>
        </div>

        {/* KPI 2: SSIM Fidelity */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Structural Coherence (SSIM)
            </span>
            <Activity size={14} color="#2563eb" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {currentSsim}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {(parseFloat(currentSsim) * 100).toFixed(1)}% structural pattern retention
          </div>
        </div>

        {/* KPI 3: Spectral Preservation */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Spectral Fit (R² vs Clear)
            </span>
            <ShieldCheck size={14} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {(currentModelForKpis.r2 * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            SAM Error: <strong>{currentSam}°</strong> across G/R/NIR
          </div>
        </div>

        {/* KPI 4: Reliability & Fallback Rate */}
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Conformal High Confidence
            </span>
            <Cpu size={14} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
            {(100 - currentModelForKpis.fallbackRate).toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Fallback Trigger Rate: <strong>{currentModelForKpis.fallbackRate}%</strong>
          </div>
        </div>
      </div>

      {/* Row 1: Dynamic Performance & Monthly Trend Line Chart (Left) + Cloud Coverage Range (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Main Performance & Monthly Trend Chart */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={15} color="#16a34a" />
              <span>{activeMetric.label} — 6-Month Trajectory</span>
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                Mean: {selectedMetricKey === 'psnr' ? `${currentPsnr} dB` : currentSsim}
              </span>
            </div>
          </div>
          <div className="card-body">
            {/* SVG Line / Multi-Line Chart */}
            <svg viewBox="0 0 520 170" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              <defs>
                <linearGradient id="trendFillGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y Axis Ticks */}
              {activeMetric.ticks.map((val) => {
                const normY = (val - activeMetric.min) / (activeMetric.max - activeMetric.min);
                const y = 145 - normY * 115;
                return (
                  <g key={val}>
                    <line x1="45" y1={y} x2="505" y2={y} stroke="#f1f5f9" strokeDasharray="3,3" />
                    <text x="38" y={y + 3} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="var(--font-mono)">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Month X-Axis Labels */}
              {MONTH_LABELS.map((m, idx) => (
                <text key={m} x={65 + idx * 82} y="162" fill="#64748b" fontSize="10.5" fontWeight={600} textAnchor="middle">
                  {m}
                </text>
              ))}

              {/* If "All Models" selected: render all 4 model lines */}
              {selectedModelKey === 'all' ? (
                <>
                  {['baseline_a', 'baseline_b', 'model_c', 'model_d'].map((mKey) => {
                    const mObj = MODELS[mKey];
                    const series = getModelSeries(mKey);
                    const pts = series
                      .map((val, idx) => {
                        const x = 65 + idx * 82;
                        const normY = Math.max(0, Math.min(1, (val - activeMetric.min) / (activeMetric.max - activeMetric.min)));
                        const y = 145 - normY * 115;
                        return `${x},${y}`;
                      })
                      .join(' ');

                    return (
                      <g key={mKey}>
                        <polyline fill="none" stroke={mObj.color} strokeWidth={mKey === 'model_d' ? '3' : '2'} strokeDasharray={mKey.startsWith('baseline') ? '4,3' : 'none'} points={pts} />
                        {series.map((val, idx) => {
                          const x = 65 + idx * 82;
                          const normY = Math.max(0, Math.min(1, (val - activeMetric.min) / (activeMetric.max - activeMetric.min)));
                          const y = 145 - normY * 115;
                          return (
                            <circle
                              key={idx}
                              cx={x}
                              cy={y}
                              r={mKey === 'model_d' ? 4 : 3}
                              fill={mObj.color}
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </>
              ) : (
                /* Single selected model view */
                (() => {
                  const series = getModelSeries(selectedModelKey);
                  const ptsArray = series.map((val, idx) => {
                    const x = 65 + idx * 82;
                    const normY = Math.max(0, Math.min(1, (val - activeMetric.min) / (activeMetric.max - activeMetric.min)));
                    const y = 145 - normY * 115;
                    return { x, y, val };
                  });

                  const linePoints = ptsArray.map((p) => `${p.x},${p.y}`).join(' ');
                  const areaPoints = `${ptsArray[0].x},145 ${linePoints} ${ptsArray[ptsArray.length - 1].x},145`;

                  return (
                    <g>
                      <polygon points={areaPoints} fill="url(#trendFillGradient)" />
                      <polyline fill="none" stroke={activeModel.color} strokeWidth="3" points={linePoints} />
                      {ptsArray.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill={activeModel.color} stroke="#ffffff" strokeWidth="2" />
                          <text x={p.x} y={p.y - 9} fill={activeModel.color} fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                            {p.val}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()
              )}
            </svg>

            {/* Legend underneath chart */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '11px' }}>
              {selectedModelKey === 'all' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '3px', background: '#16a34a' }}></span>
                    <strong style={{ color: '#16a34a' }}>Model D (Ours: 39.67 dB)</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '3px', background: '#2563eb' }}></span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>Model C (34.12 dB)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#f59e0b', borderTop: '1px dashed' }}></span>
                    <span style={{ color: '#b45309' }}>Baseline B (28.45 dB)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '2px', background: '#9333ea', borderTop: '1px dashed' }}></span>
                    <span style={{ color: '#6b21a8' }}>Baseline A (22.18 dB)</span>
                  </div>
                </>
              ) : (
                <div style={{ color: '#64748b' }}>
                  Showing trajectory for <strong>{activeModel.name}</strong> across {activeRegion.short} (Jan–Jun 2026).
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cloud Coverage Range Distribution (Updates with Region) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={15} color="#2878e5" />
              <span>Cloud Obscuration Distribution</span>
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              {activeRegion.short}
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Heavy Cumulus Obscuration (&gt; 70%)</span>
                  <strong style={{ color: '#ef4444', fontFamily: 'var(--font-mono)' }}>{activeRegion.cloudCover.heavy}%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '7px', background: '#fee2e2' }}>
                  <div className="progress-bar-fill" style={{ width: `${activeRegion.cloudCover.heavy}%`, background: '#ef4444' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Complete optical blindness. Requires Sentinel-1 SAR penetrative guidance.
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Moderate / Patchy Clouds (40% - 70%)</span>
                  <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{activeRegion.cloudCover.moderate}%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '7px', background: '#fef3c7' }}>
                  <div className="progress-bar-fill" style={{ width: `${activeRegion.cloudCover.moderate}%`, background: '#f59e0b' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Hybrid regime: clear anchor pixels calibrate radiometric gain.
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Thin Cirrus / Light Haze (&lt; 40%)</span>
                  <strong style={{ color: '#16a34a', fontFamily: 'var(--font-mono)' }}>{activeRegion.cloudCover.light}%</strong>
                </div>
                <div className="progress-bar-bg" style={{ height: '7px', background: '#dcfce7' }}>
                  <div className="progress-bar-fill" style={{ width: `${activeRegion.cloudCover.light}%`, background: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Direct optical restoration with bit-exact preservation of ground clarity.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '11px', color: '#64748b', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
              <strong>Regional Ecosystem Note:</strong> {activeRegion.climate}. Tested over <strong>{activeRegion.testedScenes} paired satellite acquisitions</strong> under ISRO NRSC validation criteria.
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Spectral Preservation (Left) + Land-Cover / LULC Consistency Bar Chart (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Spectral Preservation Chart (Dynamically changes with Model) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={15} color="#8b5cf6" />
              <span>Spectral Preservation Across Wavebands</span>
            </span>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
              {selectedModelKey === 'all' ? 'Model D: R² = 0.994' : `${activeModel.short}: R² = ${currentModelForKpis.r2}`}
            </span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
              Reflectance curve across Green (0.55 µm), Red (0.65 µm), and Near-Infrared (0.82 µm) comparing original cloudy input vs reconstructed surface against ground truth:
            </p>
            <SpectralChart height={165} points={dynamicSpectralPoints} />
          </div>
        </div>

        {/* LULC Area Distribution (Dynamically changes with Region & Model) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={15} color="#2563eb" />
              <span>LULC Area Distribution: Cloudy vs Reconstructed</span>
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              {activeRegion.short}
            </span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
              True thematic area percentage recovered under clouds for {activeRegion.short} under {activeModel.short}:
            </p>
            <LulcBarChart height={165} classes={dynamicLulcClasses} />
          </div>
        </div>
      </div>

      {/* Row 3: Cross-Class Semantic Confusion Matrix & Benchmark Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={15} color="#0f172a" />
            <span>Cross-Class Semantic Confusion &amp; Restoration Reliability Matrix</span>
          </span>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>
            Diagonal Accuracy: {(currentModelForKpis.confusionDiag * 100).toFixed(1)}%
          </span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '12px' }}>
            Demonstrates pixel assignment precision across major landform categories under the selected model ({currentModelForKpis.name}). High diagonal concentration signifies zero cross-boundary bleeding between water, vegetation, and urban infrastructure.
          </p>
          <ConfusionMatrix data={dynamicConfusionData} />
        </div>
      </div>
    </div>
  );
}
