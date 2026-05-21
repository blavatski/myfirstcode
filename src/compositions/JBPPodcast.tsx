import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { JBP_CAPTIONS, JBP_CAMERA, JBP_COLORS, JBP_EPISODE, JBP_FONTS } from "../jbp/jbp.config";
import { LowerThird } from "../jbp/components/LowerThird";
import { Waveform } from "../jbp/components/Waveform";
import { ClosedCaption } from "../jbp/components/ClosedCaption";
import { buildCaptions } from "../jbp/utils/parseSRT";

interface JBPPodcastProps {
  videoSrc?: string;
  hostName?: string;
  hostTitle?: string;
  episodeNumber?: number;
  episodeTitle?: string;
  episodeDate?: string;
  accentColor?: string;
  captions?: Array<{ text: string; start: number; end: number; speaker?: string }>;
}

export const JBPPodcast: React.FC<JBPPodcastProps> = ({
  videoSrc = JBP_CAMERA.videoSrc,
  hostName = JBP_CAMERA.hostName,
  hostTitle = JBP_CAMERA.hostTitle,
  episodeNumber = JBP_EPISODE.number,
  episodeTitle = JBP_EPISODE.title,
  accentColor = JBP_CAMERA.accentColor,
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CC_LINES = captions
    ? buildCaptions(fps, captions)
    : buildCaptions(JBP_EPISODE.fps, JBP_CAPTIONS);

  // Top and bottom bars slide in
  const barH = interpolate(
    spring({ frame, fps, config: { damping: 20, stiffness: 120 } }),
    [0, 1],
    [0, 52]
  );
  const barOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: JBP_FONTS.body }}>

      {/* Full-screen video */}
      <AbsoluteFill style={{ top: barH, bottom: barH }}>
        <OffthreadVideo
          src={videoSrc}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Bottom vignette so lower third text is readable */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.75) 100%)",
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      {/* Speaker lower third */}
      <LowerThird
        name={hostName}
        title={hostTitle}
        accentColor={accentColor}
        showAtFrame={20}
        hideAtFrame={undefined}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barH,
          backgroundColor: "#0D0D0D",
          borderBottom: `1px solid ${JBP_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          overflow: "hidden",
          opacity: barOpacity,
        }}
      >
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

        <div
          style={{
            backgroundColor: accentColor,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "4px 14px",
            borderRadius: 20,
            textTransform: "uppercase",
          }}
        >
          EP. {episodeNumber} — {episodeTitle}
        </div>

        {/* Blinking record dot */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: accentColor,
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
          height: barH,
          backgroundColor: "#0D0D0D",
          borderTop: `1px solid ${JBP_COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          overflow: "hidden",
          opacity: barOpacity,
        }}
      >
        <Waveform barCount={36} color={accentColor} height={28} width={240} />

        {/* Timecode */}
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

        <Waveform barCount={36} color={accentColor} height={28} width={240} />
      </div>

      {/* Closed captions */}
      <ClosedCaption captions={CC_LINES} bottomOffset={barH + 16} />
    </AbsoluteFill>
  );
};

export default JBPPodcast;
