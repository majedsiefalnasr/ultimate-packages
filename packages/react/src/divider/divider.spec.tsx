import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UDivider } from "./divider";

describe("UDivider", () => {
  it("renders projected content", () => {
    render(
      <UDivider>
        <span>OR</span>
      </UDivider>
    );
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("defaults to horizontal layout", () => {
    const { container } = render(<UDivider />);
    const root = container.querySelector(".u-divider") as HTMLElement;
    expect(root).toHaveClass("u-divider-horizontal");
    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
    expect(root.getAttribute("role")).toBe("separator");
  });

  it("applies vertical layout when specified", () => {
    const { container } = render(<UDivider layout="vertical" />);
    const root = container.querySelector(".u-divider") as HTMLElement;
    expect(root).toHaveClass("u-divider-vertical");
    expect(root.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("does not render a content wrapper when there are no children", () => {
    const { container } = render(<UDivider />);
    expect(container.querySelector(".u-divider-content")).not.toBeInTheDocument();
  });
});
