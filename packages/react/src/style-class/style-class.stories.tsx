import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useStyleClass } from "./style-class";

/**
 * `useStyleClass` has no `packages/component-metadata/src/records/` entry —
 * same fallback pattern documented across this batch's other stories. It is
 * a click-driven class-toggle/animation behavior, not a form control or
 * standalone component — it renders no UI of its own; the story below wraps
 * it around a plain trigger button, mirroring
 * `packages/react/src/key-filter/key-filter.stories.tsx`'s own hook-story
 * shape.
 *
 * State coverage below is sourced from
 * `packages/react/src/style-class/style-class.spec.tsx` (toggle, enter/leave
 * class sequence, selector resolution, outside-click/Escape dismissal).
 */
function StyleClassDemo() {
  const ref = React.useRef<HTMLButtonElement>(null);
  useStyleClass(ref, {
    selector: "@next",
    enterFromClass: "u-storybook-hidden",
    enterToClass: "u-storybook-visible",
    leaveFromClass: "u-storybook-visible",
    leaveToClass: "u-storybook-hidden",
    hideOnOutsideClick: true,
  });
  return (
    <div>
      <button ref={ref}>Show panel</button>
      <div
        className="u-storybook-hidden"
        style={{ marginTop: 8, padding: 8, border: "1px solid #ccc" }}
      >
        Panel content
      </div>
    </div>
  );
}

function ToggleClassDemo() {
  const ref = React.useRef<HTMLButtonElement>(null);
  useStyleClass(ref, { selector: "@next", toggleClass: "u-storybook-active" });
  return (
    <div>
      <button ref={ref}>Toggle</button>
      <div style={{ marginTop: 8, padding: 8, border: "1px solid #ccc" }}>Target content</div>
    </div>
  );
}

const meta: Meta = {
  title: "React/StyleClass",
};

export default meta;
type Story = StoryObj;

/** Toggles a single class on the next sibling element. */
export const ToggleClass: Story = {
  render: () => <ToggleClassDemo />,
};

/** Enter/leave animation class sequence on the next sibling, dismissed by outside click. */
export const EnterLeaveWithOutsideClick: Story = {
  render: () => <StyleClassDemo />,
};
