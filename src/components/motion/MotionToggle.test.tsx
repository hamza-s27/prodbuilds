import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionToggle } from "./MotionToggle";

const stubReducedMotion = (matches: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("MotionToggle", () => {
  it("renders no claim in the server HTML, only an inert placeholder", async () => {
    const { renderToString } = await import("react-dom/server");

    const html = renderToString(<MotionToggle />);

    expect(html).not.toMatch(/Motion/);
    expect(html).toContain('aria-hidden="true"');
  });

  it("switches motion off and on, reflecting state in aria-pressed", async () => {
    stubReducedMotion(false);
    render(<MotionToggle />);

    const toggle = screen.getByRole("button", { name: "Motion" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Motion" })).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.dataset.motion).toBe("off");
  });

  it("explains when the system setting has already turned motion off", () => {
    stubReducedMotion(true);
    render(<MotionToggle />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Motion off · system setting")).toBeInTheDocument();
  });
});
