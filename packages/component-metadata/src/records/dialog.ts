import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/dialog/dialog.ts (UDialog class, `input()`/`output()` signal API)
 * - React: packages/react/src/dialog/dialog.tsx (UDialogProps interface + destructured props)
 * - Vue: packages/vue/src/dialog/BaseDialog.ts (createBaseDialog's `props` object)
 *   and packages/vue/src/dialog/Dialog.vue (real `emits` declaration + `$emit` call sites)
 *
 * Events, verified per framework — this is the plan's "lifecycle-event"
 * ground-truth case (`onShow`/`onHide`, no payload), but the three
 * frameworks' real, currently-shipped mechanisms/names diverge from a naive
 * "same as Angular" assumption (same discipline Task 10/Checkbox applied):
 * - Angular's `UDialog` declares real `onShow = output<void>()` (dialog.ts:180)
 *   and `onHide = output<void>()` (dialog.ts:182), plus a separate
 *   `visibleChange = output<boolean>()` (line 178) for the controlled
 *   visibility contract itself (not modeled as a lifecycle EventFact here —
 *   it is the two-way-binding companion to the `visible` input, the same
 *   role React's `onHide` prop and Vue's `update:visible` emit play, not a
 *   "the dialog just became visible/hidden" notification). `onShow` fires
 *   only after the enter motion's promise resolves
 *   (`this.motion.enter().then(() => this.onShow.emit())`, line 274);
 *   `onHide` fires synchronously when `visible()` transitions to `false`,
 *   before the leave motion completes (line 238).
 * - React's `UDialogProps` has NO `onShow` callback prop at all — confirmed
 *   by reading the full interface (dialog.tsx:18-36) and the component body
 *   in full: only `onHide: (event?: React.SyntheticEvent) => void` exists
 *   (a required prop, not an optional lifecycle notification), called from
 *   `onClose()` (via the Escape key, the close button, or a dismissable-mask
 *   click) and, distinctly, from `useMotion`'s `onAfterLeave` callback once
 *   the leave animation actually finishes (dialog.tsx:121-138) — i.e.
 *   React's single `onHide` prop conflates Angular's separate
 *   `visibleChange`-driven-close and motion-complete-driven-`onHide`
 *   moments into one callback. There is no React equivalent of Angular's
 *   `onShow` "enter motion complete" notification; the "hidden" lifecycle
 *   moment is real but is carried by the same `onHide` callback-prop the
 *   controlled-visibility contract also uses, not a separate emitter.
 * - Vue's `Dialog.vue` declares `emits: ["update:visible", "show", "hide",
 *   "after-hide"]` (line 118). Unlike Angular, Vue has a REAL `show` emit
 *   (`this.$emit("show")` in `onEnter(el, done)`, fired at transition-enter
 *   start, line 177) and a REAL `hide` emit (`this.$emit("hide")` in
 *   `onLeave(el, done)`, fired at transition-leave start, line 199) — both
 *   void-payload, matching Angular's `onShow`/`onHide` semantic pairing
 *   closely (modeled as the same `shown`/`hidden` semanticIds). Vue
 *   additionally emits a third, distinct `after-hide` event
 *   (`this.$emit("after-hide")` in `onAfterLeave()`, line 208, fired once
 *   the leave motion's `done()` callback actually completes) that has no
 *   Angular or React counterpart — not modeled as its own EventFact here
 *   since neither of this record's own test assertions nor Angular's
 *   `onShow`/`onHide` ground truth call for a third semanticId, and no
 *   proof-set consumer need for it has been demonstrated (YAGNI); a future
 *   task can add it if a real need arises.
 */
export const DIALOG_METADATA: ComponentMetadata = {
  name: "Dialog",
  category: "Overlay",
  description:
    "A modal (or non-modal) overlay window that renders projected content above the page, with focus trapping and Escape-key dismissal.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/dialog/dialog.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/dialog/dialog.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/dialog/BaseDialog.ts" },
  },
  api: {
    ng: {
      props: [
        { name: "visible", type: "boolean", default: "false", required: false, description: "Specifies the visibility of the dialog." },
        { name: "header", type: "string | undefined", required: false, description: "Title text of the dialog." },
        {
          name: "closable",
          type: "boolean",
          default: "true",
          required: false,
          description: "Adds a close icon to the header to hide the dialog.",
        },
        {
          name: "closeOnEscape",
          type: "boolean",
          default: "true",
          required: false,
          description: "Specifies if pressing escape key should hide the dialog.",
        },
        {
          name: "modal",
          type: "boolean",
          default: "true",
          required: false,
          description: "Defines if background should be blocked when dialog is displayed.",
        },
      ],
      events: [
        {
          semanticId: "visibleChange",
          frameworkName: "visibleChange",
          mechanism: "output",
          payloadDescription: "boolean — notifies changes in the visibility state of the component (the controlled-visibility companion to the `visible` input, emitted on close).",
        },
        {
          semanticId: "shown",
          frameworkName: "onShow",
          mechanism: "output",
          payloadDescription: "void — emitted once the enter motion's promise resolves after `visible` transitions to true.",
        },
        {
          semanticId: "hidden",
          frameworkName: "onHide",
          mechanism: "output",
          payloadDescription: "void — emitted synchronously when `visible` transitions to false, before the leave motion completes.",
        },
      ],
    },
    react: {
      props: [
        { name: "visible", type: "boolean", required: true },
        { name: "header", type: "React.ReactNode", required: false },
        { name: "footer", type: "React.ReactNode", required: false },
        { name: "children", type: "React.ReactNode", required: false },
        { name: "modal", type: "boolean", default: "true", required: false },
        { name: "closable", type: "boolean", default: "true", required: false },
        { name: "showCloseIcon", type: "boolean", default: "true", required: false },
        { name: "closeOnEscape", type: "boolean", default: "false", required: false },
        { name: "dismissableMask", type: "boolean", default: "false", required: false },
        { name: "blockScroll", type: "boolean", default: "false", required: false },
        { name: "baseZIndex", type: "number | undefined", required: false },
        { name: "appendTo", type: "HTMLElement | (() => HTMLElement) | undefined", required: false },
        { name: "className", type: "string | undefined", required: false },
        { name: "style", type: "React.CSSProperties | undefined", required: false },
        { name: "id", type: "string | undefined", required: false },
        { name: "focusOnShow", type: "boolean", default: "true", required: false },
      ],
      events: [
        {
          semanticId: "hidden",
          frameworkName: "onHide",
          mechanism: "callback-prop",
          payloadDescription: "(event?: React.SyntheticEvent) => void — the single controlled-visibility/close callback, called both on user-driven close (Escape, close button, dismissable-mask click) and, distinctly, once the leave motion's onAfterLeave completes. There is no React onShow counterpart — no such prop exists on UDialogProps.",
        },
      ],
    },
    vue: {
      props: [
        { name: "visible", type: "Boolean", default: "false", required: false },
        { name: "header", type: "String", default: "null", required: false },
        { name: "footer", type: "String", default: "null", required: false },
        { name: "modal", type: "Boolean", default: "true", required: false },
        { name: "closable", type: "Boolean", default: "true", required: false },
        { name: "closeOnEscape", type: "Boolean", default: "true", required: false },
        { name: "dismissableMask", type: "Boolean", default: "false", required: false },
        { name: "blockScroll", type: "Boolean", default: "false", required: false },
        { name: "baseZIndex", type: "Number", default: "0", required: false },
        { name: "autoZIndex", type: "Boolean", default: "true", required: false },
        { name: "position", type: "String", default: "center", required: false },
        { name: "appendTo", type: "[String, Object]", default: "body", required: false },
        { name: "ariaCloseLabel", type: "String", default: "Close", required: false },
      ],
      events: [
        {
          semanticId: "visibleChange",
          frameworkName: "update:visible",
          mechanism: "emit",
          payloadDescription: "boolean — Vue's v-model convention companion to the `visible` prop, emitted false on close.",
        },
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
    componentName: "dialog",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/dialog/dialog.ts", "packages/ng/src/dialog/dialog-style.ts"],
  },
};
