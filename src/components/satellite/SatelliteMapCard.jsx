import React, { useState } from 'react';
import MapControlsOverlay from './MapControlsOverlay';

export default function SatelliteMapCard({
  title,
  imageSrc,
  scale = '2 km',
  tagText,
  tagRight,
  hasColorbar = false,
  aspectRatio = '16 / 10',
  icon: Icon,
  badgeText,
  onExpand,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [enhanceLayer, setEnhanceLayer] = useState(false);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="viewer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={15} style={{ color: '#2878e5' }} />}
          <span>{title}</span>
        </div>
        {badgeText && (
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            {badgeText}
          </span>
        )}
      </div>

      <div
        className="viewer-viewport"
        style={{ aspectRatio, position: 'relative' }}
      >
        <img
          src={imageSrc}
          alt={title}
          style={{
            transform: `scale(${zoomLevel})`,
            filter: enhanceLayer ? 'contrast(1.25) saturate(1.2) brightness(1.05)' : 'none',
            transition: 'transform 0.2s ease, filter 0.2s ease',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Map tools overlay */}
        <MapControlsOverlay
          onZoomIn={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          onZoomOut={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
          onReset={() => {
            setZoomLevel(1);
            setEnhanceLayer(false);
          }}
          onLayers={() => setEnhanceLayer((e) => !e)}
          onFullscreen={onExpand}
        />

        {/* Scale badge */}
        {scale && (
          <div className="map-scale-badge">
            <div style={{ width: '14px', height: '2px', background: '#a8f04a' }}></div>
            <span>{scale}</span>
          </div>
        )}

        {/* Tag text at bottom */}
        {tagText && (
          <div className="map-metrics-badge" style={{ bottom: '10px', left: 'auto', right: hasColorbar ? '40px' : '10px' }}>
            <span>{tagText}</span>
          </div>
        )}

        {/* Colorbar on right if requested */}
        {hasColorbar && (
          <div className="confidence-colorbar-wrapper">
            <div className="confidence-colorbar" />
            <div className="colorbar-labels">
              <span>1.0</span>
              <span>0.8</span>
              <span>0.6</span>
              <span>0.4</span>
              <span>0.2</span>
              <span>0.0</span>
            </div>
            <div
              style={{
                position: 'absolute',
                right: '-36px',
                top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                transformOrigin: 'center center',
                fontSize: '9px',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
                pointerEvents: 'none',
              }}
            >
              Confidence Score
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
