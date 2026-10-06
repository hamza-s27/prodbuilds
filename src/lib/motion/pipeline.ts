// CI-style stage states for the process pipeline.

export type StageState = "queued" | "running" | "passed";

/** `active` is the running stage: -1 before the run, `count` (or more) once it's done. */
export function stageState(index: number, active: number): StageState {
  if (index < active) return "passed";
  return index === active ? "running" : "queued";
}

/** The running stage for a run progress (0–1), with equal time per stage. */
export function activeStage(progress: number, count: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return Math.min(count, Math.floor(clamped * count));
}
