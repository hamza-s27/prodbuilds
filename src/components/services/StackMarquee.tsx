import "./marquee.css";

interface StackMarqueeProps {
  readonly items: readonly string[];
  readonly label: string;
  readonly className?: string;
}

const CHIP =
  "rounded-hud border border-border bg-card px-3 py-1.5 font-mono text-sm whitespace-nowrap text-body";

/**
 * Every technology from the services, scrolling. CSS only; see marquee.css for
 * the static modes. The pause checkbox works without JavaScript (WCAG 2.2.2).
 */
export function StackMarquee({ items, label, className }: StackMarqueeProps) {
  return (
    <div className={`marquee-block ${className ?? ""}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p id="stack-marquee-label" className="hud">
          {label}
        </p>
        <label className="marquee-pause hud min-h-6 cursor-pointer items-center gap-2 hover:text-foreground">
          <input type="checkbox" className="size-4 accent-primary" />
          Pause scrolling
        </label>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          <ul aria-labelledby="stack-marquee-label" className="marquee-list">
            {items.map((item) => (
              <li key={item} className={CHIP}>
                {item}
              </li>
            ))}
          </ul>
          <ul aria-hidden className="marquee-list marquee-copy">
            {items.map((item) => (
              <li key={item} className={CHIP}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
