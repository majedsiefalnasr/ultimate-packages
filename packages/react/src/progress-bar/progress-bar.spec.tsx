import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UProgressBar } from "./progress-bar";

describe("UProgressBar", () => {
  it("renders a determinate bar with the value width and label text", () => {
    render(<UProgressBar value={42} />);
    const root = screen.getByRole("progressbar");
    const value = root.querySelector(".u-progress-bar-value") as HTMLElement;
    expect(value.style.width).toBe("42%");
    expect(root.querySelector(".u-progress-bar-label")?.textContent).toBe("42%");
  });

  it("hides the label when showValue is false", () => {
    render(<UProgressBar value={50} showValue={false} />);
    expect(screen.getByRole("progressbar").querySelector(".u-progress-bar-label")).toBeNull();
  });

  it("renders indeterminate mode without a value/label", () => {
    render(<UProgressBar mode="indeterminate" />);
    const root = screen.getByRole("progressbar");
    expect(root.querySelector(".u-progress-bar-label")).toBeNull();
    expect(root.className).toContain("u-progress-bar-indeterminate");
  });

  it("sets aria-valuenow in determinate mode", () => {
    render(<UProgressBar value={75} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("appends a custom unit to the value label", () => {
    render(<UProgressBar value={3} unit=" MB" />);
    expect(screen.getByRole("progressbar").querySelector(".u-progress-bar-label")?.textContent).toBe(
      "3 MB"
    );
  });
});
