import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/tooltip/tooltip.ts (UTooltip `@Directive`,
 *   `input()` signal API)
 * - React: packages/react/src/tooltip/tooltip.tsx (UTooltipProps interface +
 *   destructured props)
 * - Vue: packages/vue/src/tooltip/tooltip.ts (`TooltipBindingValue`
 *   interface + `tooltipDirective`'s `createDirective` hooks)
 *
 * Structural divergence, verified per framework — Tooltip is NOT the same
 * kind of thing across all three frameworks (a genuine architectural
 * asymmetry, not just a rename, matching the discipline Task 11/Dialog
 * applied to React's missing onShow):
 * - Angular's `UTooltip` is an attribute `@Directive` (selector `[uTooltip]`,
 *   tooltip.ts:63-72), not a component — it has no template/render output
 *   of its own beyond the DOM nodes it imperatively creates via `Renderer2`.
 * - React's `UTooltip` IS a component (`tooltip.tsx:39`, returns a
 *   `<Portal>`-rendered panel), unlike Angular/Vue's directive shape.
 * - Vue's `tooltipDirective` is a custom directive (`createDirective`,
 *   tooltip.ts:148-162), matching Angular's directive shape rather than
 *   React's component shape — the opposite pairing from Dialog/Menu, where
 *   Vue paired with React's component shape and Angular stood alone.
 *
 * Events, verified per framework — no framework's real, currently-shipped
 * Tooltip has ANY custom event/output/emit:
 * - Angular's `UTooltip` declares NO `output()`s — confirmed by reading the
 *   full class body (tooltip.ts:73-194). It only has two protected internal
 *   methods, `show()` and `hide()` (tooltip.ts:86,102), wired directly to
 *   host listeners (`mouseenter`/`mouseleave`/`focus`/`blur`,
 *   tooltip.ts:66-71) — no notification is emitted outward when either
 *   fires.
 * - React's `UTooltipProps` has NO `onShow`/`onHide` (or any other
 *   callback-shaped) prop at all — confirmed by reading the full interface
 *   (tooltip.tsx:15-28): `target`, `content`, `position`, `event`,
 *   `showDelay`, `hideDelay`, `disabled`, `closeOnEscape`, `autoZIndex`,
 *   `baseZIndex`, `id`, `className` only. Internal `visible` state drives
 *   rendering directly; no callback surfaces the show/hide transition to
 *   the caller.
 * - Vue's `tooltipDirective` declares `hooks: { mounted, updated, unmounted
 *   }` only (tooltip.ts:150-161) — these are Vue's own directive lifecycle
 *   hooks, not component `emits`; a directive has no `$emit` mechanism at
 *   all. No `emits` array exists anywhere in this file, confirmed by
 *   reading it in full.
 *
 * This three-way empty-events convergence is a genuinely different finding
 * shape from Checkbox (only Angular was empty) and Dialog (React lacked
 * only `onShow`, not all events) — flagged here per this plan's established
 * discipline of surfacing real findings rather than assuming symmetry.
 */
export const TOOLTIP_METADATA: ComponentMetadata = {
  name: "Tooltip",
  category: "Overlay",
  description:
    "Shows advisory content next to a host/target element on hover or focus. An attribute directive in Angular and Vue; a target-based component in React.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/tooltip/tooltip.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/tooltip/tooltip.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/tooltip/tooltip.ts" },
  },
  api: {
    ng: {
      props: [
        { name: "uTooltip", type: "string | undefined", required: false, description: "Content of the tooltip." },
        {
          name: "uTooltipPosition",
          type: '"top" | "bottom" | "left" | "right"',
          default: '"top"',
          required: false,
          description: "Position of the tooltip.",
        },
        {
          name: "uTooltipDisabled",
          type: "boolean",
          default: "false",
          required: false,
          description: "When present, it specifies that the tooltip should be disabled.",
        },
      ],
      events: [],
    },
    react: {
      props: [
        {
          name: "target",
          type: "React.RefObject<HTMLElement> | HTMLElement | string | string[]",
          required: true,
        },
        { name: "content", type: "React.ReactNode | undefined", required: false },
        { name: "position", type: '"right" | "left" | "top" | "bottom"', default: '"right"', required: false },
        {
          name: "event",
          type: '"hover" | "focus" | "both"',
          default: '"hover"',
          required: false,
          description: "Which host events trigger show/hide: hover-only, focus-only, or both.",
        },
        { name: "showDelay", type: "number", default: "0", required: false },
        { name: "hideDelay", type: "number", default: "0", required: false },
        { name: "disabled", type: "boolean", default: "false", required: false },
        { name: "closeOnEscape", type: "boolean", default: "false", required: false },
        { name: "autoZIndex", type: "boolean", default: "true", required: false },
        { name: "baseZIndex", type: "number | undefined", required: false },
        { name: "id", type: "string | undefined", required: false },
        { name: "className", type: "string | undefined", required: false },
      ],
      events: [],
    },
    vue: {
      props: [
        { name: "value", type: "string", required: true, description: "Content of the tooltip." },
        { name: "disabled", type: "boolean | undefined", required: false },
        {
          name: "escape",
          type: "boolean",
          default: "true",
          required: false,
          description:
            "Two-mode content-injection contract: true (default) uses the safe textContent path; false is an explicit opt-in raw-innerHTML path.",
        },
        { name: "class", type: "string | undefined", required: false },
        { name: "fitContent", type: "boolean", default: "true", required: false },
        { name: "id", type: "string | undefined", required: false },
        { name: "showDelay", type: "number", default: "0", required: false },
        { name: "hideDelay", type: "number", default: "0", required: false },
        { name: "autoHide", type: "boolean", default: "true", required: false },
      ],
      events: [],
    },
  },
  style: {
    componentName: "tooltip",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/tooltip/tooltip.ts", "packages/ng/src/tooltip/tooltip-style.ts"],
  },
};
