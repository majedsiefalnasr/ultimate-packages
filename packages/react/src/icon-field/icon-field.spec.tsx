import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UIconField, UInputIcon } from "./icon-field";

describe("UIconField", () => {
  it("renders its children (icon + input)", () => {
    const { container } = render(
      <UIconField>
        <UInputIcon>search</UInputIcon>
        <input type="text" />
      </UIconField>
    );
    expect(container.querySelector(".u-input-icon")).toBeTruthy();
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("applies the u-icon-field root class", () => {
    const { container } = render(<UIconField>content</UIconField>);
    expect(container.querySelector("div")?.className).toContain("u-icon-field");
  });

  it("positions the icon leading/trailing via DOM order — root class list is stable across positions", () => {
    const { container, rerender } = render(
      <UIconField iconPosition="left">
        <UInputIcon>search</UInputIcon>
        <input type="text" />
      </UIconField>
    );
    const firstChildLeft = container.querySelector("div")?.firstElementChild;
    expect(firstChildLeft?.className).toContain("u-input-icon");

    rerender(
      <UIconField iconPosition="right">
        <input type="text" />
        <UInputIcon>search</UInputIcon>
      </UIconField>
    );
    const lastChildRight = container.querySelector("div")?.lastElementChild;
    expect(lastChildRight?.className).toContain("u-input-icon");
  });
});

describe("UInputIcon", () => {
  it("renders its children, applies the u-input-icon root class, and is aria-hidden", () => {
    const { container } = render(<UInputIcon>search</UInputIcon>);
    const icon = container.querySelector("span");
    expect(icon?.className).toContain("u-input-icon");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.textContent).toBe("search");
  });
});
