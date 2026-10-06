import { describe, expect, it } from "vitest";
import { activeStage, stageState } from "./pipeline";

const states = (active: number) => [0, 1, 2, 3].map((index) => stageState(index, active));

describe("stageState", () => {
  it("queues every stage before the run starts", () => {
    expect(states(-1)).toEqual(["queued", "queued", "queued", "queued"]);
  });

  it("passes earlier stages, runs the active one and queues the rest", () => {
    expect(states(1)).toEqual(["passed", "running", "queued", "queued"]);
  });

  it("passes everything once the run is complete", () => {
    expect(states(4)).toEqual(["passed", "passed", "passed", "passed"]);
  });
});

describe("activeStage", () => {
  it("maps run progress onto equal stage slots", () => {
    expect(activeStage(0, 4)).toBe(0);
    expect(activeStage(0.26, 4)).toBe(1);
    expect(activeStage(0.99, 4)).toBe(3);
    expect(activeStage(1, 4)).toBe(4);
  });

  it("clamps out-of-range progress", () => {
    expect(activeStage(-0.5, 4)).toBe(0);
    expect(activeStage(3, 4)).toBe(4);
  });
});
