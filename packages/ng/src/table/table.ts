import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { equals } from "@ultimate/uix-data";
import type { FilterMetadata, SelectionMode, SortMeta, SortMode } from "@ultimate/uix-data";
import { deepEquals } from "@ultimate/uix-utils/object";
import { tableStyleModule } from "./table-style";

@Component({
  standalone: true,
  selector: "u-table",
  template: `
    <div [class]="cx('root')" role="table">
      <table [class]="cx('table')">
        <thead [class]="cx('thead')" role="rowgroup">
          <tr role="row">
            @for (col of columns(); track col.field) {
              <th
                role="columnheader"
                [attr.aria-sort]="ariaSortFor(col.field)"
                (click)="onSort(col.field)"
              >{{ col.header }}</th>
            }
          </tr>
        </thead>
        <tbody [class]="cx('tbody')" role="rowgroup">
          @for (row of filteredValue; track $index) {
            <tr
              [class]="cx('row')"
              role="row"
              tabindex="0"
              [attr.aria-selected]="isSelected(row)"
              (click)="onRowClick(row)"
              (keydown)="onRowKeyDown($event)"
            >
              @for (col of columns(); track col.field) {
                <td>{{ resolveCell(row, col.field) }}</td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTable<T> extends UBaseComponent {
  protected override readonly componentName = "table";
  protected override readonly styleModule = tableStyleModule;

  value = input<T[]>([]);
  dataKey = input<string>("");
  columns = input<{ field: string; header: string }[]>([]);

  sortMode = input<SortMode>("single");
  sortField = input<string>();
  sortOrder = input<1 | 0 | -1>(0);
  multiSortMeta = input<SortMeta[]>([]);

  sortFieldChange = output<string | undefined>();
  sortOrderChange = output<1 | 0 | -1>();
  multiSortMetaChange = output<SortMeta[]>();

  filters = input<Record<string, FilterMetadata | FilterMetadata[]>>({});

  selectionMode = input<SelectionMode>();
  selection = input<T | T[]>();
  compareSelectionBy = input<"equals" | "deepEquals">("equals");
  selectionChange = output<T | T[]>();

  protected resolveCell(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  private compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  }

  /**
   * Tests one row's field value against a single `FilterMetadata`. Only the
   * string match modes in this task's scope are dispatched; all other
   * `FilterMatchMode` values are deferred (see `filteredValue`'s dispatch
   * comment) and never reach this method.
   */
  private matchesFilter(row: T, field: string, filter: FilterMetadata): boolean {
    const cellValue = String(this.resolveCell(row, field) ?? "").toLowerCase();
    const filterValue = String(filter.value ?? "").toLowerCase();

    switch (filter.matchMode) {
      case "contains":
        return cellValue.includes(filterValue);
      case "startsWith":
        return cellValue.startsWith(filterValue);
      case "equals":
        return cellValue === filterValue;
      // NEEDS IMPLEMENTATION-TIME VERIFICATION: notContains, endsWith, notEquals, lt, lte, gt, gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter, custom
      default:
        return true;
    }
  }

  /**
   * Sorted-but-unfiltered view of `value()`. Independent of `filteredValue`
   * (not derived from it) — the two are separate consumable views per the
   * plan: `sortedValue` always reflects sort state alone, while
   * `filteredValue` reflects filter-then-sort.
   */
  protected get sortedValue(): T[] {
    return this.applySort(this.value());
  }

  /**
   * Applies `filters()` to `value()`. Each entry is keyed by field; a
   * single `FilterMetadata` must match, while a `FilterMetadata[]` is an
   * array-of-alternatives OR'd together (any element matching passes the
   * row), per spec §9's Angular-specific operator shape.
   */
  protected get filteredValue(): T[] {
    const rows = this.value();
    const filters = this.filters();
    const fields = Object.keys(filters);
    if (fields.length === 0) return this.applySort(rows);

    const filtered = rows.filter((row) =>
      fields.every((field) => {
        const filter = filters[field];
        return Array.isArray(filter)
          ? filter.some((f) => this.matchesFilter(row, field, f))
          : this.matchesFilter(row, field, filter);
      }),
    );
    return this.applySort(filtered);
  }

  /**
   * Clones `rows` (`[...rows]`) before sorting so the caller's input array
   * is never mutated in place, then applies either single-field
   * (`sortField`/`sortOrder`) or multi-field (`multiSortMeta`, entries
   * applied in priority order — first entry is primary key) sort depending
   * on `sortMode()`.
   */
  private applySort(rows: T[]): T[] {
    rows = [...rows];

    if (this.sortMode() === "multiple") {
      const meta = this.multiSortMeta();
      if (meta.length === 0) return rows;
      return rows.sort((a, b) => {
        for (const { field, order } of meta) {
          const result = this.compareValues(this.resolveCell(a, field), this.resolveCell(b, field));
          if (result !== 0) return result * order;
        }
        return 0;
      });
    }

    const field = this.sortField();
    const order = this.sortOrder();
    if (!field || order === 0) return rows;
    return rows.sort(
      (a, b) => this.compareValues(this.resolveCell(a, field), this.resolveCell(b, field)) * order,
    );
  }

  protected ariaSortFor(field: string): "ascending" | "descending" | null {
    if (this.sortMode() === "multiple") {
      const entry = this.multiSortMeta().find((m) => m.field === field);
      if (!entry || entry.order === 0) return null;
      return entry.order === 1 ? "ascending" : "descending";
    }
    if (this.sortField() !== field || this.sortOrder() === 0) return null;
    return this.sortOrder() === 1 ? "ascending" : "descending";
  }

  /**
   * Directly sets/replaces sort state for the clicked column rather than
   * cycling through asc/desc/none (deferred per plan's Global Constraints,
   * spec §7). Single mode: always sets sortField/sortOrder to this field
   * ascending. Multi mode: adds or replaces this field's multiSortMeta
   * entry with order 1 ascending; no removal-on-click affordance.
   */
  protected onSort(field: string): void {
    if (this.sortMode() === "multiple") {
      const meta = [...this.multiSortMeta()];
      const index = meta.findIndex((m) => m.field === field);
      if (index === -1) {
        meta.push({ field, order: 1 });
      } else {
        meta[index] = { field, order: 1 };
      }
      this.multiSortMetaChange.emit(meta);
      return;
    }

    this.sortFieldChange.emit(field);
    this.sortOrderChange.emit(1);
  }

  /**
   * Identity comparison for selection matching, dispatched on
   * `compareSelectionBy()`: `"equals"` (default) uses `dataKey`-based
   * field identity via `uix-data`'s shared `equals`, while `"deepEquals"`
   * uses `uix-utils`'s shared structural `deepEquals` — both are real,
   * already-shipped comparators (no inline reimplementation needed).
   */
  private isRowEqual(a: T, b: T): boolean {
    return this.compareSelectionBy() === "deepEquals" ? deepEquals(a, b) : equals(a, b, this.dataKey());
  }

  protected isSelected(row: T): boolean {
    const selection = this.selection();
    if (selection == null) return false;
    if (Array.isArray(selection)) return selection.some((s) => this.isRowEqual(s, row));
    return this.isRowEqual(selection, row);
  }

  /**
   * Single mode: clicking a row always replaces the selection with that
   * row. Multiple mode: clicking toggles the row into/out of the current
   * selection array (identity via `isRowEqual`). No selectionMode set:
   * clicks are inert (no emit) — selection is opt-in per spec §6.
   */
  protected onRowClick(row: T): void {
    const mode = this.selectionMode();
    if (!mode) return;

    if (mode === "single") {
      this.selectionChange.emit(row);
      return;
    }

    const current = this.selection();
    const currentArray = Array.isArray(current) ? current : [];
    const index = currentArray.findIndex((s) => this.isRowEqual(s, row));
    const next = index === -1 ? [...currentArray, row] : currentArray.filter((_, i) => i !== index);
    this.selectionChange.emit(next);
  }

  /**
   * Keyboard-equivalent path for row navigation (spec §15's confirmed
   * ArrowDown/ArrowUp/Home/End baseline), matching real PrimeNG's
   * `table.ts:3918-4014` row-keydown convention. Only moves `.focus()`
   * between `tbody [role="row"]` elements — never the header row, since
   * this handler is bound per data row, not delegated from a host
   * listener spanning the whole table. Enter/selection-toggle behavior is
   * already covered by Task 6's `(click)` handler, so it is intentionally
   * out of scope here.
   */
  protected onRowKeyDown(event: KeyboardEvent): void {
    const row = event.currentTarget as HTMLElement;
    const rowGroup = row.parentElement;
    if (!rowGroup) return;

    const rows = Array.from(rowGroup.querySelectorAll<HTMLElement>(':scope > [role="row"]'));
    const index = rows.indexOf(row);
    if (index === -1) return;

    let target: HTMLElement | undefined;
    switch (event.key) {
      case "ArrowDown":
        target = rows[index + 1];
        break;
      case "ArrowUp":
        target = rows[index - 1];
        break;
      case "Home":
        target = rows[0];
        break;
      case "End":
        target = rows[rows.length - 1];
        break;
      default:
        return;
    }

    if (target) {
      event.preventDefault();
      target.focus();
    }
  }
}
