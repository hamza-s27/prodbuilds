import { describe, expect, it } from "vitest";
import { countFrame, decryptFrame, easeOutCubic, scrambleTick } from "./text-effects";

describe("scrambleTick", () => {
  it("advances once per scramble step", () => {
    expect(scrambleTick(0, 600)).toBe(0);
    expect(scrambleTick(0.5, 600)).toBe(5);
    expect(scrambleTick(1, 600)).toBe(10);
  });
});

describe("easeOutCubic", () => {
  it("starts at 0, ends at 1 and front-loads the change", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe("countFrame", () => {
  it("counts from 0 up to the target", () => {
    expect(countFrame(30, 0)).toBe("0");
    expect(countFrame(30, 1)).toBe("30");
  });

  it("never goes backwards and clamps out-of-range progress", () => {
    const frames = Array.from({ length: 21 }, (_, i) => Number(countFrame(30, i / 20)));

    expect(frames).toEqual([...frames].sort((a, b) => a - b));
    expect(countFrame(30, -1)).toBe("0");
    expect(countFrame(30, 2)).toBe("30");
  });
});

describe("decryptFrame", () => {
  it("lands on the real text", () => {
    expect(decryptFrame("Never", 1, 3)).toBe("Never");
  });

  it("settles characters left to right", () => {
    const frame = decryptFrame("Never", 0.4, 3);

    expect(frame.slice(0, 2)).toBe("Ne");
    expect(frame).toHaveLength(5);
  });

  it("is deterministic per tick and changes between ticks", () => {
    expect(decryptFrame("Never", 0, 3)).toBe(decryptFrame("Never", 0, 3));
    const ticks = new Set(Array.from({ length: 6 }, (_, tick) => decryptFrame("Never", 0, tick)));
    expect(ticks.size).toBeGreaterThan(1);
  });

  it("keeps each character's case and leaves spaces alone", () => {
    const frame = decryptFrame("No way", 0, 9);

    expect(frame[0]).toMatch(/[A-Z]/);
    expect(frame[1]).toMatch(/[a-z]/);
    expect(frame[2]).toBe(" ");
  });
});
