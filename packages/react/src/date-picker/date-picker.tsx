import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { datePickerStyleModule } from "./date-picker-style";

export interface UDatePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  fluid?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showIcon?: boolean;
  showClear?: boolean;
  dayNames?: string[];
  monthNames?: string[];
  className?: string;
  inputId?: string;
  onSelect?: (value: Date) => void;
  onClear?: () => void;
  onShow?: () => void;
  onHide?: () => void;
}

interface DayCell {
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

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear());
  return `${mm}/${dd}/${yy}`;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Calendar` (real source:
 * `components/lib/calendar/Calendar.js`/`CalendarBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`) — kept
 * under React's own framework-native `Calendar` capability, exported here as
 * `UDatePicker` to match Ultimate's own cross-framework export-name
 * convention (real Prime *source* name is `Calendar`; the canonical
 * capability this batch migrates is `DatePicker`, per the Batch 1 migration
 * plan's explicit naming note, same pattern `USelect`/`Dropdown` uses).
 *
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape `USelect`/`UColorPicker`
 * follow.
 *
 * Overlay-based: real source's own template composes a trigger (text input)
 * plus an absolute-positioned panel (header nav + day-grid table) opened on
 * click — this port follows the same "absolute-positioned panel, no
 * Portal" convention `USelect` (`packages/react/src/select/select.tsx`)
 * already established for this capability family in React.
 *
 * **Documented scope cut** (proof-by-exception, matching `UInputNumber`'s own
 * documented-cut precedent, same cut Angular's/Vue's `UDatePicker` document):
 * real source's full surface includes `selectionMode` (`single`/`multiple`/
 * `range`), a `currentView` state switching between date/month/year (decade)
 * grids, a full time-picker sub-mode (`showTime`/`timeOnly`), `inline`
 * rendering, touch-UI, week numbers, a button bar, and multi-month
 * responsive layouts. This port implements only: **single-date selection**
 * (real source's own default), the **date grid view only** (no month/year/
 * decade view switching), `minDate`/`maxDate`/`disabledDates` constraints,
 * month/year header navigation, full keyboard grid navigation (arrow keys
 * move focus across the day grid, Enter/Space select, Escape closes), and
 * locale-aware day/month names via simple configurable arrays (no `Intl`/
 * full i18n lookup). Multiple/range selection, the time picker, inline mode,
 * and month/year/decade view switching are NOT implemented; a future task
 * may add them without new architecture.
 */
export function UDatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  fluid = false,
  minDate,
  maxDate,
  disabledDates = [],
  showIcon = false,
  showClear = false,
  dayNames = DEFAULT_DAY_NAMES,
  monthNames = DEFAULT_MONTH_NAMES,
  className,
  inputId,
  onSelect,
  onClear,
  onShow,
  onHide,
}: UDatePickerProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "date-picker", styleModule: datePickerStyleModule });

  const today = React.useMemo(() => new Date(), []);
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [viewMonth, setViewMonth] = React.useState(value ? value.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = React.useState(value ? value.getFullYear() : today.getFullYear());
  const [focusedCell, setFocusedCell] = React.useState<{ day: number; month: number; year: number } | null>(
    null
  );

  const isCellDisabled = React.useCallback(
    (cell: DayCell): boolean => {
      const date = new Date(cell.year, cell.month, cell.day);
      if (minDate && date < stripTime(minDate)) return true;
      if (maxDate && date > stripTime(maxDate)) return true;
      return disabledDates.some((d) => isSameDay(d, date));
    },
    [minDate, maxDate, disabledDates]
  );

  const isSelected = React.useCallback(
    (cell: DayCell): boolean =>
      value !== null &&
      value.getDate() === cell.day &&
      value.getMonth() === cell.month &&
      value.getFullYear() === cell.year,
    [value]
  );

  const weeks = React.useMemo<DayCell[][]>(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: DayCell[] = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({ day, month: prevMonth, year: prevYear, otherMonth: true, today: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
      cells.push({ day, month: viewMonth, year: viewYear, otherMonth: false, today: isToday });
    }
    let nextDay = 1;
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nextDay, month: nextMonth, year: nextYear, otherMonth: true, today: false });
      nextDay++;
    }

    const result: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [viewMonth, viewYear, today]);

  const show = () => {
    if (disabled) return;
    if (value) {
      setViewMonth(value.getMonth());
      setViewYear(value.getFullYear());
      setFocusedCell({ day: value.getDate(), month: value.getMonth(), year: value.getFullYear() });
    } else {
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      setFocusedCell({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear() });
    }
    setOverlayVisible(true);
    onShow?.();
  };

  const hide = () => {
    setOverlayVisible(false);
    onHide?.();
  };

  const navBackward = () => {
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1);
        return 11;
      }
      return month - 1;
    });
  };

  const navForward = () => {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1);
        return 0;
      }
      return month + 1;
    });
  };

  const selectCell = (cell: DayCell) => {
    if (isCellDisabled(cell)) return;
    const date = new Date(cell.year, cell.month, cell.day);
    onChange(date);
    onSelect?.(date);
    if (cell.otherMonth) {
      setViewMonth(cell.month);
      setViewYear(cell.year);
    }
    setFocusedCell({ day: cell.day, month: cell.month, year: cell.year });
    hide();
  };

  const moveFocusByDays = (cell: DayCell, delta: number) => {
    const next = new Date(cell.year, cell.month, cell.day + delta);
    if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
      setViewMonth(next.getMonth());
      setViewYear(next.getFullYear());
    }
    setFocusedCell({ day: next.getDate(), month: next.getMonth(), year: next.getFullYear() });
  };

  const onDateCellKeyDown = (event: React.KeyboardEvent, cell: DayCell) => {
    switch (event.code) {
      case "ArrowRight":
        event.preventDefault();
        moveFocusByDays(cell, 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocusByDays(cell, -1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocusByDays(cell, 7);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocusByDays(cell, -7);
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        event.preventDefault();
        selectCell(cell);
        break;
      case "Escape":
        event.preventDefault();
        hide();
        break;
      default:
        break;
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.code) {
      case "Enter":
      case "NumpadEnter":
      case "Space":
        event.preventDefault();
        overlayVisible ? hide() : show();
        break;
      case "Escape":
        if (overlayVisible) {
          hide();
          event.preventDefault();
        }
        break;
      default:
        break;
    }
  };

  const isFocusedCell = (cell: DayCell): boolean => {
    if (focusedCell) {
      return focusedCell.day === cell.day && focusedCell.month === cell.month && focusedCell.year === cell.year;
    }
    return isSelected(cell);
  };

  return (
    <div className={[cx("root", { fluid }), className].filter(Boolean).join(" ")}>
      <input
        type="text"
        readOnly
        id={inputId}
        className={cx("input")}
        placeholder={placeholder}
        tabIndex={disabled ? -1 : 0}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={overlayVisible}
        value={value ? formatDate(value) : ""}
        onClick={() => (disabled ? undefined : overlayVisible ? hide() : show())}
        onKeyDown={onInputKeyDown}
      />
      {showClear && value != null && !disabled && (
        <span
          className={cx("clearIcon")}
          aria-hidden="true"
          onClick={(event) => {
            event.stopPropagation();
            onChange(null);
            onClear?.();
          }}
        >
          &times;
        </span>
      )}
      {showIcon && (
        <span
          className={cx("trigger")}
          role="button"
          aria-hidden="true"
          onClick={() => (disabled ? undefined : overlayVisible ? hide() : show())}
        >
          &#128197;
        </span>
      )}
      {overlayVisible && (
        <div className={cx("panel")} role="dialog">
          <div className={cx("header")}>
            <button type="button" className={cx("navButton")} aria-label="Previous month" onClick={navBackward}>
              &#8249;
            </button>
            <span className={cx("title")}>
              <span>{monthNames[viewMonth]}</span>
              <span>{viewYear}</span>
            </span>
            <button type="button" className={cx("navButton")} aria-label="Next month" onClick={navForward}>
              &#8250;
            </button>
          </div>
          <table className={cx("dayView")} role="grid">
            <thead>
              <tr>
                {dayNames.map((dayName) => (
                  <th key={dayName} className={cx("weekdayCell")} scope="col">
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((cell) => (
                    <td key={`${cell.month}-${cell.day}-${cell.year}`} className={cx("dayCell")}>
                      <span
                        role="gridcell"
                        tabIndex={isFocusedCell(cell) ? 0 : -1}
                        aria-selected={isSelected(cell)}
                        aria-disabled={isCellDisabled(cell)}
                        className={cx("day", {
                          otherMonth: cell.otherMonth,
                          today: cell.today,
                          selected: isSelected(cell),
                          focused: isFocusedCell(cell),
                          disabled: isCellDisabled(cell),
                        })}
                        onClick={() => selectCell(cell)}
                        onKeyDown={(event) => onDateCellKeyDown(event, cell)}
                      >
                        {cell.day}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
