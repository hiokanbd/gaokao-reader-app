import React from 'react';

interface Props {
  current: number;
  total: number;
  stage: string;
}

export const ProgressBar: React.FC<Props> = ({ current, total, stage }) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.8rem', color: '#8b7e6a', marginBottom: 4,
      }}>
        <span>{stage}</span>
        <span>{current}/{total} ({pct}%)</span>
      </div>
      <div style={{
        height: 6, borderRadius: 3,
        background: '#e8e0d5', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, #b87333, #c0392b)',
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};
