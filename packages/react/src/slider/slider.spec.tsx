import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { USlider, type USliderChangeEvent } from "./slider";

const RECT = { left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 } as DOMRect;

function mockRect(element: HTMLElement) {
  element.getBoundingClientRect = () => RECT;
}

function touch(type: string, target: EventTarget, x: number, y = 0, identifier = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", {
    value: [{ identifier, clientX: x, clientY: y }],
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

function Controlled(props: {
  initial: number | number[];
  onSlideEnd?: (event: USliderChangeEvent) => void;
  onChangeSpy?: (event: USliderChangeEvent) => void;
  [key: string]: unknown;
}) {
  const { initial, onSlideEnd, onChangeSpy, ...rest } = props;
  const [value, setValue] = React.useState<number | number[]>(initial);
  return (
    <USlider
      {...rest}
      value={value}
      onChange={(event) => {
        onChangeSpy?.(event);
        setValue(event.value);
      }}
      onSlideEnd={onSlideEnd}
    />
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("USlider", () => {
  it("renders a single handle by default with role=slider", () => {
    render(<USlider value={50} onChange={() => {}} />);
    const handles = screen.getAllByRole("slider");
    expect(handles.length).toBe(1);
    expect(handles[0]).toHaveAttribute("aria-valuenow", "50");
  });

  it("range mode renders two handles", () => {
    render(<USlider value={[20, 80]} onChange={() => {}} range />);
    const handles = screen.getAllByRole("slider");
    expect(handles.length).toBe(2);
    expect(handles[0]).toHaveAttribute("aria-valuenow", "20");
    expect(handles[1]).toHaveAttribute("aria-valuenow", "80");
  });

  it("ArrowRight increments the value by step (default 1)", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 51 }));
  });

  it("ArrowLeft decrements the value", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 49 }));
  });

  it("PageUp and PageDown move ten steps", () => {
    const onChange = vi.fn();
    render(<USlider value={50} step={2} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "PageUp" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 70 }));
    fireEvent.keyDown(screen.getByRole("slider"), { key: "PageDown" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 30 }));
  });

  it("Home/End jump to min/max", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} min={0} max={100} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 100 }));
    fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 0 }));
  });

  it("clicking the track sets the value from click position", () => {
    const onChange = vi.fn();
    const { container } = render(<USlider value={0} onChange={onChange} />);
    const root = container.querySelector(".u-slider") as HTMLElement;
    mockRect(root);
    fireEvent.click(root, { clientX: 25, clientY: 10 });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 25 }));
  });

  it("disabled state prevents keyboard interaction", () => {
    const onChange = vi.fn();
    render(<USlider value={50} onChange={onChange} disabled />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("is fully controlled — reflects the value prop", () => {
    const { rerender } = render(<USlider value={30} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "30");
    rerender(<USlider value={70} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "70");
  });

  describe("pointer drag", () => {
    it("reports the live value on slide end, not the value of the render the drag began in", () => {
      const onSlideEnd = vi.fn();
      const { container } = render(<Controlled initial={10} onSlideEnd={onSlideEnd} />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      fireEvent.mouseDown(screen.getByRole("slider"));
      fireEvent.mouseMove(document, { clientX: 40, clientY: 0 });
      fireEvent.mouseMove(document, { clientX: 65, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: 65, clientY: 0 });
      expect(onSlideEnd).toHaveBeenCalledTimes(1);
      expect(onSlideEnd.mock.calls[0][0].value).toBe(65);
    });

    it("moves only the grabbed handle in range mode and keeps the other value fresh", () => {
      const onSlideEnd = vi.fn();
      const { container } = render(<Controlled initial={[20, 80]} range onSlideEnd={onSlideEnd} />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      const handles = screen.getAllByRole("slider");
      fireEvent.mouseDown(handles[1]);
      fireEvent.mouseMove(document, { clientX: 90, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: 90, clientY: 0 });
      expect(onSlideEnd.mock.calls[0][0].value).toEqual([20, 90]);
    });

    it("grabs the start handle when both handles sit at max", () => {
      const onChangeSpy = vi.fn();
      const { container } = render(
        <Controlled initial={[100, 100]} range onChangeSpy={onChangeSpy} />
      );
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      fireEvent.mouseDown(screen.getAllByRole("slider")[1]);
      fireEvent.mouseMove(document, { clientX: 70, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: 70, clientY: 0 });
      expect(onChangeSpy.mock.calls[0][0].value).toEqual([70, 100]);
    });

    it("removes the document listeners when the component unmounts mid-drag", () => {
      const onChange = vi.fn();
      const { container, unmount } = render(<USlider value={10} onChange={onChange} />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      fireEvent.mouseDown(screen.getByRole("slider"));
      unmount();
      fireEvent.mouseMove(document, { clientX: 50, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: 50, clientY: 0 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not treat the click after a drag as a track click", () => {
      const onSlideEnd = vi.fn();
      const { container } = render(<Controlled initial={10} onSlideEnd={onSlideEnd} />);
      const root = container.querySelector(".u-slider") as HTMLElement;
      mockRect(root);
      fireEvent.mouseDown(screen.getByRole("slider"));
      fireEvent.mouseMove(document, { clientX: 40, clientY: 0 });
      fireEvent.mouseUp(document, { clientX: 40, clientY: 0 });
      fireEvent.click(root, { clientX: 40, clientY: 0 });
      expect(onSlideEnd).toHaveBeenCalledTimes(1);
    });

    it("ignores a zero-size track instead of emitting NaN", () => {
      const onChange = vi.fn();
      const { container } = render(<USlider value={10} onChange={onChange} />);
      fireEvent.click(container.querySelector(".u-slider") as HTMLElement, {
        clientX: 20,
        clientY: 0,
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("touch drag", () => {
    it("drags with touchstart, touchmove and touchend", () => {
      const onSlideEnd = vi.fn();
      const { container } = render(<Controlled initial={10} onSlideEnd={onSlideEnd} />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      const handle = screen.getByRole("slider");
      touch("touchstart", handle, 10);
      touch("touchmove", document, 55);
      touch("touchend", document, 55);
      expect(handle).toHaveAttribute("aria-valuenow", "55");
      expect(onSlideEnd).toHaveBeenCalledTimes(1);
      expect(onSlideEnd.mock.calls[0][0].value).toBe(55);
    });

    it("follows only the touch that started the drag", () => {
      const { container } = render(<Controlled initial={10} />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      const handle = screen.getByRole("slider");
      touch("touchstart", handle, 10, 0, 7);
      touch("touchmove", document, 90, 0, 3);
      expect(handle).toHaveAttribute("aria-valuenow", "10");
      touch("touchmove", document, 40, 0, 7);
      expect(handle).toHaveAttribute("aria-valuenow", "40");
    });

    it("does not start a drag when disabled", () => {
      const onChange = vi.fn();
      const { container } = render(<USlider value={10} onChange={onChange} disabled />);
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      touch("touchstart", screen.getByRole("slider"), 10);
      touch("touchmove", document, 50);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("step snapping", () => {
    it("snaps relative to the current value so a non-zero min stays on its own grid", () => {
      const onChangeSpy = vi.fn();
      const { container } = render(
        <Controlled initial={5} min={5} max={105} step={10} onChangeSpy={onChangeSpy} />
      );
      mockRect(container.querySelector(".u-slider") as HTMLElement);
      fireEvent.mouseDown(screen.getByRole("slider"));
      fireEvent.mouseMove(document, { clientX: 12, clientY: 0 });
      expect(onChangeSpy.mock.calls[0][0].value).toBe(15);
      fireEvent.mouseUp(document, { clientX: 12, clientY: 0 });
    });

    it("keeps decimal steps free of float noise", () => {
      const onChange = vi.fn();
      render(<USlider value={0.1} step={0.1} onChange={onChange} />);
      fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
      expect(onChange.mock.calls[0][0].value).toBe(0.2);
    });

    it("does not divide by zero when max equals min", () => {
      render(<USlider value={5} min={5} max={5} onChange={() => {}} />);
      const handle = screen.getByRole("slider");
      expect(handle.style.insetInlineStart).toBe("0%");
    });
  });

  describe("RTL", () => {
    it("places the handle with inset-inline-start", () => {
      render(<USlider value={25} onChange={() => {}} />);
      expect(screen.getByRole("slider").style.insetInlineStart).toBe("25%");
    });

    it("mirrors the pointer position in a right-to-left slider", () => {
      const onChange = vi.fn();
      const { container } = render(<USlider value={0} onChange={onChange} />);
      const root = container.querySelector(".u-slider") as HTMLElement;
      mockRect(root);
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        direction: "rtl",
      } as CSSStyleDeclaration);
      fireEvent.click(root, { clientX: 25, clientY: 0 });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 75 }));
    });

    it("does not mirror a vertical slider", () => {
      const onChange = vi.fn();
      const { container } = render(
        <USlider value={0} orientation="vertical" onChange={onChange} />
      );
      const root = container.querySelector(".u-slider") as HTMLElement;
      mockRect(root);
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        direction: "rtl",
      } as CSSStyleDeclaration);
      fireEvent.click(root, { clientX: 0, clientY: 25 });
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 75 }));
    });
  });

  describe("tab stop and accessible name", () => {
    it("handles are focusable with tabindex 0 by default and take a custom tabIndex", () => {
      const { rerender } = render(<USlider value={5} onChange={() => {}} />);
      expect(screen.getByRole("slider")).toHaveAttribute("tabindex", "0");
      rerender(<USlider value={5} tabIndex={3} onChange={() => {}} />);
      expect(screen.getByRole("slider")).toHaveAttribute("tabindex", "3");
    });

    it("a disabled slider has no tab stop", () => {
      render(<USlider value={[10, 20]} range disabled onChange={() => {}} />);
      for (const handle of screen.getAllByRole("slider")) {
        expect(handle).not.toHaveAttribute("tabindex");
      }
    });

    it("forwards aria-label and aria-labelledby to every handle, not the root", () => {
      const { container } = render(
        <USlider
          value={[10, 20]}
          range
          aria-label="Price"
          aria-labelledby="price-label"
          onChange={() => {}}
        />
      );
      for (const handle of screen.getAllByRole("slider")) {
        expect(handle).toHaveAttribute("aria-label", "Price");
        expect(handle).toHaveAttribute("aria-labelledby", "price-label");
      }
      const root = container.querySelector(".u-slider") as HTMLElement;
      expect(root).not.toHaveAttribute("aria-label");
      expect(root).not.toHaveAttribute("aria-labelledby");
    });
  });

  describe("state classes", () => {
    it("adds p-disabled and p-invalid to the root", () => {
      const { container } = render(<USlider value={5} disabled invalid onChange={() => {}} />);
      const root = container.querySelector(".u-slider") as HTMLElement;
      expect(root).toHaveClass("p-disabled");
      expect(root).toHaveClass("p-invalid");
    });

    it("uses the orientation classes", () => {
      const { container } = render(
        <USlider value={5} orientation="vertical" onChange={() => {}} />
      );
      expect(container.querySelector(".u-slider")).toHaveClass("u-slider-vertical");
    });
  });

  describe("ref, attributes and pass-through", () => {
    it("forwards the ref to the root and the remaining props to it", () => {
      const ref = React.createRef<HTMLDivElement>();
      const { container } = render(
        <USlider
          ref={ref}
          value={5}
          id="s"
          className="mine"
          style={{ margin: 4 }}
          data-testid="x"
          onChange={() => {}}
        />
      );
      const root = container.querySelector(".u-slider") as HTMLElement;
      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute("id", "s");
      expect(root).toHaveAttribute("data-testid", "x");
      expect(root).toHaveClass("mine");
      expect(root.style.margin).toBe("4px");
    });

    it("pt reaches the root, range and handle sections", () => {
      const { container } = render(
        <USlider
          value={5}
          pt={{
            root: { id: "root-pt", className: "extra-root" },
            range: { "data-part": "range" },
            handle: { "data-part": "handle" },
          }}
          onChange={() => {}}
        />
      );
      const root = container.querySelector(".u-slider") as HTMLElement;
      expect(root).toHaveAttribute("id", "root-pt");
      expect(root).toHaveClass("extra-root");
      expect(container.querySelector(".u-slider-range")).toHaveAttribute("data-part", "range");
      expect(screen.getByRole("slider")).toHaveAttribute("data-part", "handle");
    });

    it("range handles take startHandler and endHandler, and also handle", () => {
      render(
        <USlider
          value={[10, 20]}
          range
          pt={{
            handle: { "data-all": "yes" },
            startHandler: { "data-which": "start" },
            endHandler: { "data-which": "end" },
          }}
          onChange={() => {}}
        />
      );
      const [start, end] = screen.getAllByRole("slider");
      expect(start).toHaveAttribute("data-which", "start");
      expect(end).toHaveAttribute("data-which", "end");
      expect(start).toHaveAttribute("data-all", "yes");
      expect(end).toHaveAttribute("data-all", "yes");
    });

    it("unstyled drops the Ultimate classes and keeps pt", () => {
      const { container } = render(
        <USlider
          value={5}
          unstyled
          pt={{ root: { className: "extra-root" } }}
          onChange={() => {}}
        />
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root).toHaveClass("extra-root");
      expect(root.className).not.toMatch(/u-slider/);
      expect(screen.getByRole("slider").className).not.toMatch(/u-slider/);
    });
  });
});
