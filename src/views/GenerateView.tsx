import React, { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useWordbankStore } from '../stores/wordbankStore';
import { useArticleStore } from '../stores/articleStore';
import { generateArticle } from '../services/deepseek';
import { matchVocab } from '../services/vocab';
import { downloadAudioBatch } from '../services/audio';
import { getAllEnabledWords } from '../services/wordbank';
import { ProgressBar } from '../components/ProgressBar';

interface Props {
  onViewArticle: () => void;
}

export const GenerateView: React.FC<Props> = ({ onViewArticle }) => {
  const { apiKey } = useSettingsStore();
  const { banks } = useWordbankStore();
  const { setStatus, setArticle, setMatchedWords, setAudioUrls, setProgress } = useArticleStore();

  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState(500);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [progress, setLocalProgress] = useState({ current: 0, total: 0, stage: '' });

  const enabledBanks = banks.filter(b => b.enabled);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('请先在设置页填入 DeepSeek API Key');
      return;
    }
    if (!topic.trim()) {
      setError('请输入文章主题');
      return;
    }
    if (enabledBanks.length === 0) {
      setError('请先在词库管理启用至少一个词库');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      // Stage 1: Generate article via DeepSeek
      setStatus('generating');
      setLocalProgress({ current: 0, total: 1, stage: '正在生成文章…' });
      setProgress(0, 1, '生成文章');

      const vocabWords = getAllEnabledWords(enabledBanks);
      const { article, translation } = await generateArticle({
        topic: topic.trim(),
        wordCount,
        apiKey,
        vocabWords,
      });

      setArticle(article, translation);

      // Stage 2: Match vocabulary
      setLocalProgress({ current: 0, total: 1, stage: '正在匹配词汇…' });
      const banksForMatch = enabledBanks.map(b => ({
        id: b.id,
        color: b.color,
        bg: b.bg,
        words: b.words,
      }));
      const matched = matchVocab(article, banksForMatch);
      setMatchedWords(matched);

      // Stage 3: Download audio
      const uniqueWords = [...new Set(matched.map(m => m.lower))];
      setStatus('downloading');
      setLocalProgress({ current: 0, total: uniqueWords.length, stage: '正在下载单词发音…' });
      setProgress(0, uniqueWords.length, '下载音频');

      const audioUrls = await downloadAudioBatch(uniqueWords, (p) => {
        setLocalProgress(p);
        setProgress(p.current, p.total, '下载音频');
      });

      setAudioUrls(audioUrls);
      setStatus('ready');
      onViewArticle();
    } catch (e: any) {
      setError(e.message || '生成失败');
      setStatus('idle');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 20 }}>
      <h2 style={{ color: '#b87333', marginBottom: 20, textAlign: 'center' }}>生成文章</h2>

      {/* Topic */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#5E4B66', fontWeight: 600 }}>
          文章主题/方向
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="例如：technology and education, environmental protection, AI ethics…"
          style={{
            width: '100%', padding: '8px 12px',
            border: '1px solid #e8e0d5', borderRadius: 6,
            fontSize: '0.9rem', outline: 'none',
          }}
        />
      </div>

      {/* Word count */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#5E4B66', fontWeight: 600 }}>
          目标词数: {wordCount}
        </label>
        <input
          type="range"
          min={200} max={1000} step={50}
          value={wordCount}
          onChange={e => setWordCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#b87333' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8b7e6a' }}>
          <span>200</span><span>1000</span>
        </div>
      </div>

      {/* Enabled banks summary */}
      <div style={{ marginBottom: 20, padding: 12, background: '#faf8f5', borderRadius: 6, fontSize: '0.8rem', color: '#8b7e6a' }}>
        已启用词库: {enabledBanks.length > 0
          ? enabledBanks.map(b => (
              <span key={b.id} style={{
                display: 'inline-block', margin: '2px 4px',
                padding: '1px 8px', borderRadius: 10,
                background: b.bg, color: b.color, fontWeight: 500,
              }}>
                {b.name} ({b.wordCount}词)
              </span>
            ))
          : <span style={{ color: '#c0392b' }}>无</span>}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          width: '100%', padding: '12px',
          border: 'none', borderRadius: 8,
          background: generating ? '#d4b896' : '#b87333',
          color: '#fff', cursor: generating ? 'default' : 'pointer',
          fontSize: '1rem', fontWeight: 600,
        }}
      >
        {generating ? '生成中…' : '生成文章'}
      </button>

      {/* Progress */}
      {generating && (
        <ProgressBar
          current={progress.current}
          total={progress.total}
          stage={progress.stage}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 6,
          background: '#fff5f5', color: '#c0392b',
          fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
