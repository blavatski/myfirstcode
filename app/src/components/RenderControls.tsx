import React, { useEffect, useRef, useState } from 'react';

interface RenderControlsProps {
  composition: string;
}

type Status = 'idle' | 'rendering' | 'done' | 'error';

export function RenderControls({ composition }: RenderControlsProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [outputPath, setOutputPath] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (showLogs && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  const handleRender = async () => {
    if (status === 'rendering') return;

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('rendering');
    setLogs([]);
    setOutputPath('');
    setShowLogs(true);

    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ composition }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setStatus('error');
        setLogs((prev) => [...prev, `HTTP error: ${res.status}`]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);
            if (event.type === 'log') {
              setLogs((prev) => [...prev, event.message]);
            } else if (event.type === 'done') {
              setStatus('done');
              setOutputPath(event.output ?? '');
            } else if (event.type === 'error') {
              setStatus('error');
              setLogs((prev) => [...prev, event.message]);
            }
          } catch {
            // ignore malformed JSON
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setStatus('error');
      setLogs((prev) => [...prev, String(err)]);
    }
  };

  return (
    <div
      style={{
        background: '#0d0d0d',
        borderTop: '1px solid #222',
        flexShrink: 0,
      }}
    >
      {/* Main control row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 24px',
        }}
      >
        {/* Render button */}
        <button
          onClick={handleRender}
          disabled={status === 'rendering'}
          style={{
            background: status === 'rendering' ? '#5a0000' : '#CC0000',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: status === 'rendering' ? 'not-allowed' : 'pointer',
            opacity: status === 'rendering' ? 0.7 : 1,
            transition: 'background 0.15s, opacity 0.15s',
            flexShrink: 0,
          }}
        >
          Render {composition}
        </button>

        {/* Status indicator */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          {status === 'rendering' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SpinnerIcon />
              <span
                style={{
                  color: '#888',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Rendering...
              </span>
            </div>
          )}
          {status === 'done' && (
            <span
              style={{
                color: '#22c55e',
                fontSize: 12,
                letterSpacing: '0.06em',
              }}
            >
              ✓ Saved to {outputPath}
            </span>
          )}
          {status === 'error' && (
            <span
              style={{
                color: '#ef4444',
                fontSize: 12,
                letterSpacing: '0.06em',
              }}
            >
              ✗ Render failed
            </span>
          )}
        </div>

        {/* Show logs toggle */}
        <button
          onClick={() => setShowLogs((v) => !v)}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: showLogs ? '#f5f5f5' : '#666',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {showLogs ? 'Hide Logs' : 'Show Logs'}
        </button>
      </div>

      {/* Log panel */}
      {showLogs && (
        <div
          style={{
            maxHeight: 200,
            overflowY: 'auto',
            background: '#0a0a0a',
            borderTop: '1px solid #1a1a1a',
            padding: '12px 24px',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 11,
            color: '#888',
            lineHeight: 1.6,
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: '#333' }}>No output yet.</span>
          ) : (
            logs.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.toLowerCase().includes('error')
                    ? '#ef4444'
                    : line.toLowerCase().includes('warn')
                    ? '#f59e0b'
                    : '#888',
                }}
              >
                {line}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
}

function SpinnerIcon() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let frame: number;
    const tick = () => {
      setAngle((a) => (a + 6) % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        width: 14,
        height: 14,
        border: '2px solid #333',
        borderTopColor: '#CC0000',
        borderRadius: '50%',
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}
