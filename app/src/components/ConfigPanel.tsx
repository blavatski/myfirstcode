import React from 'react';
import { AppConfig } from '../App';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (partial: Partial<AppConfig>) => void;
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: 12,
};

const sectionLabelStyle: React.CSSProperties = {
  color: '#CC0000',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  marginTop: 16,
  marginBottom: 8,
  paddingBottom: 6,
  borderBottom: '1px solid #222',
};

export function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div
        style={{
          color: '#CC0000',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: '1px solid #222',
        }}
      >
        Episode Config
      </div>

      {/* Files section */}
      <div style={sectionLabelStyle}>Files</div>

      <div style={fieldStyle}>
        <label>Video File</label>
        <input
          type="text"
          value={config.videoFile}
          placeholder="podcast.mp4"
          onChange={(e) => onChange({ videoFile: e.target.value })}
        />
      </div>

      <div style={fieldStyle}>
        <label>Video Directory</label>
        <input
          type="text"
          value={config.videoDir}
          placeholder="D:\vids"
          onChange={(e) => onChange({ videoDir: e.target.value })}
        />
      </div>

      <div style={fieldStyle}>
        <label>Output Directory</label>
        <input
          type="text"
          value={config.outputDir}
          placeholder="D:\blackos"
          onChange={(e) => onChange({ outputDir: e.target.value })}
        />
      </div>

      {/* Host section */}
      <div style={sectionLabelStyle}>Host</div>

      <div style={fieldStyle}>
        <label>Host Name</label>
        <input
          type="text"
          value={config.hostName}
          onChange={(e) => onChange({ hostName: e.target.value })}
        />
      </div>

      <div style={fieldStyle}>
        <label>Host Title</label>
        <input
          type="text"
          value={config.hostTitle}
          onChange={(e) => onChange({ hostTitle: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <label>Accent Color</label>
          <input
            type="color"
            value={config.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 2 }}>
          <label>Hex Value</label>
          <input
            type="text"
            value={config.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
          />
        </div>
      </div>

      {/* Episode section */}
      <div style={sectionLabelStyle}>Episode</div>

      <div style={fieldStyle}>
        <label>Episode Number</label>
        <input
          type="number"
          value={config.episodeNumber}
          min={1}
          onChange={(e) => onChange({ episodeNumber: parseInt(e.target.value, 10) || 1 })}
        />
      </div>

      <div style={fieldStyle}>
        <label>Episode Title</label>
        <input
          type="text"
          value={config.episodeTitle}
          onChange={(e) => onChange({ episodeTitle: e.target.value })}
        />
      </div>

      <div style={fieldStyle}>
        <label>Episode Date</label>
        <input
          type="text"
          value={config.episodeDate}
          placeholder="2026"
          onChange={(e) => onChange({ episodeDate: e.target.value })}
        />
      </div>

      {/* Highlight section */}
      <div style={sectionLabelStyle}>Highlight Clip</div>

      <div style={fieldStyle}>
        <label>Highlight Quote</label>
        <input
          type="text"
          value={config.highlightQuote}
          onChange={(e) => onChange({ highlightQuote: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <label>Start (seconds)</label>
          <input
            type="number"
            value={config.highlightStart}
            min={0}
            step={0.5}
            onChange={(e) => onChange({ highlightStart: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <label>End (seconds)</label>
          <input
            type="number"
            value={config.highlightEnd}
            min={0}
            step={0.5}
            onChange={(e) => onChange({ highlightEnd: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}
