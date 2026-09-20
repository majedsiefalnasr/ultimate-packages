import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UTimeline } from "./timeline";

describe("UTimeline", () => {
  it("renders one event row per value entry", () => {
    const { container } = render(
      <UTimeline value={["Ordered", "Shipped", "Delivered"]} content={(e) => e} />
    );
    const rows = container.querySelectorAll(".u-timeline-event");
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain("Ordered");
    expect(rows[2].textContent).toContain("Delivered");
  });

  it("renders a connector between events but not after the last one", () => {
    const { container } = render(<UTimeline value={["A", "B"]} />);
    expect(container.querySelectorAll(".u-timeline-event-connector").length).toBe(1);
  });

  it("applies horizontal layout class", () => {
    const { container } = render(<UTimeline value={["A"]} layout="horizontal" />);
    expect(container.querySelector(".u-timeline")?.className).toContain("u-timeline-horizontal");
  });

  it("renders a default marker when no marker render-prop is provided", () => {
    const { container } = render(<UTimeline value={["A"]} />);
    expect(container.querySelector(".u-timeline-event-marker")).toBeTruthy();
  });

  it("renders a custom marker when provided", () => {
    const { container } = render(
      <UTimeline value={["A"]} marker={(e) => <span className="custom-marker">{e}</span>} />
    );
    expect(container.querySelector(".custom-marker")?.textContent).toBe("A");
    expect(container.querySelector(".u-timeline-event-marker")).toBeFalsy();
  });
});
