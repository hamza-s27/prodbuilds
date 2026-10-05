import { describe, expect, it } from "vitest";
import { deriveRenderState } from "./render-state";

const base = { motionAllowed: true, webglSupported: true, status: "ready", running: true } as const;

describe("deriveRenderState", () => {
  it("is off whenever motion is not allowed, even if WebGL is ready", () => {
    expect(deriveRenderState({ ...base, motionAllowed: false })).toBe("off");
  });

  it("falls back without WebGL or after a failure", () => {
    expect(deriveRenderState({ ...base, webglSupported: false })).toBe("fallback");
    expect(deriveRenderState({ ...base, status: "failed" })).toBe("fallback");
  });

  it("shows the poster until the engine has drawn a frame", () => {
    expect(deriveRenderState({ ...base, status: "idle" })).toBe("poster");
  });

  it("is running or paused once ready", () => {
    expect(deriveRenderState(base)).toBe("running");
    expect(deriveRenderState({ ...base, running: false })).toBe("paused");
  });
});
