import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { UKnob } from "./knob";

function stubRect(element: Element) {
  element.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 100, height: 100, x: 0, y: 0, right: 100, bottom: 100 }) as DOMRect;
}

function touch(type: string, target: EventTarget, x: number, y: number, identifier = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier, clientX: x, clientY: y }],
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

function Controlled(props: { initial: number; onValue?: (value: number) => void }) {
  const [value, setValue] = React.useState(props.initial);
  return (
    <UKnob
      value={value}
      onChange={(next) => {
        props.onValue?.(next);
        setValue(next);
      }}
    />
  );
}

describe("UKnob", () => {
  it("renders an SVG with role=slider reflecting the current value", () => {
    render(<UKnob value={30} onChange={() => {}} />);
    const svg = screen.getByRole("slider");
    expect(svg).toHaveAttribute("aria-valuenow", "30");
  });

  it("clicking the SVG at a given offset updates the value", () => {
    const onChange = vi.fn();
    render(<UKnob value={0} onChange={onChange} />);
    const svg = screen.getByRole("slider");
    fireEvent.click(svg, { nativeEvent: { offsetX: 50, offsetY: 5 } } as unknown as MouseEvent);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(0);
  });

  it("ArrowUp increments the value by step", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} step={5} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(55);
  });

  it("ArrowDown decrements the value by step", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} step={5} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it("Home/End jump to min/max", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} min={0} max={100} />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "End" });
    expect(onChange).toHaveBeenLastCalledWith(100);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("readOnly prevents value changes", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} readOnly />);
    fireEvent.keyDown(screen.getByRole("slider"), { code: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disabled prevents value changes and sets tabIndex -1", () => {
    const onChange = vi.fn();
    render(<UKnob value={50} onChange={onChange} disabled />);
    const svg = screen.getByRole("slider");
    fireEvent.keyDown(svg, { code: "ArrowUp" });
    expect(onChange).not.toHaveBeenCalled();
    expect(svg).toHaveAttribute("tabindex", "-1");
  });

  describe("touch and drag", () => {
    it("drags with touchstart, touchmove and touchend", () => {
      const onValue = vi.fn();
      render(<Controlled initial={30} onValue={onValue} />);
      const svg = screen.getByRole("slider");
      stubRect(svg);
      touch("touchstart", svg, 50, 5);
      touch("touchmove", document, 50, 5);
      expect(svg).toHaveAttribute("aria-valuenow", "50");
      touch("touchend", document, 50, 5);
      touch("touchmove", document, 95, 50);
      expect(svg).toHaveAttribute("aria-valuenow", "50");
    });

    it("follows only the touch that started the drag", () => {
      render(<Controlled initial={30} />);
      const svg = screen.getByRole("slider");
      stubRect(svg);
      touch("touchstart", svg, 50, 5, 1);
      touch("touchmove", document, 95, 50, 2);
      expect(svg).toHaveAttribute("aria-valuenow", "30");
      touch("touchmove", document, 95, 50, 1);
      expect(svg).toHaveAttribute("aria-valuenow", "80");
      touch("touchcancel", document, 95, 50, 1);
    });

    it("drags with the mouse using the latest value and props", () => {
      render(<Controlled initial={30} />);
      const svg = screen.getByRole("slider");
      stubRect(svg);
      fireEvent.mouseDown(svg);
      fireEvent.mouseMove(document, { clientX: 50, clientY: 5 });
      expect(svg).toHaveAttribute("aria-valuenow", "50");
      fireEvent.mouseMove(document, { clientX: 95, clientY: 50 });
      expect(svg).toHaveAttribute("aria-valuenow", "80");
      fireEvent.mouseUp(document);
      fireEvent.mouseMove(document, { clientX: 5, clientY: 50 });
      expect(svg).toHaveAttribute("aria-valuenow", "80");
    });

    it("removes the drag listeners when unmounted mid-drag", () => {
      const onChange = vi.fn();
      const { unmount } = render(<UKnob value={30} onChange={onChange} />);
      const svg = screen.getByRole("slider");
      stubRect(svg);
      const remove = vi.spyOn(document, "removeEventListener");
      fireEvent.mouseDown(svg);
      unmount();
      expect(remove).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(remove).toHaveBeenCalledWith("mouseup", expect.any(Function));
      fireEvent.mouseMove(document, { clientX: 50, clientY: 5 });
      expect(onChange).not.toHaveBeenCalled();
      remove.mockRestore();
    });

    it("ignores touch on a read-only knob", () => {
      const onChange = vi.fn();
      render(<UKnob value={30} onChange={onChange} readOnly />);
      const svg = screen.getByRole("slider");
      stubRect(svg);
      touch("touchstart", svg, 50, 5);
      touch("touchmove", document, 50, 5);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("accessibility, root and state", () => {
    it("uses the configured tab index and -1 when read-only", () => {
      const { rerender } = render(<UKnob value={30} onChange={() => {}} tabIndex={3} />);
      expect(screen.getByRole("slider")).toHaveAttribute("tabindex", "3");
      rerender(<UKnob value={30} onChange={() => {}} tabIndex={3} readOnly />);
      expect(screen.getByRole("slider")).toHaveAttribute("tabindex", "-1");
    });

    it("puts aria-label and aria-labelledby on the dial, not the root", () => {
      const { container } = render(
        <UKnob value={30} onChange={() => {}} aria-label="Volume" aria-labelledby="volume-label" />
      );
      const svg = screen.getByRole("slider");
      expect(svg).toHaveAttribute("aria-label", "Volume");
      expect(svg).toHaveAttribute("aria-labelledby", "volume-label");
      expect(container.firstElementChild).not.toHaveAttribute("aria-label");
    });

    it("passes id, style and other attributes to the root and forwards the ref", () => {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(
        <UKnob
          ref={ref}
          value={30}
          onChange={() => {}}
          id="knob"
          style={{ margin: "4px" }}
          data-test="root"
        />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute("id", "knob");
      expect(root).toHaveAttribute("data-test", "root");
      expect(root.style.margin).toBe("4px");
    });

    it("adds p-disabled and p-invalid to the root", () => {
      const { container, rerender } = render(<UKnob value={30} onChange={() => {}} invalid />);
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveClass("u-knob", "p-invalid");
      expect(root).not.toHaveClass("p-disabled");
      rerender(<UKnob value={30} onChange={() => {}} disabled />);
      expect(root).toHaveClass("p-disabled");
    });
  });

  describe("styling and templates", () => {
    it("applies pt sections, accepting PrimeReact's label key for the text", () => {
      const { container } = render(
        <UKnob
          value={30}
          onChange={() => {}}
          pt={{
            root: { "data-test": "root" },
            svg: { "data-test": "svg" },
            range: { "data-test": "range" },
            value: { "data-test": "value" },
            label: { "data-label": "label" },
            text: { "data-test": "text" },
          }}
        />
      );
      const svg = screen.getByRole("slider");
      const paths = svg.querySelectorAll("path");
      const text = svg.querySelector("text");
      expect(container.firstElementChild).toHaveAttribute("data-test", "root");
      expect(svg).toHaveAttribute("data-test", "svg");
      expect(paths[0]).toHaveAttribute("data-test", "range");
      expect(paths[1]).toHaveAttribute("data-test", "value");
      expect(text).toHaveAttribute("data-test", "text");
      expect(text).toHaveAttribute("data-label", "label");
    });

    it("drops the component classes when unstyled", () => {
      const { container } = render(<UKnob value={30} onChange={() => {}} unstyled />);
      expect(container.firstElementChild).not.toHaveClass("u-knob");
      expect(container.querySelector("path")).not.toHaveClass("u-knob-range");
    });

    it("defaults the colours to the knob token variables", () => {
      render(<UKnob value={30} onChange={() => {}} />);
      const svg = screen.getByRole("slider");
      const paths = svg.querySelectorAll("path");
      expect(paths[0]).toHaveAttribute("stroke", "var(--u-knob-range-background)");
      expect(paths[1]).toHaveAttribute("stroke", "var(--u-knob-value-background)");
      expect(svg.querySelector("text")).toHaveAttribute("fill", "var(--u-knob-text-color)");
    });

    it("keeps explicit colours", () => {
      render(
        <UKnob value={30} onChange={() => {}} valueColor="red" rangeColor="gray" textColor="blue" />
      );
      const svg = screen.getByRole("slider");
      const paths = svg.querySelectorAll("path");
      expect(paths[0]).toHaveAttribute("stroke", "gray");
      expect(paths[1]).toHaveAttribute("stroke", "red");
      expect(svg.querySelector("text")).toHaveAttribute("fill", "blue");
    });

    it("replaces every {value} placeholder in a string template", () => {
      render(<UKnob value={30} onChange={() => {}} valueTemplate="{value} of {value}" />);
      expect(screen.getByRole("slider").querySelector("text")).toHaveTextContent("30 of 30");
    });

    it("formats the value with a function template", () => {
      render(<UKnob value={30} onChange={() => {}} valueTemplate={(value) => `${value}%`} />);
      expect(screen.getByRole("slider").querySelector("text")).toHaveTextContent("30%");
    });
  });
});
