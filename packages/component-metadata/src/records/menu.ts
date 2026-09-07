import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/menu/menu.ts (UMenu class, `input()` signal API)
 * - React: packages/react/src/menu/menu.tsx (UMenuProps interface + destructured props)
 * - Vue: packages/vue/src/menu/BaseMenu.ts (createBaseMenu's `props` object)
 *   and packages/vue/src/menu/Menu.vue (real `emits` declaration + `$emit` call sites)
 *
 * Events, verified per framework — Menu's real, currently-shipped event
 * surface diverges sharply across frameworks (same discipline Task
 * 10/Checkbox and Task 11/Dialog applied):
 * - Angular's `UMenu` (menu.ts) declares NO `output()`s at all — confirmed
 *   by reading the full class body (menu.ts:138-230). Its only inputs are
 *   `model` (menu.ts:143) and `popup` (menu.ts:145); `popup` is accepted
 *   per this task's brief but is "currently inert beyond flagging the
 *   `u-menu-overlay` style-class variant" (menu.ts:38-42 doc comment) — there
 *   is no popup-overlay rendering, so no show/hide lifecycle exists to emit
 *   in the first place. Item interaction flows through `UMenuItem.command`
 *   (a plain callback field on each model entry, not a component-level
 *   output) — `onItemClick` calls `item.command?.(event)` directly
 *   (menu.ts:176), never emitting anything from `UMenu` itself.
 * - React's `UMenuProps` has REAL `onShow?: () => void` and `onHide?: () =>
 *   void` callback props (menu.tsx:44-45). `onShow` fires synchronously
 *   inside `show()`, right after `setVisible(true)` (menu.tsx:134-141).
 *   `onHide` is deferred — NOT called synchronously inside `hide()`
 *   (menu.tsx:116-132, which only flips `visible` to `false`) but instead
 *   fires from `useMotion`'s `onAfterLeave` callback once the leave
 *   animation genuinely completes (menu.tsx:208-223), matching the same
 *   two-state mount/motion model already established for `UDialog` (Task
 *   17) and documented in this file's own header comment (menu.tsx:93-102).
 *   Both callbacks are popup-mode-only in practice (inline mode never
 *   toggles `visible` after mount), but the props exist unconditionally on
 *   `UMenuProps`.
 * - Vue's `Menu.vue` declares `emits: ["show", "hide", "focus", "blur"]`
 *   (Menu.vue:76). Unlike Angular (no events) and matching React's
 *   semantic pairing, Vue has a REAL `show` emit (`this.$emit("show")` in
 *   `onEnter(el, done)`, Menu.vue:263) and a REAL `hide` emit
 *   (`this.$emit("hide")` in `onLeave(el, done)`, Menu.vue:270) — both
 *   void-payload (modeled as the same `shown`/`hidden` semanticIds used for
 *   Dialog and React Menu). Vue additionally emits `focus`/`blur` from
 *   `onListFocus`/`onListBlur` (Menu.vue:136,141) — DOM-focus-tracking
 *   events with no Angular or React Menu counterpart. Not modeled as their
 *   own EventFacts here: no proof-set consumer need for them has been
 *   demonstrated (YAGNI, same reasoning Task 11 applied to Vue Dialog's
 *   `after-hide`), and this task's own test assertions call for the
 *   `shown`/`hidden` pair only.
 */
export const MENU_METADATA: ComponentMetadata = {
  name: "Menu",
  category: "Navigation",
  description:
    "A flat navigation/command list rendered as an ARIA menu, either inline or (React/Vue only) as a popup overlay, with roving-tabindex keyboard navigation.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/menu/menu.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/menu/menu.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/menu/BaseMenu.ts" },
  },
  api: {
    ng: {
      props: [
        {
          name: "model",
          type: "UMenuItem[]",
          default: "[]",
          required: false,
          description: "An array of menuitems.",
        },
        {
          name: "popup",
          type: "boolean",
          default: "false",
          required: false,
          description:
            "Defines if menu would displayed as a popup. Accepted as an input but currently inert beyond flagging the popup style-class variant — no popup-overlay rendering exists yet.",
        },
      ],
      events: [],
    },
    react: {
      props: [
        { name: "model", type: "UMenuItem[]", required: true, description: "An array of menuitems." },
        { name: "popup", type: "boolean", default: "false", required: false },
        {
          name: "popupAlignment",
          type: '"left" | "right" | undefined',
          required: false,
          description:
            "Accepted for API-surface parity with upstream's real prop; positioning/placement logic is deliberately deferred and not wired to any CSS or measurement logic.",
        },
        { name: "id", type: "string | undefined", required: false },
        { name: "ariaLabel", type: "string | undefined", required: false },
        { name: "ariaLabelledBy", type: "string | undefined", required: false },
        { name: "className", type: "string | undefined", required: false },
        { name: "style", type: "React.CSSProperties | undefined", required: false },
        { name: "baseZIndex", type: "number | undefined", required: false },
        { name: "appendTo", type: "HTMLElement | (() => HTMLElement) | undefined", required: false },
        { name: "closeOnEscape", type: "boolean", default: "true", required: false },
      ],
      events: [
        {
          semanticId: "shown",
          frameworkName: "onShow",
          mechanism: "callback-prop",
          payloadDescription: "() => void — called synchronously inside show(), right after visible is set to true.",
        },
        {
          semanticId: "hidden",
          frameworkName: "onHide",
          mechanism: "callback-prop",
          payloadDescription:
            "() => void — deferred: not called synchronously inside hide(), but from useMotion's onAfterLeave once the leave animation genuinely completes.",
        },
      ],
    },
    vue: {
      props: [
        { name: "model", type: "Array", default: "[]", required: false, description: "An array of menuitems." },
        { name: "popup", type: "Boolean", default: "false", required: false },
        { name: "appendTo", type: "[String, Object]", default: "body", required: false },
        { name: "autoZIndex", type: "Boolean", default: "true", required: false },
        { name: "baseZIndex", type: "Number", default: "0", required: false },
        { name: "tabindex", type: "Number", default: "0", required: false },
        { name: "ariaLabel", type: "String", default: "null", required: false },
        { name: "ariaLabelledby", type: "String", default: "null", required: false },
      ],
      events: [
        {
          semanticId: "shown",
          frameworkName: "show",
          mechanism: "emit",
          payloadDescription: "void — emitted at transition-enter start, inside onEnter(el, done).",
        },
        {
          semanticId: "hidden",
          frameworkName: "hide",
          mechanism: "emit",
          payloadDescription: "void — emitted at transition-leave start, inside onLeave(el, done).",
        },
      ],
    },
  },
  style: {
    componentName: "menu",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/menu/menu.ts", "packages/ng/src/menu/menu-style.ts"],
  },
};
