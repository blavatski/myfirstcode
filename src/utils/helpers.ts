import { interpolate, spring } from "remotion";

/**
 * Clamps a value between a minimum and maximum
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts seconds to frames based on fps
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/**
 * Converts frames to seconds based on fps
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Creates a fade-in animation that goes from 0 to 1 over a given duration
 */
export function fadeIn(
  frame: number,
  startFrame: number,
  durationFrames: number
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Creates a fade-out animation that goes from 1 to 0 over a given duration
 */
export function fadeOut(
  frame: number,
  startFrame: number,
  durationFrames: number
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Creates a cross-fade value (0 = first clip, 1 = second clip)
 */
export function crossFade(
  frame: number,
  startFrame: number,
  durationFrames: number
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Spring-based entrance animation - returns a scale/opacity value
 * that bounces from 0 to 1
 */
export function springEntrance(
  frame: number,
  fps: number,
  delay = 0
): number {
  return spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    },
  });
}

/**
 * Slide animation - returns an x-offset in pixels for slide-in from left
 */
export function slideInFromLeft(
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance = 200
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [-distance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
}

/**
 * Slide animation - returns an x-offset in pixels for slide-in from right
 */
export function slideInFromRight(
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance = 200
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [distance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
}

/**
 * Creates a slide-out to the left offset
 */
export function slideOutToLeft(
  frame: number,
  startFrame: number,
  durationFrames: number,
  distance = 200
): number {
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, -distance],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
}

/**
 * Generates a CSS filter string for color grading
 */
export interface ColorGradeOptions {
  brightness?: number; // 0-200, default 100
  contrast?: number;   // 0-200, default 100
  saturation?: number; // 0-200, default 100
  hue?: number;        // -180 to 180 degrees, default 0
  sepia?: number;      // 0-100, default 0
  blur?: number;       // pixels, default 0
  grayscale?: number;  // 0-100, default 0
}

export function buildCSSFilter(options: ColorGradeOptions): string {
  const {
    brightness = 100,
    contrast = 100,
    saturation = 100,
    hue = 0,
    sepia = 0,
    blur = 0,
    grayscale = 0,
  } = options;

  const filters: string[] = [];

  if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
  if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
  if (saturation !== 100) filters.push(`saturate(${saturation}%)`);
  if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
  if (sepia > 0) filters.push(`sepia(${sepia}%)`);
  if (blur > 0) filters.push(`blur(${blur}px)`);
  if (grayscale > 0) filters.push(`grayscale(${grayscale}%)`);

  return filters.length > 0 ? filters.join(" ") : "none";
}

/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Generates a pulsing scale animation (grows and shrinks repeatedly)
 */
export function pulse(frame: number, fps: number, speed = 1): number {
  const period = fps / speed;
  const t = (frame % period) / period;
  return 1 + 0.05 * Math.sin(t * 2 * Math.PI);
}

/**
 * Converts a hex color string to an RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Creates an rgba CSS color string
 */
export function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}
