import React, { useState, useRef, useEffect, useCallback } from 'react';
import MapControlsOverlay from './MapControlsOverlay';

export default function ComparisonViewer({
  beforeImage,
  afterImage,
  beforeLabel = 'Input (Cloudy)',
  afterLabel = 'Reconstructed (Cloud-Free)',
  showMetaBottom = true,
  metaLeft = 'LISS-IV (Natural RGB) | Cloud Coverage: 80.98%',
  metaRight = 'PSNR: 39.67 dB | SSIM: 0.9834 | SAM: 1.6°',
  showScale = true,
  scaleText = '2 km',
  height = '100%',
  initialSliderPos = 50,
  interactive = true,
  zoomable = true,
  overlayMaskOutline = false,
  overlayConfidenceHeatmap = false,
  maskImage = null,
  confidenceImage = null,
}) {
  const [sliderPos, setSliderPos] = useState(initialSliderPos);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current || !interactive) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    setSliderPos(percent);
  }, [interactive]);

  const onMouseDown = () => setIsDragging(true);
  const onTouchStart = () => setIsDragging(true);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      className="comparison-container"
      style={{ height }}
      onClick={(e) => {
        if (!isDragging) handleMove(e.clientX);
      }}
    >
      {/* Background (After / Reconstructed) */}
      <div
        className="comparison-layer"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.2s ease',
          position: 'relative',
        }}
      >
        <img src={afterImage} alt={afterLabel} />
        {overlayConfidenceHeatmap && confidenceImage && (
          <img
            src={confidenceImage}
            alt="Confidence Overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.62,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              filter: 'saturate(1.4) contrast(1.2)',
            }}
          />
        )}
      </div>

      {/* Foreground (Before / Cloudy) clipped by slider */}
      <div
        className="comparison-overlay-clip"
        style={{
          width: `${sliderPos}%`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'left center',
          transition: isDragging ? 'none' : 'transform 0.2s ease',
        }}
      >
        <div style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%', height: '100%', position: 'relative' }}>
          <img
            src={beforeImage}
            alt={beforeLabel}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Cloud Mask Outline Overlay across both sides if enabled */}
      {overlayMaskOutline && (
        <svg
          viewBox="0 0 1000 480"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 12,
          }}
        >
          {/* Cloud boundary 1 */}
          <path
            d="M 120,60 C 180,30 320,40 400,90 C 480,140 520,240 450,300 C 380,360 220,380 140,320 C 70,260 60,100 120,60 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          {/* Cloud boundary 2 */}
          <path
            d="M 520,120 C 620,80 780,100 860,160 C 930,220 940,320 860,380 C 780,440 640,410 580,350 C 510,290 440,160 520,120 Z"
            fill="rgba(56, 189, 248, 0.08)"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          {/* Cloud shadow boundary */}
          <path
            d="M 430,310 C 490,320 540,370 510,420 C 470,450 390,440 370,400 C 350,350 380,310 430,310 Z"
            fill="rgba(244, 63, 94, 0.12)"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
        </svg>
      )}

      {/* Labels */}
      {beforeLabel && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(8, 24, 39, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          {beforeLabel}
        </div>
      )}

      {afterLabel && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(8, 24, 39, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          {afterLabel}
        </div>
      )}

      {/* Map tools overlay */}
      {zoomable && (
        <div style={{ position: 'absolute', top: '48px', left: '12px', zIndex: 22 }}>
          <MapControlsOverlay
            onZoomIn={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
            onZoomOut={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
            onReset={() => {
              setZoomLevel(1);
              setSliderPos(50);
            }}
            onLayers={() => setSliderPos((p) => (p > 50 ? 0 : 100))}
          />
        </div>
      )}

      {/* Divider line & Circular Handle */}
      {interactive && (
        <>
          <div
            className="comparison-divider-line"
            style={{ left: `${sliderPos}%` }}
          />
          <div
            className="comparison-handle"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            <span>&lt;&nbsp;&gt;</span>
          </div>
        </>
      )}

      {/* Scale Badge */}
      {showScale && (
        <div className="map-scale-badge">
          <div style={{ width: '16px', height: '2px', background: '#a8f04a' }}></div>
          <span>{scaleText}</span>
        </div>
      )}

      {/* Meta bottom bar */}
      {showMetaBottom && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(4, 10, 20, 0.88)',
            backdropFilter: 'blur(6px)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#94a3b8',
            fontFamily: 'var(--font-mono)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 15,
          }}
        >
          <div>{metaLeft}</div>
          <div style={{ color: '#cbd5e1' }}>{metaRight}</div>
        </div>
      )}
    </div>
  );
}
