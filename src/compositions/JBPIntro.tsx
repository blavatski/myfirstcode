import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { JBP_COLORS, JBP_EPISODE, JBP_FONTS } from "../jbp/jbp.config";
import { Waveform } from "../jbp/components/Waveform";

interface JBPIntroProps {
  episodeNumber?: number;
  episodeTitle?: string;
  episodeDate?: string;
}

// Animates episode number and title in on a dark background with red accents.
// 5 seconds (150 frames) at 30fps.
export const JBPIntro: React.FC<JBPIntroProps> = ({
  episodeNumber = JBP_EPISODE.number,
  episodeTitle = JBP_EPISODE.title,
  episodeDate = JBP_EPISODE.date,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // ── Red top bar wipes in from left ──────────────────────────────────────
  const barWidth = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 80, mass: 0.8 } }),
    [0, 1],
    [0, width]
  );

  // ── "THE JOE BUDDEN PODCAST" label ──────────────────────────────────────
  const labelOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(
    spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 140 } }),
    [0, 1], [30, 0]
  );

  // ── Episode number (big) ─────────────────────────────────────────────────
  const epScale = spring({ frame: frame - 30, fps, config: { damping: 12, stiffness: 100, mass: 1.2 } });
  const epOpacity = interpolate(epScale, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  // ── Episode title ────────────────────────────────────────────────────────
  const titleProgress = spring({ frame: frame - 50, fps, config: { damping: 18, stiffness: 120 } });
  const titleX = interpolate(titleProgress, [0, 1], [-60, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  // ── Divider line expands ─────────────────────────────────────────────────
  const dividerScale = spring({ frame: frame - 45, fps, config: { damping: 20, stiffness: 160 } });

  // ── Waveform appears at the bottom ──────────────────────────────────────
  const waveOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Date tag ─────────────────────────────────────────────────────────────
  const dateOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: JBP_COLORS.bg }}>

      {/* Subtle grid texture overlay */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Red top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: barWidth,
          height: 6,
          backgroundColor: JBP_COLORS.red,
        }}
      />

      {/* Red bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: barWidth,
          height: 6,
          backgroundColor: JBP_COLORS.red,
        }}
      />

      {/* Center content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Show label */}
        <div
          style={{
            color: JBP_COLORS.gray,
            fontSize: 16,
            fontFamily: JBP_FONTS.body,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            opacity: labelOpacity,
            transform: `translateY(${labelY}px)`,
            marginBottom: 16,
          }}
        >
          The Joe Budden Podcast
        </div>

        {/* Episode number */}
        <div
          style={{
            color: JBP_COLORS.white,
            fontSize: 160,
            fontFamily: JBP_FONTS.heading,
            fontWeight: 900,
            lineHeight: 1,
            opacity: epOpacity,
            transform: `scale(${0.6 + epScale * 0.4})`,
            letterSpacing: "-0.04em",
          }}
        >
          #{episodeNumber}
        </div>

        {/* Divider */}
        <div
          style={{
            width: `${dividerScale * 240}px`,
            height: 3,
            backgroundColor: JBP_COLORS.red,
            borderRadius: 2,
            margin: "18px 0",
          }}
        />

        {/* Episode title */}
        <div
          style={{
            color: JBP_COLORS.white,
            fontSize: 52,
            fontFamily: JBP_FONTS.heading,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            opacity: titleOpacity,
            transform: `translateX(${titleX}px)`,
          }}
        >
          {episodeTitle}
        </div>

        {/* Date */}
        <div
          style={{
            color: JBP_COLORS.red,
            fontSize: 15,
            fontFamily: JBP_FONTS.body,
            fontWeight: 600,
            letterSpacing: "0.2em",
            marginTop: 20,
            opacity: dateOpacity,
            textTransform: "uppercase",
          }}
        >
          {episodeDate}
        </div>
      </AbsoluteFill>

      {/* Waveform bottom center */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          opacity: waveOpacity,
        }}
      >
        <Waveform barCount={60} color={JBP_COLORS.red} height={36} width={480} />
      </div>

      {/* Corner episode label */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 36,
          color: JBP_COLORS.gray,
          fontSize: 13,
          fontFamily: JBP_FONTS.body,
          letterSpacing: "0.15em",
          opacity: dateOpacity,
          textTransform: "uppercase",
        }}
      >
        EP. {episodeNumber}
      </div>
    </AbsoluteFill>
  );
};

export default JBPIntro;
