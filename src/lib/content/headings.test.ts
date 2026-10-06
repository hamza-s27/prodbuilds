import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { posts } from "@/content/posts";
import { extractHeadings, headingBeingRead } from "./headings";

describe("headingBeingRead", () => {
  const ids = ["a", "b", "c"] as const;

  it("is the last heading at or above the read line (30% down)", () => {
    expect(headingBeingRead(ids, [-500, 200, 900], 1000, false)).toBe("b");
    expect(headingBeingRead(ids, [-500, 301, 900], 1000, false)).toBe("a");
  });

  it("is null above the first heading", () => {
    expect(headingBeingRead(ids, [400, 900, 1400], 1000, false)).toBeNull();
  });

  it("counts any heading on screen at the end of the page", () => {
    expect(headingBeingRead(ids, [-900, -100, 700], 1000, true)).toBe("c");
  });
});

describe("extractHeadings", () => {
  it("reads the H2 ids and plain text in order", () => {
    const source =
      '<H2 id="a">First</H2>\n\ntext\n\n<H2 id="b">The `@Scheduled` *trap*</H2>\n<H2 id="c">`lock_at_most`</H2>';

    expect(extractHeadings(source)).toEqual([
      { id: "a", text: "First" },
      { id: "b", text: "The @Scheduled trap" },
      { id: "c", text: "lock_at_most" },
    ]);
  });

  it("finds every heading in every post, each id unique", () => {
    for (const post of posts) {
      const source = readFileSync(`src/content/posts/${post.slug}.mdx`, "utf8");
      const headings = extractHeadings(source);

      expect(headings.length).toBe(source.split("<H2 ").length - 1);
      expect(new Set(headings.map((heading) => heading.id)).size).toBe(headings.length);
      expect(headings.every((heading) => heading.text.length > 0)).toBe(true);
    }
  });
});
