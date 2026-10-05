import { footerNav } from "@/content/site";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-hairline pt-16 pb-10">
      <div className="page-grid gap-y-10">
        <div className="col-span-12 md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-xs text-body">Software that holds up in production.</p>
        </div>
        <nav aria-label="Footer" className="col-span-12 md:col-span-6 md:col-start-7">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {footerNav.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="link-draw text-body transition-colors hover:text-foreground">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="col-span-12 rule-ticks" aria-hidden />
        <p className="hud col-span-12 -mt-6 flex flex-wrap justify-between gap-4">
          <span>&copy; ProdBuilds</span>
          <span>No tracking cookies · Built to hold up in production</span>
        </p>
      </div>
    </footer>
  );
}
