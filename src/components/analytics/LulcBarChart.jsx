import React from 'react';
import { LULC_CLASSES } from '../../data/mockData';

export default function LulcBarChart({ height = 150 }) {
  const maxVal = 40; // Max percentage for scaling
  const chartHeight = height - 40;

  return (
    <div style={{ width: '100%' }}>
      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }}></span>
          <span>Cloudy Input</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#16a34a' }}></span>
          <span>Reconstructed</span>
        </div>
      </div>

      {/* Chart grid */}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: `${chartHeight}px`, borderBottom: '1px solid #e2e8f0', gap: '12px', paddingBottom: '4px' }}>
        {LULC_CLASSES.map((cls) => {
          const cloudyH = (cls.cloudyArea / maxVal) * chartHeight;
          const reconH = (cls.percent / maxVal) * chartHeight;

          return (
            <div
              key={cls.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', width: '100%', justifyContent: 'center' }}>
                {/* Cloudy Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
                  <span style={{ fontSize: '9px', color: '#64748b', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                    {cls.cloudyArea}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${cloudyH}px`,
                      backgroundColor: '#ef4444',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                </div>

                {/* Reconstructed Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
                  <span style={{ fontSize: '9px', color: '#16a34a', fontWeight: 600, fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
                    {cls.percent}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${reconH}px`,
                      backgroundColor: '#16a34a',
                      borderRadius: '2px 2px 0 0',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Labels below chart */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        {LULC_CLASSES.map((cls) => (
          <div
            key={cls.id}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 500,
              color: '#475569',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={cls.name}
          >
            {cls.name.split('/')[0].split(' ')[0]}
          </div>
        ))}
      </div>
    </div>
  );
}
