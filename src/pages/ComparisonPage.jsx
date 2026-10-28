import React, { useState } from 'react';
import {
  Share2,
  Sliders,
  Square,
  Pentagon,
  MapPin,
  RotateCcw,
  Eye,
  Layers,
  Crosshair,
  Maximize2,
  Info,
} from 'lucide-react';
import ComparisonViewer from '../components/satellite/ComparisonViewer';
import SpectralChart from '../components/analytics/SpectralChart';
import { SATELLITE_ASSETS, PRIMARY_SCENE_INFO } from '../data/mockData';

export default function ComparisonPage({ onNavigate }) {
  const [viewMode, setViewMode] = useState('Slider');
  const [spectralMode, setSpectralMode] = useState('Natural True Color (RGB)');
  const [activeThumbnail, setActiveThumbnail] = useState('Natural RGB');
  const [opacity, setOpacity] = useState(50);
  const [selectedRoi, setSelectedRoi] = useState('Rectangle');
  const [toastMessage, setToastMessage] = useState(null);
  const [overlayMaskOutline, setOverlayMaskOutline] = useState(false);
  const [overlayConfidenceHeatmap, setOverlayConfidenceHeatmap] = useState(false);
  const [isEvaluationMode, setIsEvaluationMode] = useState(false);

  const showToast = (title, desc) => {
    setToastMessage({ title, desc });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShare = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(window.location.href);
      }
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }
    showToast('Link Copied', 'Comparison scene URL copied to clipboard.');
  };

  const handleResetView = () => {
    setSelectedRoi(null);
    setOpacity(50);
    setViewMode('Slider');
    setActiveThumbnail('Natural RGB');
    setPixelPos({ x: 1248, y: 832, e: 392448.2, n: 3021841.7 });
    showToast('View Reset', 'ROI boundary, opacity, and zoom reset to full frame scene.');
  };

  // Layer toggles
  const [layerCloudy, setLayerCloudy] = useState(true);
  const [layerRecon, setLayerRecon] = useState(true);
  const [layerTemporal, setLayerTemporal] = useState(false);
  const [layerSar, setLayerSar] = useState(false);
  const [layerMask, setLayerMask] = useState(false);

  // Inspector pixel position
  const [pixelPos, setPixelPos] = useState({ x: 1248, y: 832, e: 392448.2, n: 3021841.7 });

  const thumbnails = [
    { id: 'Natural RGB', label: 'Natural RGB', src: SATELLITE_ASSETS.cropAgriAfter },
    { id: 'False Color (FCC)', label: 'False Color (FCC)', src: SATELLITE_ASSETS.fcc },
    { id: 'Cloud/Shadow Mask', label: 'Cloud/Shadow Mask', src: SATELLITE_ASSETS.mask },
    { id: 'Sentinel-1 SAR (VV/VH)', label: 'Sentinel-1 SAR (VV/VH)', src: SATELLITE_ASSETS.sar },
    { id: 'Temporal Reference', label: 'Temporal Reference (01-NOV-2023)', src: SATELLITE_ASSETS.temporal },
    { id: 'Confidence Map', label: 'Confidence Map', src: SATELLITE_ASSETS.confidence },
  ];

  const getBeforeImage = () => {
    if (activeThumbnail === 'Cloud/Shadow Mask') return SATELLITE_ASSETS.mask;
    if (activeThumbnail === 'Sentinel-1 SAR (VV/VH)') return SATELLITE_ASSETS.sar;
    return SATELLITE_ASSETS.cloudy;
  };

  const getAfterImage = () => {
    if (activeThumbnail === 'False Color (FCC)' || spectralMode.includes('FCC')) return SATELLITE_ASSETS.fcc;
    if (activeThumbnail === 'Temporal Reference') return SATELLITE_ASSETS.temporal;
    if (activeThumbnail === 'Confidence Map') return SATELLITE_ASSETS.confidence;
    return SATELLITE_ASSETS.reconstructed;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast Notification */}
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontWeight: 700 }}>{toastMessage.title}:</span>
          <span>{toastMessage.desc}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Image Comparison</h1>
          <p className="page-subtitle">
            Explore cloudy input, reconstructed output and reference imagery with interactive side-by-side comparison
          </p>
        </div>

        {/* Controls, Modes & Overlays */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Mode Toggle: Normal vs Evaluation */}
          <div
            style={{
              display: 'flex',
              background: '#e2e8f0',
              borderRadius: '6px',
              padding: '2px',
              border: isEvaluationMode ? '1px solid #16a34a' : '1px solid #cbd5e1',
            }}
          >
            <button
              onClick={() => setIsEvaluationMode(false)}
              id="comparison-mode-normal"
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: !isEvaluationMode ? '#0f172a' : 'transparent',
                color: !isEvaluationMode ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Real operational mode: ground truth under clouds is hidden so metrics are withheld"
            >
              Normal Mode
            </button>
            <button
              onClick={() => setIsEvaluationMode(true)}
              id="comparison-mode-evaluation"
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                background: isEvaluationMode ? '#16a34a' : 'transparent',
                color: isEvaluationMode ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Evaluation mode: verifies against paired clear reference or synthetic cloud test"
            >
              Evaluate Mode
            </button>
          </div>

          {/* Overlays Toggle Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Overlays:</span>
            <button
              id="toggle-cloud-mask-outline"
              onClick={() => setOverlayMaskOutline(!overlayMaskOutline)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                border: overlayMaskOutline ? '1px solid #0284c7' : '1px solid #cbd5e1',
                background: overlayMaskOutline ? '#e0f2fe' : '#ffffff',
                color: overlayMaskOutline ? '#0369a1' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cloud Mask Outline
            </button>
            <button
              id="toggle-confidence-heatmap"
              onClick={() => setOverlayConfidenceHeatmap(!overlayConfidenceHeatmap)}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                border: overlayConfidenceHeatmap ? '1px solid #16a34a' : '1px solid #cbd5e1',
                background: overlayConfidenceHeatmap ? '#f0fdf4' : '#ffffff',
                color: overlayConfidenceHeatmap ? '#15803d' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Confidence Heatmap
            </button>
          </div>

          {/* View Mode Buttons */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
            {['Side by Side', 'Slider', 'Triple View'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: viewMode === mode ? '#16a34a' : 'transparent',
                  color: viewMode === mode ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Spectral Mode Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Color:</span>
            <select
              value={spectralMode}
              onChange={(e) => setSpectralMode(e.target.value)}
              style={{
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '11.5px',
                background: '#ffffff',
                fontWeight: 500,
              }}
            >
              <option value="Natural True Color (RGB)">True Color (RGB)</option>
              <option value="False Color Composite (FCC)">False Color (FCC: NIR-R-G)</option>
            </select>
          </div>

          {/* Share Button */}
          <button
            className="btn-secondary"
            onClick={handleShare}
            id="comparison-share-btn"
            style={{ padding: '5px 10px', fontSize: '11.5px' }}
          >
            <Share2 size={13} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Comparison Area & Right Tool Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Left: Main Viewer & Thumbnails Strip */}
        <div>
          {/* Main Viewer Card */}
          <div
            className="card"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '6px',
              backgroundColor: '#081827',
              borderColor: '#1e3a5a',
              marginBottom: '14px',
            }}
          >
            {/* ROI Overlay over Viewer */}
            {selectedRoi === 'Rectangle' && (
              <svg viewBox="0 0 1000 480" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 14 }}>
                <rect x="220" y="80" width="460" height="260" rx="6" fill="rgba(22, 163, 74, 0.22)" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="6,4" />
                <circle cx="220" cy="80" r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                <circle cx="680" cy="80" r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                <circle cx="220" cy="340" r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                <circle cx="680" cy="340" r="5" fill="#16a34a" stroke="#fff" strokeWidth="2" />
                <rect x="230" y="92" width="130" height="24" rx="4" fill="rgba(8, 24, 39, 0.9)" />
                <text x="240" y="108" fill="#a8f04a" fontSize="12" fontWeight="bold">
                  ROI Box: 8.6 km²
                </text>
              </svg>
            )}
            {selectedRoi === 'Polygon' && (
              <svg viewBox="0 0 1000 480" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 14 }}>
                <polygon points="260,110 650,85 780,260 560,390 220,330" fill="rgba(234, 179, 8, 0.28)" stroke="#eab308" strokeWidth="3" strokeDasharray="6,4" />
                <circle cx="260" cy="110" r="5" fill="#eab308" stroke="#fff" strokeWidth="2" />
                <circle cx="650" cy="85" r="5" fill="#eab308" stroke="#fff" strokeWidth="2" />
                <circle cx="780" cy="260" r="5" fill="#eab308" stroke="#fff" strokeWidth="2" />
                <circle cx="560" cy="390" r="5" fill="#eab308" stroke="#fff" strokeWidth="2" />
                <circle cx="220" cy="330" r="5" fill="#eab308" stroke="#fff" strokeWidth="2" />
                <rect x="275" y="120" width="155" height="24" rx="4" fill="rgba(8, 24, 39, 0.9)" />
                <text x="285" y="136" fill="#eab308" fontSize="12" fontWeight="bold">
                  ROI Polygon: 12.4 km²
                </text>
              </svg>
            )}
            {selectedRoi === 'Point' && (
              <svg viewBox="0 0 1000 480" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 14 }}>
                <circle cx="500" cy="240" r="45" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4,4" />
                <circle cx="500" cy="240" r="24" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="2" />
                <circle cx="500" cy="240" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                <line x1="500" y1="170" x2="500" y2="310" stroke="#2563eb" strokeWidth="2" />
                <line x1="430" y1="240" x2="570" y2="240" stroke="#2563eb" strokeWidth="2" />
                <rect x="525" y="222" width="210" height="24" rx="4" fill="rgba(8, 24, 39, 0.9)" />
                <text x="535" y="238" fill="#60a5fa" fontSize="11" fontWeight="bold">
                  Point: [392448 E, 3021841 N]
                </text>
              </svg>
            )}

            {viewMode === 'Slider' ? (
              <ComparisonViewer
                beforeImage={getBeforeImage()}
                afterImage={getAfterImage()}
                beforeLabel={`Cloudy Input (12-JUN-2023 ${spectralMode.includes('FCC') ? 'FCC' : 'RGB'})`}
                afterLabel={`Reconstructed (12-JUN-2023 ${spectralMode.includes('FCC') ? 'FCC' : 'RGB'})`}
                showMetaBottom={false}
                showScale={true}
                height="480px"
                overlayMaskOutline={overlayMaskOutline}
                overlayConfidenceHeatmap={overlayConfidenceHeatmap}
                maskImage={SATELLITE_ASSETS.mask}
                confidenceImage={SATELLITE_ASSETS.confidence}
              />
            ) : viewMode === 'Side by Side' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', height: '480px' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={getBeforeImage()} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                    Cloudy Input
                  </div>
                </div>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={getAfterImage()} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                    Reconstructed (Cloud-Free)
                  </div>
                </div>
              </div>
            ) : (
              /* Triple View */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', height: '480px' }}>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={SATELLITE_ASSETS.cloudy} alt="Cloudy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '10px', padding: '3px 6px', borderRadius: '4px' }}>
                    1. Cloudy Input
                  </div>
                </div>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={SATELLITE_ASSETS.reconstructed} alt="Reconstructed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '10px', padding: '3px 6px', borderRadius: '4px' }}>
                    2. Reconstructed
                  </div>
                </div>
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                  <img src={SATELLITE_ASSETS.confidence} alt="Confidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(8,24,39,0.85)', color: '#fff', fontSize: '10px', padding: '3px 6px', borderRadius: '4px' }}>
                    3. Confidence Map
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
            }}
          >
            {thumbnails.map((thumb) => {
              const isActive = activeThumbnail === thumb.id;
              return (
                <div
                  key={thumb.id}
                  onClick={() => setActiveThumbnail(thumb.id)}
                  style={{
                    background: '#ffffff',
                    border: isActive ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '4px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0 8px rgba(22, 163, 74, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.label}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '5px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      textAlign: 'center',
                      marginTop: '4px',
                      color: isActive ? '#15803d' : '#475569',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {thumb.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Controls, Layers, ROI, Scene Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Comparison Controls */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Sliders size={14} color="#2878e5" />
                Comparison Controls
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <span>Opacity</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(e.target.value)}
                style={{ width: '100%', accentColor: '#16a34a' }}
              />
            </div>
          </div>

          {/* Layers Selection */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Layers size={14} color="#2878e5" />
                Layers
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={layerCloudy} onChange={(e) => setLayerCloudy(e.target.checked)} />
                <span>Cloudy Input</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={layerRecon} onChange={(e) => setLayerRecon(e.target.checked)} />
                <span>Reconstructed Output</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={layerTemporal} onChange={(e) => setLayerTemporal(e.target.checked)} />
                <span>Temporal Reference (01-NOV-2023)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={layerSar} onChange={(e) => setLayerSar(e.target.checked)} />
                <span>Sentinel-1 SAR (VV/VH)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={layerMask} onChange={(e) => setLayerMask(e.target.checked)} />
                <span>Cloud/Shadow Mask</span>
              </label>
            </div>
          </div>

          {/* Region of Interest (ROI) */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                <Crosshair size={14} color="#2878e5" />
                Region of Interest (ROI)
              </span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '10px' }}>
                <button
                  id="comparison-roi-rectangle-btn"
                  onClick={() => setSelectedRoi('Rectangle')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: selectedRoi === 'Rectangle' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: selectedRoi === 'Rectangle' ? '#f0fdf4' : '#ffffff',
                    color: selectedRoi === 'Rectangle' ? '#15803d' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Square size={14} />
                  <span>Rectangle</span>
                </button>
                <button
                  id="comparison-roi-polygon-btn"
                  onClick={() => setSelectedRoi('Polygon')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: selectedRoi === 'Polygon' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: selectedRoi === 'Polygon' ? '#f0fdf4' : '#ffffff',
                    color: selectedRoi === 'Polygon' ? '#15803d' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Pentagon size={14} />
                  <span>Polygon</span>
                </button>
                <button
                  id="comparison-roi-point-btn"
                  onClick={() => setSelectedRoi('Point')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: selectedRoi === 'Point' ? '1px solid #16a34a' : '1px solid #cbd5e1',
                    background: selectedRoi === 'Point' ? '#f0fdf4' : '#ffffff',
                    color: selectedRoi === 'Point' ? '#15803d' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <MapPin size={14} />
                  <span>Point</span>
                </button>
              </div>

              {selectedRoi && (
                <div style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target ROI:</span>
                    <strong style={{ color: '#0f172a' }}>{selectedRoi}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Estimated Area:</span>
                    <strong style={{ color: '#16a34a' }}>
                      {selectedRoi === 'Rectangle' ? '8.6 km²' : selectedRoi === 'Polygon' ? '12.4 km²' : '25 m² (Pixel)'}
                    </strong>
                  </div>
                </div>
              )}

              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px' }}
                onClick={handleResetView}
                id="comparison-reset-view-btn"
              >
                <RotateCcw size={12} />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Scene Summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Scene Summary & Sensors</span>
            </div>
            <div className="card-body" style={{ fontSize: '11px', lineHeight: '1.9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Primary Sensor</span>
                <span style={{ fontWeight: 600 }}>ISRO LISS-IV (Green, Red, NIR)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>GSD Resolution</span>
                <span style={{ fontWeight: 600 }}>5.0 m Native</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Target Date</span>
                <span style={{ fontWeight: 600 }}>12-JUN-2023 (Assam Basin)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Temporal Reference</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>01-NOV-2023 (Clear Scene)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Sentinel-1 SAR</span>
                <span style={{ fontWeight: 600, color: '#0284c7' }}>15-JUN-2023 (3-Day Gap)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '4px', marginTop: '4px' }}>
                <span style={{ color: '#64748b' }}>Cloud Coverage (Before)</span>
                <span style={{ fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>80.98% (1,061,424 px)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Cloud Coverage (After)</span>
                <span style={{ fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-mono)' }}>0.00% (Fully Cleared)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Visible Clear Pixels</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>249,296 px (19.02%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Scene Pixels</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>1,310,720 px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quantitative Metrics, Spectral Reflectance Comparison, Pixel Inspector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.3fr 1.3fr',
          gap: '16px',
        }}
      >
        {/* Quantitative Metrics Table (Controlled by isEvaluationMode) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isEvaluationMode ? '#16a34a' : '#2878e5' }}></span>
              Quantitative Metrics
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700,
                background: isEvaluationMode ? '#f0fdf4' : '#f8fafc',
                color: isEvaluationMode ? '#166534' : '#64748b',
                border: isEvaluationMode ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
              }}
            >
              {isEvaluationMode ? 'Paired Reference Mode' : 'Normal Operational'}
            </span>
          </div>
          <div className="card-body" style={{ padding: '10px 14px' }}>
            {isEvaluationMode ? (
              <>
                <div style={{ marginBottom: '8px', fontSize: '11px', color: '#166534', background: '#f0fdf4', padding: '5px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                  <strong>Evaluation Type:</strong> Real Paired Reference (01-NOV-2023)
                </div>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '8px' }}>
                  <thead>
                    <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '5px 3px' }}>Metric</th>
                      <th style={{ padding: '5px 3px' }}>Value</th>
                      <th style={{ padding: '5px 3px' }}>Valid Pixels</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontFamily: 'var(--font-mono)' }}>
                    <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '5px 3px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>MAE_cloud</td>
                      <td style={{ padding: '5px 3px', fontWeight: 600, color: '#16a34a' }}>0.0412</td>
                      <td style={{ padding: '5px 3px', color: '#64748b' }}>1,061,424 px</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '5px 3px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>PSNR (dB)</td>
                      <td style={{ padding: '5px 3px', fontWeight: 700, color: '#16a34a' }}>39.67 dB</td>
                      <td style={{ padding: '5px 3px', color: '#64748b' }}>1,061,424 px</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '5px 3px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>SSIM</td>
                      <td style={{ padding: '5px 3px', fontWeight: 600 }}>0.9834</td>
                      <td style={{ padding: '5px 3px', color: '#64748b' }}>1,061,424 px</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '5px 3px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>SAM (Spectral Angle)</td>
                      <td style={{ padding: '5px 3px', fontWeight: 600 }}>1.60°</td>
                      <td style={{ padding: '5px 3px', color: '#64748b' }}>1,061,424 px</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '5px 3px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>NDVI MAE</td>
                      <td style={{ padding: '5px 3px', fontWeight: 600 }}>0.1142</td>
                      <td style={{ padding: '5px 3px', color: '#64748b' }}>1,061,424 px</td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', padding: '6px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#065f46' }}>Clear-Region Check:</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, background: '#16a34a', color: '#ffffff', padding: '2px 6px', borderRadius: '3px' }}>
                    VISIBLE PIXELS UNCHANGED: PASS
                  </span>
                </div>
              </>
            ) : (
              <div style={{ padding: '12px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: '1.7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  <Info size={15} color="#2878e5" />
                  <span>Metrics Withheld (Operational Scene)</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>
                  In real satellite operations, ground truth under clouds cannot be directly observed. Reporting synthetic or invented PSNR/SSIM would mislead remote sensing analysts.
                </p>
                <button
                  className="btn-primary"
                  style={{ fontSize: '11px', padding: '5px 10px', width: '100%', justifyContent: 'center' }}
                  onClick={() => setIsEvaluationMode(true)}
                  id="comparison-enable-eval-btn"
                >
                  Enable Evaluation Mode (Paired Reference)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spectral Reflectance Comparison Line Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
              Spectral Reflectance Comparison
            </span>
          </div>
          <div className="card-body">
            <SpectralChart height={140} />
          </div>
        </div>

        {/* Pixel Inspector Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Crosshair size={14} color="#2878e5" />
              Pixel Inspector
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              <div>
                Location (Pixel): <strong style={{ color: '#1e293b' }}>X: {pixelPos.x} &nbsp; Y: {pixelPos.y}</strong>
              </div>
              <div>
                UTM 46N: <strong style={{ color: '#1e293b' }}>E: {pixelPos.e} &nbsp; N: {pixelPos.n}</strong>
              </div>
            </div>

            <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-mono)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#64748b', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '4px' }}>Band</th>
                  <th style={{ padding: '4px' }}>Cloudy</th>
                  <th style={{ padding: '4px' }}>Reconstructed</th>
                  <th style={{ padding: '4px' }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '4px', fontWeight: 600, color: '#334155' }}>Green (B3)</td>
                  <td style={{ padding: '4px', color: '#64748b' }}>0.18</td>
                  <td style={{ padding: '4px', color: '#16a34a', fontWeight: 600 }}>0.16</td>
                  <td style={{ padding: '4px', color: '#2878e5' }}>0.15</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '4px', fontWeight: 600, color: '#334155' }}>Red (B2)</td>
                  <td style={{ padding: '4px', color: '#64748b' }}>0.24</td>
                  <td style={{ padding: '4px', color: '#16a34a', fontWeight: 600 }}>0.21</td>
                  <td style={{ padding: '4px', color: '#2878e5' }}>0.20</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '4px', fontWeight: 600, color: '#334155' }}>NIR (B4)</td>
                  <td style={{ padding: '4px', color: '#64748b' }}>0.52</td>
                  <td style={{ padding: '4px', color: '#16a34a', fontWeight: 600 }}>0.49</td>
                  <td style={{ padding: '4px', color: '#2878e5' }}>0.47</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px', fontWeight: 700, color: '#081827' }}>NDVI</td>
                  <td style={{ padding: '4px', color: '#64748b' }}>0.37</td>
                  <td style={{ padding: '4px', color: '#16a34a', fontWeight: 700 }}>0.40</td>
                  <td style={{ padding: '4px', color: '#2878e5', fontWeight: 700 }}>0.41</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
