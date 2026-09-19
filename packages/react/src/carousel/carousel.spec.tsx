import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UCarousel } from "./carousel";

const items = Array.from({ length: 6 }, (_, i) => `Item ${i + 1}`);

describe("UCarousel", () => {
  it("renders one item element per value entry", () => {
    const { container } = render(<UCarousel value={items} itemTemplate={(item) => item} />);
    expect(container.querySelectorAll(".u-carousel-item")).toHaveLength(6);
  });

  it("navigates forward and backward with the nav buttons", async () => {
    const user = userEvent.setup();
    render(<UCarousel value={items} itemTemplate={(item) => item} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(document.querySelector('[data-p-active="true"]')).toBeTruthy();
    expect(
      document.querySelectorAll(".u-carousel-indicator")[1].getAttribute("data-p-active")
    ).toBe("true");

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(
      document.querySelectorAll(".u-carousel-indicator")[0].getAttribute("data-p-active")
    ).toBe("true");
  });

  it("disables prev on the first page when not circular", () => {
    render(<UCarousel value={items} itemTemplate={(item) => item} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("circular: wraps forward navigation past the last page back to the first", async () => {
    const user = userEvent.setup();
    render(<UCarousel value={items} itemTemplate={(item) => item} circular />);
    const nextButton = screen.getByRole("button", { name: "Next" });
    for (let i = 0; i < items.length; i++) {
      await user.click(nextButton);
    }
    expect(
      document.querySelectorAll(".u-carousel-indicator")[0].getAttribute("data-p-active")
    ).toBe("true");
  });

  it("clicking an indicator dot jumps directly to that page and calls onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<UCarousel value={items} itemTemplate={(item) => item} onPageChange={onPageChange} />);
    const dots = screen.getAllByRole("button", { name: /Page \d/ });
    await user.click(dots[3]);
    expect(onPageChange).toHaveBeenCalledWith({ page: 3 });
  });

  describe("autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("advances the page automatically at the given interval", () => {
      render(<UCarousel value={items} itemTemplate={(item) => item} autoplayInterval={1000} />);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(
        document.querySelectorAll(".u-carousel-indicator")[1].getAttribute("data-p-active")
      ).toBe("true");
    });

    it("stops the autoplay timer on unmount", () => {
      const { unmount } = render(
        <UCarousel value={items} itemTemplate={(item) => item} autoplayInterval={1000} />
      );
      unmount();
      expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
    });
  });
});
