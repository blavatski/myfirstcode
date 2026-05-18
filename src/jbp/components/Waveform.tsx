import React from "react";
import { useCurrentFrame } from "remotion";
import { JBP_COLORS } from "../jbp.config";

interface WaveformProps {
  barCount?: number;
  color?: string;
  height?: number;
  width?: number;
  active?: boolean; // if false, shows flat/idle state
}

// Deterministic pseudo-random using frame + bar index so it's reproducible
function waveHeight(frame: number, barIndex: number, barCount: number): number {
  const t = frame / 8;
  const base =
    Math.sin(t * 1.7 + barIndex * 0.6) * 0.35 +
    Math.sin(t * 3.1 + barIndex * 1.1) * 0.25 +
    Math.sin(t * 0.9 + barIndex * 0.3) * 0.2 +
    Math.cos(t * 2.3 + barIndex * 0.8) * 0.2;

  // Normalize to 0.05–1.0 range
  return Math.max(0.05, Math.min(1.0, (base + 1) / 2));
}

export const Waveform: React.FC<WaveformProps> = ({
  barCount = 40,
  color = JBP_COLORS.red,
  height = 48,
  width = 200,
  active = true,
}) => {
  const frame = useCurrentFrame();
  const barWidth = Math.floor((width - barCount * 2) / barCount);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        height,
        width,
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const h = active ? waveHeight(frame, i, barCount) : 0.08;
        return (
          <div
            key={i}
            style={{
              width: Math.max(barWidth, 2),
              height: `${h * 100}%`,
              backgroundColor: color,
              borderRadius: 2,
              opacity: active ? 0.7 + h * 0.3 : 0.3,
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
};
