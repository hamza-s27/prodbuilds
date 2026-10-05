// Migrated from the legacy post HTML; styled by .diagram rules in prose.css.
export function SoftCloseDiagram() {
  return (
    <svg viewBox="0 0 400 180" role="img" aria-labelledby="fig-extend-t fig-extend-d">
      <title id="fig-extend-t">{"How a soft close moves the end of an auction"}</title>
      <desc id="fig-extend-d">
        {
          "A bid lands 10 seconds before the scheduled end, T. The bid transaction moves the end to T plus 20 seconds, 30 seconds after the bid, and a second Cloud Task is enqueued for the new end. The first task fires at T, finds the auction is not due yet and does nothing. The second task fires at T plus 20 seconds and closes the auction."
        }
      </desc>
      <text className="d-title" x="0" y="12">
        {"A bid in the last 30 s moves the end"}
      </text>
      <text x="0" y="40">
        {"Bids"}
      </text>
      <circle className="d-run" cx="104" cy="36" r="6" />
      <text className="d-note" x="114" y="40">
        {"bid at T−10 s"}
      </text>
      <text x="0" y="74">
        {"Auction ends"}
      </text>
      <circle className="d-skip" cx="176" cy="70" r="5" />
      <circle className="d-run" cx="320" cy="70" r="5" />
      <path className="d-arrow" d="M184 70H310M304 65l6 5-6 5" />
      <text className="d-note d-good" x="248" y="60" textAnchor="middle">
        {"end moves to T+20 s"}
      </text>
      <path className="d-guide" d="M176 78V92M320 78V92" />
      <text x="0" y="106">
        {"Cloud Tasks"}
      </text>
      <path className="d-skip" d="M176 94l8 8-8 8-8-8z" />
      <path className="d-run" d="M320 94l8 8-8 8-8-8z" />
      <text className="d-note" x="176" y="128" textAnchor="middle">
        {"task 1: not due,"}
      </text>
      <text className="d-note" x="176" y="142" textAnchor="middle">
        {"does nothing"}
      </text>
      <text className="d-note d-good" x="320" y="128" textAnchor="middle">
        {"task 2: closes"}
      </text>
      <text className="d-note d-good" x="320" y="142" textAnchor="middle">
        {"the auction"}
      </text>
      <path className="d-axis" d="M104 156H392M104 156v4M176 156v4M248 156v4M320 156v4M392 156v4" />
      <text className="d-note" x="104" y="172" textAnchor="middle">
        {"T−10"}
      </text>
      <text className="d-note" x="176" y="172" textAnchor="middle">
        {"T"}
      </text>
      <text className="d-note" x="248" y="172" textAnchor="middle">
        {"T+10"}
      </text>
      <text className="d-note" x="320" y="172" textAnchor="middle">
        {"T+20"}
      </text>
      <text className="d-note" x="392" y="172" textAnchor="end">
        {"T+30"}
      </text>
    </svg>
  );
}
