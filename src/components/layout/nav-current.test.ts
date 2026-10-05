import { describe, expect, it } from "vitest";
import { navCurrent } from "./nav-current";

describe("navCurrent", () => {
  it("marks the page itself as the current page", () => {
    expect(navCurrent("/blog", "/blog")).toBe("page");
  });

  it("marks the section for pages inside it", () => {
    expect(navCurrent("/blog", "/blog/some-post")).toBe("true");
  });

  it("does not match prefixes that are not a path segment", () => {
    expect(navCurrent("/blog", "/blogroll")).toBeUndefined();
  });

  it("marks nothing when there is no current path", () => {
    expect(navCurrent("/blog", undefined)).toBeUndefined();
  });
});
