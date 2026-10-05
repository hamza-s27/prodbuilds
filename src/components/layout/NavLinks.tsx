import type { NavLink } from "@/content/types";
import { cn } from "@/lib/utils";
import { navCurrent } from "./nav-current";

interface NavLinksProps {
  readonly links: readonly NavLink[];
  /** Path of the page being viewed; rendered as aria-current on the server. */
  readonly currentPath?: string;
  readonly className?: string;
  readonly linkClassName?: string;
}

export function NavLinks({ links, currentPath, className, linkClassName }: NavLinksProps) {
  return (
    <ul className={className}>
      {links.map((link, index) => (
        <li key={link.href}>
          <a
            href={link.href}
            aria-current={navCurrent(link.href, currentPath)}
            className={cn("group", linkClassName)}
          >
            <span aria-hidden className="hud mr-2 transition-colors group-aria-[current]:text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="link-draw group-aria-[current]:bg-[length:100%_1px]">{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
