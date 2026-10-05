import { cn } from "@/lib/utils";
import "./hero.css";

interface HeroPosterProps {
  readonly className?: string;
}

/**
 * Static stand-in for the light pillar: a teal column of light with a soft
 * bloom, built from gradients only (no image, no JS, no layout shift).
 * Also the reduced-motion / no-WebGL fallback once the canvas lands.
 */
export function HeroPoster({ className }: HeroPosterProps) {
  return (
    <div aria-hidden className={cn("hero-poster pointer-events-none", className)}>
      <div className="hero-poster__beam" />
      <div className="hero-poster__bloom" />
      <div className="hero-poster__scrim" />
    </div>
  );
}
