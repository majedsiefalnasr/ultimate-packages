import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UMeterGroup, type UMeterItem } from "./meter-group";

describe("UMeterGroup", () => {
  it("renders one meter segment per non-zero value item", () => {
    const value: UMeterItem[] = [
      { label: "A", value: 30, color: "red" },
      { label: "B", value: 20, color: "blue" },
      { label: "C", value: 0, color: "green" },
    ];
    const { container } = render(<UMeterGroup value={value} />);
    expect(container.querySelectorAll(".u-meter-group-meter").length).toBe(2);
  });

  it("computes segment widths proportional to min/max range", () => {
    const value: UMeterItem[] = [{ label: "A", value: 100, color: "red" }];
    const { container } = render(<UMeterGroup value={value} min={0} max={200} />);
    const meter = container.querySelector(".u-meter-group-meter") as HTMLElement;
    expect(meter.style.width).toBe("50%");
  });

  it("renders a legend list with label and percentage text", () => {
    const value: UMeterItem[] = [{ label: "Storage", value: 25, color: "red" }];
    render(<UMeterGroup value={value} />);
    expect(screen.getByText("Storage (25%)")).toBeInTheDocument();
  });

  it("switches to vertical orientation classes", () => {
    render(<UMeterGroup value={[{ value: 10 }]} orientation="vertical" />);
    expect(screen.getByRole("meter").className).toContain("u-meter-group-vertical");
  });

  it("sets aria-valuenow to the total percentage across all items", () => {
    render(<UMeterGroup value={[{ value: 20 }, { value: 30 }]} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "50");
  });
});
