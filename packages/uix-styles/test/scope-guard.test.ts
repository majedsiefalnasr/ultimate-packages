import { describe, it, expect } from "vitest";
import { style as base } from "../src/base";

const ALLOWED_SELECTOR_PREFIXES = [
  ".p-disabled",
  ".p-icon",
  ".p-overlay-mask",
  ".p-collapsible",
  ".pi",
  // Generic component marker class applied to every PrimeVue/PrimeNG
  // component (used here only in the `.p-component:disabled` rule) —
  // framework-level, not a named widget module.
  ".p-component",
  // Generic overlay-positioning animation keyframes, shared overlay
  // infrastructure alongside `.p-overlay-mask` — not a specific
  // component like `dialog` or `popover`.
  ".p-anchored-overlay",
];

// Matches any ".p-xxxx" class selector token in the CSS string.
const CLASS_SELECTOR_PATTERN = /\.p-[a-z][a-z0-9-]*/gi;

describe("base module scope guard", () => {
  it("contains only allow-listed .p-* selector prefixes (no per-component selectors leaked in)", () => {
    const found = [...new Set(base.match(CLASS_SELECTOR_PATTERN) ?? [])];
    const unexpected = found.filter(
      (selector) => !ALLOWED_SELECTOR_PREFIXES.some((allowed) => selector.startsWith(allowed))
    );
    expect(unexpected).toEqual([]);
  });
});
