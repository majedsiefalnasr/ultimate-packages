import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UChip } from "./chip";

describe("UChip", () => {
  it("renders the label text", () => {
    render(<UChip label="Apple" />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("renders an icon class when icon is provided and no image", () => {
    const { container } = render(<UChip icon="pi pi-apple" />);
    expect(container.querySelector(".pi-apple")).toBeInTheDocument();
  });

  it("renders an image and prefers it over icon", () => {
    render(<UChip image="a.png" icon="pi pi-apple" alt="fruit" />);
    const img = screen.getByAltText("fruit") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("a.png");
  });

  it("does not render a remove control by default", () => {
    const { container } = render(<UChip label="Apple" />);
    expect(container.querySelector(".u-chip-remove-icon")).not.toBeInTheDocument();
  });

  it("removes the chip and calls onRemove when the remove control is clicked", () => {
    const onRemove = vi.fn();
    const { container } = render(<UChip label="Apple" removable onRemove={onRemove} />);
    const removeEl = container.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl).toBeInTheDocument();
    fireEvent.click(removeEl);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(container.querySelector(".u-chip")).not.toBeInTheDocument();
  });

  it("removes the chip on Enter and Backspace keydown on the remove control", () => {
    const onRemove = vi.fn();
    const { container } = render(<UChip label="Apple" removable onRemove={onRemove} />);
    const removeEl = container.querySelector(".u-chip-remove-icon") as HTMLElement;
    fireEvent.keyDown(removeEl, { key: "Enter" });
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("does not remove when disabled", () => {
    const onRemove = vi.fn();
    const { container } = render(<UChip label="Apple" removable disabled onRemove={onRemove} />);
    const removeEl = container.querySelector(".u-chip-remove-icon") as HTMLElement;
    fireEvent.click(removeEl);
    expect(onRemove).not.toHaveBeenCalled();
    expect(container.querySelector(".u-chip")).toBeInTheDocument();
  });

  it("sets tabIndex -1 on the remove control when disabled", () => {
    const { container } = render(<UChip label="Apple" removable disabled />);
    const removeEl = container.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.getAttribute("tabindex")).toBe("-1");
  });

  it("calls onImageError when the image fails to load", () => {
    const onImageError = vi.fn();
    render(<UChip image="bad.png" alt="broken" onImageError={onImageError} />);
    fireEvent.error(screen.getByAltText("broken"));
    expect(onImageError).toHaveBeenCalledOnce();
  });

  it("gives the remove control an English default accessible label that can be replaced", () => {
    const { container, rerender } = render(<UChip label="Apple" removable />);
    expect(container.querySelector(".u-chip-remove-icon")?.getAttribute("aria-label")).toBe(
      "Remove"
    );
    rerender(<UChip label="Apple" removable removeAriaLabel="Delete" />);
    expect(container.querySelector(".u-chip-remove-icon")?.getAttribute("aria-label")).toBe(
      "Delete"
    );
  });

  it("replaces the remove glyph with a font class or an element", () => {
    const { container, rerender } = render(
      <UChip label="Apple" removable removeIcon="pi pi-times-circle" />
    );
    const removeEl = container.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.classList.contains("pi-times-circle")).toBe(true);
    expect(removeEl.querySelector("svg")).toBeNull();
    rerender(<UChip label="Apple" removable removeIcon={<b data-testid="glyph">x</b>} />);
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
  });

  it("renders the template instead of the image, icon and label", () => {
    const { container } = render(
      <UChip label="Apple" template={<span data-testid="custom">Custom</span>} />
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
    expect(container.querySelector(".u-chip-label")).toBeNull();
  });

  it("calls a template function with the props", () => {
    render(
      <UChip label="Apple" template={(props) => <span data-testid="fn">{props.label}</span>} />
    );
    expect(screen.getByTestId("fn").textContent).toBe("Apple");
  });

  it("forwards the ref and rest props to the root, and lets a consumer aria-label win", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <UChip ref={ref} label="Apple" data-testid="root" aria-label="Fruit" style={{ margin: 1 }} />
    );
    const root = container.querySelector(".u-chip") as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root.getAttribute("data-testid")).toBe("root");
    expect(root.getAttribute("aria-label")).toBe("Fruit");
    expect(root.style.margin).toBe("1px");
  });

  it("sets data-p to removable only when removable", () => {
    const { container, rerender } = render(<UChip label="Apple" />);
    expect(container.querySelector(".u-chip")?.hasAttribute("data-p")).toBe(false);
    rerender(<UChip label="Apple" removable />);
    expect(container.querySelector(".u-chip")?.getAttribute("data-p")).toBe("removable");
  });

  it("adds p-disabled to the root when disabled", () => {
    const { container } = render(<UChip label="Apple" disabled />);
    expect(container.querySelector(".u-chip")?.classList.contains("p-disabled")).toBe(true);
  });

  it("applies pt sections to the root and each part", () => {
    const { container } = render(
      <UChip
        label="Apple"
        icon="pi pi-apple"
        removable
        pt={{
          root: { "data-pt": "root" },
          icon: { "data-pt": "icon" },
          label: { "data-pt": "label" },
          removeIcon: { "data-pt": "remove" },
        }}
      />
    );
    expect(container.querySelector(".u-chip")?.getAttribute("data-pt")).toBe("root");
    expect(container.querySelector(".u-chip-icon")?.getAttribute("data-pt")).toBe("icon");
    expect(container.querySelector(".u-chip-label")?.getAttribute("data-pt")).toBe("label");
    expect(container.querySelector(".u-chip-remove-icon")?.getAttribute("data-pt")).toBe("remove");
  });

  it("applies the image pt section", () => {
    render(<UChip image="a.png" alt="fruit" pt={{ image: { "data-pt": "image" } }} />);
    expect(screen.getByAltText("fruit").getAttribute("data-pt")).toBe("image");
  });

  it("emits no Ultimate classes when unstyled", () => {
    const { container } = render(<UChip label="Apple" removable unstyled />);
    expect(container.querySelector(".u-chip")).toBeNull();
    expect(container.querySelector(".u-chip-label")).toBeNull();
    expect(container.querySelector("[role='button']")?.className ?? "").toBe("");
  });
});
