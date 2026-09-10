import type { Meta, StoryObj } from "@storybook/angular";
import { UTable } from "./table";

/**
 * Accessibility info source: `packages/component-metadata/src/records/table.ts`
 * (the `TABLE_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/table/table.spec.ts`'s existing test cases (row/column
 * rendering, sorting with aria-sort, paginator composition).
 */
interface Row {
  id: number;
  name: string;
}

const meta: Meta<UTable<Row>> = {
  title: "Ng/Table",
  component: UTable,
};

export default meta;
type Story = StoryObj<UTable<Row>>;

const rows: Row[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

/** Default state — rows and columns rendered, per table.spec.ts's base fixture. */
export const Default: Story = {
  args: {
    value: rows,
    columns: [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
    ],
  },
};

/** Sorted state, per table.spec.ts's "sorts by sortField/sortOrder" and "sets aria-sort" tests. */
export const Sorted: Story = {
  args: {
    value: rows,
    columns: [
      { field: "id", header: "ID" },
      { field: "name", header: "Name" },
    ],
    sortField: "name",
    sortOrder: -1,
  },
};

/** Paginated state, per table.spec.ts's "renders a real u-paginator child when paginator=true" test. */
export const Paginated: Story = {
  args: {
    value: Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` })),
    columns: [{ field: "name", header: "Name" }],
    paginator: true,
    rows: 10,
    totalRecords: 25,
  },
};
