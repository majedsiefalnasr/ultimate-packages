import { createDirective } from "@ultimate/vue-core";
import type { ObjectDirective } from "vue";

export type UKeyFilterPattern =
  | "pint"
  | "int"
  | "pnum"
  | "money"
  | "num"
  | "hex"
  | "email"
  | "alpha"
  | "alphanum";

export interface UKeyFilterOptions {
  pattern?: RegExp | UKeyFilterPattern;
  validateOnly?: boolean;
}

const DEFAULT_MASKS: Record<UKeyFilterPattern, RegExp> = {
  pint: /^[\d]*$/,
  int: /^[-]?[\d]*$/,
  pnum: /^[\d.]*$/,
  money: /^[\d.\s,]*$/,
  num: /^[-]?[\d.]*$/,
  hex: /^[0-9a-f]*$/i,
  email: /^[a-z0-9_.\-@]*$/i,
  alpha: /^[a-z_]*$/i,
  alphanum: /^[a-z0-9_]*$/i,
};

function resolveRegex(value: RegExp | UKeyFilterPattern | UKeyFilterOptions | undefined): {
  regex: RegExp;
  validateOnly: boolean;
} {
  if (value && typeof value === "object" && !(value instanceof RegExp) && "pattern" in value) {
    const options = value;
    return { regex: resolvePattern(options.pattern), validateOnly: Boolean(options.validateOnly) };
  }
  return { regex: resolvePattern(value as RegExp | UKeyFilterPattern | undefined), validateOnly: false };
}

function resolvePattern(pattern: RegExp | UKeyFilterPattern | undefined): RegExp {
  if (pattern instanceof RegExp) return pattern;
  if (pattern && pattern in DEFAULT_MASKS) return DEFAULT_MASKS[pattern];
  return /./;
}

type Handlers = { keypress: (event: Event) => void; paste: (event: Event) => void };
const boundHandlers = new WeakMap<HTMLElement, Handlers>();

function bind(el: HTMLElement, value: RegExp | UKeyFilterPattern | UKeyFilterOptions | undefined): void {
  const { regex, validateOnly } = resolveRegex(value);
  const target = el instanceof HTMLInputElement ? el : el.querySelector("input");
  if (!target) return;

  const onKeyPress = (event: Event) => {
    const e = event as KeyboardEvent;
    if (validateOnly) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === "Enter") return;
    const existingValue = target.value || "";
    const combinedValue = existingValue + e.key;
    if (!regex.test(combinedValue)) {
      e.preventDefault();
    }
  };

  const onPaste = (event: Event) => {
    const e = event as ClipboardEvent;
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;
    const pastedText = clipboardData.getData("text");
    for (const char of pastedText) {
      if (!regex.test(char)) {
        e.preventDefault();
        return;
      }
    }
  };

  target.addEventListener("keypress", onKeyPress);
  target.addEventListener("paste", onPaste);
  boundHandlers.set(target, { keypress: onKeyPress, paste: onPaste });
}

function unbind(el: HTMLElement): void {
  const target = el instanceof HTMLInputElement ? el : el.querySelector("input");
  if (!target) return;
  const handlers = boundHandlers.get(target);
  if (!handlers) return;
  target.removeEventListener("keypress", handlers.keypress);
  target.removeEventListener("paste", handlers.paste);
  boundHandlers.delete(target);
}

/**
 * Ultimate-owned adaptation of PrimeVue's `KeyFilter` directive (see
 * `.vendor-extracted/vue/keyfilter/KeyFilter.js`/`BaseKeyFilter.js`,
 * extracted this session via `scripts/provenance/extract-primevue-source.mjs`).
 * Confirmed against real source: `KeyFilter` is `BaseKeyFilter.extend('keyfilter',
 * {...})` — a real Vue custom directive (`beforeMount`/`updated`/
 * `unmounted` lifecycle hooks), not a form-control component, matching this
 * task's brief to verify KeyFilter's real shape rather than assume a
 * standard component pattern. `UKeyFilter` mirrors that exactly, built on
 * this repo's own `createDirective` factory
 * (`packages/vue-core/src/directive/base-directive.ts`) — the established
 * Vue directive-authoring primitive already proven by `UAutoFocus`'s Vue
 * counterpart pattern... no such counterpart exists yet in `packages/vue`,
 * making this the first `createDirective` consumer in `packages/vue`
 * itself, though the factory and its own test suite are already Built and
 * proven in `vue-core`.
 *
 * Ports the same `keypress`/`paste` blocking algorithm as `UKeyFilter`
 * (Angular, `packages/ng/src/key-filter/key-filter.ts`) and React's
 * `useKeyFilter` hook — one shared, source-verified filtering rule, three
 * framework-native attachment mechanisms.
 *
 * Deliberately excludes real source's `input`/`compositionstart`/
 * `compositionend` IME-composition handling (real source's own `onInput`
 * fallback for IME-composed characters — `BaseKeyFilter.js` lines ~90-106)
 * and the `getTarget`/`data-pc-name` PrimeVue-internal-component-detection
 * gate (real source only activates on an internal `InputText`/`Textarea`,
 * detected via `data-pc-name` — this port instead binds directly to any
 * plain `<input>` element the directive is applied to, or that element's
 * own descendant `<input>`, a more general and simpler target-resolution
 * rule matching this task's minimal scope) — matching every sibling
 * directive/hook's established "smaller surface than upstream" precedent.
 */
export const UKeyFilter: ObjectDirective<HTMLElement, RegExp | UKeyFilterPattern | UKeyFilterOptions | undefined> =
  createDirective({
    name: "key-filter",
    hooks: {
      mounted(el, binding) {
        bind(el, binding.value);
      },
      updated(el, binding) {
        unbind(el);
        bind(el, binding.value);
      },
      unmounted(el) {
        unbind(el);
      },
    },
  });
