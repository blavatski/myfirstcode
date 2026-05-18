import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fadeIn } from "../utils/helpers";

/**
 * VideoTrim composition
 *
 * Demonstrates how to trim/clip video segments using <OffthreadVideo>
 * with the `startFrom` and `endAt` props.
 *
 * Key Remotion APIs used:
 *  - <OffthreadVideo> — renders a video frame-by-frame off the main thread
 *      - startFrom: skip this many frames from the start of the source video
 *      - endAt:     stop rendering after this frame of the source video
 *  - useCurrentFrame() — current playback frame
 *  - useVideoConfig() — composition dimensions and fps
 *  - interpolate()    — progress bar animation
 */

interface VideoTrimProps {
  /**
   * URL to the source video file.
   * For a real project replace with an actual video URL or local asset.
   */
  videoSrc?: string;
  /** Frame in the source video where the clip should start (default 30 = 1 s at 30 fps) */
  clipStartFrom?: number;
  /** Frame in the source video where the clip should end (default 150 = 5 s at 30 fps) */
  clipEndAt?: number;
}

export const VideoTrim: React.FC<VideoTrimProps> = ({
  videoSrc,
  clipStartFrom = 30,
  clipEndAt = 150,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Fade-in overlay during the first 15 frames
  const overlayOpacity = fadeIn(frame, 0, 15);

  // Progress through the current composition (0 → 1)
  const progress = frame / (durationInFrames - 1);

  // Width of the progress bar (in pixels)
  const progressBarWidth = interpolate(progress, [0, 1], [0, width - 120]);

  // The clip duration (in source frames) that we are playing
  const clipDuration = clipEndAt - clipStartFrom;

  // Which source frame we are currently showing
  const currentSourceFrame = clipStartFrom + Math.round(frame * (clipDuration / durationInFrames));

  // Timecode helpers
  const toTimecode = (f: number) => {
    const secs = f / fps;
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    const frames = Math.floor(f % fps)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}:${frames}`;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d0d0d",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Video layer                                                          */}
      {/* ------------------------------------------------------------------ */}
      {videoSrc ? (
        <AbsoluteFill>
          {/*
           * OffthreadVideo renders every frame of the video off the main
           * browser thread, which avoids dropped frames during render.
           *
           * startFrom — skip this many frames from the beginning of the
           *             source video (e.g. 30 frames = 1 second at 30 fps)
           * endAt     — stop at this frame of the source video (exclusive).
           *             The composition will still run for durationInFrames
           *             frames but the video won't advance past clipEndAt.
           */}
          <OffthreadVideo
            src={videoSrc}
            startFrom={clipStartFrom}
            endAt={clipEndAt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </AbsoluteFill>
      ) : (
        /* Placeholder when no video source is provided */
        <AbsoluteFill
          style={{
            background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          {/* Film-strip icon placeholder */}
          <div style={{ fontSize: 80, opacity: 0.25 }}>🎬</div>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 20,
              margin: 0,
              textAlign: "center",
            }}
          >
            Provide a <code>videoSrc</code> prop to see the trimmed video
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 14,
              margin: 0,
            }}
          >
            Trimming: frame {clipStartFrom} → {clipEndAt} of source
          </p>
        </AbsoluteFill>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Overlay UI                                                           */}
      {/* ------------------------------------------------------------------ */}
      <AbsoluteFill style={{ opacity: overlayOpacity }}>

        {/* Top info bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#e94560", fontWeight: 700, fontSize: 14, letterSpacing: "0.1em" }}>
            VIDEO TRIM DEMO
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Source clip: {toTimecode(clipStartFrom)} – {toTimecode(clipEndAt)}
          </span>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            {fps} fps
          </span>
        </div>

        {/* OffthreadVideo trim callout box */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 24,
            backgroundColor: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(233,69,96,0.5)",
            borderRadius: 10,
            padding: "14px 18px",
            backdropFilter: "blur(8px)",
            maxWidth: 360,
          }}
        >
          <div
            style={{
              color: "#e94560",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            OFFTHREADVIDEO TRIM
          </div>
          <code
            style={{
              color: "#7ec8e3",
              fontSize: 12,
              lineHeight: 1.7,
              display: "block",
              whiteSpace: "pre",
            }}
          >
{`<OffthreadVideo
  src={videoSrc}
  startFrom={${clipStartFrom}}
  endAt={${clipEndAt}}
/>`}
          </code>
          <div
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              lineHeight: 1.6,
            }}
          >
            Skips the first {clipStartFrom} frames of the source
            and stops playback at frame {clipEndAt}.
          </div>
        </div>

        {/* Current source frame indicator */}
        <div
          style={{
            position: "absolute",
            top: 72,
            right: 24,
            backgroundColor: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "14px 20px",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: "0.08em", marginBottom: 4 }}>
            SOURCE FRAME
          </div>
          <div style={{ color: "#ffffff", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
            {currentSourceFrame}
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 4 }}>
            of {clipEndAt - 1}
          </div>
        </div>

        {/* Bottom progress / timeline bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 60px 20px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          {/* Timecode row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.55)",
              fontSize: 12,
              marginBottom: 8,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{toTimecode(frame)}</span>
            <span style={{ color: "#e94560", fontWeight: 700 }}>
              COMPOSITION FRAME {frame}
            </span>
            <span>{toTimecode(durationInFrames - 1)}</span>
          </div>

          {/* Progress bar track */}
          <div
            style={{
              height: 6,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: progressBarWidth,
                background: "linear-gradient(90deg, #e94560, #f5a623)",
                borderRadius: 3,
                transition: "width 0s",
              }}
            />
          </div>

          {/* Trim region markers */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
            }}
          >
            <span>▶ IN {toTimecode(clipStartFrom)}</span>
            <span>OUT {toTimecode(clipEndAt)} ◀</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoTrim;
