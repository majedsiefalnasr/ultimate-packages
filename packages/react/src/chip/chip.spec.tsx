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
});
