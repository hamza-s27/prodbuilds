// Migrated from the legacy post HTML; styled by .diagram rules in prose.css.
export function PollingGapDiagram() {
  return (
    <svg viewBox="0 0 400 314" role="img" aria-labelledby="fig-gap-t fig-gap-d">
      <title id="fig-gap-t">{"Why a run due between two polling windows was never scheduled"}</title>
      <desc id="fig-gap-d">
        {
          "Before 5.2.0, pass A started at 10:00:44.990 and looked 15 seconds ahead, up to 10:00:59.990. Pass B started at 10:01:00.004 and looked 15 seconds ahead from there. The run due at 10:01:00.000 fell into the 14 millisecond gap between the two windows, so neither pass scheduled it, and pass B's next run after now was 10:02:00. From 5.2.0, each pass starts from the last run it scheduled, so the windows join up and the 10:01:00 run is scheduled."
        }
      </desc>
      <text className="d-title" x="0" y="12">
        {"Before 5.2.0: each window starts at “now”"}
      </text>
      <text className="d-note" x="16" y="30">
        {"10:00:44.990"}
      </text>
      <text className="d-note" x="384" y="30" textAnchor="end">
        {"10:01:15.004"}
      </text>
      <rect className="d-lock" x="16" y="36" width="183.9" height="24" />
      <rect className="d-lock" x="200.1" y="36" width="183.9" height="24" />
      <text className="d-strong" x="24" y="52">
        {"Pass A: next 15 s"}
      </text>
      <text className="d-strong" x="248" y="52">
        {"Pass B: next 15 s"}
      </text>
      <path className="d-due" d="M200 32V64" />
      <circle className="d-zoom" cx="200" cy="48" r="12" />
      <path className="d-guide" d="M191 56L16 112M209 56L384 112" />
      <rect className="d-inset" x="16" y="112" width="368" height="118" />
      <text className="d-note" x="28" y="130">
        {"Zoomed in: 25 ms around 10:01:00"}
      </text>
      <text className="d-note" x="96.8" y="148" textAnchor="middle">
        {"59.990"}
      </text>
      <text className="d-note" x="289.4" y="148" textAnchor="middle">
        {"00.004"}
      </text>
      <rect className="d-lock" x="28" y="154" width="68.8" height="24" />
      <rect className="d-gap" x="96.8" y="154" width="192.6" height="24" />
      <rect className="d-lock" x="289.4" y="154" width="82.6" height="24" />
      <text className="d-note d-bad" x="160" y="170" textAnchor="middle">
        {"14 ms gap"}
      </text>
      <path className="d-due" d="M234.4 150V184" />
      <text className="d-note d-bad" x="234.4" y="198" textAnchor="middle">
        {"run due at 10:01:00: in neither window"}
      </text>
      <text className="d-note" x="28" y="219">
        {"Pass B’s next run after now: 10:02:00"}
      </text>
      <text className="d-title" x="0" y="256">
        {"5.2.0: each pass starts from the last run it scheduled"}
      </text>
      <rect className="d-lock" x="16" y="264" width="368" height="24" />
      <text className="d-strong" x="24" y="280">
        {"Pass B: from the last scheduled run to now + 15 s"}
      </text>
      <path className="d-arrow" d="M200 288V297" />
      <text className="d-note d-good" x="200" y="309" textAnchor="middle">
        {"10:01:00 scheduled"}
      </text>
    </svg>
  );
}
