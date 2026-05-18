// ─── Video source directory ───────────────────────────────────────────────────
// Change this to wherever your clips live on your machine.
const VIDEO_DIR = "file:///D:/vids";

export const MY_VIDEOS = {
  clip1: `${VIDEO_DIR}/clip1.mp4`,
  clip2: `${VIDEO_DIR}/clip2.mp4`,
  clip3: `${VIDEO_DIR}/clip3.mp4`,
};

// ─── CAPTION CONFIG ─────────────────────────────────────────────────────────
export interface Caption {
  text: string;
  startFrame: number; // frame when caption appears
  endFrame: number;   // frame when caption disappears
  position?: "top" | "center" | "bottom";
}

// ─── EDIT TIMELINE CONFIG ───────────────────────────────────────────────────
export const MY_EDIT = {
  fps: 30,
  width: 1920,
  height: 1080,

  clips: [
    {
      src: MY_VIDEOS.clip1,
      startFrom: 0,   // trim: start at this frame within the source video
      endAt: 150,     // trim: end at this frame within the source video (150 = 5s at 30fps)
      colorPreset: "cinematic" as const,
    },
    {
      src: MY_VIDEOS.clip2,
      startFrom: 30,
      endAt: 210,
      colorPreset: "warm" as const,
    },
    {
      src: MY_VIDEOS.clip3,
      startFrom: 0,
      endAt: 120,
      colorPreset: "cool" as const,
    },
  ],

  transitionFrames: 20, // number of frames for cross-fade between clips

  captions: [
    { text: "Opening shot", startFrame: 10, endFrame: 80, position: "bottom" as const },
    { text: "Scene two", startFrame: 175, endFrame: 240, position: "bottom" as const },
    { text: "Final scene", startFrame: 380, endFrame: 460, position: "bottom" as const },
  ],
};
