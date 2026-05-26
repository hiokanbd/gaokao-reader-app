import React, { useState } from 'react';
import { useArticleStore } from '../stores/articleStore';
import { ArticleRenderer } from '../components/ArticleRenderer';
import { TranslationToggle } from '../components/TranslationToggle';

interface Props {
  onBack: () => void;
}

export const ReaderView: React.FC<Props> = ({ onBack }) => {
  const { articleText, cnTranslation, matchedWords, audioUrls, status } = useArticleStore();
  const [showTranslation, setShowTranslation] = useState(false);

  if (status !== 'ready' || !articleText) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8b7e6a' }}>
        请先生成文章
        <br />
        <button
          onClick={onBack}
          style={{
            marginTop: 16, padding: '8px 24px',
            border: '1px solid #e8e0d5', borderRadius: 6,
            background: '#fff', cursor: 'pointer', color: '#8b7e6a',
          }}
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 780, margin: '0 auto',
      background: 'rgba(255,255,255,0.75)',
      border: '1px solid #e8e0d5', borderRadius: 8,
      padding: '2rem 2rem', boxShadow: '0 2px 12px rgba(80,50,20,0.08)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, paddingBottom: 12,
        borderBottom: '1px solid #e8e0d5',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '4px 14px', border: '1px solid #e8e0d5',
            borderRadius: 16, background: '#fff', cursor: 'pointer',
            color: '#8b7e6a', fontSize: '0.8rem',
          }}
        >
          ← 返回
        </button>
        <span style={{ fontSize: '0.75rem', color: '#8b7e6a' }}>
          {matchedWords.length} 个词汇标注 · {audioUrls.size} 个音频
        </span>
      </div>

      {/* Translation toggle */}
      <TranslationToggle on={showTranslation} onToggle={() => setShowTranslation(!showTranslation)} />

      {/* Article */}
      <ArticleRenderer
        text={articleText}
        matchedWords={matchedWords}
        audioUrls={audioUrls}
        showTranslation={showTranslation}
      />

      {/* Chinese translation (always visible at bottom) */}
      {cnTranslation && (
        <div style={{
          marginTop: '2rem', paddingTop: '1.5rem',
          borderTop: '2px solid #e8e0d5',
        }}>
          <h3 style={{
            fontSize: '1rem', color: '#b87333',
            textAlign: 'center', marginBottom: '1rem',
          }}>
            中文译文
          </h3>
          {cnTranslation.split('\n').filter(p => p.trim()).map((para, i) => (
            <p key={i} style={{
              textIndent: '2em', marginBottom: '0.8rem',
              lineHeight: 1.9, color: '#4a3f35',
            }}>
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
