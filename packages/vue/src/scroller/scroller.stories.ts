import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UScroller } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/scroller.ts`
 * (the `SCROLLER_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/scroller/scroller.spec.ts`'s existing test cases
 * (windowed item rendering, loading state with aria-busy, disabled
 * (unvirtualized) mode).
 *
 * `UScroller` measures its own root element's real `offsetHeight` via
 * `ResizeObserver` (see base-scroller.ts / Scroller.vue) to compute how many
 * items fit in the viewport — unlike its spec file (which runs in jsdom and
 * must mock `ResizeObserver`/`offsetHeight`), Storybook renders in a real
 * browser, so a real fixed-height wrapper decorator below is enough to
 * produce genuine windowed virtualization with no mocking needed (same
 * decorator pattern as `packages/react/src/scroller/scroller.stories.tsx`).
 */
const meta: Meta<typeof UScroller> = {
  title: "Vue/Scroller",
  component: UScroller,
  decorators: [
    () => ({
      template: `<div style="height: 300px; border: 1px solid #ccc;"><story /></div>`,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof UScroller>;

const items = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);

/** Default state — windowed rendering of 1000 items in a 300px viewport. */
export const Default: Story = {
  args: {
    items,
    itemSize: 30,
  },
};

/** Loading state, per scroller.spec.ts's "renders loader markup with .u-scroller-loader when loading is true" test. */
export const Loading: Story = {
  args: {
    items,
    itemSize: 30,
    loading: true,
  },
};

/** Disabled (unvirtualized) mode, per scroller.spec.ts's "disabled mode renders all items with zero virtualization" test. */
export const Disabled: Story = {
  args: {
    items: Array.from({ length: 50 }, (_, i) => `Item ${i}`),
    itemSize: 30,
    disabled: true,
  },
};
