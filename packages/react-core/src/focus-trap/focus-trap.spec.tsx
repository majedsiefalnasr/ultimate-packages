import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FocusTrap } from "./focus-trap";

describe("FocusTrap", () => {
  it("renders two hidden, focusable sentinel spans bracketing children", () => {
    render(
      <FocusTrap>
        <button>Inside</button>
      </FocusTrap>
    );
    const sentinels = screen.getAllByRole("presentation", { hidden: true });
    expect(sentinels).toHaveLength(2);
    sentinels.forEach((s) => expect(s.tabIndex).toBe(0));
  });

  it("focusing the last sentinel redirects focus to the first focusable descendant", () => {
    render(
      <FocusTrap>
        <button>First</button>
        <button>Second</button>
      </FocusTrap>
    );
    const sentinels = screen.getAllByRole("presentation", { hidden: true });
    const lastSentinel = sentinels[1];
    lastSentinel.dispatchEvent(new FocusEvent("focus", { bubbles: false }));
    lastSentinel.focus();
    // jsdom does not run the onFocus React handler from .focus() directly in all
    // versions — dispatch explicitly to be certain:
    lastSentinel.dispatchEvent(new Event("focus"));
    expect(document.activeElement?.textContent).toBe("First");
  });

  it("does not auto-focus when disabled is true", () => {
    render(
      <FocusTrap disabled>
        <button>Inside</button>
      </FocusTrap>
    );
    // NOTE: comparing document.activeElement?.textContent to "Inside" (the
    // brief's literal assertion) cannot distinguish "the button is focused"
    // from "nothing is focused, activeElement is <body>" here, because the
    // button's text is the only text content in the document either way —
    // body.textContent trivially equals "Inside" in both cases. Assert on
    // the element identity instead, which is what this test actually means
    // to verify: the button must not have received focus.
    expect(document.activeElement).not.toBe(screen.getByText("Inside"));
    expect(document.activeElement).toBe(document.body);
  });
});
