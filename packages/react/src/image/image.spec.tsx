import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UImage } from "./image";

describe("UImage", () => {
  it("renders the img element with src/alt", () => {
    render(<UImage src="a.png" alt="A" />);
    const img = screen.getByAltText("A") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("a.png");
  });

  it("does not render a preview button when preview is false", () => {
    const { container } = render(<UImage src="a.png" />);
    expect(container.querySelector(".u-image-preview-mask")).not.toBeInTheDocument();
  });

  it("opens the fullscreen preview mask when the preview button is clicked", () => {
    render(<UImage src="a.png" preview />);
    fireEvent.click(screen.getByLabelText("Zoom image"));
    expect(document.querySelector(".u-image-mask")).toBeInTheDocument();
  });

  it("closes the preview when the close button is clicked", () => {
    render(<UImage src="a.png" preview />);
    fireEvent.click(screen.getByLabelText("Zoom image"));
    fireEvent.click(screen.getByLabelText("Close"));
    expect(document.querySelector(".u-image-mask")).not.toBeInTheDocument();
  });

  it("closes the preview on Escape keydown", () => {
    render(<UImage src="a.png" preview />);
    fireEvent.click(screen.getByLabelText("Zoom image"));
    const mask = document.querySelector(".u-image-mask") as HTMLElement;
    fireEvent.keyDown(document, { code: "Escape" });
    expect(document.querySelector(".u-image-mask")).not.toBeInTheDocument();
    expect(mask).toBeTruthy();
  });

  it("toggles zoom in/out within the min/max bounds", () => {
    render(<UImage src="a.png" preview />);
    fireEvent.click(screen.getByLabelText("Zoom image"));
    fireEvent.click(screen.getByLabelText("Zoom in"));
    const original = document.querySelector(".u-image-original") as HTMLElement;
    expect(original.style.transform).toContain("scale(1.1)");
  });

  it("calls onImageError when the base image fails to load", () => {
    const onImageError = vi.fn();
    render(<UImage src="bad.png" alt="broken" onImageError={onImageError} />);
    fireEvent.error(screen.getByAltText("broken"));
    expect(onImageError).toHaveBeenCalledOnce();
  });

  it("calls onShow and onHide", () => {
    const onShow = vi.fn();
    const onHide = vi.fn();
    render(<UImage src="a.png" preview onShow={onShow} onHide={onHide} />);
    fireEvent.click(screen.getByLabelText("Zoom image"));
    expect(onShow).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onHide).toHaveBeenCalledOnce();
  });
});
