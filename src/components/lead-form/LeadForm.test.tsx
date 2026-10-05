import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LeadForm } from "./LeadForm";

const renderForm = () => render(<LeadForm idPrefix="hero" note="No spam. Just a conversation." />);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LeadForm", () => {
  it("renders a real form that works without JavaScript", () => {
    renderForm();

    const form = screen.getByRole("form", { name: "Leave your email" });
    expect(screen.getByLabelText("Email address")).toHaveAttribute("maxLength", "254");
    expect(form).toHaveAttribute("method", "post");
    expect(form.getAttribute("action")).toMatch(/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/);
    const input = screen.getByLabelText("Email address");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("id", "hero-email");
    expect(screen.getByText("No spam. Just a conversation.")).toHaveAttribute("id", "hero-note");
    expect(screen.getByRole("status")).toHaveAttribute("id", "hero-status");
  });

  it("thanks the visitor, hides the form and moves focus to the message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));
    renderForm();

    await userEvent.type(screen.getByLabelText("Email address"), "you@company.com");
    await userEvent.click(screen.getByRole("button", { name: "Let’s talk" }));

    const status = await screen.findByText(/Thanks — we’ll be in touch by email/);
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByText("No spam. Just a conversation.")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
    expect(status.closest("[role=status]")?.querySelector("a")).toHaveAttribute(
      "href",
      "mailto:hello@prodbuilds.com",
    );
  });

  it("explains a failure, offers email, and returns focus to the input", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    renderForm();

    await userEvent.type(screen.getByLabelText("Email address"), "you@company.com");
    await userEvent.click(screen.getByRole("button", { name: "Let’s talk" }));

    expect(await screen.findByText(/That didn’t go through/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Let’s talk" })).toBeEnabled();
    expect(screen.getByLabelText("Email address")).toHaveFocus();
    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining("hero-status"),
    );
  });

  it("shows a sending state and ignores repeat submissions", async () => {
    let resolve: (value: Response) => void = () => {};
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    renderForm();

    await userEvent.type(screen.getByLabelText("Email address"), "you@company.com");
    const form = screen.getByRole("form");
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(await screen.findByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(new Response(null));
    expect(await screen.findByText(/Thanks/)).toBeInTheDocument();
  });

  it("asks for a full address instead of blaming the connection", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderForm();

    await userEvent.type(screen.getByLabelText("Email address"), "you@");
    fireEvent.submit(screen.getByRole("form"));

    expect(await screen.findByText("Please enter a full email address.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("takes a distinct landmark name so several forms on one page stay distinguishable", () => {
    render(<LeadForm idPrefix="cta" note="n" formLabel="Start a conversation" />);

    expect(screen.getByRole("form", { name: "Start a conversation" })).toBeInTheDocument();
  });
});
