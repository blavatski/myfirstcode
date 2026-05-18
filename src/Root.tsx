import React from "react";
import { Composition } from "remotion";
import { TextOverlay } from "./compositions/TextOverlay";
import { VideoTrim } from "./compositions/VideoTrim";
import { VideoTransition } from "./compositions/VideoTransition";
import { ColorGrade } from "./compositions/ColorGrade";
import { MultiClip } from "./compositions/MultiClip";
import { MyEdit } from "./compositions/MyEdit";
import { MY_EDIT } from "./videos.config";
import { JBPIntro } from "./compositions/JBPIntro";
import { JBPPodcast } from "./compositions/JBPPodcast";
import { JBPHighlight } from "./compositions/JBPHighlight";
import { JBP_EPISODE, JBP_HIGHLIGHTS } from "./jbp/jbp.config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
       * TextOverlay: 10 seconds at 30fps = 300 frames
       * Demonstrates animated text overlays with spring and interpolate
       */}
      <Composition
        id="TextOverlay"
        component={TextOverlay}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Remotion Video Editing",
          subtitle: "Programmatic video creation with React",
          backgroundColor: "#1a1a2e",
        }}
      />

      {/*
       * VideoTrim: 4 seconds at 30fps = 120 frames
       * Demonstrates OffthreadVideo with startFrom/endAt for trimming
       */}
      <Composition
        id="VideoTrim"
        component={VideoTrim}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          clipStartFrom: 30,
          clipEndAt: 150,
        }}
      />

      {/*
       * VideoTransition: 10 seconds at 30fps = 300 frames
       * Demonstrates fade, slide, and wipe transitions between clips
       */}
      <Composition
        id="VideoTransition"
        component={VideoTransition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          transitionDurationFrames: 30,
          transitionType: "fade",
        }}
      />

      {/*
       * ColorGrade: 10 seconds at 30fps = 300 frames
       * Demonstrates CSS filter-based color grading presets
       */}
      <Composition
        id="ColorGrade"
        component={ColorGrade}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          preset: "cinematic",
        }}
      />

      {/*
       * MultiClip: sum of all default clip durations = 285 frames
       * Demonstrates Series and Sequence for multi-clip sequencing
       */}
      <Composition
        id="MultiClip"
        component={MultiClip}
        durationInFrames={285}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* MyEdit: your personal edit — configure src/videos.config.ts */}
      <Composition
        id="MyEdit"
        component={MyEdit}
        durationInFrames={
          MY_EDIT.clips.reduce((sum, c) => sum + (c.endAt - c.startFrom), 0) -
          MY_EDIT.transitionFrames * (MY_EDIT.clips.length - 1)
        }
        fps={MY_EDIT.fps}
        width={MY_EDIT.width}
        height={MY_EDIT.height}
        defaultProps={{}}
      />

      {/* ── Joe Budden Podcast compositions ───────────────────────────────── */}

      {/* JBPIntro: 5-second animated episode intro card */}
      <Composition
        id="JBPIntro"
        component={JBPIntro}
        durationInFrames={150}
        fps={JBP_EPISODE.fps}
        width={JBP_EPISODE.width}
        height={JBP_EPISODE.height}
        defaultProps={{}}
      />

      {/* JBPPodcast: 2x2 multi-cam layout — set durationInFrames to your clip length */}
      <Composition
        id="JBPPodcast"
        component={JBPPodcast}
        durationInFrames={300}
        fps={JBP_EPISODE.fps}
        width={JBP_EPISODE.width}
        height={JBP_EPISODE.height}
        defaultProps={{}}
      />

      {/* JBPHighlight: full-screen highlight clip with animated quote */}
      <Composition
        id="JBPHighlight"
        component={JBPHighlight}
        durationInFrames={JBP_HIGHLIGHTS[0] ? JBP_HIGHLIGHTS[0].endAt - JBP_HIGHLIGHTS[0].startFrom + 30 : 120}
        fps={JBP_EPISODE.fps}
        width={JBP_EPISODE.width}
        height={JBP_EPISODE.height}
        defaultProps={{ highlightIndex: 0 }}
      />
    </>
  );
};
