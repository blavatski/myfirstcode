import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { JBP_COLORS, JBP_FONTS } from "../jbp.config";

interface LowerThirdProps {
  name: string;
  title: string;
  accentColor?: string;
  showAtFrame?: number; // frame when lower third slides in
  hideAtFrame?: number; // frame when it slides out (undefined = stays)
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor = JBP_COLORS.red,
  showAtFrame = 0,
  hideAtFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const hideAt = hideAtFrame ?? durationInFrames - 20;

  // Slide in from left
  const enterProgress = spring({
    frame: frame - showAtFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.6 },
  });

  // Slide out to left
  const exitProgress = spring({
    frame: frame - hideAt,
    fps,
    config: { damping: 18, stiffness: 200, mass: 0.5 },
  });

  const slideX = interpolate(enterProgress, [0, 1], [-320, 0]) +
                 interpolate(exitProgress, [0, 1], [0, -320]);

  const opacity = Math.min(
    interpolate(enterProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(exitProgress, [0, 0.3], [1, 0], { extrapolateLeft: "clamp" })
  );

  // Accent bar width animates in slightly after the name
  const barScale = spring({
    frame: frame - showAtFrame - 4,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.4 },
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: 0,
        transform: `translateX(${slideX}px)`,
        opacity,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        overflow: "hidden",
      }}
    >
      {/* Colored left accent bar */}
      <div
        style={{
          width: 6,
          backgroundColor: accentColor,
          transform: `scaleY(${barScale})`,
          transformOrigin: "bottom",
          flexShrink: 0,
        }}
      />

      {/* Name + title block */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(6px)",
          padding: "10px 20px 10px 14px",
          borderTop: `1px solid ${accentColor}33`,
          borderRight: `1px solid ${accentColor}33`,
          borderBottom: `1px solid ${accentColor}33`,
        }}
      >
        <div
          style={{
            color: JBP_COLORS.white,
            fontSize: 22,
            fontWeight: 900,
            fontFamily: JBP_FONTS.heading,
            letterSpacing: "0.04em",
            lineHeight: 1.2,
            textTransform: "uppercase",
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: accentColor,
            fontSize: 13,
            fontFamily: JBP_FONTS.body,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginTop: 3,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};
