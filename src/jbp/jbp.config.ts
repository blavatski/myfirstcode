// ─── Video source directory ───────────────────────────────────────────────────
// Point this to wherever your videos live. Uses file:// so Remotion can read
// files outside the project folder without moving them to public/videos/.
const VIDEO_DIR = "file:///D:/vids";

function vid(filename: string) {
  return `${VIDEO_DIR}/${filename}`;
}

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

// ─── Single camera config ────────────────────────────────────────────────────
// One video file, one host. Change the filename and details below.
export const JBP_CAMERA = {
  videoSrc: vid("podcast.mp4"), // ← your video filename in D:\vids
  hostName: "Your Name",
  hostTitle: "Host",
  accentColor: JBP_COLORS.red,
};

// ─── Highlight clip config ───────────────────────────────────────────────────
// startFrom / endAt are frame numbers within your video (30 frames = 1 second)
export const JBP_HIGHLIGHTS = [
  {
    videoSrc: JBP_CAMERA.videoSrc,
    speakerName: JBP_CAMERA.hostName,
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
