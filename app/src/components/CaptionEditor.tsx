import React from 'react';
import { AppConfig } from '../App';

interface CaptionEditorProps {
  captions: AppConfig['captions'];
  onChange: (captions: AppConfig['captions']) => void;
}

export function CaptionEditor({ captions, onChange }: CaptionEditorProps) {
  const addLine = () => {
    onChange([...captions, { text: '', start: 0, end: 3, speaker: '' }]);
  };

  const removeLine = (index: number) => {
    onChange(captions.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof AppConfig['captions'][number],
    value: string | number
  ) => {
    const next = captions.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange(next);
  };

  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #222',
        borderRadius: 8,
        padding: 20,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: '1px solid #222',
        }}
      >
        <div
          style={{
            color: '#CC0000',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
          }}
        >
          Closed Captions
        </div>
        <button
          onClick={addLine}
          style={{
            background: 'transparent',
            border: '1px solid #CC0000',
            color: '#CC0000',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          + Add Line
        </button>
      </div>

      {captions.length === 0 ? (
        <div
          style={{
            color: '#444',
            fontSize: 12,
            textAlign: 'center',
            padding: '24px 0',
            letterSpacing: '0.05em',
          }}
        >
          No captions yet. Click Add Line.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {['Speaker', 'Text', 'Start (s)', 'End (s)', ''].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      color: '#555',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '4px 6px 8px',
                      borderBottom: '1px solid #1e1e1e',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {captions.map((cap, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? '#111' : '#0d0d0d' }}
                >
                  <td style={{ padding: '4px 4px' }}>
                    <input
                      type="text"
                      value={cap.speaker}
                      placeholder="HOST"
                      onChange={(e) => updateLine(i, 'speaker', e.target.value)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        color: '#f5f5f5',
                        padding: '5px 8px',
                        borderRadius: 3,
                        width: 70,
                        fontSize: 11,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input
                      type="text"
                      value={cap.text}
                      placeholder="Caption text..."
                      onChange={(e) => updateLine(i, 'text', e.target.value)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        color: '#f5f5f5',
                        padding: '5px 8px',
                        borderRadius: 3,
                        width: '100%',
                        minWidth: 120,
                        fontSize: 11,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input
                      type="number"
                      value={cap.start}
                      min={0}
                      step={0.1}
                      onChange={(e) =>
                        updateLine(i, 'start', parseFloat(e.target.value) || 0)
                      }
                      style={{
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        color: '#f5f5f5',
                        padding: '5px 8px',
                        borderRadius: 3,
                        width: 70,
                        fontSize: 11,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 4px' }}>
                    <input
                      type="number"
                      value={cap.end}
                      min={0}
                      step={0.1}
                      onChange={(e) =>
                        updateLine(i, 'end', parseFloat(e.target.value) || 0)
                      }
                      style={{
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        color: '#f5f5f5',
                        padding: '5px 8px',
                        borderRadius: 3,
                        width: 70,
                        fontSize: 11,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 4px', textAlign: 'center' }}>
                    <button
                      onClick={() => removeLine(i)}
                      title="Delete"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#555',
                        fontSize: 14,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 3,
                        lineHeight: 1,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color = '#CC0000')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLButtonElement).style.color = '#555')
                      }
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
