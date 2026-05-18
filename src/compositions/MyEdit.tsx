import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MY_EDIT, Caption } from "../videos.config";

// ─── Color grade filter presets ─────────────────────────────────────────────
const PRESETS = {
  cinematic: "brightness(90%) contrast(115%) saturate(80%)",
  vintage:   "brightness(95%) contrast(90%) saturate(70%) sepia(30%) hue-rotate(10deg)",
  cool:      "brightness(100%) contrast(110%) saturate(90%) hue-rotate(-20deg)",
  warm:      "brightness(105%) contrast(105%) saturate(120%) hue-rotate(15deg) sepia(10%)",
  noir:      "brightness(85%) contrast(130%) grayscale(100%)",
  none:      "",
};

type Preset = keyof typeof PRESETS;

// ─── Single clip with trim + color grade ────────────────────────────────────
const Clip: React.FC<{
  src: string;
  startFrom: number;
  endAt: number;
  colorPreset: Preset;
}> = ({ src, startFrom, endAt, colorPreset }) => (
  <AbsoluteFill style={{ filter: PRESETS[colorPreset] }}>
    <OffthreadVideo
      src={src}
      startFrom={startFrom}
      endAt={endAt}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

// ─── Caption overlay ─────────────────────────────────────────────────────────
const CaptionOverlay: React.FC<{ caption: Caption }> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const localFrame = frame; // frame here is already offset by Sequence
  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    localFrame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const positionStyle: React.CSSProperties =
    caption.position === "top"
      ? { top: 60 }
      : caption.position === "center"
      ? { top: "50%", transform: "translateY(-50%)" }
      : { bottom: 60 };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        opacity,
        display: "flex",
        justifyContent: "center",
        ...positionStyle,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.65)",
          color: "#fff",
          fontSize: 38,
          fontWeight: 600,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          padding: "10px 32px",
          borderRadius: 8,
          backdropFilter: "blur(4px)",
          maxWidth: "80%",
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {caption.text}
      </div>
    </div>
  );
};

// ─── Cross-fade transition between two clips ──────────────────────────────────
const CrossFade: React.FC<{
  clipA: React.ReactNode;
  clipB: React.ReactNode;
  durationFrames: number;
}> = ({ clipA, clipB, durationFrames }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <AbsoluteFill style={{ opacity: 1 - progress }}>{clipA}</AbsoluteFill>
      <AbsoluteFill style={{ opacity: progress }}>{clipB}</AbsoluteFill>
    </>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const MyEdit: React.FC = () => {
  const { clips, transitionFrames, captions } = MY_EDIT;
  const tf = transitionFrames;

  // Calculate each clip's rendered duration (trim length minus overlap for transition)
  const clipDurations = clips.map((c) => c.endAt - c.startFrom);

  // Timeline offsets: each clip starts after previous ends minus one transition overlap
  let offset = 0;
  const clipOffsets: number[] = [];
  for (let i = 0; i < clips.length; i++) {
    clipOffsets.push(offset);
    offset += clipDurations[i] - (i < clips.length - 1 ? tf : 0);
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Render each clip in its own Sequence */}
      {clips.map((clip, i) => (
        <Sequence
          key={i}
          from={clipOffsets[i]}
          durationInFrames={clipDurations[i]}
        >
          {i === 0 || i >= clips.length ? (
            // First or last clip: no incoming cross-fade, just render directly
            <Clip
              src={clip.src}
              startFrom={clip.startFrom}
              endAt={clip.endAt}
              colorPreset={clip.colorPreset as Preset}
            />
          ) : (
            // Overlap with previous clip for cross-fade
            <CrossFade
              durationFrames={tf}
              clipA={
                <Clip
                  src={clips[i - 1].src}
                  startFrom={clips[i - 1].endAt - tf}
                  endAt={clips[i - 1].endAt}
                  colorPreset={clips[i - 1].colorPreset as Preset}
                />
              }
              clipB={
                <Clip
                  src={clip.src}
                  startFrom={clip.startFrom}
                  endAt={clip.endAt}
                  colorPreset={clip.colorPreset as Preset}
                />
              }
            />
          )}
        </Sequence>
      ))}

      {/* Render captions as timed Sequences */}
      {captions.map((caption, i) => (
        <Sequence
          key={`caption-${i}`}
          from={caption.startFrame}
          durationInFrames={caption.endFrame - caption.startFrame}
        >
          <CaptionOverlay caption={caption} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default MyEdit;
