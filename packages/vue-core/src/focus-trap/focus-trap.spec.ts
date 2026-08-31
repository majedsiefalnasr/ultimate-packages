import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { focusTrapDirective } from "./focus-trap";

function template() {
  return `
    <div v-focustrap="{ disabled }">
      <button id="first">First</button>
      <button id="second">Second</button>
    </div>
  `;
}

describe("v-focustrap", () => {
  it("creates two hidden sentinel spans bracketing the trapped content when not disabled", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: false }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    const spans = wrapper.findAll("span");
    expect(spans.length).toBe(2);
    expect(spans[0].attributes("role")).toBe("presentation");
    wrapper.unmount();
  });

  it("does not create sentinels when disabled", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: true }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    expect(wrapper.findAll("span").length).toBe(0);
    wrapper.unmount();
  });

  it("auto-focuses the first focusable element when autoFocus is set", () => {
    const wrapper = mount(
      {
        template: `<div v-focustrap="{ autoFocus: true }"><button id="first">First</button></div>`,
      },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    expect(document.activeElement?.id).toBe("first");
    wrapper.unmount();
  });

  it("redirects focus into the trap when the first sentinel is focused (Shift+Tab wraparound)", () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: false }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    // Simulate a real Shift+Tab off the top of the trapped content: focus
    // starts on the first real element, then moves to the first sentinel.
    // jsdom populates `relatedTarget` on the resulting focus event from the
    // previously-focused element (verified directly), exactly like a real
    // browser Tab traversal — a bare `dispatchEvent(new FocusEvent("focus"))`
    // with no prior focus does NOT carry a `relatedTarget` and would not
    // exercise the wraparound branch at all.
    const first = document.getElementById("first") as HTMLElement;
    first.focus();
    const firstSentinel = wrapper.findAll("span")[0].element as HTMLElement;
    firstSentinel.focus();
    expect(document.activeElement?.id).toBe("second"); // wraps to the last real focusable
    wrapper.unmount();
  });

  it("redirects focus after the trapped content dynamically changes and focus is lost", async () => {
    const wrapper = mount(
      {
        template: `
          <div v-focustrap="{ disabled: false }">
            <button v-if="showFirst" id="first">First</button>
            <button id="second">Second</button>
          </div>
        `,
        data: () => ({ showFirst: true }),
      },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    const first = document.getElementById("first") as HTMLElement;
    first.focus();
    expect(document.activeElement?.id).toBe("first");

    // Removing the focused element is a dynamic content change that loses
    // focus (activeElement falls back to <body>); the bound MutationObserver
    // must redirect focus back into the trap.
    await wrapper.setData({ showFirst: false });
    // MutationObserver callbacks are microtask-queued — flush before asserting.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.activeElement?.id).toBe("second");
    wrapper.unmount();
  });

  it("unbinds the MutationObserver and listeners when disabled transitions to true on update", async () => {
    const wrapper = mount(
      { template: template(), data: () => ({ disabled: false }) },
      { global: { directives: { focustrap: focusTrapDirective } }, attachTo: document.body }
    );
    expect(wrapper.findAll("span").length).toBe(2);

    await wrapper.setData({ disabled: true });

    // Sentinels created at mount are not retroactively removed by `updated`
    // (verified upstream: `updated` only calls `unbind`, which disconnects
    // the observer/listeners — it does not remove the sentinel spans from
    // the DOM). What must be verified is that the observer no longer reacts:
    // removing the focused element after unbind must NOT redirect focus.
    const first = document.getElementById("first") as HTMLElement;
    first.focus();
    expect(document.activeElement?.id).toBe("first");

    // Simulate the button being removed (dynamic content change) after unbind.
    first.remove();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // No redirection should occur: activeElement falls back to <body>,
    // proving the MutationObserver was disconnected by `unbind`.
    expect(document.activeElement?.id).not.toBe("second");
    wrapper.unmount();
  });
});
