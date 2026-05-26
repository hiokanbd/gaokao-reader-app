import React from 'react';

interface Props {
  on: boolean;
  onToggle: () => void;
}

export const TranslationToggle: React.FC<Props> = ({ on, onToggle }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, marginBottom: 16, userSelect: 'none',
    }}>
      <label
        onClick={onToggle}
        style={{
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 20,
          border: on ? '1px solid #c0392b' : '1px solid #e8e0d5',
          background: on ? '#fff5f5' : '#fff',
          color: on ? '#c0392b' : '#8b7e6a',
          fontSize: '0.85rem', transition: 'all 0.3s',
        }}
      >
        <span style={{
          display: 'inline-block', width: 14, height: 14,
          border: `1.5px solid ${on ? '#c0392b' : '#8b7e6a'}`,
          borderRadius: 2, textAlign: 'center', lineHeight: '11px',
          fontSize: 10,
          background: on ? '#c0392b' : 'transparent',
          color: on ? '#fff' : 'transparent',
        }}>
          {on ? '✓' : ''}
        </span>
        {on ? '关闭单词翻译' : '开启单词翻译'}
      </label>
    </div>
  );
};
