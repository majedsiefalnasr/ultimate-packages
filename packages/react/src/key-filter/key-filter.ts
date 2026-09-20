import * as React from "react";

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

export interface UseKeyFilterOptions {
  pattern?: RegExp | UKeyFilterPattern;
  validateOnly?: boolean;
  when?: boolean;
}

function resolveRegex(pattern: RegExp | UKeyFilterPattern | undefined): RegExp {
  if (pattern instanceof RegExp) return pattern;
  if (pattern && pattern in DEFAULT_MASKS) return DEFAULT_MASKS[pattern];
  return /./;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `KeyFilter` (real source:
 * `components/lib/keyfilter/KeyFilter.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). Confirmed against
 * real source: PrimeReact's `KeyFilter` is a **plain exported object of
 * static helper functions** (`onKeyPress`/`onPaste`/`onBeforeInput`/
 * `validateKey`/`getRegex`), not a component, hook, or higher-order
 * wrapper — it has no React-specific shape at all; real PrimeReact
 * components (e.g. `InputText`) call these helpers directly from their own
 * `onKeyPress`/`onPaste` handlers when a `keyfilter` prop is supplied
 * (verified: no `KeyFilter.js` file references `React` or a hook API
 * anywhere).
 *
 * Per this task's brief to confirm KeyFilter's actual shape rather than
 * assume a standard form-control pattern, and per React's own established
 * no-shared-form-state-base-class convention, this port exposes the same
 * keydown/paste-filtering *behavior* as a small hook,
 * `useKeyFilter(inputRef, options)` — the idiomatic React translation of
 * "attach a DOM-event-filtering behavior to an element," matching
 * `react-core`'s own `useEventListener` hook idiom (the same DOM-listener-
 * attachment pattern already established in this codebase), rather than
 * inventing either a non-idiomatic static-utility export (which would be
 * unusable without manual wiring into every consumer's own event handlers,
 * unlike every other React capability in this batch) or a new component
 * wrapper (KeyFilter renders no UI of its own in any framework, so a
 * component shape would be a mismatch, confirmed by this same source
 * reading applying identically to the Angular/Vue directive forms).
 *
 * Ports the same `keypress`/`paste` blocking algorithm as `UKeyFilter`
 * (`packages/ng/src/key-filter/key-filter.ts`) and Vue's `KeyFilter`
 * directive — one shared, source-verified filtering rule, three
 * framework-native attachment mechanisms (Angular directive, this hook,
 * Vue custom directive).
 */
export function useKeyFilter(
  inputRef: React.RefObject<HTMLInputElement | null>,
  { pattern, validateOnly = false, when = true }: UseKeyFilterOptions
): void {
  const regex = resolveRegex(pattern);

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el || !when) return;

    const onKeyPress = (event: KeyboardEvent) => {
      if (validateOnly) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key === "Enter") return;
      const existingValue = el.value || "";
      const combinedValue = existingValue + event.key;
      if (!regex.test(combinedValue)) {
        event.preventDefault();
      }
    };

    const onPaste = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;
      const pastedText = clipboardData.getData("text");
      for (const char of pastedText) {
        if (!regex.test(char)) {
          event.preventDefault();
          return;
        }
      }
    };

    el.addEventListener("keypress", onKeyPress);
    el.addEventListener("paste", onPaste);
    return () => {
      el.removeEventListener("keypress", onKeyPress);
      el.removeEventListener("paste", onPaste);
    };
  }, [inputRef, regex, validateOnly, when]);
}
