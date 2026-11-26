import { afterEach, describe, expect, it, vi } from "vitest";
import { getCursorOffset } from "../src/dom";

/**
 * getCursorOffset measures the caret with a hidden ghost element. The text
 * before the caret is inserted as text nodes with real `<br>` line breaks,
 * never as HTML (ADR-105 D3: Prime's `innerHTML` insertion is a defect).
 */
function captureGhost(run: () => void): HTMLElement {
  const append = vi.spyOn(document.body, "appendChild");
  run();
  const ghost = append.mock.calls.at(-1)?.[0] as HTMLElement;
  append.mockRestore();
  return ghost;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCursorOffset", () => {
  it("inserts an HTML payload as plain text and creates no element from it", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    const onError = vi.fn();
    (window as unknown as { __cursorOffsetPayload: () => void }).__cursorOffsetPayload = onError;
    const payload = '<img src="x" onerror="window.__cursorOffsetPayload()"><b>bold</b>';

    const ghost = captureGhost(() => getCursorOffset(textarea, payload, "", "@"));

    expect(ghost.querySelector("img")).toBeNull();
    expect(ghost.querySelector("b")).toBeNull();
    expect(Array.from(ghost.children).map((child) => child.tagName)).toEqual(["SPAN"]);
    expect(ghost.textContent).toBe(`${payload}@`);
    expect(onError).not.toHaveBeenCalled();
    expect(document.body.contains(ghost)).toBe(false);
    textarea.remove();
  });

  it("turns every line break style into a <br> element", () => {
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const ghost = captureGhost(() => getCursorOffset(textarea, "one\ntwo\r\nthree\rfour", "", "@"));

    expect(ghost.querySelectorAll("br")).toHaveLength(3);
    expect(ghost.textContent).toBe("onetwothreefour@");
    textarea.remove();
  });

  it("copies the direction, letter spacing and box sizing of the element", () => {
    const textarea = document.createElement("textarea");
    textarea.style.direction = "rtl";
    textarea.style.letterSpacing = "2px";
    textarea.style.boxSizing = "border-box";
    document.body.appendChild(textarea);

    const ghost = captureGhost(() => getCursorOffset(textarea, "abc", "", "@"));

    expect(ghost.style.direction).toBe("rtl");
    expect(ghost.style.letterSpacing).toBe("2px");
    expect(ghost.style.boxSizing).toBe("border-box");
    textarea.remove();
  });

  it("returns auto offsets without an element", () => {
    expect(getCursorOffset(null as unknown as Element, "", "", "@")).toEqual({
      top: "auto",
      left: "auto",
    });
  });
});
