import { mainNav, NAV_CTA } from "@/content/site";
import { Logo } from "./Logo";
import { navCurrent } from "./nav-current";
import { NavLinks } from "./NavLinks";

interface SiteHeaderProps {
  /** Path of the page being viewed, e.g. "/blog/some-post"; marks the matching nav link. */
  readonly currentPath?: string;
}

/** Rendered by each page (not the root layout) so the current link needs no client JS. */
export function SiteHeader({ currentPath }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/75 backdrop-blur-md">
      <div className="page-grid h-(--header-h) items-center">
        <Logo className="col-span-6 md:col-span-3" />
        <nav aria-label="Main" className="col-span-6 flex justify-end md:col-span-9">
          <NavLinks
            links={mainNav}
            currentPath={currentPath}
            className="hidden items-center gap-8 text-sm md:flex"
            linkClassName="text-body transition-colors hover:text-foreground aria-[current]:text-foreground"
          />
          <a
            href={NAV_CTA.href}
            aria-current={navCurrent(NAV_CTA.href, currentPath)}
            className="btn-ghost ml-8 hidden text-sm aria-[current]:border-primary md:inline-flex"
          >
            {NAV_CTA.label}
          </a>
          <MobileMenu currentPath={currentPath} />
        </nav>
      </div>
    </header>
  );
}

/** Disclosure menu for small screens: native <details>, no JavaScript. */
function MobileMenu({ currentPath }: SiteHeaderProps) {
  return (
    <details className="group relative md:hidden">
      <summary className="btn-ghost cursor-pointer list-none text-sm [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">Menu</span>
        <span className="hidden group-open:inline">Close</span>
      </summary>
      <div className="surface absolute right-0 mt-3 w-64 rounded-lg p-5">
        <NavLinks
          links={mainNav}
          currentPath={currentPath}
          className="flex flex-col gap-4"
          linkClassName="text-foreground"
        />
        <a
          href={NAV_CTA.href}
          aria-current={navCurrent(NAV_CTA.href, currentPath)}
          className="btn-primary mt-6 w-full text-sm"
        >
          {NAV_CTA.label}
        </a>
      </div>
    </details>
  );
}
