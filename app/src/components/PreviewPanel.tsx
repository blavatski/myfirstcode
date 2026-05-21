import React from 'react';
import { Player } from '@remotion/player';
import { AppConfig } from '../App';
import { JBPPodcast } from '../../../src/compositions/JBPPodcast';
import { JBPIntro } from '../../../src/compositions/JBPIntro';
import { JBPHighlight } from '../../../src/compositions/JBPHighlight';

type CompName = 'JBPPodcast' | 'JBPIntro' | 'JBPHighlight';

interface PreviewPanelProps {
  config: AppConfig;
  activeComp: CompName;
  onCompChange: (comp: CompName) => void;
}

const TABS: { id: CompName; label: string }[] = [
  { id: 'JBPPodcast', label: 'Podcast' },
  { id: 'JBPIntro', label: 'Intro' },
  { id: 'JBPHighlight', label: 'Highlight' },
];

export function PreviewPanel({ config, activeComp, onCompChange }: PreviewPanelProps) {
  const inputProps = {
    videoSrc: `/videos/${config.videoFile}`,
    hostName: config.hostName,
    hostTitle: config.hostTitle,
    episodeNumber: config.episodeNumber,
    episodeTitle: config.episodeTitle,
    episodeDate: config.episodeDate,
    accentColor: config.accentColor,
    highlightQuote: config.highlightQuote,
    highlightStart: Math.round(config.highlightStart * 30),
    highlightEnd: Math.round(config.highlightEnd * 30),
    captions: config.captions,
  };

  const highlightDuration =
    Math.round((config.highlightEnd - config.highlightStart) * 30) + 30;

  const getDuration = () => {
    if (activeComp === 'JBPIntro') return 150;
    if (activeComp === 'JBPHighlight') return Math.max(highlightDuration, 31);
    return 300;
  };

  const getComponent = () => {
    if (activeComp === 'JBPIntro') return JBPIntro;
    if (activeComp === 'JBPHighlight') return JBPHighlight;
    return JBPPodcast;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #222',
          background: '#0d0d0d',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeComp;
          return (
            <button
              key={tab.id}
              onClick={() => onCompChange(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #CC0000' : '2px solid transparent',
                color: isActive ? '#f5f5f5' : '#888',
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '12px 20px',
                cursor: 'pointer',
                transition: 'color 0.15s, border-bottom-color 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Player area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '100%' }}>
          <Player
            key={`${activeComp}-${config.videoFile}`}
            component={getComponent()}
            inputProps={inputProps}
            durationInFrames={getDuration()}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: '100%', aspectRatio: '16/9' }}
            controls
            loop
          />
        </div>
      </div>
    </div>
  );
}
