// Migrated from the legacy post HTML; styled by .diagram rules in prose.css.
export function LockOverrunDiagram() {
  return (
    <svg viewBox="0 0 400 156" role="img" aria-labelledby="fig-overrun-t fig-overrun-d">
      <title id="fig-overrun-t">{"How a lock that expires mid-job lets two instances run at once"}</title>
      <desc id="fig-overrun-d">
        {
          "Instance A starts a 25 second job at 0 seconds, holding the lock for at most 8 seconds. The lock expires at 8 seconds while the job is still running. At 10 seconds instance B finds the lock free and starts the same job, so both instances run it at the same time from 10 to 25 seconds: a 15 second overlap."
        }
      </desc>
      <text className="d-title" x="0" y="12">
        {"25 s job, lockAtMostFor = 8 s"}
      </text>
      <rect className="d-overlap" x="200" y="40" width="144" height="66" />
      <text x="0" y="36">
        {"Lock"}
      </text>
      <rect className="d-lock" x="104" y="26" width="76.8" height="10" />
      <text className="d-note" x="188" y="35">
        {"lock expires at 8 s"}
      </text>
      <text x="0" y="60">
        {"Instance A"}
      </text>
      <rect className="d-run" x="104" y="45" width="240" height="22" />
      <text className="d-ink" x="112" y="60">
        {"job running, 25 s"}
      </text>
      <text x="0" y="95">
        {"Instance B"}
      </text>
      <rect className="d-dup" x="200" y="80" width="192" height="22" />
      <text className="d-ink" x="208" y="95">
        {"starts at 10 s"}
      </text>
      <text className="d-note d-bad" x="272" y="122" textAnchor="middle">
        {"both running: 15 s overlap"}
      </text>
      <path className="d-axis" d="M104 132H392M104 132v4M200 132v4M296 132v4M392 132v4" />
      <text className="d-note" x="104" y="148" textAnchor="middle">
        {"0"}
      </text>
      <text className="d-note" x="200" y="148" textAnchor="middle">
        {"10"}
      </text>
      <text className="d-note" x="296" y="148" textAnchor="middle">
        {"20"}
      </text>
      <text className="d-note" x="392" y="148" textAnchor="end">
        {"30 s"}
      </text>
    </svg>
  );
}
