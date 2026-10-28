import React from 'react';
import { CONFUSION_MATRIX_DATA } from '../../data/mockData';

export default function ConfusionMatrix({ data: customData }) {
  const { labels, matrix } = customData || CONFUSION_MATRIX_DATA;

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px', textAlign: 'left', color: '#64748b', fontSize: '10px' }}>True \ Pred</th>
            {labels.map((lbl) => (
              <th key={lbl} style={{ padding: '4px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                {lbl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rIdx) => (
            <tr key={labels[rIdx]}>
              <td style={{ padding: '3px 6px', fontWeight: 600, color: '#334155' }}>
                {labels[rIdx]}
              </td>
              {row.map((val, cIdx) => {
                const isDiag = rIdx === cIdx;
                const bg = isDiag
                  ? `rgba(37, 99, 235, ${Math.min(val * 0.9 + 0.1, 0.85)})`
                  : val > 0.03
                  ? `rgba(239, 68, 68, ${val * 1.5})`
                  : 'transparent';
                const textColor = isDiag ? '#ffffff' : '#475569';

                return (
                  <td
                    key={cIdx}
                    style={{
                      padding: '3px 4px',
                      textAlign: 'center',
                      backgroundColor: bg,
                      color: textColor,
                      borderRadius: '3px',
                      fontWeight: isDiag ? 700 : 400,
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    {val.toFixed(2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
