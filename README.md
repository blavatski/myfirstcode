# Remotion Video Editing Project

Demonstrates how to edit videos programmatically using [Remotion](https://www.remotion.dev) — a framework for creating videos with React and TypeScript.

## Quick Start

```bash
npm install
npm run studio        # open Remotion Studio (preview in browser)
```

## Rendering

```bash
# Render a specific composition to MP4
npm run render:text-overlay
npm run render:video-trim
npm run render:transition
npm run render:color-grade
npm run render:multi-clip

# Or render any composition manually:
npx remotion render src/index.ts <CompositionId> out/output.mp4
```

## Compositions

| ID | File | What it shows |
|----|------|---------------|
| `TextOverlay` | `src/compositions/TextOverlay.tsx` | Animated text overlays using `spring` and `interpolate` |
| `VideoTrim` | `src/compositions/VideoTrim.tsx` | Trimming video with `<OffthreadVideo startFrom endAt>` |
| `VideoTransition` | `src/compositions/VideoTransition.tsx` | Fade / slide / wipe transitions between clips |
| `ColorGrade` | `src/compositions/ColorGrade.tsx` | CSS filter color grading presets |
| `MultiClip` | `src/compositions/MultiClip.tsx` | Sequencing clips with `<Series>` and `<Sequence>` |

## Key Remotion APIs

### `useCurrentFrame()`
Returns the current frame number (0-indexed). The heart of every animation.

```tsx
const frame = useCurrentFrame(); // 0, 1, 2, ... durationInFrames-1
```

### `useVideoConfig()`
Returns the composition's `fps`, `width`, `height`, and `durationInFrames`.

```tsx
const { fps, width, height, durationInFrames } = useVideoConfig();
```

### `interpolate(value, inputRange, outputRange, options?)`
Maps a value from one range to another — the main tool for driving animations.

```tsx
// Fade in from frame 0 to frame 30
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### `spring({ frame, fps, config })`
Physics-based spring animation. Great for bouncy entrances.

```tsx
const scale = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
```

### `<Sequence from durationInFrames>`
Offsets children so their frame clock starts at `from`. Useful for staggering elements.

```tsx
<Sequence from={30} durationInFrames={60}>
  <MyComponent /> {/* sees frame 0..59, appears at global frame 30 */}
</Sequence>
```

### `<Series>` / `<Series.Sequence>`
Plays children one after another without manual offset math.

```tsx
<Series>
  <Series.Sequence durationInFrames={90}><ClipA /></Series.Sequence>
  <Series.Sequence durationInFrames={60}><ClipB /></Series.Sequence>
</Series>
```

### `<OffthreadVideo src startFrom endAt>`
Renders a video file frame-by-frame off the main thread. Use `startFrom` and `endAt` to trim the source clip.

```tsx
// Show source frames 30-150 (skips first second, stops at frame 150)
<OffthreadVideo src="/path/to/video.mp4" startFrom={30} endAt={150} />
```

### `<Audio src>`
Adds audio to a composition. Supports `startFrom`, `endAt`, `volume`, and `muted`.

```tsx
import { Audio } from "remotion";
<Audio src="/path/to/audio.mp3" startFrom={0} endAt={150} volume={0.8} />
```

## Project Structure

```
src/
  index.ts                     # Entry point — calls registerRoot()
  Root.tsx                     # Registers all <Composition> elements
  compositions/
    TextOverlay.tsx            # Animated text overlay example
    VideoTrim.tsx              # Video trimming with OffthreadVideo
    VideoTransition.tsx        # Fade/slide/wipe clip transitions
    ColorGrade.tsx             # CSS filter color grading
    MultiClip.tsx              # Multi-clip sequencing with Series
  utils/
    helpers.ts                 # Shared animation utilities
remotion.config.ts             # Remotion bundler & render config
tsconfig.json
package.json
```

## Using Your Own Videos

Pass a `videoSrc` prop to any composition that accepts one:

```tsx
// In Root.tsx defaultProps:
defaultProps={{
  videoSrc: "https://example.com/my-video.mp4",
  // or a local file served by Remotion's dev server:
  // videoSrc: staticFile("my-video.mp4"),  // place file in public/
}}
```

For local files, put them in a `public/` folder and import `staticFile` from `remotion`:

```tsx
import { staticFile } from "remotion";
const src = staticFile("my-video.mp4"); // => /my-video.mp4
```
