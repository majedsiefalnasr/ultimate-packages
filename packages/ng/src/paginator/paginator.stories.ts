import type { Meta, StoryObj } from "@storybook/angular";
import { UPaginator } from "./paginator";

/**
 * Accessibility info source: `packages/component-metadata/src/records/paginator.ts`
 * (the `PAGINATOR_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/paginator/paginator.spec.ts`'s existing test cases
 * (pageCount computation, page-link rendering with aria-current, first/prev/
 * next/last aria-labels).
 */
const meta: Meta<UPaginator> = {
  title: "Ng/Paginator",
  component: UPaginator,
};

export default meta;
type Story = StoryObj<UPaginator>;

/** Default state — 95 records over 10 rows/page (10 pages), per paginator.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    totalRecords: 95,
    rows: 10,
  },
};

/** A middle page selected, per paginator.spec.ts's "pageLinks" centered-window coverage. */
export const MiddlePage: Story = {
  args: {
    totalRecords: 200,
    rows: 10,
    first: 90,
    pageLinkSize: 5,
  },
};

/** Empty dataset — pageCount 0, per paginator.spec.ts's zero-guard test. */
export const Empty: Story = {
  args: {
    totalRecords: 0,
    rows: 10,
  },
};
