import type { Meta, StoryObj } from "@storybook/react-vite";
import { UPaginator } from "./paginator";

/**
 * Accessibility info source: `packages/component-metadata/src/records/paginator.ts`
 * (the `PAGINATOR_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/paginator/paginator.spec.tsx`'s existing test cases
 * (pageCount computation, page-link rendering with aria-current, zero-guard,
 * first/prev/next/last aria-labels).
 *
 * `UPaginator` holds no page state of its own — `onPageChange` is a required
 * prop with no default (see paginator.tsx doc comment: "no uncontrolled
 * fallback"), so every story below supplies a no-op so the component renders
 * without a runtime error; clicking controls has no visible effect here,
 * matching the component's own documented controlled-only contract.
 */
const meta: Meta<typeof UPaginator> = {
  title: "React/Paginator",
  component: UPaginator,
  args: {
    onPageChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof UPaginator>;

/** Default state — 95 records over 10 rows/page (10 pages), per paginator.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    totalRecords: 95,
    rows: 10,
    first: 0,
  },
};

/** A middle page selected, per paginator.spec.tsx's page-link rendering coverage. */
export const MiddlePage: Story = {
  args: {
    totalRecords: 200,
    rows: 10,
    first: 90,
    pageLinkSize: 5,
  },
};

/** Empty dataset — pageCount 0, per paginator.spec.tsx's zero-guard test. */
export const Empty: Story = {
  args: {
    totalRecords: 0,
    rows: 10,
    first: 0,
  },
};
