import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UProgressSpinner } from "./progress-spinner";

describe("UProgressSpinner", () => {
  it("renders an svg with role=progressbar and aria-busy", () => {
    const { container } = render(<UProgressSpinner />);
    const root = screen.getByRole("progressbar");
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("svg.u-progress-spinner-spin")).toBeInTheDocument();
  });

  it("applies a custom stroke width and fill to the circle", () => {
    const { container } = render(<UProgressSpinner strokeWidth="4" fill="red" />);
    const circle = container.querySelector("circle");
    expect(circle).toHaveAttribute("stroke-width", "4");
    expect(circle).toHaveAttribute("fill", "red");
  });

  it("applies a custom animation duration to the svg style", () => {
    const { container } = render(<UProgressSpinner animationDuration="4s" />);
    const svg = container.querySelector("svg") as SVGElement;
    expect(svg.style.animationDuration).toBe("4s");
  });

  it("sets aria-label when ariaLabel is provided", () => {
    render(<UProgressSpinner ariaLabel="Loading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Loading");
  });
});
