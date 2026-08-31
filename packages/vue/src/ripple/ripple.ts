import {
  addClass,
  createElement,
  getHeight,
  getOffset,
  getOuterHeight,
  getOuterWidth,
  getWidth,
  removeClass,
} from "@ultimate/uix-utils/dom";
import { createDirective } from "@ultimate/vue-core";

interface RippleState {
  ink: HTMLElement;
  mouseDownListener: (event: MouseEvent) => void;
  animationEndListener: (event: AnimationEvent) => void;
  timeout?: ReturnType<typeof setTimeout>;
}

const stateByElement = new WeakMap<HTMLElement, RippleState>();

// Matches verified upstream: ink dimensions/position are set as inline
// styles computed from the host's offset/outer size (getOffset,
// getOuterWidth/Height, getWidth/Height) — not driven through a CSS custom
// property. The animation itself IS CSS-driven: toggling the u-ink-active
// class triggers the .u-ink-active keyframe animation defined in the
// consuming theme's own stylesheet (no JS-driven animation loop here).
function createInk(): HTMLElement {
  const ink = createElement("span", {
    class: "u-ink",
    role: "presentation",
    "aria-hidden": true,
  });
  if (!ink) {
    throw new Error("Failed to create ripple ink element");
  }
  return ink;
}

function onAnimationEnd(state: RippleState): (event: AnimationEvent) => void {
  return () => {
    if (state.timeout) {
      clearTimeout(state.timeout);
    }
    removeClass(state.ink, "u-ink-active");
  };
}

function onMouseDown(el: HTMLElement, state: RippleState): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const { ink } = state;

    if (getComputedStyle(ink).display === "none") {
      return;
    }

    removeClass(ink, "u-ink-active");

    if (!getHeight(ink) && !getWidth(ink)) {
      const diameter = Math.max(getOuterWidth(el), getOuterHeight(el));
      ink.style.height = `${diameter}px`;
      ink.style.width = `${diameter}px`;
    }

    const offset = getOffset(el);
    const offsetLeft = typeof offset.left === "number" ? offset.left : 0;
    const offsetTop = typeof offset.top === "number" ? offset.top : 0;
    const x = event.pageX - offsetLeft + document.body.scrollTop - getWidth(ink) / 2;
    const y = event.pageY - offsetTop + document.body.scrollLeft - getHeight(ink) / 2;

    ink.style.left = `${x}px`;
    ink.style.top = `${y}px`;

    addClass(ink, "u-ink-active");

    // Belt-and-suspenders cleanup matching verified upstream's 401ms timeout
    // (the .u-ink-active keyframe animation is 0.4s in the theme
    // stylesheet) — a fallback in case the animationend event doesn't fire.
    state.timeout = setTimeout(() => {
      removeClass(ink, "u-ink-active");
    }, 401);
  };
}

// Vue custom directive, matching verified Ripple.js's real mechanism: a
// mousedown listener computes the ink element's size/position as inline
// styles (getOffset/getOuterWidth/getOuterHeight/getWidth/getHeight), then
// toggles the u-ink-active class, which drives a CSS keyframe animation
// defined in the consuming theme's own stylesheet (not a JS animation loop).
// Standalone primitive, matching Angular's URipple precedent
// (packages/ng/src/ripple/ripple.ts) — not folded ad-hoc into Button/Dialog's
// own component files. Deliberately excludes PrimeVue's BaseRipple/RippleStyle
// DI-styling registration and UltimateConfig ripple-toggle gating (Option B;
// see URipple's own doc comment for the same exclusion) — the ripple effect
// is applied unconditionally.
export const rippleDirective = createDirective<void>({
  name: "ripple",
  hooks: {
    mounted(el) {
      const ink = createInk();
      el.appendChild(ink);

      const state: RippleState = {
        ink,
        mouseDownListener: () => {},
        animationEndListener: () => {},
      };
      state.mouseDownListener = onMouseDown(el, state);
      state.animationEndListener = onAnimationEnd(state);

      el.addEventListener("mousedown", state.mouseDownListener);
      ink.addEventListener("animationend", state.animationEndListener as EventListener);

      stateByElement.set(el, state);
    },
    unmounted(el) {
      const state = stateByElement.get(el);
      if (!state) return;

      if (state.timeout) {
        clearTimeout(state.timeout);
      }
      el.removeEventListener("mousedown", state.mouseDownListener);
      state.ink.removeEventListener("animationend", state.animationEndListener as EventListener);
      state.ink.remove();
      stateByElement.delete(el);
    },
  },
});
