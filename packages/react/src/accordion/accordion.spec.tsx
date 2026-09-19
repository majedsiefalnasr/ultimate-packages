import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UAccordion, type UAccordionPanel } from "./accordion";

const panels: UAccordionPanel[] = [
  { value: "a", header: "Tab 1", content: "a content" },
  { value: "b", header: "Tab 2", content: "b content" },
  { value: "c", header: "Tab 3", content: "c content", disabled: true },
];

describe("UAccordion", () => {
  it("renders a header per panel and no content until expanded", () => {
    render(<UAccordion panels={panels} />);
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("expands a panel on header click and renders its content", async () => {
    const user = userEvent.setup();
    render(<UAccordion panels={panels} />);
    await user.click(screen.getByText("Tab 1"));
    expect(screen.getByRole("region")).toHaveTextContent("a content");
    expect(screen.getByText("Tab 1").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("collapses an expanded panel when clicked again (single mode)", async () => {
    const user = userEvent.setup();
    render(<UAccordion panels={panels} />);
    await user.click(screen.getByText("Tab 1"));
    expect(screen.getByRole("region")).toBeInTheDocument();
    await user.click(screen.getByText("Tab 1"));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("single mode: expanding a second panel closes the first", async () => {
    const user = userEvent.setup();
    render(<UAccordion panels={panels} />);
    await user.click(screen.getByText("Tab 1"));
    await user.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Tab 1").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByText("Tab 2").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("multiple mode: allows more than one panel expanded simultaneously", async () => {
    const user = userEvent.setup();
    render(<UAccordion panels={panels} multiple />);
    await user.click(screen.getByText("Tab 1"));
    await user.click(screen.getByText("Tab 2"));
    expect(screen.getByText("Tab 1").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText("Tab 2").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("does not expand a disabled panel", () => {
    // The disabled header sets CSS pointer-events: none (real-world click
    // is blocked at the browser level, matching real Prime's own
    // .p-disabled convention), so this exercises the click handler's own
    // `if (panel.disabled) return` guard directly via fireEvent (which,
    // unlike userEvent, does not enforce jsdom's pointer-events check) —
    // asserting the guard itself, not the CSS layer, which the "applies
    // the disabled header CSS" concern is out of scope for this behavioral
    // test.
    render(<UAccordion panels={panels} />);
    fireEvent.click(screen.getByText("Tab 3"));
    expect(screen.getByText("Tab 3").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("calls onTabOpen and onTabClose", async () => {
    const user = userEvent.setup();
    const onTabOpen = vi.fn();
    const onTabClose = vi.fn();
    render(<UAccordion panels={panels} onTabOpen={onTabOpen} onTabClose={onTabClose} />);
    await user.click(screen.getByText("Tab 1"));
    expect(onTabOpen).toHaveBeenCalledWith(expect.objectContaining({ index: "a" }));
    await user.click(screen.getByText("Tab 1"));
    expect(onTabClose).toHaveBeenCalledWith(expect.objectContaining({ index: "a" }));
  });

  it("respects a controlled value prop", () => {
    render(<UAccordion panels={panels} value="b" />);
    expect(screen.getByText("Tab 2").closest('[role="button"]')).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });
});
