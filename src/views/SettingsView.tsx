import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

interface Props {
  onBack?: () => void;
}

export const SettingsView: React.FC<Props> = ({ onBack }) => {
  const { apiKey, hasKey, keyLoaded, loadApiKey, setApiKey, clearApiKey } = useSettingsStore();
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, [loadApiKey]);

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setSaving(true);
    await setApiKey(inputKey.trim());
    setSaving(false);
    setInputKey('');
  };

  const handleClear = () => {
    clearApiKey();
  };

  if (!keyLoaded) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8b7e6a' }}>加载中…</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: '#b87333', marginBottom: 20, textAlign: 'center' }}>设置</h2>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#5E4B66', fontWeight: 600 }}>
          DeepSeek API Key
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            placeholder={hasKey ? '•••••••• (已保存)' : 'sk-xxxxxxxx'}
            style={{
              flex: 1, padding: '8px 12px',
              border: '1px solid #e8e0d5', borderRadius: 6,
              fontSize: '0.9rem', outline: 'none',
              background: '#fff',
            }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              padding: '8px 12px', border: '1px solid #e8e0d5',
              borderRadius: 6, background: '#fff', cursor: 'pointer',
              fontSize: '0.8rem', color: '#8b7e6a',
            }}
          >
            {showKey ? '隐藏' : '显示'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={!inputKey.trim() || saving}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 6,
              background: saving ? '#d4b896' : '#b87333',
              color: '#fff', cursor: saving ? 'default' : 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {saving ? '保存中…' : (hasKey ? '更新 Key' : '保存')}
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              style={{
                padding: '8px 20px', border: '1px solid #c0392b',
                borderRadius: 6, background: '#fff', cursor: 'pointer',
                color: '#c0392b', fontSize: '0.85rem',
              }}
            >
              删除 Key
            </button>
          )}
        </div>
        {hasKey && (
          <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#27ae60' }}>
            ✅ API Key 已保存（加密存储）
          </div>
        )}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          style={{
            padding: '8px 24px', border: '1px solid #e8e0d5',
            borderRadius: 6, background: '#fff', cursor: 'pointer',
            color: '#8b7e6a', fontSize: '0.85rem',
          }}
        >
          返回
        </button>
      )}
    </div>
  );
};
