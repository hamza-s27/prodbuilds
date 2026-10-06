import { describe, expect, it } from "vitest";
import { findings } from "@/content/findings";
import type { TerminalLine } from "@/content/types";
import { cursorLine, scheduleTerminal, typedAt, visibleByLine } from "./terminal";

const TIMING = { charMs: 10, afterCommandMs: 100, afterOutputMs: 200 };
const lines: readonly TerminalLine[] = [
  { kind: "command", text: "ls" },
  { kind: "output", text: "a.txt" },
  { kind: "command", text: "pwd" },
];

describe("scheduleTerminal", () => {
  it("types commands per character and prints output in one go", () => {
    // ls: 0–20 ms, pause 100 → output at 120, pause 200 → pwd at 320, typed by 350.
    expect(scheduleTerminal(lines, TIMING)).toEqual({ starts: [0, 120, 320], totalMs: 350 });
  });

  it("finishes the real findings within 5 s (no pause control needed, WCAG 2.2.2)", () => {
    expect(scheduleTerminal(findings).totalMs).toBeLessThan(5000);
  });
});

describe("typedAt", () => {
  const schedule = scheduleTerminal(lines, TIMING);

  it("counts typed characters across lines", () => {
    expect(typedAt(lines, schedule, 0, TIMING)).toBe(0);
    expect(typedAt(lines, schedule, 10, TIMING)).toBe(1);
    expect(typedAt(lines, schedule, 50, TIMING)).toBe(2);
  });

  it("prints a whole output line at its start time", () => {
    expect(typedAt(lines, schedule, 119, TIMING)).toBe(2);
    expect(typedAt(lines, schedule, 120, TIMING)).toBe(7);
  });

  it("reaches every character by the end", () => {
    expect(typedAt(lines, schedule, schedule.totalMs, TIMING)).toBe(10);
    expect(typedAt(lines, schedule, 99_999, TIMING)).toBe(10);
  });
});

describe("visibleByLine", () => {
  it("splits a typed count into per-line visible lengths", () => {
    expect(visibleByLine(lines, 0)).toEqual([0, 0, 0]);
    expect(visibleByLine(lines, 8)).toEqual([2, 5, 1]);
    expect(visibleByLine(lines, Number.POSITIVE_INFINITY)).toEqual([2, 5, 3]);
  });
});

describe("cursorLine", () => {
  it("sits on the line being typed, moving on as each line completes", () => {
    expect(cursorLine(lines, 0)).toBe(0);
    expect(cursorLine(lines, 1)).toBe(0);
    expect(cursorLine(lines, 2)).toBe(1);
    expect(cursorLine(lines, 7)).toBe(2);
    expect(cursorLine(lines, Number.POSITIVE_INFINITY)).toBe(2);
  });
});
