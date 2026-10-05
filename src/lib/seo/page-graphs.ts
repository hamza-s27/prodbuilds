// The structured data each page ships, composed from content modules.
import { faq } from "@/content/faq";
import { legalUpdated, pages, type StaticPath } from "@/content/pages";
import { getPost, posts } from "@/content/posts";
import { services } from "@/content/services";
import {
  blog,
  blogPosting,
  breadcrumbList,
  type Crumb,
  faqPage,
  fullOrganization,
  graph,
  type JsonLdNode,
  offerCatalog,
  organization,
  webPage,
  website,
} from "./json-ld";
import { absoluteUrl } from "./metadata";

const HOME_CRUMB: Crumb = { name: "Home", path: "/" };
const crumbsFor = (path: StaticPath): Crumb[] => [
  HOME_CRUMB,
  { name: pages[path].schemaCrumb ?? pages[path].name, path },
];
const pageCrumbs = (path: StaticPath) => breadcrumbList(path, crumbsFor(path));

function servicesGraph(): JsonLdNode[] {
  const catalogId = absoluteUrl("/services#catalog");
  return [
    webPage({
      path: "/services",
      name: pages["/services"].name,
      extra: { mainEntity: { "@id": catalogId } },
    }),
    offerCatalog(services, { "@id": catalogId, name: "ProdBuilds services" }),
    pageCrumbs("/services"),
    organization("basic"),
  ];
}

const legalGraph = (path: "/privacy" | "/terms"): JsonLdNode[] => [
  webPage({ path, name: pages[path].name, dateModified: legalUpdated }),
  pageCrumbs(path),
];

const GRAPHS: Readonly<Record<StaticPath, () => JsonLdNode[]>> = {
  "/": () => [fullOrganization(services), website()],
  "/services": servicesGraph,
  "/how-we-work": () => [
    webPage({ path: "/how-we-work", name: pages["/how-we-work"].name }),
    faqPage("/how-we-work", faq),
    pageCrumbs("/how-we-work"),
    organization("basic"),
  ],
  "/contact": () => [
    webPage({ path: "/contact", name: pages["/contact"].name, type: "ContactPage" }),
    pageCrumbs("/contact"),
    organization("contact"),
  ],
  "/privacy": () => legalGraph("/privacy"),
  "/terms": () => legalGraph("/terms"),
  "/blog": () => [blog(pages["/blog"].seo.description, posts), pageCrumbs("/blog"), organization("logo")],
};

export function pageGraph(path: StaticPath): JsonLdNode {
  return graph(GRAPHS[path]());
}

export function postGraph(slug: string): JsonLdNode {
  const post = getPost(slug);
  if (!post) throw new Error(`Unknown post: ${slug}`);
  const path = `/blog/${slug}`;
  return graph([
    blogPosting(post),
    breadcrumbList(path, [HOME_CRUMB, { name: "Blog", path: "/blog" }, { name: post.breadcrumbName, path }]),
    organization("logo"),
  ]);
}
