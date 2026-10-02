import { Theme, getVariableValue, toVariables } from "@ultimate/uix-styled";
import { primitive, semantic } from "../../src/presets/aura/base";

/** Matches `{token.path}` references the same way the dt engine does (EXPR_REGEX). */
const PREFIX = "u";

const REFERENCE_PATTERN = /{([^}]*)}/g;

export type ColorMode = "light" | "dark";

export interface TokenReference {
  /** Dotted path of the string inside the module (e.g. `root.focusRing.color`). */
  location: string;
  /** The reference with braces stripped (e.g. `focus.ring.color`). */
  reference: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * CSS custom-property names (`--u-form-field-background`) the real dt engine
 * defines, per colour mode.
 *
 * Mirrors `ThemeUtils.getCommon` (uix-styled): primitive and the
 * mode-independent semantic keys are emitted once; `semantic.colorScheme.light`
 * and `.dark` are emitted separately. Names come from the engine's own
 * `toVariables`, so camelCase keys are kebab-cased and structural keys
 * (`colorScheme`, `light`, `dark`, `root`, ...) are dropped.
 */
export function definedVariableNames(): Record<ColorMode, Set<string>> {
  const { colorScheme, ...semanticShared } = semantic;
  const { light, dark } = colorScheme;
  const namesOf = (node: Record<string, unknown>, root: string): string[] =>
    toVariables({ [root]: node }, { prefix: PREFIX }).value.map((declaration) =>
      declaration.slice(0, declaration.indexOf(":"))
    );

  const shared = [
    ...namesOf(primitive as Record<string, unknown>, "primitive"),
    ...namesOf(semanticShared, "semantic"),
  ];

  return {
    light: new Set([...shared, ...namesOf(light, "light")]),
    dark: new Set([...shared, ...namesOf(dark, "dark")]),
  };
}

/**
 * The CSS variable name the dt engine turns `{reference}` into, via the
 * engine's own `getVariableValue` (kebab-casing, structural keys dropped). This
 * is why `{overlay.popover.borderRadius}` and `{overlay.popover.border.radius}`
 * both resolve to `--u-overlay-popover-border-radius`.
 */
export function variableNameFor(reference: string): string | undefined {
  const resolved = getVariableValue(`{${reference}}`, undefined, PREFIX, [
    Theme.defaults.variable.excludedKeyRegex,
  ]);
  return resolved?.match(/--[\w-]+/)?.[0];
}

/** Every `{a.b.c}` reference found in any string value of `node`, with its location. */
export function collectReferences(node: unknown, location = ""): TokenReference[] {
  if (typeof node === "string") {
    return [...node.matchAll(REFERENCE_PATTERN)].map((match) => ({
      location,
      reference: match[1],
    }));
  }
  if (isRecord(node)) {
    return Object.entries(node).flatMap(([key, child]) =>
      collectReferences(child, location ? `${location}.${key}` : key)
    );
  }
  return [];
}

/**
 * References in `module` that the real engine would leave dangling in at least
 * one colour mode. Empty array means every reference resolves in both light and
 * dark. Returned entries name the mode(s) in which the path is undefined.
 */
export function unresolvedReferences(module: unknown): string[] {
  const defined = definedVariableNames();
  const modes: ColorMode[] = ["light", "dark"];

  return collectReferences(module).flatMap(({ location, reference }) => {
    const name = variableNameFor(reference);
    const missingIn = modes.filter((mode) => !name || !defined[mode].has(name));
    return missingIn.length > 0
      ? [`${location}: {${reference}} undefined in ${missingIn.join("+")}`]
      : [];
  });
}

/** Strings containing an opening brace that does not form a complete `{...}` reference. */
export function malformedReferences(node: unknown, location = ""): string[] {
  if (typeof node === "string") {
    const stripped = node.replace(REFERENCE_PATTERN, "");
    return /[{}]/.test(stripped) ? [`${location}: ${node}`] : [];
  }
  if (isRecord(node)) {
    return Object.entries(node).flatMap(([key, child]) =>
      malformedReferences(child, location ? `${location}.${key}` : key)
    );
  }
  return [];
}
