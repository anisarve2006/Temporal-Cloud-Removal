import React from 'react';
import { SPECTRAL_ANALYSIS_DATA } from '../../data/mockData';

export default function SpectralChart({ height = 150, points: customPoints }) {
  const points = customPoints || SPECTRAL_ANALYSIS_DATA.curvePoints;
  const minWl = 0.5;
  const maxWl = 0.9;
  const minVal = 0.0;
  const maxVal = 0.8;

  // Viewbox coordinates
  const svgWidth = 380;
  const svgHeight = height;
  const padLeft = 32;
  const padRight = 16;
  const padTop = 14;
  const padBottom = 24;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (wl) => padLeft + ((wl - minWl) / (maxWl - minWl)) * plotW;
  const getY = (v) => padTop + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

  const makePath = (key) => {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.wl).toFixed(1)} ${getY(p[key]).toFixed(1)}`)
      .join(' ');
  };

  const pathOrig = makePath('orig');
  const pathRecon = makePath('recon');
  const pathRef = makePath('ref');

  return (
    <div style={{ width: '100%' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#94a3b8' }}></span>
          <span>Original (Cloudy)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
          <span>Reconstructed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2878e5' }}></span>
          <span>Reference (Clear)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        {/* Y Axis Grid & Labels */}
        {[0.0, 0.2, 0.4, 0.6, 0.8].map((v) => {
          const y = getY(v);
          return (
            <g key={v}>
              <line
                x1={padLeft}
                y1={y}
                x2={svgWidth - padRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={v === 0 ? 'none' : '3,3'}
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {[0.5, 0.6, 0.7, 0.8, 0.9].map((wl) => {
          const x = getX(wl);
          return (
            <text
              key={wl}
              x={x}
              y={svgHeight - 6}
              fill="#94a3b8"
              fontSize="9"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {wl.toFixed(1)}
            </text>
          );
        })}

        {/* Axis Titles */}
        <text
          x={-(padTop + plotH / 2)}
          y="10"
          transform="rotate(-90)"
          fill="#64748b"
          fontSize="9"
          textAnchor="middle"
        >
          Reflectance
        </text>
        <text
          x={padLeft + plotW / 2}
          y={svgHeight + 8}
          fill="#64748b"
          fontSize="9"
          textAnchor="middle"
        >
          Wavelength (µm)
        </text>

        {/* Lines */}
        <path d={pathOrig} fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d={pathRecon} fill="none" stroke="#16a34a" strokeWidth="2.5" />
        <path d={pathRef} fill="none" stroke="#2878e5" strokeWidth="1.8" strokeDasharray="4,2" />
      </svg>
    </div>
  );
}
