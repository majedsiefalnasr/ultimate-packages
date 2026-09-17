import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useKeyFilter, type UKeyFilterPattern } from "./key-filter";

/**
 * `useKeyFilter` has no `packages/component-metadata/src/records/` entry —
 * same fallback pattern documented across this batch's other stories. It is
 * a keystroke-filtering hook, not a form control: it blocks
 * `keypress`/`paste` events that would produce a value not matching its
 * pattern, and renders no UI of its own — the story below wraps it around a
 * plain `<input>` to demonstrate the attached behavior, mirroring
 * `packages/ng/src/key-filter/key-filter.stories.ts`'s own directive-story
 * shape.
 *
 * State coverage below is sourced from
 * `packages/react/src/key-filter/key-filter.spec.tsx` (named presets,
 * custom RegExp, paste blocking, `validateOnly`).
 */
function KeyFilterDemo({ pattern, placeholder }: { pattern: RegExp | UKeyFilterPattern; placeholder: string }) {
  const ref = React.useRef<HTMLInputElement>(null);
  useKeyFilter(ref, { pattern });
  return <input ref={ref} placeholder={placeholder} />;
}

const meta: Meta<typeof KeyFilterDemo> = {
  title: "React/KeyFilter",
  component: KeyFilterDemo,
};

export default meta;
type Story = StoryObj<typeof KeyFilterDemo>;

/** Integer-only preset — allows digits and a leading '-'. */
export const IntegerOnly: Story = {
  args: { pattern: "int", placeholder: "Integer only" },
};

/** Alphanumeric preset. */
export const Alphanumeric: Story = {
  args: { pattern: "alphanum", placeholder: "Letters and numbers" },
};

/** Custom RegExp pattern. */
export const CustomPattern: Story = {
  args: { pattern: /^[abc]*$/, placeholder: "a, b, or c only" },
};
