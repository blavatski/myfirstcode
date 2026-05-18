import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";
import { fadeIn, fadeOut, slideInFromLeft } from "../utils/helpers";

/**
 * TextOverlay composition
 *
 * Demonstrates adding animated text overlays on top of a video background.
 * Shows several Remotion animation techniques:
 *  - useCurrentFrame() to get the current frame number
 *  - useVideoConfig() to get fps, width, height, durationInFrames
 *  - interpolate() for smooth value transitions
 *  - spring() for physics-based animations
 *  - Layering elements with AbsoluteFill
 */

interface TextOverlayProps {
  videoSrc?: string;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  videoSrc,
  title = "Remotion Video Editing",
  subtitle = "Programmatic video creation with React",
  backgroundColor = "#1a1a2e",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // --- Title animation ---
  // The title slides in from the left and fades in during the first 30 frames
  const titleSlideX = slideInFromLeft(frame, 0, 30, width * 0.5);
  const titleOpacity = fadeIn(frame, 0, 30);

  // After frame 120, the title starts fading out
  const titleFadeOut = fadeOut(frame, durationInFrames - 30, 30);
  const titleFinalOpacity = Math.min(titleOpacity, titleFadeOut);

  // --- Subtitle animation ---
  // Subtitle enters using a spring animation with a 15-frame delay
  const subtitleSpring = spring({
    frame: frame - 15,
    fps,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.8,
    },
  });
  const subtitleY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);

  // --- Decorative line ---
  // A horizontal accent line that expands from center
  const lineScale = spring({
    frame: frame - 25,
    fps,
    config: {
      damping: 20,
      stiffness: 180,
      mass: 0.5,
    },
  });

  // --- Badge / pill animation ---
  // A small animated badge that pulses
  const badgeOpacity = fadeIn(frame, 40, 15);
  const badgeScale = spring({
    frame: frame - 40,
    fps,
    config: {
      damping: 10,
      stiffness: 300,
      mass: 0.3,
    },
  });

  // --- Lower third bar ---
  // Slides in from the bottom at frame 60
  const lowerThirdY = interpolate(
    spring({
      frame: frame - 60,
      fps,
      config: { damping: 20, stiffness: 150, mass: 0.6 },
    }),
    [0, 1],
    [80, 0]
  );
  const lowerThirdOpacity = fadeIn(frame, 60, 20);

  // Lower third fades out before the video ends
  const lowerThirdFadeOut = fadeOut(frame, durationInFrames - 45, 20);
  const lowerThirdFinal = Math.min(lowerThirdOpacity, lowerThirdFadeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Background video layer — replaced by a gradient when no src is provided */}
      {videoSrc ? (
        <AbsoluteFill>
          <Video
            src={videoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Dark scrim so text is always readable */}
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        </AbsoluteFill>
      ) : (
        /* Animated gradient background used when no video source is provided */
        <AbsoluteFill
          style={{
            background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)`,
          }}
        />
      )}

      {/* Decorative animated circles in the background */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {[0, 1, 2].map((i) => {
          const circleOpacity = interpolate(
            frame,
            [i * 10, i * 10 + 30],
            [0, 0.08],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                opacity: circleOpacity,
                width: 200 + i * 150,
                height: 200 + i * 150,
                top: height * 0.5 - (200 + i * 150) / 2,
                left: width * 0.5 - (200 + i * 150) / 2,
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Badge / pill */}
      <div
        style={{
          position: "absolute",
          top: height * 0.28,
          left: "50%",
          transform: `translateX(-50%) scale(${badgeScale})`,
          opacity: badgeOpacity,
          backgroundColor: "rgba(83, 52, 131, 0.8)",
          border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 24,
          padding: "6px 20px",
          color: "rgba(255,255,255,0.9)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          backdropFilter: "blur(8px)",
          whiteSpace: "nowrap",
        }}
      >
        Now Playing
      </div>

      {/* Main title */}
      <div
        style={{
          position: "absolute",
          top: height * 0.35,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        <h1
          style={{
            color: "#ffffff",
            fontSize: Math.min(width * 0.065, 72),
            fontWeight: 800,
            margin: 0,
            textAlign: "center",
            transform: `translateX(${titleSlideX}px)`,
            opacity: titleFinalOpacity,
            textShadow: "0 4px 24px rgba(0,0,0,0.5)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>

        {/* Decorative accent line */}
        <div
          style={{
            marginTop: 20,
            height: 4,
            width: `${lineScale * 120}px`,
            borderRadius: 2,
            background: "linear-gradient(90deg, #e94560 0%, #533483 100%)",
          }}
        />

        {/* Subtitle */}
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: Math.min(width * 0.025, 26),
            fontWeight: 400,
            margin: "16px 0 0",
            textAlign: "center",
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleOpacity,
            maxWidth: 600,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* Lower-third bar */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          right: 60,
          transform: `translateY(${lowerThirdY}px)`,
          opacity: lowerThirdFinal,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 6,
            height: 48,
            borderRadius: 3,
            background: "linear-gradient(180deg, #e94560, #533483)",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Frame {frame} of {durationInFrames}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {fps} fps · {width}×{height}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default TextOverlay;
