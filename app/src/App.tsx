import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { CaptionEditor } from './components/CaptionEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { RenderControls } from './components/RenderControls';

export interface AppConfig {
  videoDir: string;
  outputDir: string;
  videoFile: string;
  hostName: string;
  hostTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  episodeDate: string;
  accentColor: string;
  highlightQuote: string;
  highlightStart: number;
  highlightEnd: number;
  captions: Array<{ text: string; start: number; end: number; speaker: string }>;
}

const DEFAULT_CONFIG: AppConfig = {
  videoDir: 'D:\\vids',
  outputDir: 'D:\\blackos',
  videoFile: '20220802_232841.mp4',
  hostName: 'Black$',
  hostTitle: 'Host',
  episodeNumber: 1,
  episodeTitle: "Once again it's on",
  episodeDate: '2026',
  accentColor: '#CC0000',
  highlightQuote: 'I said what I said.',
  highlightStart: 0,
  highlightEnd: 90,
  captions: [
    { text: 'Welcome back to the show.', start: 1.5, end: 4.0, speaker: 'BLACK$' },
  ],
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);
  const [activeComp, setActiveComp] = useState<'JBPPodcast' | 'JBPIntro' | 'JBPHighlight'>('JBPPodcast');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Load config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data: AppConfig) => {
        setConfig(data);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  // Debounced auto-save whenever config changes
  useEffect(() => {
    if (!loaded) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      }).catch(() => {});
    }, 800);
  }, [config, loaded]);

  const handleChange = useCallback((partial: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleCaptionsChange = useCallback(
    (captions: AppConfig['captions']) => {
      setConfig((prev) => ({ ...prev, captions }));
    },
    []
  );

  if (!loaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#888',
          fontSize: 13,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      <Header episodeNumber={config.episodeNumber} episodeTitle={config.episodeTitle} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left column */}
        <div
          style={{
            width: 380,
            flexShrink: 0,
            overflowY: 'auto',
            borderRight: '1px solid #222',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <ConfigPanel config={config} onChange={handleChange} />
          <CaptionEditor captions={config.captions} onChange={handleCaptionsChange} />
        </div>

        {/* Right column */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PreviewPanel config={config} activeComp={activeComp} onCompChange={setActiveComp} />
        </div>
      </div>

      <RenderControls composition={activeComp} />
    </div>
  );
}
