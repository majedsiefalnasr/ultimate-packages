import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { UMenuItem } from "@ultimate/ng-core";
import {
  UButton,
  UCheckbox,
  UDialog,
  UMenu,
  UPaginator,
  UScroller,
  UTable,
  UTooltip,
} from "@ultimate/ng";
import type { PaginatorPageChangeEvent } from "@ultimate/ng";

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

/** Fixed, literal 5-item list for the UScroller proof (no windowing). */
const SCROLLER_ITEMS: readonly string[] = ["Row 1", "Row 2", "Row 3", "Row 4", "Row 5"];

type SortOrder = 1 | 0 | -1;

/**
 * Single standalone page rendering all 8 `@ultimate/ng` components with
 * static fixture data, for Track E's SSR/hydration verification harness.
 * Imports every component from `@ultimate/ng`'s root barrel (the package
 * has no per-component subpath exports).
 */
@Component({
  selector: "app-proof-page",
  standalone: true,
  imports: [UButton, UCheckbox, UDialog, UMenu, UPaginator, UScroller, UTable, UTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <h1>Ultimate Angular SSR Proof</h1>

      <section aria-labelledby="button-heading">
        <h2 id="button-heading">Button</h2>
        <u-button label="Proof Button" (onClick)="onButtonClick()" />
        <p data-testid="click-counter">Clicks: {{ clickCount() }}</p>
      </section>

      <section aria-labelledby="checkbox-heading">
        <h2 id="checkbox-heading">Checkbox</h2>
        <u-checkbox #proofCheckbox binary label="Proof Checkbox" />
        <p data-testid="checkbox-state">Checked: {{ proofCheckbox.checked() }}</p>
      </section>

      <section aria-labelledby="dialog-heading">
        <h2 id="dialog-heading">Dialog</h2>
        <u-button label="Open Dialog" (onClick)="openDialog()" />
        <u-dialog header="Proof Dialog" [(visible)]="dialogVisible">
          <p>Proof Dialog Content</p>
        </u-dialog>
      </section>

      <section aria-labelledby="menu-heading">
        <h2 id="menu-heading">Menu</h2>
        <u-menu [model]="menuItems" />
        <p data-testid="menu-last-selected">Last selected: {{ lastSelectedMenuItem() }}</p>
      </section>

      <section aria-labelledby="paginator-heading">
        <h2 id="paginator-heading">Paginator</h2>
        <p data-testid="paginator-page">Page {{ paginatorPage() }}</p>
        <u-paginator [first]="paginatorFirst()" [rows]="2" [totalRecords]="6" (onPageChange)="onPaginatorPageChange($event)" />
      </section>

      <section aria-labelledby="scroller-heading">
        <h2 id="scroller-heading">Scroller</h2>
        <u-scroller [items]="scrollerItems" [itemSize]="40" [disabled]="true" />
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading">Table</h2>
        <u-table
          [value]="tableRows()"
          [columns]="tableColumns"
          [sortField]="tableSortField()"
          [sortOrder]="tableSortOrder()"
          (sortFieldChange)="onTableSortFieldChange($event)"
          (sortOrderChange)="onTableSortOrderChange($event)"
        />
      </section>

      <section aria-labelledby="tooltip-heading">
        <h2 id="tooltip-heading">Tooltip</h2>
        <span uTooltip="Proof Tooltip Content" data-testid="tooltip-host">Hover for tooltip</span>
      </section>
    </main>
  `,
})
export class ProofPageComponent {
  // --- Button ---
  protected readonly clickCount = signal(0);

  protected onButtonClick(): void {
    this.clickCount.update((count) => count + 1);
  }

  // --- Dialog ---
  protected readonly dialogVisible = signal(false);

  protected openDialog(): void {
    this.dialogVisible.set(true);
  }

  // --- Menu ---
  protected readonly lastSelectedMenuItem = signal("none");
  protected readonly menuItems: UMenuItem[] = [
    { label: "First Item", command: () => this.lastSelectedMenuItem.set("First Item") },
    { label: "Second Item", command: () => this.lastSelectedMenuItem.set("Second Item") },
    { label: "Third Item", command: () => this.lastSelectedMenuItem.set("Third Item") },
  ];

  // --- Paginator ---
  protected readonly paginatorFirst = signal(0);
  protected readonly paginatorPage = signal(1);

  protected onPaginatorPageChange(event: PaginatorPageChangeEvent): void {
    this.paginatorFirst.set(event.first);
    this.paginatorPage.set(event.page + 1);
  }

  // --- Scroller ---
  protected readonly scrollerItems: string[] = [...SCROLLER_ITEMS];

  // --- Table ---
  protected readonly tableColumns: { field: string; header: string }[] = [
    { field: "name", header: "Name" },
    { field: "score", header: "Score" },
  ];
  protected readonly tableSortField = signal("");
  protected readonly tableSortOrder = signal<SortOrder>(0);

  protected readonly tableRows = signal<ProofRow[]>([...PROOF_ROWS]);

  protected onTableSortFieldChange(field: string | undefined): void {
    this.tableSortField.set(field ?? "");
  }

  protected onTableSortOrderChange(order: SortOrder): void {
    this.tableSortOrder.set(order);
  }
}
