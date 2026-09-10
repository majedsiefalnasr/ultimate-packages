import type { Meta, StoryObj } from "@storybook/react-vite";
import { UTable } from "./table";

/**
 * Accessibility info source: `packages/component-metadata/src/records/table.ts`
 * (the `TABLE_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/react/src/table/table.spec.tsx`'s existing test cases (row/
 * column rendering, sorting with aria-sort, real UPaginator composition).
 *
 * `UTable<T>` is generic; `Meta`/`StoryObj` are pinned to the same `Row`
 * shape table.spec.tsx uses throughout, matching how a real consumer would
 * instantiate it for one concrete row type.
 */
interface Row {
  id: number;
  name: string;
}

const meta: Meta<typeof UTable<Row>> = {
  title: "React/Table",
  component: UTable,
};

export default meta;
type Story = StoryObj<typeof UTable<Row>>;

const rows: Row[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

/** Default state — rows and columns rendered, per table.spec.tsx's base fixture. */
export const Default: Story = {
  args: {
    value: rows,
    columns: [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
    ],
  },
};

/** Sorted state, per table.spec.tsx's "sets aria-sort on the active sortField's columnheader" test. */
export const Sorted: Story = {
  args: {
    value: rows,
    columns: [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
    ],
    sortField: "name",
    sortOrder: -1,
    onSort: () => {},
  },
};

/** Paginated state, per table.spec.tsx's "renders a real UPaginator child and slices rows to the current page" test. */
export const Paginated: Story = {
  args: {
    value: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` })),
    columns: [{ field: "name", header: "Name" }],
    paginator: true,
    first: 0,
    rows: 10,
    totalRecords: 25,
    onPage: () => {},
  },
};
