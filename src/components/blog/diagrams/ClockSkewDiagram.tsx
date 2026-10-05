// Migrated from the legacy post HTML; styled by .diagram rules in prose.css.
export function ClockSkewDiagram() {
  return (
    <svg viewBox="0 0 400 312" role="img" aria-labelledby="fig-skew-t fig-skew-d">
      <title id="fig-skew-t">{"How a 300 ms clock difference gets past ShedLock"}</title>
      <desc id="fig-skew-d">
        {
          "Top: without lockAtLeastFor, instance A runs a 50 millisecond job and releases the lock after 50 milliseconds. Instance B, whose clock is 300 milliseconds behind, fires at 300 milliseconds, finds the lock free and runs the job again. Bottom: with lockAtLeastFor set to 5 seconds, the lock is still held at 300 milliseconds, so instance B skips the run."
        }
      </desc>
      <text className="d-title" x="0" y="12">
        {"Without lockAtLeastFor"}
      </text>
      <path className="d-guide" d="M320 22V124" />
      <text x="0" y="40">
        {"Lock"}
      </text>
      <rect className="d-lock" x="104" y="28" width="36" height="16" />
      <text className="d-note" x="148" y="40">
        {"released after 50 ms"}
      </text>
      <text x="0" y="71">
        {"Instance A"}
      </text>
      <rect className="d-run" x="104" y="56" width="36" height="22" />
      <text className="d-note" x="148" y="71">
        {"runs the job"}
      </text>
      <text x="0" y="100">
        {"Instance B"}
      </text>
      <text className="d-note" x="0" y="115">
        {"300 ms behind"}
      </text>
      <rect className="d-dup" x="320" y="86" width="36" height="22" />
      <text className="d-note d-bad" x="312" y="101" textAnchor="end">
        {"lock is free: runs again"}
      </text>
      <path className="d-axis" d="M104 124H392M104 124v4M176 124v4M248 124v4M320 124v4M392 124v4" />
      <text className="d-note" x="104" y="140" textAnchor="middle">
        {"0"}
      </text>
      <text className="d-note" x="176" y="140" textAnchor="middle">
        {"100"}
      </text>
      <text className="d-note" x="248" y="140" textAnchor="middle">
        {"200"}
      </text>
      <text className="d-note" x="320" y="140" textAnchor="middle">
        {"300"}
      </text>
      <text className="d-note" x="392" y="140" textAnchor="end">
        {"400 ms"}
      </text>
      <text className="d-title" x="0" y="176">
        {"With lockAtLeastFor = 5 s"}
      </text>
      <path className="d-guide" d="M320 186V288" />
      <text x="0" y="204">
        {"Lock"}
      </text>
      <rect className="d-lock" x="104" y="192" width="288" height="16" />
      <text className="d-note d-strong" x="110" y="204">
        {"held for at least 5 s"}
      </text>
      <path className="d-arrow" d="M382 195l6 5-6 5" />
      <text x="0" y="235">
        {"Instance A"}
      </text>
      <rect className="d-run" x="104" y="220" width="36" height="22" />
      <text className="d-note" x="148" y="235">
        {"runs the job"}
      </text>
      <text x="0" y="264">
        {"Instance B"}
      </text>
      <text className="d-note" x="0" y="279">
        {"300 ms behind"}
      </text>
      <rect className="d-skip" x="320" y="250" width="36" height="22" />
      <text className="d-note d-good" x="312" y="265" textAnchor="end">
        {"lock is held: skips"}
      </text>
      <path className="d-axis" d="M104 288H392M104 288v4M176 288v4M248 288v4M320 288v4M392 288v4" />
      <text className="d-note" x="104" y="304" textAnchor="middle">
        {"0"}
      </text>
      <text className="d-note" x="176" y="304" textAnchor="middle">
        {"100"}
      </text>
      <text className="d-note" x="248" y="304" textAnchor="middle">
        {"200"}
      </text>
      <text className="d-note" x="320" y="304" textAnchor="middle">
        {"300"}
      </text>
      <text className="d-note" x="392" y="304" textAnchor="end">
        {"400 ms"}
      </text>
    </svg>
  );
}
