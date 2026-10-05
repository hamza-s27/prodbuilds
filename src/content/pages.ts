import type { PageSeo } from "@/lib/seo/metadata";
import { posts } from "./posts";

export type StaticPath = "/" | "/services" | "/how-we-work" | "/contact" | "/privacy" | "/terms" | "/blog";

export interface StaticPage {
  readonly seo: PageSeo;
  /** WebPage.name in structured data. */
  readonly name: string;
  /** Breadcrumb name in structured data, when it differs from `name`. */
  readonly schemaCrumb?: string;
  /** Visible breadcrumb label. */
  readonly crumbLabel: string;
  /** ISO date the page content last changed (sitemap lastmod, legal "Last updated"). */
  readonly updated: string;
}

const LAUNCH_CONTENT = "2026-09-26";
/** Pages that list posts change whenever a post does. */
const LATEST_POST = posts.map((post) => post.dateModified).reduce((a, b) => (b > a ? b : a), LAUNCH_CONTENT);

export const pages: Readonly<Record<StaticPath, StaticPage>> = {
  "/": {
    name: "Home",
    crumbLabel: "Home",
    updated: LATEST_POST,
    seo: {
      path: "/",
      title: "ProdBuilds | Backend, Cloud & AI Software Development",
      description:
        "ProdBuilds designs and builds backend systems, APIs, cloud infrastructure and AI integrations that hold up in production, from a first MVP to the platform you already run.",
      keywords:
        "ProdBuilds, custom software development, backend development, API development, Java, Spring Boot, Node.js, cloud infrastructure, AWS, scaling, automation, AI integration, MCP",
    },
  },
  "/services": {
    name: "Services",
    crumbLabel: "Services",
    updated: LAUNCH_CONTENT,
    seo: {
      path: "/services",
      title: "Services: Backend, Cloud, Automation & AI | ProdBuilds",
      ogTitle: "Services | ProdBuilds",
      description:
        "APIs and backend systems, scaling and modernisation, cloud infrastructure, MVPs and web apps, automation and integrations, and AI integrations, from ProdBuilds.",
    },
  },
  "/how-we-work": {
    name: "How we work",
    crumbLabel: "How we work",
    updated: LAUNCH_CONTENT,
    seo: {
      path: "/how-we-work",
      title: "How We Work: From First Call to Production | ProdBuilds",
      ogTitle: "How we work | ProdBuilds",
      description:
        "How a ProdBuilds project runs: discovery, design, iterative delivery with automated tests, and launch and support, with direct access to the engineer building your software.",
    },
  },
  "/contact": {
    name: "Contact ProdBuilds",
    schemaCrumb: "Contact",
    crumbLabel: "Contact",
    updated: LAUNCH_CONTENT,
    seo: {
      path: "/contact",
      title: "Contact ProdBuilds | Start a Software or AI Project",
      description:
        "Contact ProdBuilds about custom software, AI, or cloud work. Leave your email or write to hello@prodbuilds.com and we'll reply to set up a call.",
    },
  },
  "/privacy": {
    name: "Privacy Policy",
    crumbLabel: "Privacy",
    updated: "2026-10-06",
    seo: {
      path: "/privacy",
      title: "Privacy Policy | ProdBuilds",
      description:
        "How ProdBuilds handles personal data on this website and in the software we build and host for our clients.",
      robots: "basic",
    },
  },
  "/terms": {
    name: "Terms and Conditions",
    crumbLabel: "Terms",
    updated: LAUNCH_CONTENT,
    seo: {
      path: "/terms",
      title: "Terms and Conditions | ProdBuilds",
      description: "The terms that govern your use of prodbuilds.com.",
      robots: "basic",
    },
  },
  "/blog": {
    name: "Blog",
    crumbLabel: "Blog",
    updated: LATEST_POST,
    seo: {
      path: "/blog",
      title: "Blog | ProdBuilds",
      description:
        "Engineering write-ups from ProdBuilds on scheduling, background jobs and Firebase, with tested code and measured results.",
      rss: true,
    },
  },
};
