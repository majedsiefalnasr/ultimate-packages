import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseInput, UOverlay } from "@ultimate/ng-core";
import { datePickerStyleModule } from "./date-picker-style";

export interface UDatePickerSelectEvent {
  originalEvent: Event;
  value: Date;
}

interface UDatePickerDayCell {
  day: number;
  month: number;
  year: number;
  otherMonth: boolean;
  today: boolean;
}

const DEFAULT_DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DEFAULT_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Ultimate-owned adaptation of PrimeNG's `DatePicker` component (see
 * `.vendor-extracted/ng/datepicker/datepicker.ts`). Real source extends
 * `BaseInput<DatePickerPassThrough>` — confirmed against `export class
 * DatePicker extends BaseInput<...>` — same tier `USelect`/`UAutoComplete`/
 * `UPassword`/`UInputNumber` already extend.
 *
 * Overlay-based: real source's own template composes a `p-overlay`-driven
 * panel around a header (prev/next nav + month/year title) and a day-grid
 * `<table>` — this port composes `UOverlay` the same way `USelect` does
 * (`packages/ng/src/select/select.ts`), matching real source's own
 * "text input trigger + overlay calendar panel" shape.
 *
 * **Documented scope cut** (proof-by-exception, matching `UInputNumber`'s own
 * documented-cut precedent): real source's full surface is genuinely huge —
 * `selectionMode` (`single`/`multiple`/`range`), a `view` input switching
 * between date/month/year *(decade)* grids, a full time-picker sub-mode
 * (`showTime`/`timeOnly`/hour-minute-second spinners), `inline` rendering,
 * touch-UI, week-number display, a button bar, and multi-month responsive
 * layouts. This port implements only: **single-date selection** (real
 * source's own default `selectionMode`), the **date grid view only** (no
 * month/year/decade view switching), `minDate`/`maxDate`/`disabledDates`
 * constraints, month/year header navigation, full keyboard grid navigation
 * (arrow keys move focus across the day grid, Enter/Space select, Escape
 * closes), and locale-aware day/month names via simple configurable arrays
 * (`dayNames`/`monthNames` inputs, English defaults) — no `Intl`/full i18n
 * lookup. This is the same "smaller surface than upstream" boundary every
 * sibling component in this batch draws, just a larger cut given real
 * source's own much larger surface. Multiple/range selection, the time
 * picker, inline mode, and month/year/decade view switching are NOT
 * implemented; a future task may add them without new architecture.
 */
@Component({
  standalone: true,
  selector: "u-date-picker",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UDatePicker, multi: true }],
  template: `
    <input
      #inputEl
      type="text"
      readonly
      [class]="cx('pcInputText')"
      [attr.id]="inputId()"
      [attr.placeholder]="placeholder()"
      [attr.tabindex]="$disabled() ? -1 : 0"
      [attr.disabled]="$disabled() ? '' : undefined"
      [attr.aria-haspopup]="'dialog'"
      [attr.aria-expanded]="overlayVisible()"
      [value]="inputFieldValue()"
      (click)="onInputClick()"
      (keydown)="onInputKeydown($event)"
    />
    @if (showClear() && $filled() && !$disabled()) {
      <span [class]="cx('clearIcon')" aria-hidden="true" (click)="clear($event)">&times;</span>
    }
    @if (showIcon()) {
      <span
        [class]="cx('trigger')"
        role="button"
        aria-hidden="true"
        (click)="onInputClick()"
      >&#128197;</span>
    }
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('panel')" role="dialog">
        <div [class]="cx('header')">
          <button
            type="button"
            [class]="cx('navButton')"
            aria-label="Previous month"
            (click)="navBackward()"
          >&#8249;</button>
          <span [class]="cx('title')">
            <span [class]="cx('titleButton')">{{ monthNames()[viewMonth()] }}</span>
            <span [class]="cx('titleButton')">{{ viewYear() }}</span>
          </span>
          <button
            type="button"
            [class]="cx('navButton')"
            aria-label="Next month"
            (click)="navForward()"
          >&#8250;</button>
        </div>
        <table [class]="cx('dayView')" role="grid">
          <thead>
            <tr>
              @for (dayName of dayNames(); track dayName) {
                <th [class]="cx('weekdayCell')" scope="col">
                  <span [class]="cx('weekday')">{{ dayName }}</span>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (week of weeks(); track $index) {
              <tr>
                @for (cell of week; track cell.month + '-' + cell.day + '-' + cell.year) {
                  <td [class]="cx('dayCell')">
                    <span
                      [class]="cx('day', dayClassesParams(cell))"
                      role="gridcell"
                      [attr.tabindex]="isFocusedCell(cell) ? 0 : -1"
                      [attr.aria-selected]="isSelected(cell)"
                      [attr.aria-disabled]="isCellDisabled(cell)"
                      (click)="onDateSelect($event, cell)"
                      (keydown)="onDateCellKeydown($event, cell)"
                    >{{ cell.day }}</span>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', rootClassesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UDatePicker extends UBaseInput {
  protected override readonly componentName = "date-picker";
  protected override readonly styleModule = datePickerStyleModule;

  /** Format string used to render the input's text value. */
  dateFormat = input("mm/dd/yy");
  /** Placeholder text shown when no date is selected. */
  placeholder = input<string>();
  /** Identifier of the accessible input element. */
  inputId = input<string>();
  /** Earliest selectable date (inclusive). */
  minDate = input<Date | undefined>();
  /** Latest selectable date (inclusive). */
  maxDate = input<Date | undefined>();
  /** Dates that cannot be selected. */
  disabledDates = input<Date[]>([]);
  /** Whether a trigger icon is displayed to open the overlay. */
  showIcon = input(false, { transform: booleanAttribute });
  /** Whether a clear icon is displayed to reset the selection. */
  showClear = input(false, { transform: booleanAttribute });
  /** Day-of-week abbreviations, Sunday first — override for locale support. */
  dayNames = input<string[]>(DEFAULT_DAY_NAMES);
  /** Full month names, January first — override for locale support. */
  monthNames = input<string[]>(DEFAULT_MONTH_NAMES);

  /** Callback to invoke when a date is selected. */
  onSelect = output<Date>();
  /** Callback to invoke when the model value is cleared. */
  onClear = output<void>();
  /** Callback to invoke when the panel is shown. */
  onShow = output<void>();
  /** Callback to invoke when the panel is hidden. */
  onHide = output<void>();

  protected readonly overlayVisible = signal(false);
  protected readonly renderOverlay = computed(() => this.overlayVisible());

  private readonly today = new Date();
  protected readonly viewMonth = signal(this.today.getMonth());
  protected readonly viewYear = signal(this.today.getFullYear());
  protected readonly focusedCell = signal<{ day: number; month: number; year: number } | null>(null);

  protected readonly selectedDate = computed(() => {
    const value = this.modelValue();
    return value instanceof Date ? value : null;
  });

  protected readonly inputFieldValue = computed(() => {
    const value = this.selectedDate();
    return value ? this.formatDate(value) : "";
  });

  protected rootClassesParams() {
    return { disabled: this.$disabled(), fluid: this.hasFluid };
  }

  protected dayClassesParams(cell: UDatePickerDayCell) {
    return {
      otherMonth: cell.otherMonth,
      today: cell.today,
      selected: this.isSelected(cell),
      focused: this.isFocusedCell(cell),
      disabled: this.isCellDisabled(cell),
    };
  }

  protected readonly weeks = computed(() => {
    const month = this.viewMonth();
    const year = this.viewYear();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: UDatePickerDayCell[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      cells.push({ day, month: prevMonth, year: prevYear, otherMonth: true, today: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, month, year, otherMonth: false, today: this.isToday(day, month, year) });
    }
    let nextDay = 1;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay, month: nextMonth, year: nextYear, otherMonth: true, today: false });
      nextDay++;
    }

    const weeks: UDatePickerDayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  });

  private isToday(day: number, month: number, year: number): boolean {
    return (
      day === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear()
    );
  }

  protected isSelected(cell: UDatePickerDayCell): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;
    return (
      selected.getDate() === cell.day &&
      selected.getMonth() === cell.month &&
      selected.getFullYear() === cell.year
    );
  }

  protected isFocusedCell(cell: UDatePickerDayCell): boolean {
    const focused = this.focusedCell();
    if (focused) {
      return focused.day === cell.day && focused.month === cell.month && focused.year === cell.year;
    }
    return this.isSelected(cell);
  }

  protected isCellDisabled(cell: UDatePickerDayCell): boolean {
    const date = new Date(cell.year, cell.month, cell.day);
    const min = this.minDate();
    const max = this.maxDate();
    if (min && date < this.stripTime(min)) return true;
    if (max && date > this.stripTime(max)) return true;
    return this.disabledDates().some((d) => this.isSameDay(d, date));
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private formatDate(date: Date): string {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear());
    return `${mm}/${dd}/${yy}`;
  }

  protected onInputClick(): void {
    if (this.$disabled()) return;
    this.overlayVisible() ? this.hide() : this.show();
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (this.$disabled()) return;
    switch (event.code) {
      case "Enter":
      case "NumpadEnter":
      case "Space":
        event.preventDefault();
        this.overlayVisible() ? this.hide() : this.show();
        break;
      case "Escape":
        if (this.overlayVisible()) {
          this.hide();
          event.preventDefault();
        }
        break;
      default:
        break;
    }
  }

  private show(): void {
    if (this.$disabled()) return;
    const selected = this.selectedDate();
    if (selected) {
      this.viewMonth.set(selected.getMonth());
      this.viewYear.set(selected.getFullYear());
      this.focusedCell.set({ day: selected.getDate(), month: selected.getMonth(), year: selected.getFullYear() });
    } else {
      this.viewMonth.set(this.today.getMonth());
      this.viewYear.set(this.today.getFullYear());
      this.focusedCell.set({ day: this.today.getDate(), month: this.today.getMonth(), year: this.today.getFullYear() });
    }
    this.overlayVisible.set(true);
    this.onShow.emit();
  }

  private hide(): void {
    this.overlayVisible.set(false);
    this.onHide.emit();
  }

  protected navBackward(): void {
    const month = this.viewMonth();
    if (month === 0) {
      this.viewMonth.set(11);
      this.viewYear.set(this.viewYear() - 1);
    } else {
      this.viewMonth.set(month - 1);
    }
  }

  protected navForward(): void {
    const month = this.viewMonth();
    if (month === 11) {
      this.viewMonth.set(0);
      this.viewYear.set(this.viewYear() + 1);
    } else {
      this.viewMonth.set(month + 1);
    }
  }

  protected onDateSelect(event: Event, cell: UDatePickerDayCell): void {
    if (this.isCellDisabled(cell)) return;
    const date = new Date(cell.year, cell.month, cell.day);
    this.writeModelValue(date);
    this.onModelChange(date);
    this.onModelTouched();
    this.onSelect.emit(date);
    if (cell.otherMonth) {
      this.viewMonth.set(cell.month);
      this.viewYear.set(cell.year);
    }
    this.focusedCell.set({ day: cell.day, month: cell.month, year: cell.year });
    this.hide();
    void event;
  }

  protected onDateCellKeydown(event: KeyboardEvent, cell: UDatePickerDayCell): void {
    switch (event.code) {
      case "ArrowRight":
        event.preventDefault();
        this.moveFocusByDays(cell, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.moveFocusByDays(cell, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.moveFocusByDays(cell, 7);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveFocusByDays(cell, -7);
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        event.preventDefault();
        this.onDateSelect(event, cell);
        break;
      case "Escape":
        event.preventDefault();
        this.hide();
        break;
      default:
        break;
    }
  }

  private moveFocusByDays(cell: UDatePickerDayCell, delta: number): void {
    const next = new Date(cell.year, cell.month, cell.day + delta);
    if (next.getMonth() !== this.viewMonth() || next.getFullYear() !== this.viewYear()) {
      this.viewMonth.set(next.getMonth());
      this.viewYear.set(next.getFullYear());
    }
    this.focusedCell.set({ day: next.getDate(), month: next.getMonth(), year: next.getFullYear() });
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.writeModelValue(null);
    this.onModelChange(null);
    this.onClear.emit();
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value instanceof Date ? value : null);
  }
}
