import { ArrowRight } from "lucide-react";

interface SectionFootLinkProps {
  readonly href: string;
  readonly label: string;
}

export function SectionFootLink({ href, label }: SectionFootLinkProps) {
  return (
    <a href={href} className="group mt-10 inline-flex items-center gap-2 font-medium text-foreground">
      <span className="link-draw">{label}</span>
      <ArrowRight
        aria-hidden
        className="size-4 text-primary transition-transform duration-(--duration-normal) ease-(--ease-out-expo) group-hover:translate-x-1"
      />
    </a>
  );
}
