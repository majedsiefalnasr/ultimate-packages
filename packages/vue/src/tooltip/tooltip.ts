import { createElement } from "@ultimate/uix-utils/dom";
import { uuid } from "@ultimate/uix-utils/uuid";
import { createDirective, registerComponentStyle, useZIndex, Z_INDEX_KEYS } from "@ultimate/vue-core";
import { tooltipStyleModule } from "./tooltip-style";

export interface TooltipBindingValue {
  value: string;
  disabled?: boolean;
  escape?: boolean;
  class?: string;
  fitContent?: boolean;
  id?: string;
  showDelay?: number;
  hideDelay?: number;
  autoHide?: boolean;
}

interface TooltipState {
  panel?: HTMLElement;
  panelId: string;
  showTimer?: ReturnType<typeof setTimeout>;
  hideTimer?: ReturnType<typeof setTimeout>;
  onEnter: () => void;
  onLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

const stateByElement = new WeakMap<HTMLElement, TooltipState>();
const { set: setZIndex, clear: clearZIndex } = useZIndex();

function normalizeBinding(value: string | TooltipBindingValue | undefined): TooltipBindingValue {
  if (typeof value === "string") return { value, escape: true, showDelay: 0, hideDelay: 0, autoHide: true };
  return { escape: true, showDelay: 0, hideDelay: 0, autoHide: true, ...value, value: value?.value ?? "" };
}

function addOwnedDescribedBy(el: HTMLElement, id: string): void {
  const existing = el.getAttribute("aria-describedby");
  const tokens = existing ? existing.split(" ").filter(Boolean) : [];
  if (!tokens.includes(id)) tokens.push(id);
  el.setAttribute("aria-describedby", tokens.join(" "));
}

function removeOwnedDescribedBy(el: HTMLElement, id: string): void {
  const existing = el.getAttribute("aria-describedby");
  if (!existing) return;
  const tokens = existing.split(" ").filter((token) => token && token !== id);
  if (tokens.length > 0) el.setAttribute("aria-describedby", tokens.join(" "));
  else el.removeAttribute("aria-describedby");
}

function showTooltip(el: HTMLElement, state: TooltipState, binding: TooltipBindingValue): void {
  if (binding.disabled || !binding.value) return;

  registerComponentStyle("tooltip", tooltipStyleModule);

  const text = createElement("div", { class: "u-tooltip-text" });
  if (!text) return;

  // Two-mode content contract, matching verified Tooltip.js's create()
  // exactly (spec §25): escape defaults to true (safe createTextNode path);
  // escape: false is an explicit, caller-opt-in-only raw-HTML path. The
  // default path must never be the unsafe one.
  if (binding.escape === false) {
    text.innerHTML = binding.value;
  } else {
    text.textContent = binding.value;
  }

  const panel = createElement(
    "div",
    {
      id: state.panelId,
      role: "tooltip",
      class: ["u-tooltip", binding.class],
      style: { position: "absolute", width: binding.fitContent === false ? undefined : "fit-content" },
    },
    text
  );
  if (!panel) return;

  document.body.appendChild(panel);
  state.panel = panel;

  const rect = el.getBoundingClientRect();
  panel.style.left = `${rect.left + window.scrollX}px`;
  panel.style.top = `${rect.bottom + window.scrollY + 4}px`;

  setZIndex(Z_INDEX_KEYS.tooltip, panel);
  addOwnedDescribedBy(el, state.panelId);
}

function hideTooltip(el: HTMLElement, state: TooltipState): void {
  if (!state.panel) return;
  clearZIndex(state.panel);
  state.panel.remove();
  state.panel = undefined;
  removeOwnedDescribedBy(el, state.panelId);
}

function bind(el: HTMLElement, binding: TooltipBindingValue): void {
  const state: TooltipState = {
    panelId: binding.id ?? uuid("u_tooltip"),
    onEnter: () => {},
    onLeave: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };

  state.onEnter = () => {
    clearTimeout(state.hideTimer);
    state.showTimer = setTimeout(() => showTooltip(el, state, binding), binding.showDelay ?? 0);
  };
  state.onLeave = () => {
    clearTimeout(state.showTimer);
    if (binding.autoHide === false) return;
    state.hideTimer = setTimeout(() => hideTooltip(el, state), binding.hideDelay ?? 0);
  };
  state.onFocus = state.onEnter;
  state.onBlur = state.onLeave;

  el.addEventListener("mouseenter", state.onEnter);
  el.addEventListener("mouseleave", state.onLeave);
  el.addEventListener("focus", state.onFocus);
  el.addEventListener("blur", state.onBlur);

  stateByElement.set(el, state);
}

function unbind(el: HTMLElement): void {
  const state = stateByElement.get(el);
  if (!state) return;
  clearTimeout(state.showTimer);
  clearTimeout(state.hideTimer);
  el.removeEventListener("mouseenter", state.onEnter);
  el.removeEventListener("mouseleave", state.onLeave);
  el.removeEventListener("focus", state.onFocus);
  el.removeEventListener("blur", state.onBlur);
  hideTooltip(el, state);
  stateByElement.delete(el);
}

// Vue custom directive, target-based model matching verified Tooltip.js
// exactly — NOT a wrapper component (spec §9). aria-describedby wiring is
// this task's intentional accessibility deviation over verified upstream
// (which has no such wiring) — additive to any pre-existing value, removes
// only its own owned id on cleanup.
export const tooltipDirective = createDirective<string | TooltipBindingValue | undefined>({
  name: "tooltip",
  hooks: {
    mounted(el, binding) {
      bind(el, normalizeBinding(binding.value));
    },
    updated(el, binding) {
      unbind(el);
      bind(el, normalizeBinding(binding.value));
    },
    unmounted(el) {
      unbind(el);
    },
  },
});
