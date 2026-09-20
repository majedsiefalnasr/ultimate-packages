import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { UStyleClass } from "./style-class";

describe("UStyleClass", () => {
  it("toggles a class on the next sibling when toggleClass is set", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', toggleClass: 'active' }">Toggle</button>
            <div id="target"></div>
          </div>
        `,
      },
      { global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;

    button.click();
    expect(target.classList.contains("active")).toBe(true);

    button.click();
    expect(target.classList.contains("active")).toBe(false);
  });

  it("adds enterToClass and removes enterFromClass immediately when no enterActiveClass is set", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', enterFromClass: 'hidden', enterToClass: 'visible' }">
              Toggle
            </button>
            <div id="target" class="hidden"></div>
          </div>
        `,
      },
      { global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;

    button.click();
    expect(target.classList.contains("visible")).toBe(true);
    expect(target.classList.contains("hidden")).toBe(false);
  });

  it("resolves a plain CSS selector target", () => {
    // The directive's plain-CSS-selector fallback branch resolves via
    // document.querySelector(selector) (a real DOM-wide query, not scoped
    // to the mounted component's own virtual tree) — the wrapper must
    // actually be attached to document.body for that query to find
    // anything.
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '.target', toggleClass: 'open' }">Toggle</button>
            <div class="target"></div>
          </div>
        `,
      },
      { attachTo: document.body, global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find(".target").element as HTMLDivElement;

    button.click();
    expect(target.classList.contains("open")).toBe(true);

    wrapper.unmount();
  });

  it("hides on outside click when hideOnOutsideClick is set", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', enterToClass: 'visible', leaveFromClass: 'visible', hideOnOutsideClick: true }">
              Toggle
            </button>
            <div id="target" style="display:block"></div>
            <div id="outside"></div>
          </div>
        `,
      },
      { attachTo: document.body, global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;
    const outside = wrapper.find("#outside").element as HTMLDivElement;
    // jsdom never computes real layout, so offsetParent is always null.
    // UStyleClass's click handler reads target.offsetParent === null to
    // decide enter() vs leave() on this same click, and the document click
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

    wrapper.unmount();
  });

  it("hides on Escape when hideOnEscape is set", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', enterToClass: 'visible', leaveFromClass: 'visible', hideOnEscape: true }">
              Toggle
            </button>
            <div id="target" style="display:block"></div>
          </div>
        `,
      },
      { attachTo: document.body, global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;
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

    wrapper.unmount();
  });

  it("runs the enter animation class sequence and removes enterActiveClass on animationend", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', enterActiveClass: 'animating', enterToClass: 'visible' }">
              Toggle
            </button>
            <div id="target"></div>
          </div>
        `,
      },
      { global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;

    button.click();
    expect(target.classList.contains("animating")).toBe(true);

    target.dispatchEvent(new Event("animationend"));
    expect(target.classList.contains("animating")).toBe(false);
    expect(target.classList.contains("visible")).toBe(true);
  });

  it("cleans up document listeners on unmount", () => {
    const wrapper = mount(
      {
        template: `
          <div>
            <button v-style-class="{ selector: '@next', enterToClass: 'visible', leaveFromClass: 'visible', hideOnOutsideClick: true }">
              Toggle
            </button>
            <div id="target" style="display:block"></div>
          </div>
        `,
      },
      { attachTo: document.body, global: { directives: { "style-class": UStyleClass } } }
    );
    const button = wrapper.find("button").element as HTMLButtonElement;
    const target = wrapper.find("#target").element as HTMLDivElement;
    // See the "hides on outside click" test above for why this stub must
    // be a getter keyed off the "visible" class, not a static value.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });
    button.click();

    const removeSpy = vi.spyOn(document, "removeEventListener");
    wrapper.unmount();
    expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));
    removeSpy.mockRestore();
  });
});
