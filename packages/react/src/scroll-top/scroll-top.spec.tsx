import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { UScrollTop } from "./scroll-top";

function setScrollY(value: number) {
  Object.defineProperty(window, "pageYOffset", { value, configurable: true });
}

function fireWindowScroll() {
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("UScrollTop", () => {
  afterEach(() => {
    setScrollY(0);
  });

  it("is hidden below the scroll threshold", () => {
    render(<UScrollTop threshold={100} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("becomes visible once window scroll exceeds the threshold", () => {
    render(<UScrollTop threshold={100} />);
    setScrollY(200);
    fireWindowScroll();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onShow when crossing the threshold and scrolls to top on click", () => {
    const onShow = vi.fn();
    render(<UScrollTop threshold={50} onShow={onShow} />);
    setScrollY(100);
    fireWindowScroll();
    expect(onShow).toHaveBeenCalledTimes(1);

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy as unknown as typeof window.scroll;
    screen.getByRole("button").click();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("respects a custom behavior value", () => {
    render(<UScrollTop threshold={10} behavior="auto" />);
    setScrollY(50);
    fireWindowScroll();

    const scrollSpy = vi.fn();
    window.scroll = scrollSpy as unknown as typeof window.scroll;
    screen.getByRole("button").click();
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("calls onHide when scrolling back below threshold", () => {
    const onHide = vi.fn();
    render(<UScrollTop threshold={50} onHide={onHide} />);
    setScrollY(100);
    fireWindowScroll();
    expect(screen.getByRole("button")).toBeInTheDocument();

    setScrollY(0);
    fireWindowScroll();
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
