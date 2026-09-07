import { SCHEMA_VERSION } from "@ultimate/component-schema";
import type { ComponentMetadata } from "@ultimate/component-schema";

/**
 * Ground truth for every field below:
 * - Angular: packages/ng/src/button/button.ts (UButton class, `input()`/`output()` signal API)
 * - React: packages/react/src/button/button.tsx (UButtonProps interface + destructured props)
 * - Vue: packages/vue/src/button/base-button.ts (createBaseButton's `props` object)
 *
 * Button has NO custom events in any framework — only the native `<button>`
 * click passthrough. Confirmed by reading all three components in full:
 * - Angular's UButton does declare `onClick`/`onFocus`/`onBlur` `output()`s
 *   that wrap the native click/focus/blur DOM events one-to-one (no custom
 *   payload, no semantics beyond the native event) — per spec convention
 *   used across this plan, native-event passthrough outputs are not modeled
 *   as EventFacts, matching the "native click passthrough only" framing
 *   this record's own test asserts.
 * - React's UButtonProps extends native ButtonHTMLAttributes (Omit<"disabled">),
 *   so any `onClick`/`onFocus`/`onBlur` handler is the plain native DOM
 *   attribute, not a component-specific callback prop.
 * - Vue's createBaseButton() declares no `emits` at all, and Button.vue does
 *   not declare its own `emits` either — only `v-bind="rootAttrs"` native
 *   attribute/listener passthrough exists.
 */
export const BUTTON_METADATA: ComponentMetadata = {
  name: "Button",
  category: "Primitive",
  description:
    "A clickable button control with optional icon, loading state, and severity/size/style modifiers.",
  schemaVersion: SCHEMA_VERSION,
  metadataVersion: 1,
  packages: {
    ng: { packageName: "@ultimate/ng", sourcePath: "packages/ng/src/button/button.ts" },
    react: { packageName: "@ultimate/react", sourcePath: "packages/react/src/button/button.tsx" },
    vue: { packageName: "@ultimate/vue", sourcePath: "packages/vue/src/button/base-button.ts" },
  },
  api: {
    ng: {
      props: [
        { name: "label", type: "string | undefined", required: false, description: "Text of the button." },
        { name: "icon", type: "string | undefined", required: false, description: "Name of the icon." },
        {
          name: "iconPos",
          type: '"left" | "right" | "top" | "bottom"',
          default: "left",
          required: false,
          description: "Position of the icon.",
        },
        {
          name: "loading",
          type: "boolean",
          default: "false",
          required: false,
          description: "Whether the button is in loading state.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          required: false,
          description: "When present, it specifies that the component should be disabled.",
        },
        { name: "severity", type: "string | undefined", required: false, description: "Defines the style of the button." },
        {
          name: "raised",
          type: "boolean",
          default: "false",
          required: false,
          description: "Add a shadow to indicate elevation.",
        },
        {
          name: "rounded",
          type: "boolean",
          default: "false",
          required: false,
          description: "Add a circular border radius to the button.",
        },
        {
          name: "text",
          type: "boolean",
          default: "false",
          required: false,
          description: "Add a textual class to the button without a background initially.",
        },
        {
          name: "outlined",
          type: "boolean",
          default: "false",
          required: false,
          description: "Add a border class without a background initially.",
        },
        { name: "size", type: '"small" | "large" | undefined', required: false, description: "Defines the size of the button." },
        {
          name: "fluid",
          type: "boolean",
          default: "false",
          required: false,
          description: "Spans 100% width of the container when enabled.",
        },
      ],
      events: [],
    },
    react: {
      props: [
        { name: "label", type: "string | undefined", required: false },
        { name: "icon", type: "React.ReactNode", required: false },
        { name: "iconPos", type: '"left" | "right" | "top" | "bottom"', default: "left", required: false },
        { name: "loading", type: "boolean", default: "false", required: false },
        { name: "loadingIcon", type: "React.ReactNode", required: false },
        { name: "disabled", type: "boolean", default: "false", required: false },
        {
          name: "severity",
          type: '"secondary" | "success" | "info" | "warning" | "danger" | "help" | "contrast" | undefined',
          required: false,
        },
        { name: "size", type: '"small" | "large" | undefined', required: false },
        { name: "text", type: "boolean | undefined", required: false },
        { name: "raised", type: "boolean | undefined", required: false },
        { name: "rounded", type: "boolean | undefined", required: false },
        { name: "outlined", type: "boolean | undefined", required: false },
        { name: "link", type: "boolean | undefined", required: false },
        { name: "plain", type: "boolean | undefined", required: false },
        { name: "badge", type: "string | undefined", required: false },
        { name: "badgeClassName", type: "string | undefined", required: false },
        { name: "visible", type: "boolean", default: "true", required: false },
        { name: "tooltip", type: "string | undefined", required: false },
        { name: "tooltipOptions", type: "Record<string, unknown> | undefined", required: false },
      ],
      events: [],
    },
    vue: {
      props: [
        { name: "label", type: "String", default: "null", required: false },
        { name: "icon", type: "String", default: "null", required: false },
        { name: "iconPos", type: "String", default: "left", required: false },
        { name: "iconClass", type: "[String, Object]", default: "null", required: false },
        { name: "badge", type: "String", default: "null", required: false },
        { name: "badgeClass", type: "[String, Object]", default: "null", required: false },
        { name: "badgeSeverity", type: "String", default: "secondary", required: false },
        { name: "loading", type: "Boolean", default: "false", required: false },
        { name: "loadingIcon", type: "String", required: false },
        { name: "as", type: "[String, Object]", default: "BUTTON", required: false },
        { name: "asChild", type: "Boolean", default: "false", required: false },
        { name: "link", type: "Boolean", default: "false", required: false },
        { name: "severity", type: "String", default: "null", required: false },
        { name: "raised", type: "Boolean", default: "false", required: false },
        { name: "rounded", type: "Boolean", default: "false", required: false },
        { name: "text", type: "Boolean", default: "false", required: false },
        { name: "outlined", type: "Boolean", default: "false", required: false },
        { name: "size", type: "String", default: "null", required: false },
        { name: "variant", type: "String", default: "null", required: false },
        { name: "plain", type: "Boolean", default: "false", required: false },
        { name: "fluid", type: "Boolean", default: "null", required: false },
        { name: "ariaLabel", type: "String", default: "null", required: false },
        { name: "tooltip", type: "String", default: "null", required: false },
        { name: "tooltipOptions", type: "Object", default: "null", required: false },
      ],
      events: [],
    },
  },
  style: {
    componentName: "button",
  },
  provenanceRef: {
    package: "ng",
    ultimateDestinations: ["packages/ng/src/button/button.ts", "packages/ng/src/button/button-style.ts"],
  },
};
