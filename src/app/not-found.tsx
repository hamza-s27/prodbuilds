import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Page not found | ProdBuilds" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="page-grid flex-1 content-center py-(--space-section-major)"
      >
        <div className="col-span-12 lg:col-span-10 lg:col-start-2">
          <p className="hud text-primary">404 · Route not in production</p>
          <h1 className="display mt-6 text-(length:--text-h1)">This page doesn’t exist.</h1>
          <p className="mt-6 max-w-xl text-(length:--text-lead) text-body">
            The link may be old, or the address mistyped. Everything that ships lives one click away.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/" className="btn-primary">
              Back to home
            </a>
            <a href="/blog" className="btn-ghost min-h-12">
              Read the blog
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
