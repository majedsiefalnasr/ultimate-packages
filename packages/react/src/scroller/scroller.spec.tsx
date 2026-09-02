/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { UScroller } from "./scroller";

describe("UScroller", () => {
  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const { container } = render(
      <UScroller items={Array.from({ length: 5 }, (_, i) => i)} itemSize={20} numToleratedItems={50} />
    );
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const { container } = render(<UScroller items={[]} itemSize={20} />);
    expect(container.querySelector("[data-last]")?.getAttribute("data-last")).toBe("0");
  });
});
