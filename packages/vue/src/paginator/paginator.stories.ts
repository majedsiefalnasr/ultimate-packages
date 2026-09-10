import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UPaginator } from "./index";

/**
 * Accessibility info source: `packages/component-metadata/src/records/paginator.ts`
 * (the `PAGINATOR_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/vue/src/paginator/paginator.spec.ts`'s existing test cases
 * (pageCount computation exposed via data-page-count, page-link rendering,
 * current-page report region with aria-live=polite).
 *
 * `UPaginator` advances its own internal `d_first`/`d_rows` data on click
 * even without a `v-model:first` consumer (per paginator.spec.ts's "advances
 * d_first internally even without a v-model consumer" test), so every story
 * below renders correctly interactive with plain `args` — no external
 * harness is required for the paginator to visibly page forward/back when
 * clicked in Storybook.
 */
const meta: Meta<typeof UPaginator> = {
  title: "Vue/Paginator",
  component: UPaginator,
};

export default meta;
type Story = StoryObj<typeof UPaginator>;

/** Default state — 95 records over 10 rows/page (10 pages), per paginator.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    first: 0,
    rows: 10,
    totalRecords: 95,
  },
};

/** A middle page selected, per paginator.spec.ts's page-link rendering coverage. */
export const MiddlePage: Story = {
  args: {
    first: 90,
    rows: 10,
    totalRecords: 200,
    pageLinkSize: 5,
  },
};

/** Empty dataset — pageCount 0. */
export const Empty: Story = {
  args: {
    first: 0,
    rows: 10,
    totalRecords: 0,
  },
};
