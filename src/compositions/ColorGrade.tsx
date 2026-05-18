import React from "react";
import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { buildCSSFilter, fadeIn } from "../utils/helpers";

interface ColorGradeProps {
  videoSrc?: string;
  preset?: "cinematic" | "vintage" | "cool" | "warm" | "noir";
}

const PRESETS = {
  cinematic: { brightness: 90, contrast: 115, saturation: 80, hue: 0, sepia: 0, blur: 0, grayscale: 0 },
  vintage: { brightness: 95, contrast: 90, saturation: 70, hue: 10, sepia: 30, blur: 0, grayscale: 0 },
  cool: { brightness: 100, contrast: 110, saturation: 90, hue: -20, sepia: 0, blur: 0, grayscale: 0 },
  warm: { brightness: 105, contrast: 105, saturation: 120, hue: 15, sepia: 10, blur: 0, grayscale: 0 },
  noir: { brightness: 85, contrast: 130, saturation: 0, hue: 0, sepia: 0, blur: 0, grayscale: 100 },
};

export const ColorGrade: React.FC<ColorGradeProps> = ({
  videoSrc,
  preset = "cinematic",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Animate through all presets over the composition duration
  const presetKeys = Object.keys(PRESETS) as Array<keyof typeof PRESETS>;
  const segmentLength = Math.floor(durationInFrames / presetKeys.length);
  const activePresetIndex = Math.min(
    Math.floor(frame / segmentLength),
    presetKeys.length - 1
  );
  const activePreset = presetKeys[activePresetIndex];
  const currentOptions = PRESETS[activePreset];

  // Smoothly interpolate between adjacent presets during transition (last 10 frames of each segment)
  const segmentFrame = frame % segmentLength;
  const transitionStart = segmentLength - 10;
  const blendT = interpolate(segmentFrame, [transitionStart, segmentLength], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nextPresetIndex = Math.min(activePresetIndex + 1, presetKeys.length - 1);
  const nextOptions = PRESETS[presetKeys[nextPresetIndex]];

  const blendedOptions = {
    brightness: currentOptions.brightness + (nextOptions.brightness - currentOptions.brightness) * blendT,
    contrast: currentOptions.contrast + (nextOptions.contrast - currentOptions.contrast) * blendT,
    saturation: currentOptions.saturation + (nextOptions.saturation - currentOptions.saturation) * blendT,
    hue: currentOptions.hue + (nextOptions.hue - currentOptions.hue) * blendT,
    sepia: currentOptions.sepia + (nextOptions.sepia - currentOptions.sepia) * blendT,
    blur: 0,
    grayscale: currentOptions.grayscale + (nextOptions.grayscale - currentOptions.grayscale) * blendT,
  };

  const cssFilter = buildCSSFilter(blendedOptions);
  const overlayOpacity = fadeIn(frame, 0, 15);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* Video with CSS filter applied */}
      <AbsoluteFill style={{ filter: cssFilter }}>
        {videoSrc ? (
          <OffthreadVideo
            src={videoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <AbsoluteFill
            style={{
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 20 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎨</div>
              <div>Provide a videoSrc prop to apply color grading to real footage</div>
            </div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* HUD */}
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
            COLOR GRADE DEMO
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textTransform: "capitalize" }}>
            Preset: <strong style={{ color: "#fff" }}>{activePreset}</strong>
          </span>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
            Frame {frame}/{durationInFrames}
          </span>
        </div>

        {/* Filter values panel */}
        <div
          style={{
            position: "absolute",
            top: 68,
            right: 24,
            backgroundColor: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "16px 20px",
            backdropFilter: "blur(8px)",
            minWidth: 200,
          }}
        >
          <div style={{ color: "#e94560", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
            CSS FILTER VALUES
          </div>
          {[
            { label: "Brightness", value: blendedOptions.brightness, unit: "%" },
            { label: "Contrast", value: blendedOptions.contrast, unit: "%" },
            { label: "Saturation", value: blendedOptions.saturation, unit: "%" },
            { label: "Hue Rotate", value: blendedOptions.hue, unit: "deg" },
            { label: "Sepia", value: blendedOptions.sepia, unit: "%" },
            { label: "Grayscale", value: blendedOptions.grayscale, unit: "%" },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 20 }}
            >
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{label}</span>
              <span style={{ color: "#fff", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(value)}{unit}
              </span>
            </div>
          ))}
        </div>

        {/* Preset selector timeline */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 24px 16px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {presetKeys.map((key, i) => (
              <div
                key={key}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === activePresetIndex ? "#e94560" : "rgba(255,255,255,0.2)",
                  transition: "background-color 0s",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {presetKeys.map((key, i) => (
              <div
                key={key}
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: i === activePresetIndex ? "#fff" : "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  fontWeight: i === activePresetIndex ? 700 : 400,
                  textTransform: "capitalize",
                }}
              >
                {key}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ColorGrade;
