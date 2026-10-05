import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MOTION_STORAGE_KEY,
  readMotionPreference,
  subscribeMotionPreference,
  writeMotionPreference,
} from "./motion-preference";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("motion preference", () => {
  it("defaults to on", () => {
    expect(readMotionPreference()).toBe("on");
  });

  it("persists 'off' in localStorage (not a cookie) and marks <html>", () => {
    writeMotionPreference("off");

    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("off");
    expect(readMotionPreference()).toBe("off");
    expect(document.documentElement.dataset.motion).toBe("off");
    expect(document.cookie).toBe("");
  });

  it("clears the flag when switched back on", () => {
    writeMotionPreference("off");
    writeMotionPreference("on");

    expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.dataset.motion).toBeUndefined();
  });

  it("notifies subscribers, and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeMotionPreference(listener);

    writeMotionPreference("off");
    unsubscribe();
    writeMotionPreference("on");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("still works when storage is unavailable (private mode)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(readMotionPreference()).toBe("on");
    expect(() => writeMotionPreference("off")).not.toThrow();
    expect(document.documentElement.dataset.motion).toBe("off");
  });
});
