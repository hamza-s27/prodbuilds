import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersSavingData, softwareWebGLAllowed, webglContextAttributes } from "./capability";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("webglContextAttributes", () => {
  it("refuses software rendering by default", () => {
    expect(webglContextAttributes()).toMatchObject({ failIfMajorPerformanceCaveat: true });
  });

  it("accepts software rendering only when explicitly allowed (tests)", () => {
    expect(webglContextAttributes(true)).toMatchObject({ failIfMajorPerformanceCaveat: false });
  });

  it("asks for a premultiplied, alpha-only canvas without depth or antialiasing", () => {
    expect(webglContextAttributes()).toMatchObject({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    });
  });
});

describe("prefersSavingData", () => {
  it("reads navigator.connection.saveData", () => {
    vi.stubGlobal("navigator", { connection: { saveData: true } });
    expect(prefersSavingData()).toBe(true);

    vi.stubGlobal("navigator", {});
    expect(prefersSavingData()).toBe(false);
  });
});

describe("softwareWebGLAllowed", () => {
  it("is off unless the test flag is set", () => {
    expect(softwareWebGLAllowed()).toBe(false);

    vi.stubGlobal("__PB_ALLOW_SOFTWARE_WEBGL__", true);
    expect(softwareWebGLAllowed()).toBe(true);
  });
});
