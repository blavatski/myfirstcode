import { staticFile } from "remotion";

export const JBP_COLORS = {
  bg: "#080808",
  red: "#CC0000",
  darkRed: "#8B0000",
  white: "#F5F5F5",
  gray: "#888888",
  darkGray: "#1A1A1A",
  cardBg: "#111111",
  border: "#222222",
};

export const JBP_FONTS = {
  heading: "'Arial Black', 'Impact', sans-serif",
  body: "'Arial', 'Helvetica Neue', sans-serif",
};

// ─── Episode metadata ────────────────────────────────────────────────────────
// Edit these to match your episode
export const JBP_EPISODE = {
  number: 700,
  title: "No More Games",
  date: "2024",
  fps: 30,
  width: 1920,
  height: 1080,
};

// ─── Speakers ────────────────────────────────────────────────────────────────
// Drop your video files in public/videos/ and update the paths below.
// Each speaker needs their own camera angle recording.
export const JBP_SPEAKERS = [
  {
    id: "joe",
    name: "Joe Budden",
    title: "Host",
    accentColor: JBP_COLORS.red,
    videoSrc: staticFile("videos/joe.mp4"),
  },
  {
    id: "ice",
    name: "Ice",
    title: "Co-Host",
    accentColor: "#1A6CC4",
    videoSrc: staticFile("videos/ice.mp4"),
  },
  {
    id: "ish",
    name: "Ish",
    title: "Co-Host",
    accentColor: "#16A34A",
    videoSrc: staticFile("videos/ish.mp4"),
  },
  {
    id: "parks",
    name: "Parks",
    title: "Co-Host",
    accentColor: "#9333EA",
    videoSrc: staticFile("videos/parks.mp4"),
  },
];

// ─── Highlight clip config ───────────────────────────────────────────────────
export const JBP_HIGHLIGHTS = [
  {
    videoSrc: staticFile("videos/joe.mp4"),
    speakerName: "Joe Budden",
    quote: "I said what I said.",
    startFrom: 0,
    endAt: 90,
  },
];
