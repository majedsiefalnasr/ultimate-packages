import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UBadge } from "./badge";
import { UButton } from "../button";

function badgeOf(container: HTMLElement): HTMLElement {
  return container.querySelector(".u-badge") as HTMLElement;
}

describe("UBadge", () => {
  it("renders the value in a span", () => {
    const { container } = render(<UBadge value="12" />);
    const badge = badgeOf(container);
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveTextContent("12");
  });

  it("renders a dot when there is no value", () => {
    const { container } = render(<UBadge />);
    expect(badgeOf(container)).toHaveClass("u-badge-dot");
  });

  it("renders a circle for a single character", () => {
    const { container, rerender } = render(<UBadge value="3" />);
    expect(badgeOf(container)).toHaveClass("u-badge-circle");
    expect(badgeOf(container)).not.toHaveClass("u-badge-dot");
    rerender(<UBadge value="33" />);
    expect(badgeOf(container)).not.toHaveClass("u-badge-circle");
  });

  it("maps size to the shared sm, lg and xl classes", () => {
    const { container, rerender } = render(<UBadge value="1" size="small" />);
    expect(badgeOf(container)).toHaveClass("u-badge-sm");
    rerender(<UBadge value="1" size="large" />);
    expect(badgeOf(container)).toHaveClass("u-badge-lg");
    rerender(<UBadge value="1" size="xlarge" />);
    expect(badgeOf(container)).toHaveClass("u-badge-xl");
  });

  it("accepts both warn and warning for the warn severity", () => {
    const { container, rerender } = render(<UBadge value="1" severity="warn" />);
    expect(badgeOf(container)).toHaveClass("u-badge-warn");
    rerender(<UBadge value="1" severity="warning" />);
    expect(badgeOf(container)).toHaveClass("u-badge-warn");
  });

  it.each(["secondary", "info", "success", "danger", "contrast"] as const)(
    "maps the %s severity",
    (severity) => {
      const { container } = render(<UBadge value="1" severity={severity} />);
      expect(badgeOf(container)).toHaveClass(`u-badge-${severity}`);
    }
  );

  it("merges className, style and native attributes onto the root", () => {
    const { container } = render(
      <UBadge value="1" className="extra" style={{ color: "red" }} data-testid="b" id="x" />
    );
    const badge = badgeOf(container);
    expect(badge).toHaveClass("extra");
    expect(badge).toHaveClass("u-badge");
    expect(badge.style.color).toBe("red");
    expect(badge).toHaveAttribute("data-testid", "b");
    expect(badge).toHaveAttribute("id", "x");
  });

  it("forwards a ref to the span", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<UBadge value="1" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("pt.root attributes and classes reach the root", () => {
    const { container } = render(
      <UBadge value="1" pt={{ root: { "data-test": "x", className: "custom" } }} />
    );
    const badge = badgeOf(container);
    expect(badge).toHaveAttribute("data-test", "x");
    expect(badge).toHaveClass("custom");
  });

  it("unstyled drops the Ultimate classes", () => {
    const { container } = render(<UBadge value="1" severity="info" unstyled />);
    expect(container.querySelector(".u-badge")).toBeNull();
    expect(container.querySelector("span")).toHaveTextContent("1");
  });
});

describe("UButton badge", () => {
  it("renders the button badge through UBadge and keeps badgeClassName", () => {
    const { container } = render(<UButton label="Save" badge="3" badgeClassName="mine" />);
    const badge = badgeOf(container);
    expect(badge).toHaveTextContent("3");
    expect(badge).toHaveClass("mine");
  });
});
