import React from 'react';
import { PALETTE } from '../utils/colors';

interface Props {
  selected: number;
  onChange: (idx: number) => void;
}

export const ColorPicker: React.FC<Props> = ({ selected, onChange }) => {
  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {PALETTE.map((c, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          title={c.name}
          style={{
            width: 22, height: 22,
            borderRadius: '50%',
            border: i === selected ? `2px solid ${c.value}` : '2px solid transparent',
            background: c.value,
            cursor: 'pointer',
            outline: 'none',
            boxShadow: i === selected ? `0 0 0 2px ${c.bg}` : 'none',
            transition: 'all 0.15s',
          }}
        />
      ))}
    </div>
  );
};
