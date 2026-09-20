import * as React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { USkeleton } from "./skeleton";

describe("USkeleton", () => {
  it("renders with default rectangle shape and wave animation classes", () => {
    const { container } = render(<USkeleton />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.className).not.toContain("u-skeleton-circle");
    expect(root.className).toContain("u-skeleton-wave");
  });

  it("applies circle shape class", () => {
    const { container } = render(<USkeleton shape="circle" />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.className).toContain("u-skeleton-circle");
  });

  it("defaults to 100% width and 1rem height", () => {
    const { container } = render(<USkeleton />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("1rem");
  });

  it("applies custom width/height", () => {
    const { container } = render(<USkeleton width="10rem" height="2rem" />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("10rem");
    expect(root.style.height).toBe("2rem");
  });

  it("size overrides width/height for a square/circle skeleton", () => {
    const { container } = render(<USkeleton shape="circle" size="4rem" />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("4rem");
    expect(root.style.height).toBe("4rem");
  });

  it("has no animation class when animation is none", () => {
    const { container } = render(<USkeleton animation="none" />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.className).not.toContain("u-skeleton-wave");
  });

  it("is aria-hidden", () => {
    const { container } = render(<USkeleton />);
    const root = container.querySelector(".u-skeleton") as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });
});
