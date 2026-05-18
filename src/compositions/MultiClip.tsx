import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fadeIn, fadeOut, springEntrance } from "../utils/helpers";

interface ClipConfig {
  src?: string;
  label: string;
  color: string;
  durationInFrames: number;
}

interface MultiClipProps {
  clips?: ClipConfig[];
}

const DEFAULT_CLIPS: ClipConfig[] = [
  { label: "Intro", color: "#1a1a2e", durationInFrames: 60 },
  { label: "Scene A", color: "#0f3460", durationInFrames: 90 },
  { label: "Scene B", color: "#533483", durationInFrames: 75 },
  { label: "Outro", color: "#16213e", durationInFrames: 60 },
];

const ClipPlaceholder: React.FC<{ label: string; color: string; clipFrame: number; clipDuration: number }> = ({
  label,
  color,
  clipFrame,
  clipDuration,
}) => {
  const progress = clipFrame / (clipDuration - 1);
  const barWidth = interpolate(progress, [0, 1], [0, 100]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #0d0d0d 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 60, marginBottom: 20, opacity: 0.4 }}>🎞️</div>
      <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{label}</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
        Frame {clipFrame} of {clipDuration}
      </div>
      <div
        style={{
          width: 200,
          height: 4,
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: "linear-gradient(90deg, #e94560, #533483)",
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const ClipOverlay: React.FC<{ label: string; clipIndex: number; totalClips: number }> = ({
  label,
  clipIndex,
  totalClips,
}) => {
  const frame = useCurrentFrame();
  const labelOpacity = fadeIn(frame, 0, 15);
  const labelScale = springEntrance(frame, 30);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Clip label badge */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(233,69,96,0.5)",
          borderRadius: 8,
          padding: "8px 16px",
          opacity: labelOpacity,
          transform: `scale(${labelScale})`,
          backdropFilter: "blur(6px)",
        }}
      >
        <span style={{ color: "#e94560", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em" }}>
          CLIP {clipIndex + 1}/{totalClips}
        </span>
        <span style={{ color: "#fff", fontSize: 12, marginLeft: 10, fontWeight: 600 }}>
          {label}
        </span>
      </div>
    </AbsoluteFill>
  );
};

export const MultiClip: React.FC<MultiClipProps> = ({ clips = DEFAULT_CLIPS }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const totalClips = clips.length;
  const overlayOpacity = fadeIn(frame, 0, 10);

  // Calculate cumulative start frames for timeline
  const cumulativeStarts = clips.reduce<number[]>((acc, clip, i) => {
    if (i === 0) return [0];
    return [...acc, acc[i - 1] + clips[i - 1].durationInFrames];
  }, []);

  const currentClipIndex = cumulativeStarts.findIndex((start, i) => {
    const end = start + clips[i].durationInFrames;
    return frame >= start && frame < end;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/*
       * <Series> sequences multiple <Series.Sequence> children one after another.
       * Each child plays for its durationInFrames before the next begins.
       * This is equivalent to using multiple <Sequence from={...}> with
       * calculated offsets, but Series handles the math for you.
       */}
      <Series>
        {clips.map((clip, i) => (
          <Series.Sequence key={i} durationInFrames={clip.durationInFrames}>
            {clip.src ? (
              <OffthreadVideo
                src={clip.src}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <ClipPlaceholder
                label={clip.label}
                color={clip.color}
                clipFrame={0}
                clipDuration={clip.durationInFrames}
              />
            )}
            {/*
             * <Sequence> offsets its children's frame clock.
             * Here we use it to layer the per-clip overlay on top,
             * starting at frame 0 of each clip's local timeline.
             */}
            <Sequence from={0} durationInFrames={clip.durationInFrames}>
              <ClipOverlay label={clip.label} clipIndex={i} totalClips={totalClips} />
            </Sequence>
          </Series.Sequence>
        ))}
      </Series>

      {/* Global HUD overlay */}
      <AbsoluteFill style={{ opacity: overlayOpacity, pointerEvents: "none" }}>
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 52,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#e94560", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em" }}>
            MULTI-CLIP SEQUENCE
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            {totalClips} clips · {fps} fps
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            Frame {frame}/{durationInFrames}
          </span>
        </div>

        {/* Timeline at the bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 24px 14px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          <div style={{ display: "flex", gap: 3, height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            {clips.map((clip, i) => {
              const segStart = cumulativeStarts[i];
              const isActive = currentClipIndex === i;
              const progressInClip = isActive
                ? interpolate(frame - segStart, [0, clip.durationInFrames - 1], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : frame >= segStart + clip.durationInFrames
                ? 1
                : 0;

              return (
                <div
                  key={i}
                  style={{
                    flex: clip.durationInFrames,
                    position: "relative",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      width: `${progressInClip * 100}%`,
                      backgroundColor: isActive ? "#e94560" : "rgba(255,255,255,0.35)",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {clips.map((clip, i) => (
              <div
                key={i}
                style={{
                  flex: clip.durationInFrames,
                  textAlign: "center",
                  color: currentClipIndex === i ? "#fff" : "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  fontWeight: currentClipIndex === i ? 700 : 400,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {clip.label}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MultiClip;
