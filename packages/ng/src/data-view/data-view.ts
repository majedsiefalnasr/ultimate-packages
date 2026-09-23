import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UPaginator, type PaginatorPageChangeEvent } from "../paginator/paginator";
import { dataViewStyleModule } from "./data-view-style";

type MatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "in"
  | "lt"
  | "lte"
  | "gt"
  | "gte";

function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value != null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      item
    );
}

function matches(value: unknown, query: unknown, mode: MatchMode, locale?: string): boolean {
  if (query == null || query === "") return true;
  const text = (entry: unknown) => String(entry ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in")
    return Array.isArray(query) && query.some((entry) => text(value) === text(entry));
  if (value == null) return mode === "notEquals";
  switch (mode) {
    case "contains":
      return text(value).includes(text(query));
    case "startsWith":
      return text(value).startsWith(text(query));
    case "endsWith":
      return text(value).endsWith(text(query));
    case "equals":
      return text(value) === text(query);
    case "notEquals":
      return text(value) !== text(query);
    case "lt":
      return Number(value) < Number(query);
    case "lte":
      return Number(value) <= Number(query);
    case "gt":
      return Number(value) > Number(query);
    case "gte":
      return Number(value) >= Number(query);
  }
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  return typeof a === "number" && typeof b === "number"
    ? a - b
    : String(a).localeCompare(String(b));
}

@Component({
  selector: "u-data-view",
  standalone: true,
  imports: [UPaginator],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="cx('root')" [attr.aria-busy]="loading()">
      @if (loading()) {
        <span role="status" [class]="loadingIcon()">Loading</span>
      }
      @if (showPaginator() && paginatorPosition() !== "bottom") {
        <u-paginator
          [first]="pageFirst()"
          [rows]="pageRows()"
          [totalRecords]="recordCount()"
          [pageLinkSize]="pageLinkSize()"
          (onPageChange)="onPageChange($event)"
        />
      }
      @if (layout() === "grid") {
        <div [class]="cx('list', { layout: 'grid' })" role="list">
          @for (item of pageValue(); track identity($index, item)) {
            <div [class]="cx('listItem')" role="listitem">{{ itemTemplate()(item, "grid") }}</div>
          } @empty {
            <div>{{ emptyMessage() }}</div>
          }
        </div>
      } @else {
        <ul [class]="cx('list', { layout: 'list' })">
          @for (item of pageValue(); track identity($index, item)) {
            <li [class]="cx('listItem')">{{ itemTemplate()(item, "list") }}</li>
          } @empty {
            <li>{{ emptyMessage() }}</li>
          }
        </ul>
      }
      @if (showPaginator() && paginatorPosition() !== "top") {
        <u-paginator
          [first]="pageFirst()"
          [rows]="pageRows()"
          [totalRecords]="recordCount()"
          [pageLinkSize]="pageLinkSize()"
          (onPageChange)="onPageChange($event)"
        />
      }
      @if (paginator()) {
        @if (rowsPerPageOptions().length) {
          <label
            >Rows per page
            <select [value]="pageRows()" (change)="changeRows(+$any($event.target).value)">
              @for (size of rowsPerPageOptions(); track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </label>
        }
        <span aria-live="polite">{{ report() }}</span>
      }
    </div>
  `,
})
export class UDataView<T = unknown> extends UBaseComponent implements OnChanges {
  protected override readonly componentName = "data-view";
  protected override readonly styleModule = dataViewStyleModule;

  value = input<T[]>([]);
  itemTemplate = input.required<(item: T, layout: "list" | "grid") => string>();
  layout = input<"list" | "grid">("list");
  paginator = input(false, { transform: booleanAttribute });
  first = input(0);
  rows = input(0);
  totalRecords = input<number>();
  pageLinkSize = input(5);
  rowsPerPageOptions = input<number[]>([]);
  paginatorPosition = input<"top" | "bottom" | "both">("bottom");
  alwaysShowPaginator = input(true, { transform: booleanAttribute });
  currentPageReportTemplate = input("{first} to {last} of {totalRecords}");
  sortField = input("");
  sortOrder = input<1 | -1>(1);
  lazy = input(false, { transform: booleanAttribute });
  loading = input(false, { transform: booleanAttribute });
  loadingIcon = input("u-loading-icon");
  emptyMessage = input("No results found");
  dataKey = input("");
  trackBy = input<(index: number, item: T) => unknown>((_index, item) => item);
  filterBy = input("");
  filterLocale = input<string>();

  pageChange = output<PaginatorPageChangeEvent>();
  onLazyLoad = output<{ first: number; rows: number; sortField: string; sortOrder: 1 | -1 }>();

  protected readonly pageFirst = signal(0);
  protected readonly pageRows = signal(0);
  private readonly query = signal<unknown>("");
  private readonly matchMode = signal<MatchMode>("contains");

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["first"]) this.pageFirst.set(this.first());
    if (changes["rows"]) this.pageRows.set(this.rows());
    if (
      this.lazy() &&
      (changes["first"] ||
        changes["rows"] ||
        changes["sortField"] ||
        changes["sortOrder"] ||
        changes["lazy"])
    ) {
      this.emitLazy();
    }
  }

  filter(query: unknown, mode: MatchMode = "contains"): void {
    this.query.set(query);
    this.matchMode.set(mode);
    this.pageFirst.set(0);
    if (this.lazy()) this.emitLazy();
  }

  protected readonly processed = computed(() => {
    if (this.lazy()) return this.value();
    const fields = this.filterBy()
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    const filtered = fields.length
      ? this.value().filter((item) =>
          fields.some((key) =>
            matches(field(item, key), this.query(), this.matchMode(), this.filterLocale())
          )
        )
      : this.value();
    const rows = [...filtered];
    return this.sortField()
      ? rows.sort(
          (a, b) =>
            compare(field(a, this.sortField()), field(b, this.sortField())) * this.sortOrder()
        )
      : rows;
  });

  protected readonly recordCount = computed(() =>
    this.lazy() ? (this.totalRecords() ?? this.value().length) : this.processed().length
  );
  protected readonly pageValue = computed(() =>
    this.lazy() || !this.paginator() || this.pageRows() <= 0
      ? this.processed()
      : this.processed().slice(this.pageFirst(), this.pageFirst() + this.pageRows())
  );
  protected readonly showPaginator = computed(
    () => this.paginator() && (this.alwaysShowPaginator() || this.recordCount() > this.pageRows())
  );

  protected identity(index: number, item: T): unknown {
    return this.dataKey() ? field(item, this.dataKey()) : this.trackBy()(index, item);
  }

  protected report(): string {
    const count = this.recordCount();
    const first = count ? this.pageFirst() + 1 : 0;
    const last = Math.min(this.pageFirst() + this.pageRows(), count);
    const pageCount = this.pageRows() > 0 ? Math.ceil(count / this.pageRows()) : 0;
    const values: Record<string, number> = {
      first,
      last,
      totalRecords: count,
      currentPage: pageCount ? Math.floor(this.pageFirst() / this.pageRows()) + 1 : 0,
      totalPages: pageCount,
      rows: this.pageRows(),
    };
    return this.currentPageReportTemplate().replace(
      /\{(first|last|totalRecords|currentPage|totalPages|rows)\}/g,
      (_, name: string) => String(values[name])
    );
  }

  protected onPageChange(event: PaginatorPageChangeEvent): void {
    this.pageFirst.set(event.first);
    this.pageRows.set(event.rows);
    this.pageChange.emit(event);
    if (this.lazy()) this.emitLazy();
  }

  protected changeRows(rows: number): void {
    if (rows <= 0) return;
    this.onPageChange({ first: 0, rows, page: 0, pageCount: Math.ceil(this.recordCount() / rows) });
  }

  private emitLazy(): void {
    this.onLazyLoad.emit({
      first: this.pageFirst(),
      rows: this.pageRows(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
    });
  }
}
