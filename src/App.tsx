import React, { useState } from 'react';
import { SettingsView } from './views/SettingsView';
import { WordbankView } from './views/WordbankView';
import { GenerateView } from './views/GenerateView';
import { ReaderView } from './views/ReaderView';

type View = 'generate' | 'settings' | 'wordbanks' | 'reader';

const App: React.FC = () => {
  const [view, setView] = useState<View>('generate');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#faf8f5',
      fontFamily: '"Georgia", "Times New Roman", "Noto Serif SC", serif',
      color: '#2c2416',
    }}>
      {/* Top navigation bar */}
      <nav style={{
        display: 'flex', justifyContent: 'center', gap: 4,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.9)',
        borderBottom: '1px solid #e8e0d5',
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        {[
          { id: 'generate' as View, label: '📝 生成', desc: '创建新文章' },
          { id: 'reader' as View, label: '📖 阅读', desc: '查看文章' },
          { id: 'wordbanks' as View, label: '📚 词库', desc: '管理词库' },
          { id: 'settings' as View, label: '⚙️ 设置', desc: 'API Key' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: '8px 14px',
              border: view === tab.id ? '1px solid #b87333' : '1px solid transparent',
              borderRadius: 10,
              background: view === tab.id ? '#fef5ec' : 'transparent',
              color: view === tab.id ? '#b87333' : '#8b7e6a',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: view === tab.id ? 600 : 400,
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '1rem' }}>{tab.label.split(' ')[0]}</span>
            <span style={{ fontSize: '0.65rem' }}>{tab.label.split(' ')[1]}</span>
          </button>
        ))}
      </nav>

      {/* View content */}
      <main style={{ padding: '16px 16px 40px' }}>
        {view === 'generate' && (
          <GenerateView onViewArticle={() => setView('reader')} />
        )}
        {view === 'settings' && (
          <SettingsView onBack={() => setView('generate')} />
        )}
        {view === 'wordbanks' && (
          <WordbankView onBack={() => setView('generate')} />
        )}
        {view === 'reader' && (
          <ReaderView onBack={() => setView('generate')} />
        )}
      </main>
    </div>
  );
};

export default App;
