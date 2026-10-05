/**
 * aria-current for a nav link: "page" on the page itself, "true" anywhere inside
 * its section (e.g. a post under /blog), otherwise nothing.
 */
export function navCurrent(href: string, currentPath: string | undefined): "page" | "true" | undefined {
  if (!currentPath) return undefined;
  if (currentPath === href) return "page";
  return currentPath.startsWith(`${href}/`) ? "true" : undefined;
}
