import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { JBP_CAPTIONS, JBP_COLORS, JBP_EPISODE, JBP_FONTS, JBP_SPEAKERS } from "../jbp/jbp.config";
import { LowerThird } from "../jbp/components/LowerThird";
import { Waveform } from "../jbp/components/Waveform";
import { ClosedCaption } from "../jbp/components/ClosedCaption";
import { buildCaptions } from "../jbp/utils/parseSRT";

const CC_LINES = buildCaptions(JBP_EPISODE.fps, JBP_CAPTIONS);

// One speaker cell in the 2x2 grid
const SpeakerCell: React.FC<{
  speaker: (typeof JBP_SPEAKERS)[number];
  style?: React.CSSProperties;
  showLowerThird?: boolean;
}> = ({ speaker, style, showLowerThird = true }) => {
  return (
    <div
      style={{
        position: "relative",
        backgroundColor: JBP_COLORS.darkGray,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Video feed */}
      <OffthreadVideo
        src={speaker.videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Accent border on active speaker */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `2px solid ${speaker.accentColor}44`,
          pointerEvents: "none",
        }}
      />

      {/* Lower third */}
      {showLowerThird && (
        <LowerThird
          name={speaker.name}
          title={speaker.title}
          accentColor={speaker.accentColor}
          showAtFrame={15}
          hideAtFrame={undefined}
        />
      )}
    </div>
  );
};

// 2x2 grid layout
export const JBPPodcast: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Top bar slides down
  const topBarH = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 120 } }),
    [0, 1],
    [0, 52]
  );

  // Bottom bar slides up
  const bottomBarH = interpolate(
    spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 120 } }),
    [0, 1],
    [0, 52]
  );

  const topBarOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const cellW = width / 2;
  const cellH = (height - topBarH - bottomBarH) / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: JBP_FONTS.body }}>

      {/* 2x2 speaker grid */}
      <div
        style={{
          position: "absolute",
          top: topBarH,
          left: 0,
          right: 0,
          bottom: bottomBarH,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 3,
          backgroundColor: "#000",
        }}
      >
        {JBP_SPEAKERS.map((speaker) => (
          <SpeakerCell key={speaker.id} speaker={speaker} />
        ))}
      </div>

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: topBarH,
          backgroundColor: "#0D0D0D",
          borderBottom: `1px solid ${JBP_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          overflow: "hidden",
          opacity: topBarOpacity,
        }}
      >
        {/* Show name */}
        <div
          style={{
            color: JBP_COLORS.white,
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: JBP_FONTS.heading,
          }}
        >
          The Joe Budden Podcast
        </div>

        {/* Episode pill */}
        <div
          style={{
            backgroundColor: JBP_COLORS.red,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "4px 14px",
            borderRadius: 20,
            textTransform: "uppercase",
          }}
        >
          EP. {JBP_EPISODE.number} — {JBP_EPISODE.title}
        </div>

        {/* Live dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: JBP_COLORS.red,
              opacity: Math.abs(Math.sin(frame / 15)) * 0.6 + 0.4,
            }}
          />
          <span
            style={{
              color: JBP_COLORS.gray,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Recording
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: bottomBarH,
          backgroundColor: "#0D0D0D",
          borderTop: `1px solid ${JBP_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          overflow: "hidden",
          opacity: topBarOpacity,
        }}
      >
        {/* Waveform left */}
        <Waveform barCount={36} color={JBP_COLORS.red} height={28} width={240} />

        {/* Center timestamp */}
        <div
          style={{
            color: JBP_COLORS.gray,
            fontSize: 13,
            letterSpacing: "0.1em",
            fontFamily: JBP_FONTS.body,
          }}
        >
          {String(Math.floor(frame / (30 * 60))).padStart(2, "0")}:
          {String(Math.floor((frame % (30 * 60)) / 30)).padStart(2, "0")}:
          {String(Math.floor(frame % 30)).padStart(2, "0")}
        </div>

        {/* Waveform right */}
        <Waveform barCount={36} color={JBP_COLORS.red} height={28} width={240} />
      </div>

      {/* Closed captions — sits above the bottom bar */}
      <ClosedCaption captions={CC_LINES} bottomOffset={bottomBarH + 16} />
    </AbsoluteFill>
  );
};

export default JBPPodcast;
