import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { JBP_FONTS } from "../jbp.config";

export interface CCLine {
  text: string;
  startFrame: number;
  endFrame: number;
  speaker?: string; // optional speaker label (e.g. "JOE:")
}

interface ClosedCaptionProps {
  captions: CCLine[];
  bottomOffset?: number; // px from bottom, default 100
}

export const ClosedCaption: React.FC<ClosedCaptionProps> = ({
  captions,
  bottomOffset = 100,
}) => {
  const frame = useCurrentFrame();

  const active = captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );

  if (!active) return null;

  const fadeFrames = 6;
  const opacity = Math.min(
    interpolate(frame, [active.startFrame, active.startFrame + fadeFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(frame, [active.endFrame - fadeFrames, active.endFrame], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
        maxWidth: "76%",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: "rgba(0,0,0,0.82)",
          padding: "10px 24px",
          borderRadius: 6,
        }}
      >
        {active.speaker && (
          <span
            style={{
              color: "#CC0000",
              fontFamily: JBP_FONTS.body,
              fontWeight: 700,
              fontSize: 22,
              marginRight: 10,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {active.speaker}
          </span>
        )}
        <span
          style={{
            color: "#FFFFFF",
            fontFamily: JBP_FONTS.body,
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        >
          {active.text}
        </span>
      </div>
    </div>
  );
};
