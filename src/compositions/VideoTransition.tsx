import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { fadeIn } from "../utils/helpers";

interface VideoTransitionProps {
  firstVideoSrc?: string;
  secondVideoSrc?: string;
  transitionDurationFrames?: number;
  transitionType?: "fade" | "slide" | "wipe";
}

export const VideoTransition: React.FC<VideoTransitionProps> = ({
  firstVideoSrc,
  secondVideoSrc,
  transitionDurationFrames = 30,
  transitionType = "fade",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height, fps } = useVideoConfig();

  const firstClipDuration = Math.floor((durationInFrames - transitionDurationFrames) / 2);
  const transitionStart = firstClipDuration;
  const transitionEnd = transitionStart + transitionDurationFrames;

  // Progress through the transition: 0 = fully first clip, 1 = fully second clip
  const transitionProgress = interpolate(
    frame,
    [transitionStart, transitionEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const firstClipOpacity = transitionType === "fade"
    ? interpolate(transitionProgress, [0, 1], [1, 0])
    : 1;

  const secondClipOpacity = transitionType === "fade"
    ? interpolate(transitionProgress, [0, 1], [0, 1])
    : 1;

  const slideOffset = transitionType === "slide"
    ? interpolate(transitionProgress, [0, 1], [0, -width])
    : 0;

  const wipeWidth = transitionType === "wipe"
    ? interpolate(transitionProgress, [0, 1], [0, width])
    : 0;

  const overlayOpacity = fadeIn(frame, 0, 15);

  const PlaceholderClip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #0d0d0d 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 24,
          fontFamily: "'Segoe UI', Arial, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎬</div>
        <div>{label}</div>
        <div style={{ fontSize: 14, marginTop: 8, opacity: 0.5 }}>
          Provide a video src prop to see real footage
        </div>
      </div>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* First clip */}
      <AbsoluteFill
        style={{
          opacity: firstClipOpacity,
          transform: `translateX(${slideOffset}px)`,
          overflow: "hidden",
        }}
      >
        {firstVideoSrc ? (
          <OffthreadVideo
            src={firstVideoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <PlaceholderClip label="Clip A" color="#1a1a2e" />
        )}
      </AbsoluteFill>

      {/* Second clip */}
      <AbsoluteFill style={{ opacity: secondClipOpacity }}>
        {transitionType === "wipe" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: wipeWidth,
              height: "100%",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {secondVideoSrc ? (
              <OffthreadVideo
                src={secondVideoSrc}
                style={{ width, height, objectFit: "cover" }}
              />
            ) : (
              <div style={{ width, height }}>
                <PlaceholderClip label="Clip B" color="#0f3460" />
              </div>
            )}
          </div>
        )}
        {transitionType !== "wipe" && (
          <>
            {secondVideoSrc ? (
              <OffthreadVideo
                src={secondVideoSrc}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <PlaceholderClip label="Clip B" color="#0f3460" />
            )}
          </>
        )}
      </AbsoluteFill>

      {/* HUD overlay */}
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
            TRANSITION DEMO
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textTransform: "capitalize" }}>
            Type: {transitionType} · {transitionDurationFrames} frames ({(transitionDurationFrames / fps).toFixed(1)}s)
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            Frame {frame}/{durationInFrames}
          </span>
        </div>

        {/* Transition progress indicator */}
        {frame >= transitionStart && frame <= transitionEnd && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0,0,0,0.75)",
              border: "1px solid rgba(233,69,96,0.6)",
              borderRadius: 12,
              padding: "16px 28px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ color: "#e94560", fontSize: 11, letterSpacing: "0.1em", marginBottom: 6 }}>
              TRANSITION IN PROGRESS
            </div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>
              {Math.round(transitionProgress * 100)}%
            </div>
          </div>
        )}

        {/* Bottom timeline */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 40px 16px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          }}
        >
          <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                flex: firstClipDuration,
                backgroundColor: "#e94560",
                borderRadius: "4px 0 0 4px",
              }}
            />
            <div
              style={{
                flex: transitionDurationFrames,
                background: "linear-gradient(90deg, #e94560, #533483)",
              }}
            />
            <div
              style={{
                flex: durationInFrames - transitionEnd,
                backgroundColor: "#533483",
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              marginTop: 6,
            }}
          >
            <span>Clip A</span>
            <span style={{ color: "#e94560" }}>↔ Transition</span>
            <span>Clip B</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default VideoTransition;
