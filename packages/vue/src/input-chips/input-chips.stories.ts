import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UInputChips } from "./index";

/**
 * `UInputChips` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `date-picker.stories.ts`.
 *
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UInputChips` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: the tag list is a `role="listbox"` with each tag as
 * `role="option"`. Keyboard support: Enter commits the current text as a
 * new tag; Backspace on an empty input removes the last tag;
 * ArrowLeft/ArrowRight move focus between tag tokens and the input.
 */
const meta: Meta<typeof UInputChips> = {
  title: "Vue/InputChips",
  component: UInputChips,
};

export default meta;
type Story = StoryObj<typeof UInputChips>;

/** Default — type a value and press Enter to add a tag. */
export const Default: Story = {
  args: { modelValue: [], placeholder: "Add a tag" },
  render: (args) => ({
    components: { UInputChips },
    setup() {
      const modelValue = ref(args.modelValue);
      return { args, modelValue };
    },
    template: `<UInputChips v-bind="args" v-model="modelValue" />`,
  }),
};

/** Pre-populated with existing tags. */
export const WithInitialTags: Story = {
  args: { modelValue: ["design", "frontend"], placeholder: "Add a tag" },
  render: Default.render,
};

/** Limits the number of tags via `max`. */
export const MaxTags: Story = {
  args: { modelValue: ["one", "two"], max: 2, placeholder: "Max reached" },
  render: Default.render,
};

/** Disabled state. */
export const Disabled: Story = {
  args: { modelValue: ["locked"], disabled: true },
  render: Default.render,
};
