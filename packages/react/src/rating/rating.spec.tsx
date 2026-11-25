import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { URating, type URatingHandle } from "./rating";

const stars = () => screen.getAllByRole("radio");

describe("URating", () => {
  describe("rendering", () => {
    it("renders one option per star with role=group on the root", () => {
      render(<URating value={null} onChange={() => {}} stars={5} />);
      expect(screen.getByRole("group")).toBeInTheDocument();
      expect(stars().length).toBe(5);
    });

    it("names each star and marks the selected one checked", () => {
      render(<URating value={2} stars={3} />);
      expect(stars().map((star) => star.getAttribute("aria-label"))).toEqual([
        "1 star",
        "2 stars",
        "3 stars",
      ]);
      expect(stars().map((star) => star.getAttribute("aria-checked"))).toEqual([
        "false",
        "true",
        "false",
      ]);
    });

    it("marks the filled stars active and draws the Prime star icons", () => {
      const { container } = render(<URating value={2} stars={4} />);
      expect(stars().map((star) => star.classList.contains("u-rating-option-active"))).toEqual([
        true,
        true,
        false,
        false,
      ]);
      expect(container.querySelectorAll("svg.u-rating-on-icon").length).toBe(2);
      expect(container.querySelectorAll("svg.u-rating-off-icon").length).toBe(2);
      expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 14 14");
    });

    it("uses the shared u-rating classes and no hard-coded colours", () => {
      const { container } = render(<URating value={null} />);
      expect(container.firstElementChild?.className).toContain("u-rating u-component");
      const css = Array.from(document.querySelectorAll("style"))
        .map((style) => style.textContent ?? "")
        .join("\n");
      expect(css).toContain(".u-rating-option-active .u-rating-icon");
      expect(css).not.toMatch(/#3b82f6|#f59e0b|#9ca3af|#d1d5db/);
    });
  });

  describe("pointer", () => {
    it("clicking a star calls onChange with that star's value", () => {
      const onChange = vi.fn();
      render(<URating value={null} onChange={onChange} stars={5} />);
      fireEvent.click(stars()[2]);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 3 }));
    });

    it("clicking the already-selected star clears it", () => {
      const onChange = vi.fn();
      render(<URating value={3} onChange={onChange} stars={5} />);
      fireEvent.click(stars()[2]);
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: null }));
    });

    it("the change event carries target, preventDefault and stopPropagation", () => {
      const onChange = vi.fn();
      render(<URating id="score" name="score" value={null} onChange={onChange} />);
      fireEvent.click(stars()[1]);
      const event = onChange.mock.calls[0][0];
      expect(event.target).toEqual({ name: "score", id: "score", value: 2 });
      expect(typeof event.preventDefault).toBe("function");
      expect(typeof event.stopPropagation).toBe("function");
      expect(event.originalEvent.type).toBe("click");
    });
  });

  describe("keyboard", () => {
    it("ArrowRight/ArrowDown steps to the next star, wrapping past the max", () => {
      const onChange = vi.fn();
      render(<URating value={3} onChange={onChange} stars={3} />);
      fireEvent.keyDown(stars()[2], { key: "ArrowRight" });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 1 }));
      fireEvent.keyDown(stars()[2], { key: "ArrowDown" });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 1 }));
    });

    it("ArrowLeft/ArrowUp steps to the previous star, wrapping below 1", () => {
      const onChange = vi.fn();
      render(<URating value={1} onChange={onChange} stars={4} />);
      fireEvent.keyDown(stars()[0], { key: "ArrowLeft" });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 4 }));
      fireEvent.keyDown(stars()[0], { key: "ArrowUp" });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 4 }));
    });

    it("Enter and Space select the focused star and never clear it", () => {
      const onChange = vi.fn();
      render(<URating value={2} onChange={onChange} stars={3} />);
      fireEvent.keyDown(stars()[1], { key: " " });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 2 }));
      fireEvent.keyDown(stars()[2], { key: "Enter" });
      expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 3 }));
    });
  });

  describe("states", () => {
    it("readOnly prevents changes and removes the stars from the tab order", () => {
      const onChange = vi.fn();
      const { container } = render(<URating value={2} onChange={onChange} readOnly />);
      fireEvent.click(stars()[4]);
      fireEvent.keyDown(stars()[1], { key: "ArrowRight" });
      expect(onChange).not.toHaveBeenCalled();
      expect(stars()[0]).not.toHaveAttribute("tabindex");
      expect(container.firstElementChild).toHaveClass("p-readonly");
    });

    it("disabled prevents changes and adds p-disabled", () => {
      const onChange = vi.fn();
      const { container } = render(<URating value={null} onChange={onChange} disabled />);
      fireEvent.click(stars()[0]);
      expect(onChange).not.toHaveBeenCalled();
      expect(container.firstElementChild).toHaveClass("p-disabled");
    });

    it("invalid marks the icons and the stars", () => {
      const { container } = render(<URating value={1} stars={2} invalid />);
      expect(container.querySelectorAll(".u-rating-icon.p-invalid").length).toBe(2);
      expect(stars().every((star) => star.getAttribute("aria-invalid") === "true")).toBe(true);
    });
  });

  describe("focus", () => {
    it("keyboard focus shows the focus ring; pointer focus does not", () => {
      render(<URating value={null} stars={3} />);
      fireEvent.focus(stars()[0]);
      expect(stars()[0]).toHaveClass("p-focus-visible");
      fireEvent.blur(stars()[0]);
      fireEvent.mouseDown(stars()[1]);
      fireEvent.focus(stars()[1]);
      expect(stars()[1]).not.toHaveClass("p-focus-visible");
      expect(stars()[1]).toHaveAttribute("data-p-focused", "true");
    });

    it("forwards onFocus and onBlur from the root", () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      render(<URating value={null} onFocus={onFocus} onBlur={onBlur} />);
      fireEvent.focus(stars()[0]);
      fireEvent.blur(stars()[0]);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("cancel item", () => {
    it("is not rendered by default", () => {
      render(<URating value={2} />);
      expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("clears the value on click, Enter and Space", () => {
      const onChange = vi.fn();
      render(<URating value={2} onChange={onChange} cancel />);
      const clear = screen.getByRole("button", { name: "Clear" });
      expect(clear).toHaveClass("u-rating-cancel-option");
      expect(clear.querySelector("svg.u-rating-cancel-icon")).not.toBeNull();
      fireEvent.click(clear);
      fireEvent.keyDown(clear, { key: "Enter" });
      fireEvent.keyDown(clear, { key: " " });
      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange.mock.calls.every(([event]) => event.value === null)).toBe(true);
    });

    it("does nothing when read-only", () => {
      const onChange = vi.fn();
      render(<URating value={2} onChange={onChange} cancel readOnly />);
      fireEvent.click(screen.getByRole("button", { name: "Clear" }));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("custom icons", () => {
    it("renders a class-string icon on a span with the icon classes", () => {
      const { container } = render(
        <URating value={1} stars={2} onIcon="pi pi-heart-fill" offIcon="pi pi-heart" />
      );
      expect(container.querySelector("span.u-rating-on-icon.pi-heart-fill")).not.toBeNull();
      expect(container.querySelector("span.u-rating-off-icon.pi-heart")).not.toBeNull();
      expect(container.querySelector("svg")).toBeNull();
    });

    it("passes the icon props to an element or a function icon", () => {
      const { container } = render(
        <URating
          value={1}
          stars={2}
          onIcon={<b className="on" />}
          offIcon={(iconProps) => <i data-testid="off" className={iconProps.className as string} />}
          onIconProps={{ title: "on" }}
        />
      );
      const on = container.querySelector("b.on");
      expect(on).toHaveClass("u-rating-on-icon");
      expect(on).toHaveAttribute("title", "on");
      expect(screen.getByTestId("off")).toHaveClass("u-rating-off-icon");
    });
  });

  describe("ref, pass-through and unstyled", () => {
    it("exposes getElement on the ref", () => {
      const ref = React.createRef<URatingHandle>();
      const { container } = render(<URating ref={ref} value={null} />);
      expect(ref.current?.getElement()).toBe(container.firstElementChild);
    });

    it("applies pt sections to the root, items, icons and cancel item", () => {
      const { container } = render(
        <URating
          value={1}
          stars={2}
          cancel
          pt={{
            root: { "data-pt": "root" },
            item: { "data-pt": "item" },
            onIcon: { "data-pt": "on" },
            offIcon: { "data-pt": "off" },
            cancelItem: { "data-pt": "cancel-item" },
            cancelIcon: { "data-pt": "cancel-icon" },
          }}
        />
      );
      expect(container.firstElementChild).toHaveAttribute("data-pt", "root");
      expect(stars()[0]).toHaveAttribute("data-pt", "item");
      expect(container.querySelector(".u-rating-on-icon")).toHaveAttribute("data-pt", "on");
      expect(container.querySelector(".u-rating-off-icon")).toHaveAttribute("data-pt", "off");
      expect(container.querySelector(".u-rating-cancel-option")).toHaveAttribute(
        "data-pt",
        "cancel-item"
      );
      expect(container.querySelector(".u-rating-cancel-icon")).toHaveAttribute(
        "data-pt",
        "cancel-icon"
      );
    });

    it("renders no Ultimate classes when unstyled", () => {
      const { container } = render(<URating value={1} unstyled />);
      expect(container.querySelector("[class*='u-rating']")).toBeNull();
      expect(stars().length).toBe(5);
    });
  });
});
