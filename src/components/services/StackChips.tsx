import { cn } from "@/lib/utils";

interface StackChipsProps {
  readonly items: readonly string[];
  readonly label?: string;
  readonly className?: string;
}

export function StackChips({ items, label, className }: StackChipsProps) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <li key={item} className="rounded-hud border border-border px-2 py-1 font-mono text-xs text-body">
          {item}
        </li>
      ))}
    </ul>
  );
}
