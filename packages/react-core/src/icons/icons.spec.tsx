import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  USpinnerIcon,
  UTimesIcon,
  UWindowMaximizeIcon,
  UWindowMinimizeIcon,
  UCheckIcon,
} from "./index";

const icons = [
  ["USpinnerIcon", USpinnerIcon],
  ["UTimesIcon", UTimesIcon],
  ["UWindowMaximizeIcon", UWindowMaximizeIcon],
  ["UWindowMinimizeIcon", UWindowMinimizeIcon],
  ["UCheckIcon", UCheckIcon],
] as const;

describe.each(icons)("%s", (_name, Icon) => {
  it("renders an svg with role='img'", () => {
    const { container } = render(<Icon />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("role")).toBe("img");
  });

  it("applies aria-label from the label prop", () => {
    const { container } = render(<Icon label="Loading" />);
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe("Loading");
  });

  it("forwards an additional className", () => {
    const { container } = render(<Icon className="u-extra" />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("u-extra");
  });
});

describe("USpinnerIcon spin behavior", () => {
  it("adds a spin class when spin is true", () => {
    const { container } = render(<USpinnerIcon spin />);
    expect(container.querySelector("svg")?.getAttribute("class")).toContain("u-icon-spin");
  });
});
