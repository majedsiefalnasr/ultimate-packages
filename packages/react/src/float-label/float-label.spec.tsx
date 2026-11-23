import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UFloatLabel } from "./float-label";

describe("UFloatLabel", () => {
  it("renders its children (input + label)", () => {
    const { container } = render(
      <UFloatLabel>
        <input type="text" id="username" />
        <label htmlFor="username">Username</label>
      </UFloatLabel>
    );
    expect(container.querySelector("input")).toBeTruthy();
    expect(container.querySelector("label")).toBeTruthy();
  });

  it("applies the u-float-label root class", () => {
    const { container } = render(<UFloatLabel>content</UFloatLabel>);
    expect(container.querySelector("span")?.className).toContain("u-float-label");
  });

  it("applies the default 'over' variant class", () => {
    const { container } = render(<UFloatLabel>content</UFloatLabel>);
    expect(container.querySelector("span")?.className).toContain("u-float-label-over");
  });

  it("applies the 'in' variant class when set", () => {
    const { container } = render(<UFloatLabel variant="in">content</UFloatLabel>);
    expect(container.querySelector("span")?.className).toContain("u-float-label-in");
  });

  it("label-float trigger is pure CSS (:has()) — root class does not change with child filled state", () => {
    const { container, rerender } = render(
      <UFloatLabel>
        <input type="text" />
        <label>Username</label>
      </UFloatLabel>
    );
    const before = container.querySelector("span")?.className;

    rerender(
      <UFloatLabel>
        <input type="text" className="p-filled" />
        <label>Username</label>
      </UFloatLabel>
    );
    const after = container.querySelector("span")?.className;

    expect(after).toBe(before);
    expect(container.querySelector("input.p-filled")).toBeTruthy();
  });

  it("passes native attributes and the ref through to the root span", () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(
      <UFloatLabel ref={ref} id="fl" className="mine" style={{ color: "red" }}>
        content
      </UFloatLabel>
    );
    const root = container.querySelector("span") as HTMLSpanElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("fl");
    expect(root.className).toContain("mine");
    expect(root.className).toContain("u-float-label");
    expect(root.style.color).toBe("red");
  });

  it("applies root pt attributes and keeps the root class", () => {
    const { container } = render(
      <UFloatLabel pt={{ root: { id: "float-root", className: "extra-root" } }}>
        content
      </UFloatLabel>
    );
    const root = container.querySelector("span") as HTMLSpanElement;
    expect(root.id).toBe("float-root");
    expect(root.className).toContain("u-float-label");
    expect(root.className).toContain("extra-root");
    expect(root.getAttribute("data-pc-name")).toBe("floatlabel");
    expect(root.getAttribute("data-pc-section")).toBe("root");
  });

  it("unstyled drops the Ultimate classes", () => {
    const { container } = render(
      <UFloatLabel unstyled pt={{ root: { className: "extra-root" } }}>
        content
      </UFloatLabel>
    );
    const root = container.querySelector("span") as HTMLSpanElement;
    expect(root.className).not.toContain("u-float-label");
    expect(root.className).toContain("extra-root");
  });
});
