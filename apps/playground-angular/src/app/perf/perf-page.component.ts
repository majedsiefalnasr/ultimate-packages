import { ChangeDetectionStrategy, Component, signal, viewChild } from "@angular/core";
import {
  UButton,
  UDataView,
  UDatePicker,
  UDialog,
  UDrawer,
  UInputText,
  UMenu,
  UPopover,
  UScroller,
  USelect,
  UTable,
} from "@ultimate/ng";
import {
  INITIAL_STATE,
  ITEMS_10K,
  MENU_MODEL,
  ROWS_100,
  ROWS_1000,
  ROWS_10K,
  ROW_HEIGHT,
  SELECT_OPTIONS,
  TABLE_COLUMNS,
  TABLE_FILTER,
  TABLE_SORT,
  subjectFromLocation,
} from "../../../../../scripts/perf/browser/harness";
import type { PerfRow, PerfState } from "../../../../../scripts/perf/browser/harness";

/**
 * Client-only ADR-057 Stage 1 perf page (`/perf/<subject>`), built by the
 * `build-perf` target into dist/perf. It is separate from the SSR proof page
 * (proof-page.component.ts), which it does not import. The host element is
 * `#perf-root`; OrganizationChart has no Angular component ("not built").
 */
@Component({
  selector: "app-perf-page",
  standalone: true,
  imports: [
    UButton,
    UDataView,
    UDatePicker,
    UDialog,
    UDrawer,
    UInputText,
    UMenu,
    UPopover,
    UScroller,
    USelect,
    UTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state().mounted) {
      @switch (subject) {
        @case ("button") {
          <u-button label="Perf Button" />
        }
        @case ("inputtext") {
          <input uInputText />
        }
        @case ("select") {
          <u-select
            [options]="options"
            optionLabel="label"
            optionValue="value"
            placeholder="Select"
          />
        }
        @case ("datepicker") {
          <u-date-picker />
        }
        @case ("dialog") {
          <div>
            <button type="button" data-perf-trigger (click)="setVisible(true)">Open</button>
            <u-dialog
              header="Perf Dialog"
              [visible]="state().visible"
              (visibleChange)="setVisible($event)"
            >
              Dialog body
            </u-dialog>
          </div>
        }
        @case ("drawer") {
          <div>
            <button type="button" data-perf-trigger (click)="setVisible(true)">Open</button>
            <u-drawer
              header="Perf Drawer"
              [visible]="state().visible"
              (visibleChange)="setVisible($event)"
            >
              Drawer body
            </u-drawer>
          </div>
        }
        @case ("popover") {
          <div>
            <button type="button" data-perf-trigger (click)="popover()?.toggle($event)"
              >Open</button
            >
            <u-popover>Popover body</u-popover>
          </div>
        }
        @case ("menu") {
          <div>
            <button type="button" data-perf-trigger (click)="menu()?.toggle($event)">Open</button>
            <u-menu [model]="menuModel" [popup]="true" />
          </div>
        }
        @case ("table-100") {
          <u-table
            [value]="rows100"
            [columns]="columns"
            [sortField]="sorted() ? sort.field : ''"
            [sortOrder]="sorted() ? sort.order : 0"
            [filters]="filtered() ? filter : {}"
          />
        }
        @case ("table-1000") {
          <u-table
            [value]="rows1000"
            [columns]="columns"
            [sortField]="sorted() ? sort.field : ''"
            [sortOrder]="sorted() ? sort.order : 0"
            [filters]="filtered() ? filter : {}"
          />
        }
        @case ("table-virtual-10k") {
          <u-table
            [value]="rows10k"
            [columns]="columns"
            [virtualScroll]="true"
            [virtualScrollItemSize]="rowHeight"
          />
        }
        @case ("scroller-10k") {
          <u-scroller [items]="items10k" [itemSize]="rowHeight" />
        }
        @case ("dataview") {
          <u-data-view [value]="rows1000" [itemTemplate]="itemTemplate" />
        }
      }
    }
  `,
})
export class PerfPageComponent {
  readonly subject = subjectFromLocation() ?? "";
  readonly state = signal<PerfState>(INITIAL_STATE);
  readonly popover = viewChild(UPopover);
  readonly menu = viewChild(UMenu);
  readonly select = viewChild(USelect);

  protected readonly options = SELECT_OPTIONS;
  protected readonly menuModel = MENU_MODEL;
  protected readonly rows100 = ROWS_100;
  protected readonly rows1000 = ROWS_1000;
  protected readonly rows10k = ROWS_10K;
  protected readonly items10k = ITEMS_10K;
  protected readonly columns = TABLE_COLUMNS;
  protected readonly rowHeight = ROW_HEIGHT;
  protected readonly sort = TABLE_SORT;
  protected readonly filter = TABLE_FILTER;
  protected readonly itemTemplate = (row: PerfRow) => row.name;

  protected sorted(): boolean {
    return this.state().updated === "sort";
  }

  protected filtered(): boolean {
    return this.state().updated === "filter";
  }

  setVisible(visible: boolean): void {
    this.state.update((current) => ({ ...current, visible }));
  }
}
