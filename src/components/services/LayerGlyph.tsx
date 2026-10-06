import type { ServiceLayer } from "@/content/types";

const SLAB_COUNT = 5;
const SLAB_HEIGHT = 10;
const SLAB_GAP = 6;
const WIDTH = 96;
const RAIL_X = 108;

interface LayerGlyphProps {
  readonly layer: ServiceLayer;
}

/**
 * Small static diagram of the stack (five slabs plus the AI rail) with the
 * current layer highlighted. Server-rendered; below 1024px only (the sticky
 * StackVisual takes over from there).
 */
export function LayerGlyph({ layer }: LayerGlyphProps) {
  const height = SLAB_COUNT * (SLAB_HEIGHT + SLAB_GAP) - SLAB_GAP;
  const isRail = layer.depth === null;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${RAIL_X + 4} ${height}`}
      width={RAIL_X + 4}
      height={height}
      className="overflow-visible"
    >
      {Array.from({ length: SLAB_COUNT }, (_, depth) => {
        const isActive = depth === layer.depth;
        return (
          <rect
            key={depth}
            x={depth * 3}
            y={depth * (SLAB_HEIGHT + SLAB_GAP)}
            width={WIDTH - depth * 6}
            height={SLAB_HEIGHT}
            rx={2}
            className={isActive ? "fill-primary" : "fill-none stroke-border"}
          />
        );
      })}
      <line
        x1={RAIL_X}
        x2={RAIL_X}
        y1={0}
        y2={height}
        strokeWidth={isRail ? 3 : 1}
        className={isRail ? "stroke-primary" : "stroke-border"}
      />
    </svg>
  );
}
