import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "./metadata";

describe("buildPageMetadata", () => {
  const meta = buildPageMetadata({
    path: "/services",
    title: "Services: Backend | ProdBuilds",
    ogTitle: "Services | ProdBuilds",
    description: "What we do.",
  });

  it("sets an absolute title, description and canonical", () => {
    expect(meta.title).toEqual({ absolute: "Services: Backend | ProdBuilds" });
    expect(meta.description).toBe("What we do.");
    expect(meta.alternates?.canonical).toBe("https://prodbuilds.com/services");
  });

  it("mirrors Open Graph into Twitter, with the default share image", () => {
    expect(meta.openGraph).toMatchObject({
      type: "website",
      url: "https://prodbuilds.com/services",
      siteName: "ProdBuilds",
      locale: "en_US",
      title: "Services | ProdBuilds",
      description: "What we do.",
      images: [
        {
          url: "https://prodbuilds.com/images/og.png",
          type: "image/png",
          width: 1200,
          height: 630,
          alt: "ProdBuilds: Software that holds up in production. Backend, cloud and AI development.",
        },
      ],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Services | ProdBuilds",
      description: "What we do.",
      images: [
        {
          url: "https://prodbuilds.com/images/og.png",
          alt: "ProdBuilds: Software that holds up in production. Backend, cloud and AI development.",
        },
      ],
    });
  });

  it("uses the full robots directive by default and plain index/follow for legal pages", () => {
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    });
    expect(
      buildPageMetadata({ path: "/terms", title: "T", description: "D", robots: "basic" }).robots,
    ).toEqual({ index: true, follow: true });
  });

  it("falls back to the page title for Open Graph", () => {
    const plain = buildPageMetadata({
      path: "/privacy",
      title: "Privacy Policy | ProdBuilds",
      description: "D",
    });

    expect(plain.openGraph?.title).toBe("Privacy Policy | ProdBuilds");
  });

  it("adds article fields, a custom image and the RSS alternate for posts", () => {
    const post = buildPageMetadata({
      path: "/blog/a",
      title: "A | ProdBuilds",
      ogTitle: "A",
      description: "D",
      image: { path: "/images/blog/a.png", alt: "A — ProdBuilds blog" },
      article: { publishedTime: "2026-09-26", modifiedTime: "2026-09-26", section: "Firebase" },
      rss: true,
    });

    expect(post.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-09-26",
      modifiedTime: "2026-09-26",
      section: "Firebase",
      images: [
        expect.objectContaining({
          url: "https://prodbuilds.com/images/blog/a.png",
          alt: "A — ProdBuilds blog",
        }),
      ],
    });
    expect(post.alternates?.types).toEqual({
      "application/rss+xml": "https://prodbuilds.com/blog/feed.xml",
    });
  });
});
