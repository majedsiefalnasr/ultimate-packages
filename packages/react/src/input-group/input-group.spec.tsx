import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UInputGroup, UInputGroupAddon } from "./input-group";

describe("UInputGroup", () => {
  it("renders addons and the input as children of the root", () => {
    const { container } = render(
      <UInputGroup>
        <UInputGroupAddon>$</UInputGroupAddon>
        <input type="text" />
      </UInputGroup>
    );
    const root = container.querySelector(".u-input-group") as HTMLDivElement;
    expect(root).toBeTruthy();
    expect(root.querySelector(".u-input-group-addon")?.textContent).toBe("$");
    expect(root.querySelector("input")).toBeTruthy();
  });

  it("passes native attributes, className and the ref to the root div", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <UInputGroup ref={ref} id="group" className="mine" data-testid="x">
        content
      </UInputGroup>
    );
    const root = container.querySelector("div") as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("group");
    expect(root.classList.contains("u-input-group")).toBe(true);
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.getAttribute("data-testid")).toBe("x");
  });

  it("applies pt root attributes", () => {
    const { container } = render(
      <UInputGroup pt={{ root: { "data-pt": "yes" } }}>content</UInputGroup>
    );
    expect(container.querySelector("div")?.getAttribute("data-pt")).toBe("yes");
  });

  it("renders no Ultimate class when unstyled", () => {
    const { container } = render(<UInputGroup unstyled>content</UInputGroup>);
    expect(container.querySelector("div")?.className ?? "").not.toContain("u-input-group");
  });

  it("registers the shared inputgroup CSS", () => {
    render(<UInputGroup>content</UInputGroup>);
    const css = Array.from(document.querySelectorAll("style"))
      .map((node) => node.textContent ?? "")
      .join("\n");
    expect(css).toContain(".u-input-group-addon");
  });
});

describe("UInputGroupAddon", () => {
  it("applies the u-input-group-addon root class", () => {
    const { container } = render(<UInputGroupAddon>$</UInputGroupAddon>);
    expect(container.querySelector("div")?.className).toContain("u-input-group-addon");
  });

  it("passes native attributes, className and the ref to the root div", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <UInputGroupAddon ref={ref} id="addon" className="mine" style={{ color: "red" }}>
        $
      </UInputGroupAddon>
    );
    const root = container.querySelector("div") as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("addon");
    expect(root.classList.contains("mine")).toBe(true);
    expect(root.style.color).toBe("red");
  });

  it("applies pt root attributes", () => {
    const { container } = render(
      <UInputGroupAddon pt={{ root: { "data-pt": "yes" } }}>$</UInputGroupAddon>
    );
    expect(container.querySelector("div")?.getAttribute("data-pt")).toBe("yes");
  });

  it("renders no Ultimate class when unstyled", () => {
    const { container } = render(<UInputGroupAddon unstyled>$</UInputGroupAddon>);
    expect(container.querySelector("div")?.className ?? "").not.toContain("u-input-group-addon");
  });
});
