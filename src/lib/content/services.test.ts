import { describe, expect, it } from "vitest";
import type { Service } from "@/content/types";
import { orderedByDepth, stackUnion } from "./services";

const service = (id: Service["id"], depth: number | null, stack: string[]): Service => ({
  id,
  tag: id,
  title: id,
  schemaName: id,
  summary: id,
  intro: id,
  included: ["x"],
  stack,
  relatedPostSlugs: [],
  layer: { depth, hud: id },
});

describe("orderedByDepth", () => {
  it("orders layers by depth and puts cross-cutting (null depth) services last", () => {
    const services = [service("ai", null, []), service("cloud", 4, []), service("product", 0, [])];

    expect(orderedByDepth(services).map((s) => s.id)).toEqual(["product", "cloud", "ai"]);
  });

  it("does not mutate its input", () => {
    const services = [service("cloud", 4, []), service("product", 0, [])];

    orderedByDepth(services);

    expect(services.map((s) => s.id)).toEqual(["cloud", "product"]);
  });
});

describe("stackUnion", () => {
  it("returns every technology once, in first-seen order", () => {
    const services = [service("backend", 1, ["Java", "Docker"]), service("cloud", 4, ["Docker", "AWS"])];

    expect(stackUnion(services)).toEqual(["Java", "Docker", "AWS"]);
  });
});
