import {
  createElement,
  focus,
  getFirstFocusableElement,
  getLastFocusableElement,
} from "@ultimate/uix-utils/dom";
import { createDirective, type DirectiveBinding } from "../directive/base-directive";

export interface FocusTrapBindingValue {
  disabled?: boolean;
  autoFocus?: boolean;
  autoFocusSelector?: string;
  firstFocusableSelector?: string;
  lastFocusableSelector?: string;
}

interface TrapState {
  observer?: MutationObserver;
  focusInListener?: (event: FocusEvent) => void;
  focusOutListener?: (event: FocusEvent) => void;
  firstSentinel?: HTMLElement;
  lastSentinel?: HTMLElement;
}

const stateByElement = new WeakMap<HTMLElement, TrapState>();

function getComputedSelector(selector?: string): string {
  return `:not(.u-hidden-focusable):not([data-u-hidden-focusable="true"])${selector ?? ""}`;
}

function createSentinel(onFocus: (event: FocusEvent) => void): HTMLElement {
  const el = createElement("span", {
    class: "u-hidden-accessible u-hidden-focusable",
    tabIndex: 0,
    role: "presentation",
    "aria-hidden": true,
    "data-u-hidden-accessible": true,
    "data-u-hidden-focusable": true,
  });
  if (!el) throw new Error("createElement failed to create sentinel span");
  el.addEventListener("focus", onFocus as EventListener);
  return el;
}

function bind(el: HTMLElement, binding: FocusTrapBindingValue): void {
  const state: TrapState = {};
  stateByElement.set(el, state);

  const onFirstHiddenFocus = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null;
    const target =
      related === state.lastSentinel || !el.contains(related)
        ? getFirstFocusableElement(el, getComputedSelector(binding.firstFocusableSelector))
        : state.lastSentinel;
    if (target) focus(target as HTMLElement);
  };

  const onLastHiddenFocus = (event: FocusEvent) => {
    const related = event.relatedTarget as HTMLElement | null;
    const target =
      related === state.firstSentinel || !el.contains(related)
        ? getLastFocusableElement(el, getComputedSelector(binding.lastFocusableSelector))
        : state.firstSentinel;
    if (target) focus(target as HTMLElement);
  };

  state.firstSentinel = createSentinel(onFirstHiddenFocus);
  state.lastSentinel = createSentinel(onLastHiddenFocus);
  el.prepend(state.firstSentinel);
  el.append(state.lastSentinel);

  state.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList" && !el.contains(document.activeElement)) {
        const next = getFirstFocusableElement(el, getComputedSelector());
        if (next) focus(next as HTMLElement);
      }
    }
  });
  state.observer.observe(el, { childList: true });

  state.focusInListener = () => {};
  state.focusOutListener = () => {};
  el.addEventListener("focusin", state.focusInListener);
  el.addEventListener("focusout", state.focusOutListener);
}

function unbind(el: HTMLElement): void {
  const state = stateByElement.get(el);
  if (!state) return;
  state.observer?.disconnect();
  if (state.focusInListener) el.removeEventListener("focusin", state.focusInListener);
  if (state.focusOutListener) el.removeEventListener("focusout", state.focusOutListener);
  stateByElement.delete(el);
}

function autoElementFocus(el: HTMLElement, binding: FocusTrapBindingValue): void {
  let target = getFirstFocusableElement(
    el,
    `[autofocus]${getComputedSelector(binding.autoFocusSelector)}`
  );
  if (binding.autoFocus && !target) {
    target = getFirstFocusableElement(el, getComputedSelector(binding.firstFocusableSelector));
  }
  if (target) focus(target as HTMLElement);
}

// Sentinel-span + MutationObserver mechanism, matching verified FocusTrap.js
// exactly (spec §14). disabled=true -> unbound/inactive: mounted skips setup
// entirely. disabled=false -> bound/active. Does NOT restore focus on unmount
// (verified — no such logic upstream); that is UDialog's responsibility
// (Task 21).
export const focusTrapDirective = createDirective<FocusTrapBindingValue | undefined>({
  name: "focustrap",
  hooks: {
    mounted(el, binding: DirectiveBinding<FocusTrapBindingValue | undefined>) {
      const value = binding.value ?? {};
      if (!value.disabled) {
        bind(el, value);
        autoElementFocus(el, value);
      }
    },
    updated(el, binding) {
      if (binding.value?.disabled) unbind(el);
    },
    unmounted(el) {
      unbind(el);
    },
  },
});
