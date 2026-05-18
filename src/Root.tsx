import React from "react";
import { Composition } from "remotion";
import { TextOverlay } from "./compositions/TextOverlay";
import { VideoTrim } from "./compositions/VideoTrim";
import { VideoTransition } from "./compositions/VideoTransition";
import { ColorGrade } from "./compositions/ColorGrade";
import { MultiClip } from "./compositions/MultiClip";

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
    </>
  );
};
