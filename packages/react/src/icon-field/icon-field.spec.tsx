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

  it("defaults iconPosition to left and adds the left root class", () => {
    const { container } = render(<UIconField>content</UIconField>);
    const root = container.querySelector("div") as HTMLDivElement;
    expect(root.classList.contains("u-icon-field-left")).toBe(true);
    expect(root.classList.contains("u-icon-field-right")).toBe(false);
  });

  it("adds the right root class for iconPosition right", () => {
    const { container } = render(<UIconField iconPosition="right">content</UIconField>);
    const root = container.querySelector("div") as HTMLDivElement;
    expect(root.classList.contains("u-icon-field-right")).toBe(true);
    expect(root.classList.contains("u-icon-field-left")).toBe(false);
  });

  it("places the icon by DOM order, as the position classes are only styling hooks", () => {
    const { container, rerender } = render(
      <UIconField iconPosition="left">
        <UInputIcon>search</UInputIcon>
        <input type="text" />
      </UIconField>
    );
    expect(container.querySelector("div")?.firstElementChild?.className).toContain("u-input-icon");

    rerender(
      <UIconField iconPosition="right">
        <input type="text" />
        <UInputIcon>search</UInputIcon>
      </UIconField>
    );
    expect(container.querySelector("div")?.lastElementChild?.className).toContain("u-input-icon");
  });

  it("passes native attributes and the ref through to the root div", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <UIconField ref={ref} id="field" className="mine" style={{ color: "red" }} data-testid="x">
        content
      </UIconField>
    );
    const root = container.querySelector("div") as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("field");
    expect(root.className).toContain("mine");
    expect(root.className).toContain("u-icon-field");
    expect(root.style.color).toBe("red");
    expect(root.getAttribute("data-testid")).toBe("x");
  });

  it("applies root pt attributes and keeps the root class", () => {
    const { container } = render(
      <UIconField pt={{ root: { id: "icon-field-root", className: "extra-root" } }}>
        content
      </UIconField>
    );
    const root = container.querySelector("div") as HTMLDivElement;
    expect(root.id).toBe("icon-field-root");
    expect(root.className).toContain("u-icon-field");
    expect(root.className).toContain("extra-root");
    expect(root.getAttribute("data-pc-name")).toBe("iconfield");
    expect(root.getAttribute("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate classes", () => {
    const { container } = render(
      <UIconField unstyled pt={{ root: { className: "extra-root" } }}>
        content
      </UIconField>
    );
    const root = container.querySelector("div") as HTMLDivElement;
    expect(root.className).not.toContain("u-icon-field");
    expect(root.className).toContain("extra-root");
  });
});

describe("UInputIcon", () => {
  it("renders its children and applies the u-input-icon root class", () => {
    const { container } = render(<UInputIcon>search</UInputIcon>);
    const icon = container.querySelector("span");
    expect(icon?.className).toContain("u-input-icon");
    expect(icon?.textContent).toBe("search");
  });

  it("is aria-hidden by default", () => {
    const { container } = render(<UInputIcon>search</UInputIcon>);
    expect(container.querySelector("span")).toHaveAttribute("aria-hidden", "true");
  });

  it("lets an aria-hidden prop replace the default", () => {
    const { container } = render(<UInputIcon aria-hidden={false}>clear</UInputIcon>);
    expect(container.querySelector("span")).toHaveAttribute("aria-hidden", "false");
  });

  it("passes native attributes, handlers and the ref through to the root span", () => {
    const ref = React.createRef<HTMLSpanElement>();
    let clicks = 0;
    const { container } = render(
      <UInputIcon ref={ref} id="icon" className="mine" onClick={() => (clicks += 1)}>
        search
      </UInputIcon>
    );
    const icon = container.querySelector("span") as HTMLSpanElement;
    expect(ref.current).toBe(icon);
    expect(icon.id).toBe("icon");
    expect(icon.className).toContain("mine");
    expect(icon.className).toContain("u-input-icon");
    icon.click();
    expect(clicks).toBe(1);
  });

  it("applies root pt attributes, keeps the root class and lets pt replace aria-hidden", () => {
    const { container } = render(
      <UInputIcon
        pt={{ root: { id: "icon-root", className: "extra-icon", "aria-hidden": "false" } }}
      >
        search
      </UInputIcon>
    );
    const icon = container.querySelector("span") as HTMLSpanElement;
    expect(icon.id).toBe("icon-root");
    expect(icon.className).toContain("u-input-icon");
    expect(icon.className).toContain("extra-icon");
    expect(icon.getAttribute("aria-hidden")).toBe("false");
    expect(icon.getAttribute("data-pc-name")).toBe("inputicon");
    expect(icon.getAttribute("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate class", () => {
    const { container } = render(
      <UInputIcon unstyled pt={{ root: { className: "extra-icon" } }}>
        search
      </UInputIcon>
    );
    const icon = container.querySelector("span") as HTMLSpanElement;
    expect(icon.className).not.toContain("u-input-icon");
    expect(icon.className).toContain("extra-icon");
  });
});
