import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { equals } from "@ultimate/uix-data";
import type { FilterMetadata, SelectionMode, SortMeta, SortMode } from "@ultimate/uix-data";
import { deepEquals } from "@ultimate/uix-utils/object";
import { PaginatorPageChangeEvent, UPaginator } from "../paginator/paginator";
import { UScroller } from "../scroller/scroller";
import { tableStyleModule } from "./table-style";

export interface UTableColumn<T = unknown> {
  field: string;
  header: string;
  body?: (row: T, options: { field: string; rowIndex: number }) => string;
}

/**
 * Default empty-state message (Spec §5.6, GAP-046). Real PrimeNG's own
 * Table component has no hardcoded default text for its empty region — it
 * renders purely via a content-projected `#emptymessage` template with no
 * built-in fallback string. The closest verified real-PrimeNG default text
 * is the global locale's `emptyMessage` translation key (confirmed via the
 * pinned `primeng-21.1.9.tar.gz` tarball, `packages/primeng/src/config/
 * primeng.ts`: `emptyMessage: 'No results found'` — used by Tree, DataView,
 * and AutoComplete's empty-search fallback), which this constant matches.
 */
const DEFAULT_EMPTY_MESSAGE = "No results found";

@Component({
  standalone: true,
  selector: "u-table",
  imports: [UPaginator, UScroller],
  template: `
    <div [class]="cx('root')" role="table">
      @if (virtualScroll()) {
        <u-scroller
          [items]="filteredValue"
          [itemSize]="virtualScrollItemSize()"
          [lazy]="lazy()"
          (onLazyLoad)="onScrollerLazyLoad($event)"
        >
          <ng-template #content let-visibleItems let-options="options">
            <table data-u-table-virtual-body [class]="cx('table')">
              <tbody [class]="cx('tbody')" role="rowgroup">
                @for (item of visibleItems; track item.index) {
                  <!-- Known limitation: onRowKeyDown walks :scope > [role="row"] within
                       this tbody, which under virtualization only contains the
                       currently-rendered window, not the full logical dataset — so
                       ArrowDown/ArrowUp/Home/End stop at the edges of what's mounted,
                       not the edges of the full value() dataset. This is intentional
                       (a row outside the window isn't in the DOM to focus), not a bug. -->
                  <tr
                    [class]="cx('row')"
                    role="row"
                    tabindex="0"
                    [attr.aria-selected]="isSelected(item.value)"
                    [style.position]="'absolute'"
                    [style.top.px]="options.getItemOptions(item.index).index * options.itemSize"
                    [style.width]="'100%'"
                    (click)="onRowClick(item.value)"
                    (keydown)="onRowKeyDown($event, item.value)"
                  >
                    <!-- Minor finding 4 (fix-loop integration review): use the item's
                         own absolute dataset index, not a $index re-derived from the
                         visible window (which would reset to 0 per scroll) — matching
                         React's/Vue's own absolute-index semantics. -->
                    @for (col of columns(); track col.field) {
                      <td>{{ renderCell(item.value, col, item.index) }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </ng-template>
        </u-scroller>
      } @else {
        <table [class]="cx('table')">
          <thead [class]="cx('thead')" role="rowgroup">
            <tr role="row">
              @if (selectionColumn() && selectionMode()) {
                <th>
                  @if (selectionMode() === "multiple") {
                    <input
                      type="checkbox"
                      [checked]="allSelected"
                      (click)="toggleAllSelection()"
                    />
                  }
                </th>
              }
              <!-- Minor finding 3 (fix-loop integration review): the expansion-toggle
                   and edit-actions columns each render a <td> per body row but had no
                   matching header <th> at all, leaving the header row's cell count
                   short of the body rows' — added empty <th> cells here so counts
                   match, mirroring the selection column's own already-correct <th>. -->
              @if (dataKey()) {
                <th></th>
              }
              @for (col of columns(); track col.field) {
                <th
                  role="columnheader"
                  [attr.aria-sort]="ariaSortFor(col.field)"
                  (click)="onSort(col.field)"
                >{{ col.header }}</th>
              }
              @if (editMode() === "row") {
                <th></th>
              }
            </tr>
          </thead>
          <tbody [class]="cx('tbody')" role="rowgroup">
            @if (loading()) {
              <tr>
                <td data-u-table-loading [attr.colspan]="totalColumnCount"></td>
              </tr>
            } @else if (value().length === 0) {
              <tr>
                <td [attr.colspan]="totalColumnCount">{{ emptyMessage }}</td>
              </tr>
            } @else {
              @for (entry of groupedRows; track $index; let rowIndex = $index) {
                @if (entry.isGroupHeader && rowGroupMode() === "subheader") {
                  <tr data-u-table-group-header [class]="cx('rowGroupHeader')">
                    <td [attr.colspan]="totalColumnCount">{{ resolveCell(entry.row, groupRowsBy() ?? "") }}</td>
                  </tr>
                }
                <tr
                  [class]="cx('row')"
                  role="row"
                  tabindex="0"
                  [attr.aria-selected]="isSelected(entry.row)"
                  (click)="onRowClick(entry.row)"
                  (keydown)="onRowKeyDown($event, entry.row)"
                >
                  @if (selectionColumn() && selectionMode()) {
                    <td>
                      @if (selectionMode() === "multiple") {
                        <input
                          type="checkbox"
                          [checked]="isSelected(entry.row)"
                          (click)="onSelectionInputClick($event, entry.row)"
                        />
                      } @else {
                        <input
                          type="radio"
                          [checked]="isSelected(entry.row)"
                          (click)="onSelectionInputClick($event, entry.row)"
                        />
                      }
                    </td>
                  }
                  @if (dataKey()) {
                    <td>
                      <button
                        type="button"
                        data-u-table-row-toggle
                        (click)="toggleRowExpansion($event, entry.row)"
                      >{{ isRowExpanded(entry.row) ? "-" : "+" }}</button>
                    </td>
                  }
                  @for (col of columns(); track col.field) {
                    @if (rowGroupMode() === "rowspan" && groupRowsBy() && col.field === groupRowsBy()) {
                      @if (entry.isGroupHeader) {
                        <td data-u-table-group-cell [attr.rowspan]="entry.groupSize">{{ renderCell(entry.row, col, rowIndex) }}</td>
                      }
                    } @else if (isRowEditing(entry.row)) {
                      <td data-u-table-cell-editor>
                        <input
                          [value]="draftValue(entry.row, col.field)"
                          (input)="onDraftInput(entry.row, col.field, $event)"
                          (click)="$event.stopPropagation()"
                        />
                      </td>
                    } @else {
                      <td>{{ renderCell(entry.row, col, rowIndex) }}</td>
                    }
                  }
                  @if (editMode() === "row" && isRowEditing(entry.row)) {
                    <td>
                      <button type="button" data-u-table-row-edit-save (click)="saveRowEdit(entry.row, $event)">Save</button>
                      <button type="button" data-u-table-row-edit-cancel (click)="cancelRowEdit(entry.row, $event)">Cancel</button>
                    </td>
                  } @else if (editMode() === "row") {
                    <td>
                      <button type="button" data-u-table-row-edit-init (click)="initRowEdit(entry.row, $event)">Edit</button>
                    </td>
                  }
                </tr>
                @if (dataKey() && isRowExpanded(entry.row)) {
                  <tr data-u-table-row-expansion>
                    <td [attr.colspan]="totalColumnCount"></td>
                  </tr>
                }
              }
            }
          </tbody>
        </table>
      }
      @if (paginator()) {
        <u-paginator
          [first]="_first()"
          [rows]="rows()"
          [totalRecords]="totalRecords()"
          (onPageChange)="onPaginatorPageChange($event)"
        ></u-paginator>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UTable<T> extends UBaseComponent implements OnChanges {
  protected override readonly componentName = "table";
  protected override readonly styleModule = tableStyleModule;

  value = input<T[]>([]);
  dataKey = input<string>("");
  columns = input<UTableColumn<T>[]>([]);

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
  selectionColumn = input(false);

  paginator = input(false);
  first = input(0);
  rows = input(0);
  totalRecords = input(0);
  rowsPerPageOptions = input<number[]>();

  firstChange = output<number>();
  rowsChange = output<number>();

  virtualScroll = input(false);
  virtualScrollItemSize = input(0);
  lazy = input(false);
  lazyLoadOnInit = input(false);

  onLazyLoad = output<{ first: number; last: number }>();

  editMode = input<"cell" | "row">();
  editingRowKeys = input<Record<string, boolean>>({});
  editingRowKeysChange = output<Record<string, boolean>>();

  expandedRowKeys = input<Record<string, boolean>>({});
  expandedRowKeysChange = output<Record<string, boolean>>();
  onRowExpand = output<{ originalEvent: Event; data: T }>();
  onRowCollapse = output<{ originalEvent: Event; data: T }>();

  rowGroupMode = input<"subheader" | "rowspan">();
  groupRowsBy = input<string>();

  loading = input(false);

  /**
   * Default empty-state message (Spec §5.6, GAP-046). Not itself an input —
   * the plan's own Task 10 scope is the boolean flag and default message
   * only; a future templated-empty-state extension is a separate,
   * not-yet-authorized soft dependency (see the plan's Global Constraints).
   */
  protected readonly emptyMessage = DEFAULT_EMPTY_MESSAGE;

  /**
   * Total header/body cell count (Minor finding 3, fix-loop integration
   * review): `columns().length` plus one for each of the selection,
   * expansion-toggle, and edit-actions columns that are actually rendered.
   * Used consistently everywhere a `colspan` is set (loading row, empty row,
   * subheader-group row, row-expansion placeholder row) so none of them
   * under-counts once those extra columns are present — previously all four
   * used the bare `columns().length`, ignoring the extra columns entirely.
   */
  protected get totalColumnCount(): number {
    let count = this.columns().length;
    if (this.selectionColumn() && this.selectionMode()) count++;
    if (this.dataKey()) count++;
    if (this.editMode() === "row") count++;
    return count;
  }

  /**
   * A signal (not a plain field) so `matchesFilter`'s read of it inside the
   * `custom` case — reached via `filteredValue`'s template-bound getter —
   * marks this `OnPush` view dirty when `registerCustomFilter` mutates it.
   * Without this, a predicate registered after the component's first render
   * (the realistic case: a component reference is only obtainable via
   * viewChild/@ViewChild, which resolves after first render) would leave a
   * table already rendered with `custom` filters stuck showing the stale
   * (empty) predicate result until some unrelated input change happened to
   * trigger change detection.
   */
  private readonly customFilterPredicate = signal<
    ((value: unknown, filter: unknown, filterLocale?: string) => boolean) | undefined
  >(undefined);

  /**
   * Registers the predicate the 'custom' FilterMatchMode dispatches to for
   * this UTable instance only (Spec §3.4.1's binding contract: Table-scoped,
   * reserved 'custom' key, replace-on-duplicate). No consuming application
   * code should assume this registration is visible to any other UTable
   * instance.
   */
  registerCustomFilter(fn: (value: unknown, filter: unknown, filterLocale?: string) => boolean): void {
    this.customFilterPredicate.set(fn);
  }

  /**
   * Internal paging cursor, reconciled from the `first` input via
   * `ngOnChanges` and mutated directly by `onPaginatorPageChange` —
   * mirrors `UPaginator`'s own `_first`/`ngOnChanges` pattern (see
   * `../paginator/paginator.ts`). A signal (not a plain field) so
   * `pagedValue`'s reactive read picks up `onPaginatorPageChange`'s
   * mutation under `OnPush` without a parent re-binding `first` back in —
   * required by the second Task 8 test, which clicks the real
   * `UPaginator`'s own next button directly and asserts the table's
   * rendered slice updates without the test itself re-setting `first`.
   */
  protected readonly _first = signal(0);

  /**
   * Internal edit-in-progress key-map, reconciled from the `editingRowKeys`
   * input via `ngOnChanges` — mirrors `_first`'s own internal-signal pattern
   * above so that `initRowEdit`/`saveRowEdit`/`cancelRowEdit` can update
   * local edit state immediately (driving `isRowEditing`'s template read
   * under `OnPush`) without requiring a parent to feed `editingRowKeysChange`
   * back into the `editingRowKeys` input in the same tick — matching every
   * existing consumer test's own expectation that the row-edit-init button
   * alone (with no simulated parent round-trip) opens the cell editor.
   */
  protected readonly _editingRowKeys = signal<Record<string, boolean>>({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) {
      this._first.set(changes["first"].currentValue);
    }
    if (changes["editingRowKeys"]) {
      this._editingRowKeys.set(changes["editingRowKeys"].currentValue ?? {});
    }
  }

  /**
   * Reads `field` off `row`, transparently substituting a committed
   * row-editing override (GAP-043, Spec §5.3 — see `committedOverrides`)
   * when `row`'s `dataKey()`-resolved identity has one, so every existing
   * caller (rendering, sorting, filtering, selection, grouping) sees a
   * saved edit without any parallel rendering path. A no-op when
   * `dataKey()` is unset (empty-string identity never matches a real
   * override key) or no edit has been committed for this row.
   */
  protected resolveCell(row: T, field: string): unknown {
    const dataKey = this.dataKey();
    if (dataKey) {
      const override = this.committedOverrides()[String((row as Record<string, unknown>)[dataKey])];
      if (override) return (override as Record<string, unknown>)[field];
    }
    return (row as Record<string, unknown>)[field];
  }

  /**
   * Resolves the post-edit row object for `row` — the same `committedOverrides`
   * entry `resolveCell` reads a single field from, above — so a caller that
   * needs the *whole* row (not just one field) sees a saved edit too. A no-op
   * (returns `row` itself) when `dataKey()` is unset or no edit has been
   * committed for this row, mirroring `resolveCell`'s own fallback.
   */
  private resolveRow(row: T): T {
    const dataKey = this.dataKey();
    if (dataKey) {
      const override = this.committedOverrides()[String((row as Record<string, unknown>)[dataKey])];
      if (override) return override;
    }
    return row;
  }

  /**
   * Fix-loop round 1 (GAP-043 review): `col.body` must see the same post-edit
   * merged row `resolveCell` already honors for the plain-value path — React's
   * and Vue's `effectiveValue` replace the row object itself via `.map()`, so
   * their `col.body` automatically receives the merged row; Angular's
   * equivalent override lives only in `committedOverrides`/`resolveCell`, so
   * `renderCell` must explicitly resolve the merged row before handing it to
   * `col.body`, or a custom renderer reading fields directly off `row` would
   * render stale pre-edit data after a save.
   */
  protected renderCell(row: T, col: UTableColumn<T>, rowIndex: number): unknown {
    return col.body
      ? col.body(this.resolveRow(row), { field: col.field, rowIndex })
      : this.resolveCell(row, col.field);
  }

  private compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  }

  /**
   * Tests one row's field value against a single `FilterMetadata`. Every
   * `FilterMatchMode` value is dispatched, including `custom`, which
   * resolves through the Table-scoped registration contract (Spec §3.4.1)
   * via `registerCustomFilter`/`customFilterPredicate`.
   */
  private matchesFilter(row: T, field: string, filter: FilterMetadata): boolean {
    const rawCellValue = this.resolveCell(row, field);
    const rawFilterValue = filter.value;
    const cellValue = String(rawCellValue ?? "").toLowerCase();
    const filterValue = String(rawFilterValue ?? "").toLowerCase();

    switch (filter.matchMode) {
      case "contains":
        return cellValue.includes(filterValue);
      case "startsWith":
        return cellValue.startsWith(filterValue);
      case "notContains":
        // Real PrimeNG filterservice.ts (matching PrimeReact's/PrimeVue's own
        // notContains): an absent/empty filter value passes through (matches
        // everything). String.prototype.includes("") is always true, so
        // without this guard `!cellValue.includes("")` would be false for
        // every row, hiding all of them instead of showing all of them.
        if (rawFilterValue === undefined || rawFilterValue === null || filterValue === "") return true;
        return !cellValue.includes(filterValue);
      case "endsWith":
        return cellValue.endsWith(filterValue);
      case "equals":
        return cellValue === filterValue;
      case "notEquals":
        // Real PrimeNG filterservice.ts: absent (undefined/null) OR an
        // empty/whitespace-only string filter value => false (no match).
        // String() does NOT trim, so we check rawFilterValue.trim() === "" to catch whitespace-only.
        if (
          rawFilterValue === undefined ||
          rawFilterValue === null ||
          (typeof rawFilterValue === "string" && rawFilterValue.trim() === "")
        )
          return false;
        return cellValue !== filterValue;
      case "lt":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) < (rawFilterValue as number | Date);
      case "lte":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) <= (rawFilterValue as number | Date);
      case "gt":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) > (rawFilterValue as number | Date);
      case "gte":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as number | Date) >= (rawFilterValue as number | Date);
      case "between": {
        const range = rawFilterValue as [unknown, unknown] | null | undefined;
        if (range == null || range[0] == null || range[1] == null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        const low = range[0] as number | Date;
        const high = range[1] as number | Date;
        return low <= (rawCellValue as number | Date) && (rawCellValue as number | Date) <= high;
      }
      case "in": {
        const options = rawFilterValue as unknown[] | null | undefined;
        if (options == null || options.length === 0) return true;
        return options.some((option) => equals(rawCellValue, option));
      }
      case "notIn": {
        const options = rawFilterValue as unknown[] | null | undefined;
        if (options == null || options.length === 0) return true;
        return !options.some((option) => equals(rawCellValue, option));
      }
      case "dateIs":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).toDateString() === (rawFilterValue as Date).toDateString();
      case "dateIsNot":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).toDateString() !== (rawFilterValue as Date).toDateString();
      case "dateBefore":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).getTime() < (rawFilterValue as Date).getTime();
      case "dateAfter":
        if (rawFilterValue === undefined || rawFilterValue === null) return true;
        if (rawCellValue === undefined || rawCellValue === null) return false;
        return (rawCellValue as Date).getTime() > (rawFilterValue as Date).getTime();
      case "custom": {
        const predicate = this.customFilterPredicate();
        if (!predicate) return false;
        // NEEDS IMPLEMENTATION-TIME VERIFICATION: filterLocale is passed as
        // undefined — FilterMetadata has no filterLocale field and Table has
        // no filterLocale input, so no real locale value exists in Table's
        // current data flow. Revisit once a Table-level locale input exists.
        return predicate(rawCellValue, rawFilterValue, undefined);
      }
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
   * Paginated view of `filteredValue` (filter-then-sort-then-paginate, per
   * spec §10 and both research reports' consistent pipeline ordering). When
   * `paginator()` is false, this falls back to the full `filteredValue`
   * result unsliced — critical for Tasks 2-7's existing tests, none of
   * which set `paginator`, to keep rendering every filtered/sorted row
   * unmodified.
   */
  protected get pagedValue(): T[] {
    if (!this.paginator()) return this.filteredValue;
    const first = this._first();
    return this.filteredValue.slice(first, first + this.rows());
  }

  /**
   * Row-grouping view (spec §13's confirmed algorithm): reuses the existing
   * sort machinery (`applySort`, Task 4) rather than a parallel comparator —
   * `groupRowsBy()` is injected as a synthetic leading `SortMeta` ahead of
   * any existing multi-sort meta, so rows sharing the same group value are
   * always adjacent in the result, then the rows are walked once comparing
   * each row's group value against the previous row's via `uix-data`'s
   * shared `equals` (2-arg form, i.e. `deepEquals` on the two resolved
   * scalar values — not the 3-arg `dataKey`-based identity form used for
   * selection) to detect group boundaries. Each boundary is flagged
   * `isGroupHeader: true` so the template can render a
   * `data-u-table-group-header` marker row ahead of it in `subheader` mode.
   * When `groupRowsBy()` is unset, this degrades to `pagedValue` unchanged
   * (no boundaries ever detected), preserving every prior task's ungrouped
   * rendering.
   *
   * `groupSize` (GAP-045) is the count of consecutive rows, starting at this
   * entry, that share this row's `groupRowsBy()` value — meaningful only on
   * an `isGroupHeader: true` entry (every other entry's own value is `1` but
   * unused by the template). It's computed via the same boundary detection
   * as `isGroupHeader` (a forward scan from each header to the next), so
   * `"rowspan"` mode's `[attr.rowspan]` binding reuses the identical group
   * boundaries `"subheader"` mode already renders — no parallel grouping
   * algorithm.
   */
  protected get groupedRows(): { row: T; isGroupHeader: boolean; groupSize: number }[] {
    const field = this.groupRowsBy();
    if (!field) return this.pagedValue.map((row) => ({ row, isGroupHeader: false, groupSize: 1 }));

    const meta: SortMeta[] = [{ field, order: 1 }, ...this.multiSortMeta()];
    const rows = this.applyMultiFieldSort([...this.pagedValue], meta);

    const withHeaders = rows.map((row, index) => {
      const previous = rows[index - 1];
      const isGroupHeader =
        index === 0 || !equals(this.resolveCell(row, field), this.resolveCell(previous, field));
      return { row, isGroupHeader, groupSize: 1 };
    });

    let currentHeaderIndex = -1;
    withHeaders.forEach((entry, index) => {
      if (entry.isGroupHeader) {
        currentHeaderIndex = index;
      } else if (currentHeaderIndex !== -1) {
        withHeaders[currentHeaderIndex].groupSize++;
      }
    });

    return withHeaders;
  }

  /**
   * Wired to the real `UPaginator`'s `onPageChange` output. Per spec §4.1's
   * always-internal-plus-emit convention: `_first` is updated internally
   * first (so `pagedValue` reflects the new page immediately, matching
   * `UPaginator`'s own internal-state-first pattern), then `firstChange`/
   * `rowsChange` are emitted so a parent using two-way/banana-in-a-box
   * binding (`[(first)]`/`[(rows)]`) stays in sync.
   */
  protected onPaginatorPageChange(event: PaginatorPageChangeEvent): void {
    this._first.set(event.first);
    this.firstChange.emit(event.first);
    this.rowsChange.emit(event.rows);
  }

  /**
   * Re-emits the real `UScroller`'s own `onLazyLoad` payload shape
   * unchanged, matching Table's own `onLazyLoad` output contract (Interfaces
   * section: "output `onLazyLoad`").
   */
  protected onScrollerLazyLoad(event: { first: number; last: number }): void {
    this.onLazyLoad.emit(event);
  }

  /**
   * Row-editing lifecycle entry point (spec §11.1's key-map idiom): marks
   * `row`'s `dataKey()`-resolved identity as editing by adding it to
   * `editingRowKeys()` and emitting the merged map via
   * `editingRowKeysChange` — no separate dirty-value store. Cell-level
   * `.ng-invalid.ng-dirty` DOM-validity checking and a full reactive-forms
   * cell editor are explicitly out of scope for this task (spec §11.1:
   * GAP-018/reactive-forms integration is a consumer/example concern, not a
   * Table core blocker).
   *
   * `event` is optional (public API callers, like the pre-existing
   * `initRowEdit(row)` direct-invocation test, don't have to supply one) —
   * when supplied, `stopPropagation()` is called (Important finding 1,
   * fix-loop integration review) so the enclosing row's own
   * `(click)="onRowClick(...)"` doesn't also fire and toggle selection,
   * mirroring `onSelectionInputClick`'s own established convention.
   */
  initRowEdit(row: T, event?: Event): void {
    event?.stopPropagation();
    const key = String(this.resolveCell(row, this.dataKey()));
    const next = { ...this._editingRowKeys(), [key]: true };
    this._editingRowKeys.set(next);
    this.editingRowKeysChange.emit(next);
  }

  /**
   * Per-row draft values for in-progress edits (GAP-043, Spec §5.3), keyed
   * by `dataKey()`-resolved row identity and then by field — never the live
   * `value()` array, so keystrokes in the cell editor's `<input>` do not
   * mutate source data until `saveRowEdit` explicitly commits them. A
   * signal (not a plain field) so template reads under `OnPush` re-render on
   * every keystroke, matching `customFilterPredicate`'s own signal rationale
   * above.
   */
  private readonly editDrafts = signal<Record<string, Record<string, unknown>>>({});

  /**
   * True when `row`'s `dataKey()`-resolved identity is present in
   * `editingRowKeys()` (spec §11.1's key-map idiom) — drives whether each
   * column's cell renders the plain `renderCell` output or the editable
   * `data-u-table-cell-editor` input.
   */
  protected isRowEditing(row: T): boolean {
    const key = String(this.resolveCell(row, this.dataKey()));
    return !!this._editingRowKeys()[key];
  }

  /**
   * Reads a field's current draft value for `row`, falling back to the live
   * cell value the first time the row enters edit mode (before any keystroke
   * has populated `editDrafts`).
   */
  protected draftValue(row: T, field: string): unknown {
    const key = String(this.resolveCell(row, this.dataKey()));
    const rowDraft = this.editDrafts()[key];
    return rowDraft && field in rowDraft ? rowDraft[field] : this.resolveCell(row, field);
  }

  /**
   * Updates one field's draft value for `row` from the cell editor
   * `<input>`'s `(input)` event, without touching `value()` at all (Spec
   * §5.3's "edits must not mutate the source data until explicitly saved"
   * contract).
   */
  protected onDraftInput(row: T, field: string, event: Event): void {
    const key = String(this.resolveCell(row, this.dataKey()));
    const target = event.target as HTMLInputElement;
    const current = this.editDrafts();
    this.editDrafts.set({
      ...current,
      [key]: { ...current[key], [field]: target.value },
    });
  }

  /**
   * Row-level committed-value overrides (GAP-043, Spec §5.3): `value()` is a
   * parent-owned `input()` with no corresponding `valueChange` output on
   * this component (Table's declared event surface for row editing is
   * `editingRowKeysChange` alone), so a save commits by recording a fresh,
   * immutably-built row (new object, matching this codebase's established
   * immutable-update convention everywhere else) keyed by `dataKey()`
   * identity. `resolveCell` consults this map first — see below — so every
   * existing reader (render, sort, filter, selection, grouping) transparently
   * sees the committed value with no parallel rendering path and no mutation
   * of the `value()` array itself.
   */
  private readonly committedOverrides = signal<Record<string, T>>({});

  /**
   * Commits `row`'s accumulated draft values by replacing the whole row with
   * a new object (immutable update) stored in `committedOverrides`, then
   * exits edit mode: the row's key is removed from `editingRowKeys()` and
   * the merged map is emitted via `editingRowKeysChange`.
   *
   * `event` is optional, same rationale as `initRowEdit`'s own doc comment —
   * when supplied, `stopPropagation()` is called (Important finding 1) so
   * the enclosing row's `(click)="onRowClick(...)"` doesn't also fire.
   */
  protected saveRowEdit(row: T, event?: Event): void {
    event?.stopPropagation();
    const key = String(this.resolveCell(row, this.dataKey()));
    const draft = this.editDrafts()[key];
    if (draft) {
      const committedRow = { ...(this.committedOverrides()[key] ?? row), ...draft } as T;
      this.committedOverrides.set({ ...this.committedOverrides(), [key]: committedRow });
    }
    this.exitRowEdit(row);
  }

  /**
   * Discards `row`'s draft (no mutation to `value()` or `committedOverrides`
   * at all) and exits edit mode the same way `saveRowEdit` does. `event` is
   * optional, same rationale as `initRowEdit`'s own doc comment.
   */
  protected cancelRowEdit(row: T, event?: Event): void {
    event?.stopPropagation();
    this.exitRowEdit(row);
  }

  private exitRowEdit(row: T): void {
    const key = String(this.resolveCell(row, this.dataKey()));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit the row's key
    const { [key]: _discardedDraft, ...remainingDrafts } = this.editDrafts();
    this.editDrafts.set(remainingDrafts);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit the row's key
    const { [key]: _wasEditing, ...remainingKeys } = this._editingRowKeys();
    this._editingRowKeys.set(remainingKeys);
    this.editingRowKeysChange.emit(remainingKeys);
  }

  /**
   * Row-expansion state check (GAP-044, Spec §5.4), matching the existing
   * `editingRowKeys()`-style key-map read: a row is expanded when its
   * `dataKey()`-resolved identity is present (truthy) in `expandedRowKeys()`.
   */
  protected isRowExpanded(row: T): boolean {
    const key = String(this.resolveCell(row, this.dataKey()));
    return !!this.expandedRowKeys()[key];
  }

  /**
   * Row-expansion toggle (GAP-044, Spec §5.4), reusing the same key-map
   * read/write pattern already established by `initRowEdit`/
   * `editingRowKeys`: the row's `dataKey()`-resolved identity is flipped in
   * a shallow-copied map (spread, so a duplicate `dataKey` value across two
   * rows is last-write-wins — no new uniqueness validation, matching Review
   * Focus item 5 and the existing selection key-map's own precedent), the
   * merged map is emitted via `expandedRowKeysChange`, and `onRowExpand`/
   * `onRowCollapse` fire according to the row's new state.
   *
   * `stopPropagation()` (Important finding 1, fix-loop integration review)
   * so the enclosing row's own `(click)="onRowClick(...)"` doesn't also fire
   * and toggle selection, mirroring `onSelectionInputClick`'s own
   * established convention.
   */
  protected toggleRowExpansion(event: Event, row: T): void {
    event.stopPropagation();
    const key = String(this.resolveCell(row, this.dataKey()));
    const wasExpanded = !!this.expandedRowKeys()[key];
    const next = { ...this.expandedRowKeys(), [key]: !wasExpanded };
    this.expandedRowKeysChange.emit(next);

    if (wasExpanded) {
      this.onRowCollapse.emit({ originalEvent: event, data: row });
    } else {
      this.onRowExpand.emit({ originalEvent: event, data: row });
    }
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
      return this.applyMultiFieldSort(rows, meta);
    }

    const field = this.sortField();
    const order = this.sortOrder();
    if (!field || order === 0) return rows;
    return rows.sort(
      (a, b) => this.compareValues(this.resolveCell(a, field), this.resolveCell(b, field)) * order,
    );
  }

  /**
   * Shared multi-field comparator, extracted from `applySort`'s
   * `"multiple"` branch so `groupedRows` can drive the same priority-order
   * comparison logic with a synthetic leading `SortMeta` (Task 10) without
   * duplicating it — `applySort` itself still owns reading `multiSortMeta()`
   * from table state, this helper only owns the comparison given an
   * explicit `meta` array.
   */
  private applyMultiFieldSort(rows: T[], meta: SortMeta[]): T[] {
    return rows.sort((a, b) => {
      for (const { field, order } of meta) {
        const result = this.compareValues(this.resolveCell(a, field), this.resolveCell(b, field));
        if (result !== 0) return result * order;
      }
      return 0;
    });
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
    this.toggleSelection(row);
  }

  /**
   * Shared row-selection-toggle logic (GAP-042, Spec §5.2), extracted from
   * `onRowClick` so the new checkbox/radio selection-column controls
   * reuse the exact same toggle behavior rather than duplicating it.
   */
  private toggleSelection(row: T): void {
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
   * Selection-column checkbox/radio click handler (GAP-042, Spec §5.2):
   * stops propagation so the enclosing row's own `(click)="onRowClick(...)"`
   * handler doesn't also fire and double-toggle the same row, then delegates
   * to the shared `toggleSelection` logic.
   */
  protected onSelectionInputClick(event: Event, row: T): void {
    event.stopPropagation();
    this.toggleSelection(row);
  }

  /**
   * Header select-all checkbox state (GAP-042, Spec §5.2): checked only when
   * there is at least one row and every row is currently selected — an empty
   * `value()` is never considered "all selected".
   */
  protected get allSelected(): boolean {
    const rows = this.value();
    return rows.length > 0 && rows.every((row) => this.isSelected(row));
  }

  /**
   * Header select-all checkbox click handler (GAP-042, Spec §5.2): selects
   * every row in `value()` if not all are already selected, otherwise
   * deselects all (clears the selection).
   */
  protected toggleAllSelection(): void {
    const next = this.allSelected ? [] : [...this.value()];
    this.selectionChange.emit(next);
  }

  /**
   * Keyboard-equivalent path for row navigation (spec §15's confirmed
   * ArrowDown/ArrowUp/Home/End baseline), matching real PrimeNG's
   * `table.ts:3918-4014` row-keydown convention. Only moves `.focus()`
   * between `tbody [role="row"]` elements — never the header row, since
   * this handler is bound per data row, not delegated from a host
   * listener spanning the whole table.
   *
   * Also handles keyboard selection (GAP-047, Spec §5.7): Space/Enter
   * toggle the focused row's selection via the same `toggleSelection`
   * logic the row-click handler and selection-column controls already
   * share (no duplicated toggle logic), and Ctrl+A/Cmd+A selects every row
   * in `value()` when `selectionMode()` is exactly `"multiple"`. When
   * `selectionMode()` is not `"multiple"` (including unset), Ctrl+A does
   * nothing and does not call `preventDefault()` — the browser's native
   * "select all text" behavior is only swallowed when Ctrl+A actually did
   * something (Review Focus item 3).
   *
   * Important finding 2 (fix-loop integration review): the Space/Enter/
   * Ctrl+A branches only apply when the keydown genuinely originated from
   * the row element itself (`event.target === event.currentTarget`) — not
   * when it bubbled up from a child control (the cell-editor `<input>`, or
   * the expand/edit/save/cancel buttons). Without this guard, typing a space
   * in the editor input got swallowed into a row-selection toggle instead of
   * appearing in the input, Ctrl+A selected all rows instead of the input's
   * text, and Space/Enter on a focused button got hijacked instead of
   * activating the button. Arrow/Home/End navigation below is unaffected —
   * it already only moves focus among sibling rows and only actually acts
   * when the focused row element is found in the row list, so a bubbled
   * event from a child control that isn't itself a `[role="row"]` is
   * already a no-op there.
   */
  protected onRowKeyDown(event: KeyboardEvent, row: T): void {
    if (event.target !== event.currentTarget) {
      if ((event.ctrlKey || event.metaKey) && event.code === "KeyA") return;
      if (event.code === "Space" || event.code === "Enter") return;
    }

    if ((event.ctrlKey || event.metaKey) && event.code === "KeyA") {
      if (this.selectionMode() === "multiple") {
        event.preventDefault();
        this.selectionChange.emit([...this.value()]);
      }
      return;
    }

    if (event.code === "Space" || event.code === "Enter") {
      if (this.selectionMode()) {
        event.preventDefault();
        this.toggleSelection(row);
      }
      return;
    }

    const rowElement = event.currentTarget as HTMLElement;
    const rowGroup = rowElement.parentElement;
    if (!rowGroup) return;

    const rows = Array.from(rowGroup.querySelectorAll<HTMLElement>(':scope > [role="row"]'));
    const index = rows.indexOf(rowElement);
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
