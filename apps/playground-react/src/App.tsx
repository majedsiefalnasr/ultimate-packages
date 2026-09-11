import * as React from "react";
import { UButton } from "@ultimate/react/button";
import { UCheckbox } from "@ultimate/react/checkbox";
import { UDialog } from "@ultimate/react/dialog";
import { UMenu } from "@ultimate/react/menu";
import type { UMenuItem } from "@ultimate/react/menu";
import { UPaginator } from "@ultimate/react/paginator";
import type { PaginatorPageChangeEvent } from "@ultimate/react/paginator";
import { UScroller } from "@ultimate/react/scroller";
import { UTable } from "@ultimate/react/table";
import { UTooltip } from "@ultimate/react/tooltip";

/**
 * Fixed, literal fixture rows for the UTable proof — 3 rows x 2 columns of
 * static strings/numbers. No Math.random()/Date.now()/locale formatting per
 * the harness's binding determinism rule.
 */
interface ProofRow {
  name: string;
  score: number;
}

const PROOF_ROWS: readonly ProofRow[] = [
  { name: "Alpha", score: 30 },
  { name: "Bravo", score: 10 },
  { name: "Charlie", score: 20 },
];

const TABLE_COLUMNS = [
  { field: "name", header: "Name" },
  { field: "score", header: "Score" },
];

/** Fixed, literal 5-item list for the UScroller proof (no windowing). */
const SCROLLER_ITEMS: readonly string[] = ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"];

type SortOrder = 1 | 0 | -1;

/**
 * Single root component rendering all 8 `@ultimate/react` components with
 * static fixture data, for Track E's SSR/hydration verification harness.
 * Every component is imported via `@ultimate/react`'s per-component
 * subpaths (confirmed present for all 8 in the package's `exports` map),
 * matching the package's own tree-shaking design intent — unlike Task 2's
 * Angular harness, which had no choice but to use `@ultimate/ng`'s root
 * barrel.
 */
export function App(): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const tooltipHostRef = React.useRef<HTMLSpanElement>(null);

  // --- Button ---
  const [clickCount, setClickCount] = React.useState(0);

  // --- Checkbox ---
  const [checkboxChecked, setCheckboxChecked] = React.useState(false);

  // --- Dialog ---
  const [dialogVisible, setDialogVisible] = React.useState(false);

  // --- Menu ---
  const [lastSelectedMenuItem, setLastSelectedMenuItem] = React.useState("none");
  const menuItems: UMenuItem[] = [
    { label: "First Item", command: () => setLastSelectedMenuItem("First Item") },
    { label: "Second Item", command: () => setLastSelectedMenuItem("Second Item") },
    { label: "Third Item", command: () => setLastSelectedMenuItem("Third Item") },
  ];

  // --- Paginator ---
  const [paginatorFirst, setPaginatorFirst] = React.useState(0);
  const [paginatorPage, setPaginatorPage] = React.useState(1);

  const onPaginatorPageChange = (event: PaginatorPageChangeEvent) => {
    setPaginatorFirst(event.first);
    setPaginatorPage(event.page + 1);
  };

  // --- Table ---
  const [tableSortField, setTableSortField] = React.useState<string | undefined>(undefined);
  const [tableSortOrder, setTableSortOrder] = React.useState<SortOrder>(0);

  const onTableSort = (event: { sortField?: string; sortOrder?: SortOrder }) => {
    setTableSortField(event.sortField);
    setTableSortOrder(event.sortOrder ?? 0);
  };

  // Hydration marker: flips true only after the client attaches, via a
  // mount-only effect that never runs during renderToPipeableStream's
  // server pass — a later Playwright test polls for this attribute.
  React.useEffect(() => {
    if (rootRef.current) {
      rootRef.current.setAttribute("data-hydrated", "true");
    }
  }, []);

  return (
    <div ref={rootRef} id="app-root">
      <h1>Ultimate React SSR Proof</h1>

      <section aria-labelledby="button-heading">
        <h2 id="button-heading">Button</h2>
        <UButton label="Proof Button" onClick={() => setClickCount((count) => count + 1)} />
        <p data-testid="click-counter">Clicks: {clickCount}</p>
      </section>

      <section aria-labelledby="checkbox-heading">
        <h2 id="checkbox-heading">Checkbox</h2>
        <UCheckbox
          checked={checkboxChecked}
          onChange={(event) => setCheckboxChecked(Boolean(event.checked))}
        />
        <p data-testid="checkbox-state">Checked: {String(checkboxChecked)}</p>
      </section>

      <section aria-labelledby="dialog-heading">
        <h2 id="dialog-heading">Dialog</h2>
        <UButton label="Open Dialog" onClick={() => setDialogVisible(true)} />
        <UDialog
          header="Proof Dialog"
          visible={dialogVisible}
          onHide={() => setDialogVisible(false)}
          closeOnEscape
        >
          <p>Proof Dialog Content</p>
        </UDialog>
      </section>

      <section aria-labelledby="menu-heading">
        <h2 id="menu-heading">Menu</h2>
        <UMenu model={menuItems} />
        <p data-testid="menu-last-selected">Last selected: {lastSelectedMenuItem}</p>
      </section>

      <section aria-labelledby="paginator-heading">
        <h2 id="paginator-heading">Paginator</h2>
        <p data-testid="paginator-page">Page {paginatorPage}</p>
        <UPaginator
          first={paginatorFirst}
          rows={2}
          totalRecords={6}
          onPageChange={onPaginatorPageChange}
        />
      </section>

      <section aria-labelledby="scroller-heading">
        <h2 id="scroller-heading">Scroller</h2>
        <UScroller items={[...SCROLLER_ITEMS]} itemSize={40} disabled />
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading">Table</h2>
        <UTable
          value={[...PROOF_ROWS]}
          columns={TABLE_COLUMNS}
          sortField={tableSortField}
          sortOrder={tableSortOrder}
          onSort={onTableSort}
        />
      </section>

      <section aria-labelledby="tooltip-heading">
        <h2 id="tooltip-heading">Tooltip</h2>
        <span ref={tooltipHostRef} data-testid="tooltip-host">
          Hover for tooltip
        </span>
        <UTooltip target={tooltipHostRef} content="Proof Tooltip Content" />
      </section>
    </div>
  );
}
