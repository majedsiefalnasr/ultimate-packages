import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useStyleClass, type UseStyleClassOptions } from "./style-class";

function TestTrigger(props: UseStyleClassOptions) {
  const ref = React.useRef<HTMLButtonElement>(null);
  useStyleClass(ref, props);
  return (
    <div>
      <button ref={ref}>Toggle</button>
      <div data-testid="target" id="target" />
      <div data-testid="outside" id="outside" />
    </div>
  );
}

describe("useStyleClass", () => {
  it("toggles a class on the next sibling when toggleClass is set", () => {
    render(<TestTrigger selector="@next" toggleClass="active" />);
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");

    button.click();
    expect(target.classList.contains("active")).toBe(true);

    button.click();
    expect(target.classList.contains("active")).toBe(false);
  });

  it("adds enterToClass and removes enterFromClass immediately when no enterActiveClass is set", () => {
    render(<TestTrigger selector="@next" enterFromClass="hidden" enterToClass="visible" />);
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");
    target.classList.add("hidden");

    button.click();
    expect(target.classList.contains("visible")).toBe(true);
    expect(target.classList.contains("hidden")).toBe(false);
  });

  it("resolves a plain CSS selector target", () => {
    render(<TestTrigger selector="#target" toggleClass="open" />);
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");

    button.click();
    expect(target.classList.contains("open")).toBe(true);
  });

  it("hides on outside click when hideOnOutsideClick is set", () => {
    render(
      <TestTrigger
        selector="@next"
        enterToClass="visible"
        leaveFromClass="visible"
        hideOnOutsideClick
      />
    );
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");
    const outside = screen.getByTestId("outside");
    target.style.display = "block";
    // jsdom never computes real layout, so offsetParent is always null.
    // useStyleClass's onClick reads target.offsetParent === null to decide
    // enter() vs leave() on this same click, and the document click
    // listener it binds inside enter() — registered synchronously during
    // this same click's bubble phase, so it still observes this very click
    // event once it reaches `document` — reads it again via isVisible() to
    // decide whether to self-unbind. A getter keyed off the "visible" class
    // (the same signal a real browser's own layout engine would use)
    // satisfies both call sites at their different points in the same
    // synchronous click dispatch; a static pre- or post-click stub cannot.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });

    button.click();
    expect(target.classList.contains("visible")).toBe(true);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(target.classList.contains("visible")).toBe(false);
  });

  it("hides on Escape when hideOnEscape is set", () => {
    render(
      <TestTrigger selector="@next" enterToClass="visible" leaveFromClass="visible" hideOnEscape />
    );
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");
    target.style.display = "block";
    // See the "hides on outside click" test above for why this stub must
    // be a getter keyed off the "visible" class, not a static value.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });

    button.click();
    expect(target.classList.contains("visible")).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(target.classList.contains("visible")).toBe(false);
  });

  it("runs the enter animation class sequence and removes enterActiveClass on animationend", () => {
    render(<TestTrigger selector="@next" enterActiveClass="animating" enterToClass="visible" />);
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");

    button.click();
    expect(target.classList.contains("animating")).toBe(true);

    target.dispatchEvent(new Event("animationend"));
    expect(target.classList.contains("animating")).toBe(false);
    expect(target.classList.contains("visible")).toBe(true);
  });

  it("cleans up document listeners on unmount", () => {
    const { unmount } = render(
      <TestTrigger
        selector="@next"
        enterToClass="visible"
        leaveFromClass="visible"
        hideOnOutsideClick
      />
    );
    const button = screen.getByText("Toggle");
    const target = screen.getByTestId("target");
    target.style.display = "block";
    // See the "hides on outside click" test above for why this stub must
    // be a getter keyed off the "visible" class, not a static value.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });
    button.click();

    const removeSpy = vi.spyOn(document, "removeEventListener");
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));
    removeSpy.mockRestore();
  });
});
