import React from 'react';
import { Plus, Minus, Crosshair, Layers, Maximize2 } from 'lucide-react';

export default function MapControlsOverlay({ onZoomIn, onZoomOut, onReset, onLayers, onFullscreen }) {
  return (
    <div className="map-tools-overlay" title="Geospatial Map Controls">
      <button className="map-tool-btn" onClick={onZoomIn} title="Zoom In">
        <Plus size={14} />
      </button>
      <button className="map-tool-btn" onClick={onZoomOut} title="Zoom Out">
        <Minus size={14} />
      </button>
      <button className="map-tool-btn" onClick={onReset} title="Reset View">
        <Crosshair size={14} />
      </button>
      <button className="map-tool-btn" onClick={onLayers} title="Toggle Layers">
        <Layers size={14} />
      </button>
      {onFullscreen && (
        <button className="map-tool-btn" onClick={onFullscreen} title="Fullscreen">
          <Maximize2 size={13} />
        </button>
      )}
    </div>
  );
}
