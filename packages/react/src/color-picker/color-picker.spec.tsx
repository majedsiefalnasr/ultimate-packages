import * as React from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { act, render, fireEvent, waitFor } from "@testing-library/react";
import {
  UColorPicker,
  type UColorPickerChangeEvent,
  type UColorPickerProps,
  type UColorPickerRef,
  type UColorPickerValue,
} from "./color-picker";

const RECT = {
  left: 0,
  top: 0,
  width: 150,
  height: 150,
  x: 0,
  y: 0,
  right: 150,
  bottom: 150,
  toJSON: () => ({}),
} as DOMRect;

function part(name: string): HTMLElement {
  const element = document.querySelector(`.u-color-picker-${name}`) as HTMLElement;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(RECT);
  return element;
}

function touch(
  type: string,
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY: number
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", { value: [{ identifier, clientX, clientY }] });
  act(() => {
    target.dispatchEvent(event);
  });
}

function Controlled(
  props: Omit<UColorPickerProps, "value" | "onChange"> & {
    initial?: UColorPickerValue | null;
    onValue?: (event: UColorPickerChangeEvent) => void;
  }
) {
  const { initial = null, onValue, ...rest } = props;
  const [value, setValue] = React.useState<UColorPickerValue | null>(initial);
  return (
    <UColorPicker
      {...rest}
      value={value}
      onChange={(event) => {
        setValue(event.value);
        onValue?.(event);
      }}
    />
  );
}

async function open(input: HTMLElement) {
  fireEvent.click(input);
  await waitFor(() => expect(document.querySelector(".u-color-picker-panel")).not.toBeNull());
}

async function closed() {
  await waitFor(() => expect(document.querySelector(".u-color-picker-panel")).toBeNull());
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UColorPicker", () => {
  it("renders a readonly preview input named 'Select a color' showing the default color", () => {
    const { container } = render(<UColorPicker inputId="brand" tabIndex={3} />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.getAttribute("aria-label")).toBe("Select a color");
    expect(input.id).toBe("brand");
    expect(input.tabIndex).toBe(3);
    expect(input.className).not.toContain("p-inputtext");
    expect(input.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("opens the panel in the body and emits onShow and onHide around the motion", async () => {
    const onShow = vi.fn();
    const onHide = vi.fn();
    const { container } = render(<UColorPicker onShow={onShow} onHide={onHide} />);
    const input = container.querySelector("input") as HTMLInputElement;
    await open(input);
    const panel = document.querySelector(".u-color-picker-panel") as HTMLElement;
    expect(container.contains(panel)).toBe(false);
    expect(panel.style.zIndex).not.toBe("");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await waitFor(() => expect(onShow).toHaveBeenCalledTimes(1));

    fireEvent.keyDown(input, { code: "Escape" });
    await closed();
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("keeps the panel in place with appendTo='self'", async () => {
    const { container } = render(<UColorPicker appendTo="self" />);
    await open(container.querySelector("input") as HTMLElement);
    expect(container.querySelector(".u-color-picker-panel")).not.toBeNull();
  });

  it("Tab closes and Space toggles the panel", async () => {
    const { container } = render(<UColorPicker />);
    const input = container.querySelector("input") as HTMLInputElement;
    await open(input);
    fireEvent.keyDown(input, { code: "Tab" });
    await closed();
    fireEvent.keyDown(input, { code: "Space" });
    await waitFor(() => expect(document.querySelector(".u-color-picker-panel")).not.toBeNull());
    fireEvent.keyDown(input, { code: "Space" });
    await closed();
  });

  it("closes on an outside click but not on a click inside the panel", async () => {
    const { container } = render(<UColorPicker />);
    await open(container.querySelector("input") as HTMLElement);
    fireEvent.click(part("hue"));
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    fireEvent.click(document.body);
    await closed();
  });

  it("realigns instead of closing when a scrollable ancestor scrolls", async () => {
    const { container } = render(
      <div className="scroller" style={{ overflow: "scroll" }}>
        <UColorPicker />
      </div>
    );
    await open(container.querySelector("input") as HTMLElement);
    const panel = document.querySelector(".u-color-picker-panel") as HTMLElement;
    panel.style.top = "";
    act(() => {
      (container.querySelector(".scroller") as HTMLElement).dispatchEvent(new Event("scroll"));
    });
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    expect(panel.style.top).not.toBe("");
  });

  it("writes rrggbb without # and the PrimeReact form-style payload", async () => {
    const onValue = vi.fn();
    const { container } = render(
      <Controlled initial="#00ff00" id="picker" name="brand" onValue={onValue} />
    );
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.style.backgroundColor).toBe("rgb(0, 255, 0)");
    await open(input);
    fireEvent.mouseDown(part("color-selector"), { clientX: 150, clientY: 0 });
    const event: UColorPickerChangeEvent = onValue.mock.calls.at(-1)![0];
    expect(event.value).toBe("00ff00");
    expect(event.target).toEqual({ name: "brand", id: "picker", value: "00ff00" });
    expect(event.originalEvent).toBeDefined();
    expect(typeof event.preventDefault).toBe("function");
    expect(typeof event.stopPropagation).toBe("function");
  });

  it("reads hex with or without # and follows value changes when not dragging", () => {
    const { container, rerender } = render(<UColorPicker value="0000ff" />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.style.backgroundColor).toBe("rgb(0, 0, 255)");
    rerender(<UColorPicker value="#00ff00" />);
    expect(input.style.backgroundColor).toBe("rgb(0, 255, 0)");
  });

  it("ignores value updates while dragging", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<UColorPicker value="ff0000" onChange={onChange} />);
    const input = container.querySelector("input") as HTMLInputElement;
    await open(input);
    fireEvent.mouseDown(part("hue"), { clientY: 75 });
    expect(onChange.mock.calls.at(-1)![0].value).toBe("00ffff");
    rerender(<UColorPicker value="0000ff" onChange={onChange} />);
    expect(input.style.backgroundColor).toBe("rgb(0, 255, 255)");
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseup"));
    });
    rerender(<UColorPicker value="ff00ff" onChange={onChange} />);
    expect(input.style.backgroundColor).toBe("rgb(255, 0, 255)");
  });

  it("dragging the hue strip follows the pointer until mouseup", async () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="ff0000" onValue={onValue} />);
    const root = container.querySelector(".u-color-picker") as HTMLElement;
    await open(container.querySelector("input") as HTMLElement);
    fireEvent.mouseDown(part("hue"), { clientY: 75 });
    expect(onValue.mock.calls.at(-1)![0].value).toBe("00ffff");
    expect(root.classList).toContain("u-color-picker-dragging");
    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 100 }));
    });
    expect(onValue.mock.calls.at(-1)![0].value).toBe("00ff00");
    act(() => {
      document.dispatchEvent(new MouseEvent("mouseup"));
    });
    const calls = onValue.mock.calls.length;
    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 150 }));
    });
    expect(onValue.mock.calls.length).toBe(calls);
    expect(root.classList).not.toContain("u-color-picker-dragging");
  });

  it("a touch drag follows only its own touch and ends on touchcancel", async () => {
    const onValue = vi.fn();
    const { container } = render(<Controlled initial="ff0000" onValue={onValue} />);
    await open(container.querySelector("input") as HTMLElement);
    touch("touchstart", part("hue"), 7, 5, 75);
    expect(onValue.mock.calls.at(-1)![0].value).toBe("00ffff");
    touch("touchmove", document, 8, 5, 100);
    expect(onValue.mock.calls.at(-1)![0].value).toBe("00ffff");
    touch("touchmove", document, 7, 5, 100);
    expect(onValue.mock.calls.at(-1)![0].value).toBe("00ff00");
    touch("touchcancel", document, 7, 5, 100);
    const calls = onValue.mock.calls.length;
    touch("touchmove", document, 7, 5, 150);
    expect(onValue.mock.calls.length).toBe(calls);
  });

  it("respects the rgb and hsb formats", async () => {
    const onChange = vi.fn();
    const { container, unmount } = render(<UColorPicker format="rgb" onChange={onChange} />);
    await open(container.querySelector("input") as HTMLElement);
    fireEvent.mouseDown(part("color-selector"), { clientX: 150, clientY: 0 });
    expect(onChange.mock.calls.at(-1)![0].value).toEqual({ r: 255, g: 0, b: 0 });
    unmount();

    const hsb = render(<UColorPicker format="hsb" onChange={onChange} />);
    await open(hsb.container.querySelector("input") as HTMLElement);
    fireEvent.mouseDown(part("color-selector"), { clientX: 150, clientY: 0 });
    expect(onChange.mock.calls.at(-1)![0].value).toEqual({ h: 0, s: 100, b: 100 });
  });

  it("renders the panel in place without an input when inline", () => {
    const { container } = render(<UColorPicker inline />);
    expect(container.querySelector("input")).toBeNull();
    const panel = container.querySelector(".u-color-picker-panel") as HTMLElement;
    expect(panel.classList).toContain("u-color-picker-panel-inline");
    expect(container.querySelector(".u-color-picker")!.classList).not.toContain(
      "u-color-picker-overlay"
    );
  });

  it("a disabled picker does not open", () => {
    const { container } = render(<UColorPicker disabled />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList).toContain("p-disabled");
    fireEvent.click(input);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("exposes show, hide, focus, getElement, getOverlay and getInput on the ref", async () => {
    const ref = React.createRef<UColorPickerRef>();
    const { container } = render(<UColorPicker ref={ref} />);
    expect(ref.current!.getElement()).toBe(container.querySelector(".u-color-picker"));
    expect(ref.current!.getInput()).toBe(container.querySelector("input"));
    act(() => ref.current!.focus());
    expect(document.activeElement).toBe(container.querySelector("input"));
    act(() => ref.current!.show());
    await waitFor(() => expect(ref.current!.getOverlay()).not.toBeNull());
    act(() => ref.current!.hide());
    await closed();
  });

  it("removes the drag and overlay listeners on unmount mid-drag", async () => {
    const { container, unmount } = render(<UColorPicker />);
    await open(container.querySelector("input") as HTMLElement);
    fireEvent.mouseDown(part("hue"), { clientY: 75 });
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const removeWindow = vi.spyOn(window, "removeEventListener");
    unmount();
    const removed = removeDocument.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["mousemove", "mouseup", "click"]));
    expect(removeWindow.mock.calls.map(([type]) => type)).toContain("resize");
  });

  it("applies pt sections, with PrimeReact's names merged first", async () => {
    const { container } = render(
      <UColorPicker
        pt={{
          root: { "data-part": "root" },
          input: { "data-alias": "input", "data-part": "input" },
          preview: { "data-part": "preview" },
          panel: { "data-part": "panel" },
          content: { "data-part": "content" },
          selector: { "data-alias": "selector" },
          colorSelector: { "data-part": "colorSelector" },
          color: { "data-alias": "color" },
          colorBackground: { "data-part": "colorBackground" },
          colorHandle: { "data-part": "colorHandle" },
          hue: { "data-part": "hue" },
          hueHandle: { "data-part": "hueHandle" },
        }}
      />
    );
    expect(container.querySelector(".u-color-picker")!.getAttribute("data-part")).toBe("root");
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("data-part")).toBe("preview");
    expect(input.getAttribute("data-alias")).toBe("input");
    await open(input);
    for (const name of [
      "panel",
      "content",
      "colorSelector",
      "colorBackground",
      "colorHandle",
      "hue",
      "hueHandle",
    ]) {
      expect(document.querySelector(`[data-part="${name}"]`), name).not.toBeNull();
    }
    expect(document.querySelector('[data-alias="selector"]')).not.toBeNull();
    expect(document.querySelector('[data-alias="color"]')).not.toBeNull();
  });

  it("drops the component classes when unstyled", () => {
    const { container } = render(<UColorPicker unstyled />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toContain("u-color-picker");
    expect((container.querySelector("input") as HTMLInputElement).className).toBe("");
  });
});
