import React, { useEffect, useState } from 'react';

interface HeaderProps {
  episodeNumber: number;
  episodeTitle: string;
}

export function Header({ episodeNumber, episodeTitle }: HeaderProps) {
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 0.12;
      setPulse(Math.abs(Math.sin(t)) * 0.6 + 0.4);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 52,
        background: '#0d0d0d',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      {/* Left: Brand */}
      <div
        style={{
          color: '#CC0000',
          fontWeight: 900,
          fontSize: 15,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontFamily: "'Arial Black', Impact, sans-serif",
        }}
      >
        BlackOS Studio
      </div>

      {/* Center: Episode badge */}
      <div
        style={{
          backgroundColor: '#CC0000',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          padding: '5px 16px',
          borderRadius: 20,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 400,
        }}
      >
        EP. {episodeNumber} — {episodeTitle}
      </div>

      {/* Right: Live preview indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#CC0000',
            opacity: pulse,
            transition: 'opacity 0.05s',
          }}
        />
        <span
          style={{
            color: '#888',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Live Preview
        </span>
      </div>
    </div>
  );
}
