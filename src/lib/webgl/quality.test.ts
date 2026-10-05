import { describe, expect, it } from "vitest";
import { initialQuality, nextQuality } from "./quality";

describe("initialQuality", () => {
  it("caps device pixel ratio at 1.5 on desktop and 1 on phones", () => {
    expect(initialQuality({ dpr: 3, cores: 8, viewportWidth: 1440 }).dpr).toBe(1.5);
    expect(initialQuality({ dpr: 3, cores: 8, viewportWidth: 390 }).dpr).toBe(1);
    expect(initialQuality({ dpr: 1, cores: 8, viewportWidth: 1440 }).dpr).toBe(1);
  });

  it("renders at a lower scale and 30 fps on low-core devices", () => {
    expect(initialQuality({ dpr: 2, cores: 4, viewportWidth: 1440 })).toMatchObject({
      renderScale: 0.5,
      maxFps: 30,
    });
    expect(initialQuality({ dpr: 2, cores: 8, viewportWidth: 1440 })).toMatchObject({
      renderScale: 0.75,
      maxFps: 60,
    });
  });
});

describe("nextQuality", () => {
  const start = { dpr: 1.5, renderScale: 0.75, maxFps: 60 } as const;

  it("keeps quality while frames are fast", () => {
    expect(nextQuality([12, 14, 16], start)).toEqual(start);
  });

  it("steps the render scale down when frames average over 20 ms", () => {
    expect(nextQuality([22, 24, 23], start)).toEqual({ ...start, renderScale: 0.6 });
  });

  it("never goes below the minimum scale while frames are merely slow", () => {
    expect(nextQuality([25, 25], { ...start, renderScale: 0.4 })).toEqual({ ...start, renderScale: 0.4 });
  });

  it("gives up (poster fallback) when frames stay over 33 ms at the minimum scale", () => {
    expect(nextQuality([40, 45, 50], { ...start, renderScale: 0.4 })).toBe("fallback");
  });

  it("ignores an empty sample window", () => {
    expect(nextQuality([], start)).toEqual(start);
  });
});
