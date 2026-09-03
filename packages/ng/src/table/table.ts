import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import type { SortMeta, SortMode } from "@ultimate/uix-data";
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
          @for (row of sortedValue; track $index) {
            <tr [class]="cx('row')" role="row">
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
   * Clones `value()` (`[...this.value()]`) before sorting so the caller's
   * input array is never mutated in place, then applies either single-field
   * (`sortField`/`sortOrder`) or multi-field (`multiSortMeta`, entries
   * applied in priority order — first entry is primary key) sort depending
   * on `sortMode()`.
   */
  protected get sortedValue(): T[] {
    const rows = [...this.value()];

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

  protected onSort(field: string): void {
    if (this.sortMode() === "multiple") {
      const meta = [...this.multiSortMeta()];
      const index = meta.findIndex((m) => m.field === field);
      if (index === -1) {
        meta.push({ field, order: 1 });
      } else {
        const nextOrder = this.nextOrder(meta[index].order);
        if (nextOrder === 0) {
          meta.splice(index, 1);
        } else {
          meta[index] = { field, order: nextOrder };
        }
      }
      this.multiSortMetaChange.emit(meta);
      return;
    }

    const nextOrder = this.sortField() === field ? this.nextOrder(this.sortOrder()) : 1;
    this.sortFieldChange.emit(field);
    this.sortOrderChange.emit(nextOrder);
  }

  private nextOrder(current: 1 | 0 | -1): 1 | 0 | -1 {
    if (current === 1) return -1;
    if (current === -1) return 0;
    return 1;
  }
}
