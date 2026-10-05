import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats an ISO date as on the legacy site", () => {
    expect(formatDate("2026-09-26")).toBe("26 September 2026");
  });

  it("does not shift the day across time zones", () => {
    expect(formatDate("2026-01-01")).toBe("1 January 2026");
  });

  it("throws on an invalid date", () => {
    expect(() => formatDate("2026-13-40")).toThrow(/Invalid date/);
  });
});
