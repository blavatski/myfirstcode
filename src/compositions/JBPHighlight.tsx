import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { JBP_COLORS, JBP_EPISODE, JBP_FONTS, JBP_HIGHLIGHTS } from "../jbp/jbp.config";
import { LowerThird } from "../jbp/components/LowerThird";
import { Waveform } from "../jbp/components/Waveform";
import { ClosedCaption, CCLine } from "../jbp/components/ClosedCaption";

interface JBPHighlightProps {
  highlightIndex?: number;
  captions?: CCLine[];   // optional CC lines; auto-generates from quote if omitted
}

export const JBPHighlight: React.FC<JBPHighlightProps> = ({
  highlightIndex = 0,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const clip = JBP_HIGHLIGHTS[highlightIndex] ?? JBP_HIGHLIGHTS[0];

  // Auto-generate a single CC line from the clip's quote if none provided
  const ccLines: CCLine[] = captions ?? [
    {
      text: clip.quote,
      startFrame: 20,
      endFrame: durationInFrames - 20,
      speaker: clip.speakerName.split(" ")[0].toUpperCase(),
    },
  ];

  // ── Full-screen video scale-in ───────────────────────────────────────────
  const scaleIn = spring({ frame, fps, config: { damping: 20, stiffness: 80, mass: 0.8 } });
  const videoScale = interpolate(scaleIn, [0, 1], [1.08, 1.0]);

  // ── Dark vignette fades in ───────────────────────────────────────────────
  const vignetteOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  // ── Red accent bar sweeps across bottom ─────────────────────────────────
  const accentBarW = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 100 } }),
    [0, 1],
    [0, width]
  );

  // ── Quote text animates in word by word ─────────────────────────────────
  const words = clip.quote.split(" ");
  const wordDelay = 6; // frames between each word
  const quoteStartFrame = 25;

  // ── Episode stamp fade ───────────────────────────────────────────────────
  const stampOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Fade out at end ──────────────────────────────────────────────────────
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>

      {/* Full-screen video */}
      <AbsoluteFill
        style={{
          transform: `scale(${videoScale})`,
          opacity: fadeOut,
        }}
      >
        <OffthreadVideo
          src={clip.videoSrc}
          startFrom={clip.startFrom}
          endAt={clip.endAt}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Gradient vignette — heavier at bottom for text legibility */}
      <AbsoluteFill
        style={{
          opacity: vignetteOpacity * fadeOut,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Red accent bar at very bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: accentBarW,
          height: 5,
          backgroundColor: JBP_COLORS.red,
          opacity: fadeOut,
        }}
      />

      {/* Speaker lower third */}
      <LowerThird
        name={clip.speakerName}
        title="The Joe Budden Podcast"
        accentColor={JBP_COLORS.red}
        showAtFrame={8}
        hideAtFrame={durationInFrames - 25}
      />

      {/* Quote text */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 48,
          right: 48,
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {words.map((word, i) => {
            const wordFrame = quoteStartFrame + i * wordDelay;
            const wordSpring = spring({
              frame: frame - wordFrame,
              fps,
              config: { damping: 16, stiffness: 180, mass: 0.5 },
            });
            const wordOpacity = interpolate(wordSpring, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
            const wordY = interpolate(wordSpring, [0, 1], [18, 0]);

            return (
              <span
                key={i}
                style={{
                  color: JBP_COLORS.white,
                  fontSize: 52,
                  fontFamily: JBP_FONTS.heading,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  display: "inline-block",
                  lineHeight: 1.15,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      {/* Episode stamp — top right */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 32,
          opacity: stampOpacity * fadeOut,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <div
          style={{
            backgroundColor: JBP_COLORS.red,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            padding: "4px 12px",
            borderRadius: 3,
            textTransform: "uppercase",
            fontFamily: JBP_FONTS.body,
          }}
        >
          EP. {JBP_EPISODE.number}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: JBP_FONTS.body,
          }}
        >
          {JBP_EPISODE.title}
        </div>
      </div>

      {/* Waveform top left */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 32,
          opacity: stampOpacity * fadeOut,
        }}
      >
        <Waveform barCount={24} color={JBP_COLORS.red} height={28} width={160} />
      </div>

      {/* Closed captions — sits between the accent bar and the quote */}
      <ClosedCaption captions={ccLines} bottomOffset={24} />
    </AbsoluteFill>
  );
};

export default JBPHighlight;
