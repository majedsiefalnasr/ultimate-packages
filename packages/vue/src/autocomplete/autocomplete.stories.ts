import { ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UAutoComplete } from "./index";

/**
 * `UAutoComplete` is controlled via `modelValue`/`update:modelValue` (Vue's
 * `v-model` convention), same harness pattern as `password.stories.ts`.
 *
 * State coverage below is sourced from
 * `packages/vue/src/autocomplete/autocomplete.spec.ts`'s existing test
 * cases (debounced `complete` emit, suggestion overlay, keyboard
 * navigation, Escape-to-close).
 */
const meta: Meta<typeof UAutoComplete> = {
  title: "Vue/AutoComplete",
  component: UAutoComplete,
};

export default meta;
type Story = StoryObj<typeof UAutoComplete>;

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

/** Default state — type at least one character to trigger the `complete` event. */
export const Default: Story = {
  args: {
    modelValue: null,
    placeholder: "Search a fruit",
  },
  render: (args) => ({
    components: { UAutoComplete },
    setup() {
      const modelValue = ref(args.modelValue);
      const suggestions = ref<string[]>([]);
      const onComplete = (event: { query: string }) => {
        suggestions.value = FRUITS.filter((f) => f.toLowerCase().includes(event.query.toLowerCase()));
      };
      return { args, modelValue, suggestions, onComplete };
    },
    template: `<UAutoComplete v-bind="args" v-model="modelValue" :suggestions="suggestions" @complete="onComplete" />`,
  }),
};

/** Loading state — shows a loader indicator while a search is in flight. */
export const Loading: Story = {
  args: {
    modelValue: null,
    placeholder: "Search a fruit",
    loading: true,
  },
  render: Default.render,
};
