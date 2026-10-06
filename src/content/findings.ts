import type { TerminalLine } from "./types";

// Measured results from the blog posts, typed out by the home page terminal.
// The commands are illustrative; every result line must stay true to its post.
export const findings: readonly TerminalLine[] = [
  // spring-boot-scheduled-jobs-multiple-instances
  { kind: "command", text: "./count-runs --instances=2 --lock=none" },
  { kind: "output", text: "21/21 runs happened twice", tone: "bad" },
  // jobrunr-skipping-recurring-jobs
  { kind: "command", text: "grep JobZooKeeper jobrunr.log" },
  { kind: "output", text: "03:35:59.999  JobZooKeeper: Found 1 recurring jobs", tone: "muted" },
  { kind: "output", text: "no 03:36 run, and 0 errors logged", tone: "bad" },
  // firebase-auction-close-on-time
  { kind: "command", text: "./close-auction --concurrent=5" },
  { kind: "output", text: "1 closed, 4 already-closed", tone: "good" },
];
