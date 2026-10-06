// Typing schedule for the findings terminal: commands are typed a character
// at a time, output lines print whole. State is one number: characters shown.
import type { TerminalLine } from "@/content/types";

export interface TerminalTiming {
  readonly charMs: number;
  readonly afterCommandMs: number;
  readonly afterOutputMs: number;
}

export interface TerminalSchedule {
  /** When each line starts, in ms from the start of the run. */
  readonly starts: readonly number[];
  readonly totalMs: number;
}

export const TERMINAL_TIMING: TerminalTiming = { charMs: 24, afterCommandMs: 260, afterOutputMs: 380 };

const lineDuration = (line: TerminalLine, timing: TerminalTiming) =>
  line.kind === "command" ? line.text.length * timing.charMs : 0;

const pauseAfter = (line: TerminalLine, timing: TerminalTiming) =>
  line.kind === "command" ? timing.afterCommandMs : timing.afterOutputMs;

export function scheduleTerminal(
  lines: readonly TerminalLine[],
  timing: TerminalTiming = TERMINAL_TIMING,
): TerminalSchedule {
  const starts = lines.reduce<number[]>((acc, _line, index) => {
    const previous = lines[index - 1];
    const start = previous
      ? acc[index - 1]! + lineDuration(previous, timing) + pauseAfter(previous, timing)
      : 0;
    return [...acc, start];
  }, []);
  const last = lines.length - 1;
  const totalMs = last < 0 ? 0 : starts[last]! + lineDuration(lines[last]!, timing);
  return { starts, totalMs };
}

/** Characters on screen (across all lines) at `elapsedMs` into the run. */
export function typedAt(
  lines: readonly TerminalLine[],
  schedule: TerminalSchedule,
  elapsedMs: number,
  timing: TerminalTiming = TERMINAL_TIMING,
): number {
  return lines.reduce((total, line, index) => {
    const since = elapsedMs - schedule.starts[index]!;
    if (since < 0) return total;
    if (line.kind === "output") return total + line.text.length;
    return total + Math.min(line.text.length, Math.floor(since / timing.charMs));
  }, 0);
}

/** How many characters of each line a typed count reveals. */
export function visibleByLine(lines: readonly TerminalLine[], typed: number): number[] {
  let remaining = typed;
  return lines.map((line) => {
    const shown = Math.max(0, Math.min(line.text.length, remaining));
    remaining -= line.text.length;
    return shown;
  });
}

/** The line the cursor sits on: the first one not yet complete, else the last. */
export function cursorLine(lines: readonly TerminalLine[], typed: number): number {
  const visible = visibleByLine(lines, typed);
  const index = lines.findIndex((line, i) => visible[i]! < line.text.length);
  return index === -1 ? lines.length - 1 : index;
}
