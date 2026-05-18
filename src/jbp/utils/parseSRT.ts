import { CCLine } from "../components/ClosedCaption";

// Convert SRT timestamp "00:01:23,456" → total milliseconds
function srtTimeToMs(ts: string): number {
  const [hms, ms] = ts.split(",");
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600000 + m * 60000 + s * 1000 + Number(ms);
}

// Convert milliseconds → frame number
function msToFrame(ms: number, fps: number): number {
  return Math.round((ms / 1000) * fps);
}

/**
 * Parse an SRT string into CCLine[] ready for <ClosedCaption>.
 *
 * Usage:
 *   import srtText from "../../public/captions/episode700.srt?raw";
 *   const captions = parseSRT(srtText, 30);
 */
export function parseSRT(srt: string, fps: number, speaker?: string): CCLine[] {
  const blocks = srt.trim().split(/\n\s*\n/);
  const lines: CCLine[] = [];

  for (const block of blocks) {
    const rows = block.trim().split("\n");
    if (rows.length < 3) continue;

    // rows[0] = index, rows[1] = "00:00:00,000 --> 00:00:02,000", rows[2..] = text
    const timeParts = rows[1].split(" --> ");
    if (timeParts.length !== 2) continue;

    const startMs = srtTimeToMs(timeParts[0].trim());
    const endMs = srtTimeToMs(timeParts[1].trim());
    const text = rows.slice(2).join(" ").replace(/<[^>]+>/g, "").trim();

    if (!text) continue;

    lines.push({
      text,
      startFrame: msToFrame(startMs, fps),
      endFrame: msToFrame(endMs, fps),
      speaker,
    });
  }

  return lines;
}

/**
 * Build CCLine[] manually (no SRT file needed).
 * Times are in seconds for convenience.
 *
 * Usage:
 *   const captions = buildCaptions(30, [
 *     { text: "Yo, welcome back.", start: 1.0, end: 3.5, speaker: "JOE" },
 *   ]);
 */
export function buildCaptions(
  fps: number,
  entries: { text: string; start: number; end: number; speaker?: string }[]
): CCLine[] {
  return entries.map((e) => ({
    text: e.text,
    startFrame: Math.round(e.start * fps),
    endFrame: Math.round(e.end * fps),
    speaker: e.speaker,
  }));
}
