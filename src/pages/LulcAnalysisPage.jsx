import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  Activity,
  Trees,
  Waves,
  Building2,
  Compass,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Crosshair,
  Info
} from 'lucide-react';
import SatelliteMapCard from '../components/satellite/SatelliteMapCard';
import LulcBarChart from '../components/analytics/LulcBarChart';
import ConfusionMatrix from '../components/analytics/ConfusionMatrix';
import {
  SATELLITE_ASSETS,
  LULC_CLASSES,
  PRIMARY_SCENE_INFO,
  SUBCLOUD_CLASSES,
  SUBCLOUD_DEMO_SUMMARY,
  VEGETATION_HEALTH_TIERS,
  VEGETATION_HEALTH_SUMMARY
} from '../data/mockData';

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

export default function LulcAnalysisPage({ onNavigate }) {
  // Navigation Tabs: 'subcloud' | 'vegetation' | 'standard'
  const [activeTab, setActiveTab] = useState('subcloud');

  // Common Controls
  const [selectedImage, setSelectedImage] = useState('Assam_12JUN2023.tif');
  const [isRunning, setIsRunning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Sub-Cloud Labelling State
  const [subcloudLayer, setSubcloudLayer] = useState('masked'); // 'masked' | 'full' | 'recon' | 'cloudy'
  const [selectedClassFilter, setSelectedClassFilter] = useState(null);

  // Vegetation Health State
  const [vegLayer, setVegLayer] = useState('continuous'); // 'continuous' | 'discrete' | 'fcc' | 'recon'
  const [selectedTierFilter, setSelectedTierFilter] = useState(null);

  // Interactive Pixel Probe State
  const [probeData, setProbeData] = useState({
    coords: { x: 420, y: 310, norm_x: 0.41, norm_y: 0.30 },
    wasBeneathCloud: true,
    classLabel: 'Dense Forest & Canopy',
    classColor: '#15803d',
    nir: 0.68,
    red: 0.17,
    green: 0.14,
    ndvi: 0.60,
    savi: 0.42,
    healthTier: 'Healthy Canopy / Active Biomass',
    healthColor: '#84cc16'
  });

  // Standard LULC Page State
  const [model, setModel] = useState('Random Forest (Trained)');
  const [analysisType, setAnalysisType] = useState('Original vs Reconstructed');
  const [roiEnabled, setRoiEnabled] = useState(true);
  const [roiTool, setRoiTool] = useState('Polygon');
  const [previewClass, setPreviewClass] = useState('agriculture');

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = Math.max(0, Math.min(1, clickX / rect.width));
    const normY = Math.max(0, Math.min(1, clickY / rect.height));

    // Call backend probe endpoint or fallback gracefully
    fetch(`/api/v1/analytics/probe-pixel?norm_x=${normX.toFixed(4)}&norm_y=${normY.toFixed(4)}`)
      .then((res) => {
        if (!res.ok) throw new Error('API probe fallback');
        return res.json();
      })
      .then((data) => {
        setProbeData({
          coords: {
            x: data.pixel_coord.x,
            y: data.pixel_coord.y,
            norm_x: normX,
            norm_y: normY,
          },
          wasBeneathCloud: data.was_beneath_cloud,
          classLabel: data.terrain_class,
          classColor: data.terrain_color,
          nir: data.reflectance.nir_b4,
          red: data.reflectance.red_b3,
          green: data.reflectance.green_b2,
          ndvi: data.vegetation.ndvi,
          savi: data.vegetation.savi,
          healthTier: data.vegetation.tier_name,
          healthColor: data.vegetation.hex,
        });
      })
      .catch(() => {
        // Fast client calculation fallback
        const isCloudArea = normX > 0.15 && normX < 0.85 && normY > 0.10 && normY < 0.85;
        const pseudoNdvi = Number((0.15 + (Math.sin(normX * 12) + Math.cos(normY * 10)) * 0.35 + 0.30).toFixed(2));
        const clampedNdvi = Math.max(-0.2, Math.min(0.85, pseudoNdvi));
        
        let label = 'Cropland / Agriculture';
        let color = '#eab308';
        if (normY < 0.25 && normX < 0.4) {
          label = 'Water Bodies (River)';
          color = '#2563eb';
        } else if (clampedNdvi > 0.5) {
          label = 'Dense Forest & Canopy';
          color = '#15803d';
        } else if (normX > 0.7 && normY > 0.6) {
          label = 'Mountain & High Relief';
          color = '#64748b';
        } else if (clampedNdvi < 0.15) {
          label = 'Roads / Infrastructure';
          color = '#f97316';
        }

        setProbeData({
          coords: { x: Math.round(normX * 1024), y: Math.round(normY * 1024), norm_x: normX, norm_y: normY },
          wasBeneathCloud: isCloudArea,
          classLabel: label,
          classColor: color,
          nir: Number((0.35 + clampedNdvi * 0.4).toFixed(2)),
          red: Number((0.20 - clampedNdvi * 0.1).toFixed(2)),
          green: 0.16,
          ndvi: clampedNdvi,
          savi: Number((clampedNdvi * 0.75).toFixed(2)),
          healthTier: clampedNdvi >= 0.7 ? 'Vibrant Canopy' : clampedNdvi >= 0.45 ? 'Healthy Biomass' : clampedNdvi >= 0.25 ? 'Moderate Vigor' : 'Stressed Canopy',
          healthColor: clampedNdvi >= 0.7 ? '#15803d' : clampedNdvi >= 0.45 ? '#84cc16' : clampedNdvi >= 0.25 ? '#f59e0b' : '#ef4444'
        });
      });
  };

  const handleRunAnalysis = () => {
    setIsRunning(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setAnalysisResult({
        overallAccuracy: '78.64%',
        accuracyGain: '+74.95%',
        validPixels: '262,144',
        dominantClass: 'Dense Forest & Canopy (35.8%)',
        subcloudRecovered: '13.59 km² (51.46% of scene)'
      });
    }, 600);
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
      {/* Top Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Sub-Cloud Labelling & Vegetation Health Engine</h1>
          <p className="page-subtitle">
            Physics-guided classification beneath cloud obscuration (Water, City, Roads, Forest, Mountain) & NIR-driven canopy health
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => handleExport('csv')}
            id="lulc-export-csv-btn"
          >
            <Download size={13} />
            <span>Export Analytics (CSV)</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => handleExport('pdf')}
            id="lulc-export-report-btn"
          >
            <FileText size={13} />
            <span>Scientific Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: '#e2e8f0',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <button
          onClick={() => setActiveTab('subcloud')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'subcloud' ? '#ffffff' : 'transparent',
            color: activeTab === 'subcloud' ? '#1d4ed8' : '#475569',
            boxShadow: activeTab === 'subcloud' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Compass size={16} />
          <span>Under-Cloud Terrain Labelling Engine</span>
          <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '10px' }}>
            New
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vegetation')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'vegetation' ? '#ffffff' : 'transparent',
            color: activeTab === 'vegetation' ? '#15803d' : '#475569',
            boxShadow: activeTab === 'vegetation' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Activity size={16} />
          <span>NIR Vegetation Health (NDVI / SAVI)</span>
          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '10px' }}>
            Multi-Spectral
          </span>
        </button>

        <button
          onClick={() => setActiveTab('standard')}
          style={{
            flex: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'standard' ? '#ffffff' : 'transparent',
            color: activeTab === 'standard' ? '#0f172a' : '#475569',
            boxShadow: activeTab === 'standard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={16} />
          <span>Standard 8-Class LULC Benchmark</span>
        </button>
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
              <strong>Sub-Surface Analysis Complete:</strong> Recovered: <strong>{analysisResult.subcloudRecovered}</strong> • Dominant: <strong>{analysisResult.dominantClass}</strong> • Classification Accuracy: <strong>{analysisResult.overallAccuracy}</strong>
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

      {/* =========================================================================
          TAB 1: UNDER-CLOUD TERRAIN LABELLING ENGINE
          ========================================================================= */}
      {activeTab === 'subcloud' && (
        <div>
          {/* Top KPI Cards for Sub-Cloud Terrain */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div className="card" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cloud Occlusion</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {SUBCLOUD_DEMO_SUMMARY.cloudCoveredAreaKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                {SUBCLOUD_DEMO_SUMMARY.cloudCoveragePct}% of 26.42 km² scene
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, textTransform: 'uppercase' }}>Water Bodies</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                {SUBCLOUD_DEMO_SUMMARY.waterBodiesKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                River channels & oxbow lakes
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #f97316' }}>
              <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600, textTransform: 'uppercase' }}>Road Network</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                {SUBCLOUD_DEMO_SUMMARY.roadNetworkKm} km
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Linear transport corridors
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #15803d' }}>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Forest Canopy</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                {SUBCLOUD_DEMO_SUMMARY.forestKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                35.8% of sub-cloud terrain
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #64748b' }}>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Mountain Slopes</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                {SUBCLOUD_DEMO_SUMMARY.mountainKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                High-relief topography
              </div>
            </div>
          </div>

          {/* Main Sub-Cloud Workspace (Interactive Map + Probe Panel) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '16px', marginBottom: '20px' }}>
            {/* Interactive Image Canvas Card */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={16} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>
                    Sub-Cloud Thematic Surface Inspector (Click on map to probe pixels)
                  </span>
                </div>
                {/* Layer Selector */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setSubcloudLayer('masked')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subcloudLayer === 'masked' ? '#2563eb' : 'transparent',
                      color: subcloudLayer === 'masked' ? '#ffffff' : '#475569',
                    }}
                  >
                    Sub-Cloud Only
                  </button>
                  <button
                    onClick={() => setSubcloudLayer('full')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subcloudLayer === 'full' ? '#2563eb' : 'transparent',
                      color: subcloudLayer === 'full' ? '#ffffff' : '#475569',
                    }}
                  >
                    Full Scene
                  </button>
                  <button
                    onClick={() => setSubcloudLayer('recon')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subcloudLayer === 'recon' ? '#2563eb' : 'transparent',
                      color: subcloudLayer === 'recon' ? '#ffffff' : '#475569',
                    }}
                  >
                    Reconstructed Optical
                  </button>
                  <button
                    onClick={() => setSubcloudLayer('cloudy')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: subcloudLayer === 'cloudy' ? '#2563eb' : 'transparent',
                      color: subcloudLayer === 'cloudy' ? '#ffffff' : '#475569',
                    }}
                  >
                    Original Cloudy
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ padding: '12px' }}>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    cursor: 'crosshair',
                    aspectRatio: '16 / 11',
                    background: '#0f172a'
                  }}
                  onClick={handleImageClick}
                >
                  <img
                    src={
                      subcloudLayer === 'masked'
                        ? SATELLITE_ASSETS.subcloudTerrainMasked
                        : subcloudLayer === 'full'
                        ? SATELLITE_ASSETS.subcloudTerrainFull
                        : subcloudLayer === 'recon'
                        ? SATELLITE_ASSETS.reconstructed
                        : SATELLITE_ASSETS.cloudy
                    }
                    alt="Subcloud thematic layer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Interactive Probe Crosshair Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${probeData.coords.norm_x * 100}%`,
                      top: `${probeData.coords.norm_y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,0.8)',
                      }}
                    />
                    <div style={{ position: 'absolute', width: '2px', height: '34px', background: '#ffffff', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', width: '34px', height: '2px', background: '#ffffff', opacity: 0.9 }} />
                    <span
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '-10px',
                        background: 'rgba(15, 23, 42, 0.92)',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${probeData.classColor}`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      {probeData.classLabel}
                    </span>
                  </div>

                  {/* On-Map Legend Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(15, 23, 42, 0.88)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Crosshair size={13} color="#38bdf8" />
                    <span>Coordinates: [{probeData.coords.x}, {probeData.coords.y}]</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: probeData.wasBeneathCloud ? '#fbbf24' : '#4ade80' }}>
                      {probeData.wasBeneathCloud ? '⚡ Recovered Under Cloud' : '☀️ Cloud-Free Zone'}
                    </span>
                  </div>
                </div>

                {/* Sub-Cloud Classes Filter Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {SUBCLOUD_CLASSES.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassFilter(selectedClassFilter === cls.key ? null : cls.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 9px',
                        borderRadius: '6px',
                        border: selectedClassFilter === cls.key ? `2px solid ${cls.color}` : '1px solid #cbd5e1',
                        background: selectedClassFilter === cls.key ? `${cls.color}15` : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: selectedClassFilter === cls.key ? 700 : 500,
                        color: '#1e293b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: cls.color }} />
                      <span>{cls.name}</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>({cls.subcloudAreaKm2} km²)</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sub-Cloud Pixel Probe & Taxonomy Analytics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Probed Pixel Inspection Card */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crosshair size={15} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '12.5px' }}>Probed Pixel Spectral Diagnostic</span>
                </div>
                <div className="card-body" style={{ padding: '14px' }}>
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            background: probeData.classColor,
                          }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {probeData.classLabel}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: probeData.wasBeneathCloud ? '#fef3c7' : '#dcfce7',
                          color: probeData.wasBeneathCloud ? '#92400e' : '#166534',
                        }}
                      >
                        {probeData.wasBeneathCloud ? 'Beneath Cloud' : 'Clear Sky'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
                      <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Green (B2)</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{probeData.green}</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Red (B3)</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{probeData.red}</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>NIR (B4)</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>{probeData.nir}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '12px' }}>
                      <span style={{ color: '#475569' }}>Calculated NDVI:</span>
                      <strong style={{ color: '#0f172a' }}>{probeData.ndvi}</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    Click anywhere on the image canvas above to probe underlying reflectance bands, evaluate whether the pixel was occluded, and inspect the classified sub-surface terrain.
                  </p>
                </div>
              </div>

              {/* Sub-Cloud Area Distribution Table */}
              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <span style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Revealed Sub-Cloud Inventory (13.59 km²)
                  </span>
                </div>
                <div className="card-body" style={{ padding: '8px 12px' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '6px 4px' }}>Terrain Feature</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>Sub-Cloud Area</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>% of Cloud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SUBCLOUD_CLASSES.map((cls) => (
                        <tr
                          key={cls.id}
                          style={{
                            borderBottom: '1px solid #f8fafc',
                            background: selectedClassFilter === cls.key ? `${cls.color}15` : 'transparent',
                          }}
                        >
                          <td style={{ padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: cls.color }} />
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{cls.name}</span>
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {cls.subcloudAreaKm2} km²
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                            {cls.subcloudPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: NIR VEGETATION HEALTH ANALYSIS (NDVI / SAVI)
          ========================================================================= */}
      {activeTab === 'vegetation' && (
        <div>
          {/* Top KPI Cards for NIR Vegetation Health */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Sub-Cloud Mean NDVI</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {VEGETATION_HEALTH_SUMMARY.meanNdviBeneathCloud}
              </div>
              <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '2px' }}>
                Restored from 0.00 (Occluded)
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #84cc16' }}>
              <div style={{ fontSize: '11px', color: '#65a30d', fontWeight: 600, textTransform: 'uppercase' }}>Recovered Biomass</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {VEGETATION_HEALTH_SUMMARY.recoveredVegetationKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Active vegetation canopy
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase' }}>Stress Alert Area</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}>
                {VEGETATION_HEALTH_SUMMARY.stressedVegetationKm2} km²
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Low-vigor / stressed crops
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Sub-Cloud Mean SAVI</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                {VEGETATION_HEALTH_SUMMARY.meanSaviBeneathCloud}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Soil-adjusted index (L=0.5)
              </div>
            </div>

            <div className="card" style={{ padding: '12px 14px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, textTransform: 'uppercase' }}>NIR Penetration Gain</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#7c3aed', marginTop: '4px' }}>
                {VEGETATION_HEALTH_SUMMARY.nirReflectionGain.split(' ')[0]}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Band 4 optical restoration
              </div>
            </div>
          </div>

          {/* Main Vegetation Health Analysis Canvas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '16px', marginBottom: '20px' }}>
            {/* Map Canvas */}
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="#16a34a" />
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>
                    NIR Vegetation Health Inspector
                  </span>
                </div>

                {/* Layer Toggle */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    onClick={() => setVegLayer('continuous')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: vegLayer === 'continuous' ? '#16a34a' : 'transparent',
                      color: vegLayer === 'continuous' ? '#ffffff' : '#475569',
                    }}
                  >
                    Continuous NDVI
                  </button>
                  <button
                    onClick={() => setVegLayer('discrete')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: vegLayer === 'discrete' ? '#16a34a' : 'transparent',
                      color: vegLayer === 'discrete' ? '#ffffff' : '#475569',
                    }}
                  >
                    5-Tier Vigor Map
                  </button>
                  <button
                    onClick={() => setVegLayer('fcc')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: vegLayer === 'fcc' ? '#16a34a' : 'transparent',
                      color: vegLayer === 'fcc' ? '#ffffff' : '#475569',
                    }}
                  >
                    False Color Composite (FCC)
                  </button>
                  <button
                    onClick={() => setVegLayer('recon')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      background: vegLayer === 'recon' ? '#16a34a' : 'transparent',
                      color: vegLayer === 'recon' ? '#ffffff' : '#475569',
                    }}
                  >
                    Natural Optical
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ padding: '12px' }}>
                <div
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #cbd5e1',
                    cursor: 'crosshair',
                    aspectRatio: '16 / 11',
                    background: '#0f172a'
                  }}
                  onClick={handleImageClick}
                >
                  <img
                    src={
                      vegLayer === 'continuous'
                        ? SATELLITE_ASSETS.vegetationHealthNdvi
                        : vegLayer === 'discrete'
                        ? SATELLITE_ASSETS.vegetationHealthDiscrete
                        : vegLayer === 'fcc'
                        ? SATELLITE_ASSETS.fcc
                        : SATELLITE_ASSETS.reconstructed
                    }
                    alt="Vegetation Health Layer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${probeData.coords.norm_x * 100}%`,
                      top: `${probeData.coords.norm_y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #ffffff',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px rgba(0,0,0,0.8)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '-10px',
                        background: 'rgba(15, 23, 42, 0.92)',
                        color: '#ffffff',
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${probeData.healthColor}`,
                      }}
                    >
                      NDVI: {probeData.ndvi} ({probeData.healthTier.split('/')[0]})
                    </span>
                  </div>

                  {/* Continuous NDVI Color Scale Legend Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(15, 23, 42, 0.90)',
                      backdropFilter: 'blur(4px)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Water / Built (NDVI &lt; 0.1)</span>
                      <span style={{ color: '#f87171' }}>Stressed (0.1 - 0.25)</span>
                      <span style={{ color: '#fbbf24' }}>Moderate (0.25 - 0.45)</span>
                      <span style={{ color: '#a3e635' }}>Healthy (0.45 - 0.7)</span>
                      <span style={{ color: '#4ade80' }}>Vibrant (&gt; 0.7)</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'linear-gradient(to right, #475569 0%, #ef4444 20%, #f59e0b 45%, #84cc16 70%, #15803d 100%)',
                      }}
                    />
                  </div>
                </div>

                {/* Formula Callout */}
                <div style={{ marginTop: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Normalized Difference Vegetation Index (NDVI):</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>(NIR - Red) / (NIR + Red)</span> • LISS-IV Bands: B4 (0.77-0.86 µm) &amp; B3 (0.62-0.68 µm)
                  </div>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>Physical Remote Sensing Formula</span>
                </div>
              </div>
            </div>

            {/* Vegetation Health Right Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Probed NIR Diagnostic */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crosshair size={15} color="#16a34a" />
                  <span style={{ fontWeight: 700, fontSize: '12.5px' }}>Probed Canopy Health Diagnostic</span>
                </div>
                <div className="card-body" style={{ padding: '14px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {probeData.healthTier}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: probeData.healthColor,
                          color: '#ffffff',
                        }}
                      >
                        NDVI: {probeData.ndvi}
                      </span>
                    </div>

                    <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Near-Infrared Reflectance</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed' }}>{probeData.nir}</div>
                      </div>
                      <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>Red Reflectance</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>{probeData.red}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#475569' }}>
                      <span>Soil-Adjusted Index (SAVI):</span>
                      <strong>{probeData.savi}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5-Tier Health Breakdown Table */}
              <div className="card" style={{ flex: 1 }}>
                <div className="card-header">
                  <span style={{ fontWeight: 700, fontSize: '12.5px' }}>
                    Sub-Cloud Vegetation Health Breakdown
                  </span>
                </div>
                <div className="card-body" style={{ padding: '8px 12px' }}>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '6px 4px' }}>Health Status</th>
                        <th style={{ padding: '6px 4px' }}>Range</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>Area (km²)</th>
                        <th style={{ padding: '6px 4px', textAlign: 'right' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VEGETATION_HEALTH_TIERS.map((tier) => (
                        <tr key={tier.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '6px 4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: tier.hex }} />
                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{tier.status}</span>
                          </td>
                          <td style={{ padding: '6px 4px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                            {tier.range}
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            {tier.subcloudAreaKm2}
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                            {tier.subcloudPct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STANDARD 8-CLASS LULC BENCHMARK
          ========================================================================= */}
      {activeTab === 'standard' && (
        <div>
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
              {/* Select Image */}
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
            <SatelliteMapCard
              title="1. Cloudy Input (Natural RGB)"
              imageSrc={DATASET_CONFIG[selectedImage]?.cloudy || SATELLITE_ASSETS.cloudy}
              scale="2 km"
              aspectRatio="16 / 12"
            />
            <SatelliteMapCard
              title="2. Cloudy Input - LULC Map"
              imageSrc={DATASET_CONFIG[selectedImage]?.lulcCloudy || SATELLITE_ASSETS.lulcCloudy}
              scale="2 km"
              aspectRatio="16 / 12"
            />
            <SatelliteMapCard
              title="3. Reconstructed (Cloud-Free)"
              imageSrc={DATASET_CONFIG[selectedImage]?.reconstructed || SATELLITE_ASSETS.reconstructed}
              scale="2 km"
              aspectRatio="16 / 12"
            />
            <SatelliteMapCard
              title="4. Reconstructed - LULC Map"
              imageSrc={DATASET_CONFIG[selectedImage]?.lulcReconstructed || SATELLITE_ASSETS.lulcReconstructed}
              scale="2 km"
              aspectRatio="16 / 12"
            />

            {/* Legend */}
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

          {/* Analytics Grid: Bar Chart + Confusion Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Class Distribution: Cloudy vs Reconstructed</span>
              </div>
              <div className="card-body">
                <LulcBarChart />
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Downstream Classification Confusion Matrix</span>
              </div>
              <div className="card-body">
                <ConfusionMatrix />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
