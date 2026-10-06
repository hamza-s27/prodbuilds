import { describe, expect, it } from "vitest";
import { gaugeStop, pickActive } from "./stack-dive";

const ORDER = ["product", "backend", "scaling", "automation", "cloud", "ai"] as const;

describe("pickActive", () => {
  it("is null while no section crosses the viewport centre", () => {
    expect(pickActive(ORDER, new Set())).toBeNull();
  });

  it("picks the section crossing the centre", () => {
    expect(pickActive(ORDER, new Set(["scaling"]))).toBe("scaling");
  });

  it("prefers the deeper section when two touch the centre line at a boundary", () => {
    expect(pickActive(ORDER, new Set(["backend", "scaling"]))).toBe("scaling");
  });

  it("ignores ids it doesn't know", () => {
    expect(pickActive(ORDER, new Set(["faq"]))).toBeNull();
  });
});

describe("gaugeStop", () => {
  it("places the needle on a layer's depth", () => {
    expect(gaugeStop(0)).toBe(0);
    expect(gaugeStop(4)).toBe(4);
  });

  it("parks it at the surface for the cross-cutting rail and when nothing is active", () => {
    expect(gaugeStop(null)).toBe(0);
    expect(gaugeStop(undefined)).toBe(0);
  });
});
