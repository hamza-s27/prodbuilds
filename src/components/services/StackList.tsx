import type { Service } from "@/content/types";
import { StackChips } from "./StackChips";

interface StackListProps {
  /** Already in display (depth) order. */
  readonly services: readonly Service[];
}

/** Services as layers of a stack, not a card grid. Each row links to its /services anchor. */
export function StackList({ services }: StackListProps) {
  return (
    <ol className="border-t border-hairline">
      {services.map((service) => (
        <li
          key={service.id}
          data-layer={service.id}
          className="stack-row group relative border-b border-hairline"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-px origin-top scale-y-0 bg-primary transition-transform duration-(--duration-normal) ease-(--ease-out-expo) group-focus-within:scale-y-100 group-hover:scale-y-100"
          />
          <div className="grid grid-cols-12 gap-x-[clamp(1rem,2vw,2rem)] gap-y-3 py-7 transition-transform duration-(--duration-normal) ease-(--ease-out-expo) group-hover:translate-x-2 md:py-9">
            <p className="hud col-span-12 md:col-span-3 md:pl-4 lg:col-span-12">{service.layer.hud}</p>
            <div className="col-span-12 md:col-span-5 lg:col-span-7">
              <h3 className="text-(length:--text-h3) font-semibold tracking-tight [font-variation-settings:'wdth'_110]">
                <a href={`/services#${service.id}`} className="after:absolute after:inset-0">
                  {service.title}
                </a>
              </h3>
              <p className="mt-3 text-body">{service.summary}</p>
            </div>
            <StackChips
              items={service.stack.slice(0, 4)}
              className="col-span-12 md:col-span-4 md:justify-end md:self-center lg:col-span-5"
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
