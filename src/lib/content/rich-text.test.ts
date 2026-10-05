import { describe, expect, it } from "vitest";
import { toPlainText } from "./rich-text";

describe("toPlainText", () => {
  it("joins strings and link labels in order", () => {
    expect(toPlainText(["See our ", { href: "/privacy", label: "privacy policy" }, "."])).toBe(
      "See our privacy policy.",
    );
  });

  it("returns an empty string for empty rich text", () => {
    expect(toPlainText([])).toBe("");
  });
});
