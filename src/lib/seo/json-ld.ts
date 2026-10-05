// Schema.org node builders. Pages compose them into an @graph (page-graphs.ts).
import { CONTACT_EMAIL, ORG_DESCRIPTION, ORG_KNOWS_ABOUT, SITE_NAME } from "@/content/site";
import type { FaqItem, PostMeta, Service } from "@/content/types";
import { toPlainText } from "@/lib/content/rich-text";
import { absoluteUrl } from "./metadata";

export type JsonLdNode = Readonly<Record<string, unknown>>;

export const ORG_ID = absoluteUrl("/#organization");
export const WEBSITE_ID = absoluteUrl("/#website");
const ref = (id: string) => ({ "@id": id });

export function graph(nodes: readonly JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

const contactPoint = () => ({
  "@type": "ContactPoint",
  email: CONTACT_EMAIL,
  contactType: "sales",
  url: absoluteUrl("/contact"),
});

export type OrganizationDetail = "basic" | "logo" | "contact";

export function organization(detail: OrganizationDetail): JsonLdNode {
  const base = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: absoluteUrl("/") };
  if (detail === "logo") return { ...base, logo: absoluteUrl("/favicon.svg") };
  if (detail === "contact") return { ...base, email: CONTACT_EMAIL, contactPoint: contactPoint() };
  return base;
}

export function fullOrganization(services: readonly Service[]): JsonLdNode {
  return {
    ...organization("logo"),
    description: ORG_DESCRIPTION,
    email: CONTACT_EMAIL,
    contactPoint: contactPoint(),
    knowsAbout: ORG_KNOWS_ABOUT,
    hasOfferCatalog: offerCatalog(services, { name: "Services", url: absoluteUrl("/services") }),
  };
}

export function website(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    inLanguage: "en",
    publisher: ref(ORG_ID),
  };
}

export function offerCatalog(
  services: readonly Service[],
  extra: Readonly<Record<string, string>>,
): JsonLdNode {
  return {
    "@type": "OfferCatalog",
    ...extra,
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.schemaName,
        description: service.summary,
        url: absoluteUrl(`/services#${service.id}`),
        provider: ref(ORG_ID),
      },
    })),
  };
}

export interface Crumb {
  readonly name: string;
  readonly path: string;
}

export function breadcrumbList(path: string, crumbs: readonly Crumb[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    "@id": absoluteUrl(`${path}#breadcrumb`),
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export interface WebPageOptions {
  readonly path: string;
  readonly name: string;
  readonly type?: "WebPage" | "ContactPage";
  /** Legal pages carry dateModified + publisher instead of about. */
  readonly dateModified?: string;
  readonly extra?: Readonly<Record<string, unknown>>;
}

export function webPage({ path, name, type = "WebPage", dateModified, extra }: WebPageOptions): JsonLdNode {
  const ownership = dateModified
    ? { dateModified, isPartOf: ref(WEBSITE_ID), publisher: ref(ORG_ID) }
    : { isPartOf: ref(WEBSITE_ID), about: ref(ORG_ID) };
  return {
    "@type": type,
    "@id": absoluteUrl(`${path}#webpage`),
    url: absoluteUrl(path),
    name,
    inLanguage: "en",
    ...ownership,
    breadcrumb: ref(absoluteUrl(`${path}#breadcrumb`)),
    ...extra,
  };
}

export function faqPage(path: string, items: readonly FaqItem[]): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": absoluteUrl(`${path}#faq`),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: toPlainText(item.answer) },
    })),
  };
}

const postUrl = (post: PostMeta) => absoluteUrl(`/blog/${post.slug}`);

export function blog(description: string, posts: readonly PostMeta[]): JsonLdNode {
  return {
    "@type": "Blog",
    "@id": absoluteUrl("/blog#blog"),
    url: absoluteUrl("/blog"),
    name: `${SITE_NAME} blog`,
    description,
    inLanguage: "en",
    publisher: ref(ORG_ID),
    breadcrumb: ref(absoluteUrl("/blog#breadcrumb")),
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${postUrl(post)}#post`,
      headline: post.title,
      url: postUrl(post),
      datePublished: post.datePublished,
    })),
  };
}

export function blogPosting(post: PostMeta): JsonLdNode {
  const url = postUrl(post);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: "en",
    image: absoluteUrl(`/images/blog/${post.slug}.png`),
    keywords: post.keywords,
    wordCount: post.wordCount,
    author: ref(ORG_ID),
    publisher: ref(ORG_ID),
    isPartOf: ref(absoluteUrl("/blog#blog")),
    breadcrumb: ref(`${url}#breadcrumb`),
  };
}
