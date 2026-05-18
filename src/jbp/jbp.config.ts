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

// ─── Closed captions ─────────────────────────────────────────────────────────
// Times are in seconds. Use buildCaptions() or parseSRT() from
// src/jbp/utils/parseSRT.ts to generate these from a .srt file instead.
//
// Tip: one CCLine per sentence/breath. Keep lines under ~10 words.
export const JBP_CAPTIONS = [
  { text: "Yo, welcome back to the show.", start: 1.5,  end: 4.0,  speaker: "JOE"   },
  { text: "Episode seven hundred, let's go.",  start: 4.2,  end: 6.8,  speaker: "JOE"   },
  { text: "Seven hundred episodes, bro.",       start: 7.0,  end: 9.2,  speaker: "ICE"   },
  { text: "That's actually crazy.",             start: 9.4,  end: 11.0, speaker: "ISH"   },
  { text: "We been doing this forever.",        start: 11.2, end: 13.5, speaker: "PARKS" },
  { text: "No more games.",                     start: 14.0, end: 16.0, speaker: "JOE"   },
];
