<template>
  <div :class="cx('root', rootClassesParams)">
    <input
      type="text"
      readonly
      :id="inputId"
      :class="cx('input')"
      :placeholder="placeholder"
      :tabindex="disabled ? -1 : 0"
      :disabled="disabled"
      aria-haspopup="dialog"
      :aria-expanded="overlayVisible"
      :value="inputFieldValue"
      @click="onInputClick"
      @keydown="onInputKeydown"
    />
    <span v-if="showClear && filled && !disabled" :class="cx('clearIcon')" aria-hidden="true" @click="clear">&times;</span>
    <span v-if="showIcon" :class="cx('trigger')" role="button" aria-hidden="true" @click="onInputClick">&#128197;</span>
    <UPortal v-if="overlayVisible" :appendTo="appendTo">
      <div :class="cx('panel')" role="dialog">
        <div :class="cx('header')">
          <button type="button" :class="cx('navButton')" aria-label="Previous month" @click="navBackward">&#8249;</button>
          <span :class="cx('title')">
            <span>{{ monthNames[viewMonth] }}</span>
            <span>{{ viewYear }}</span>
          </span>
          <button type="button" :class="cx('navButton')" aria-label="Next month" @click="navForward">&#8250;</button>
        </div>
        <table :class="cx('dayView')" role="grid">
          <thead>
            <tr>
              <th v-for="dayName in dayNames" :key="dayName" :class="cx('weekdayCell')" scope="col">{{ dayName }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(week, weekIndex) in weeks" :key="weekIndex">
              <td v-for="cell in week" :key="`${cell.month}-${cell.day}-${cell.year}`" :class="cx('dayCell')">
                <span
                  role="gridcell"
                  :tabindex="isFocusedCell(cell) ? 0 : -1"
                  :aria-selected="isSelected(cell)"
                  :aria-disabled="isCellDisabled(cell)"
                  :class="cx('day', dayClassesParams(cell))"
                  @click="onDateSelect(cell)"
                  @keydown="onDateCellKeydown($event, cell)"
                >{{ cell.day }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UPortal>
  </div>
</template>

<script>
import { Portal as UPortal } from "@ultimate/vue-core";
import { createBaseDatePicker } from "./BaseDatePicker";

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear());
  return `${mm}/${dd}/${yy}`;
}

// Real PrimeVue DatePicker (.vendor-extracted/vue/datepicker/DatePicker.vue)
// composes a text-input trigger plus a Portal/Teleport-rendered panel around
// a header (prev/next nav + month/year title) and a day-grid <table> — this
// port composes UPortal the same way Select.vue does
// (packages/vue/src/select/Select.vue), matching real source's own
// "text input trigger + overlay calendar panel" shape.
//
// Documented scope cut (proof-by-exception, matching UInputNumber's own
// documented-cut precedent, same cut Angular's/React's UDatePicker document):
// real source's full surface includes `selectionMode` (single/multiple/
// range), a `currentView` state switching between date/month/year (decade)
// grids, a full time-picker sub-mode (showTime/timeOnly), `inline`
// rendering, touch-UI, week numbers, a button bar, and multi-month
// responsive layouts. This port implements only: single-date selection
// (real source's own default), the date grid view only (no month/year/
// decade view switching), minDate/maxDate/disabledDates constraints, month/
// year header navigation, full keyboard grid navigation (arrow keys move
// focus across the day grid, Enter/Space select, Escape closes), and
// locale-aware day/month names via simple configurable arrays (no Intl/full
// i18n lookup). Multiple/range selection, the time picker, inline mode, and
// month/year/decade view switching are NOT implemented; a future task may
// add them without new architecture.
export default {
  name: "UDatePicker",
  extends: createBaseDatePicker(),
  components: { UPortal },
  emits: ["select", "clear", "show", "hide"],
  data() {
    // Base tier's own data() (createBaseEditableHolder, via createBaseInput)
    // initializes dValue independently of this child's own data() — this
    // child's initial view state must derive from the same underlying
    // inputs (this.defaultValue/this.modelValue), NOT from this.dValue,
    // which is not yet populated when this data() runs (documented pitfall,
    // see ColorPicker.vue's own data() for the corrected pattern).
    const initial = this.defaultValue !== undefined ? this.defaultValue : this.modelValue;
    const initialDate = initial instanceof Date ? initial : null;
    const today = new Date();
    return {
      overlayVisible: false,
      viewMonth: initialDate ? initialDate.getMonth() : today.getMonth(),
      viewYear: initialDate ? initialDate.getFullYear() : today.getFullYear(),
      focusedCell: null,
      today,
    };
  },
  computed: {
    rootClassesParams() {
      return { disabled: this.disabled, fluid: this.resolvedFluid };
    },
    selectedDate() {
      return this.dValue instanceof Date ? this.dValue : null;
    },
    inputFieldValue() {
      const value = this.selectedDate;
      return value ? formatDate(value) : "";
    },
    weeks() {
      const month = this.viewMonth;
      const year = this.viewYear;
      const firstOfMonth = new Date(year, month, 1);
      const startOffset = firstOfMonth.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();

      const cells = [];
      for (let i = startOffset - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        cells.push({ day, month: prevMonth, year: prevYear, otherMonth: true, today: false });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear();
        cells.push({ day, month, year, otherMonth: false, today: isToday });
      }
      let nextDay = 1;
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      while (cells.length % 7 !== 0) {
        cells.push({ day: nextDay, month: nextMonth, year: nextYear, otherMonth: true, today: false });
        nextDay++;
      }

      const weeks = [];
      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
      }
      return weeks;
    },
  },
  methods: {
    dayClassesParams(cell) {
      return {
        otherMonth: cell.otherMonth,
        today: cell.today,
        selected: this.isSelected(cell),
        focused: this.isFocusedCell(cell),
        disabled: this.isCellDisabled(cell),
      };
    },
    isSelected(cell) {
      const selected = this.selectedDate;
      if (!selected) return false;
      return selected.getDate() === cell.day && selected.getMonth() === cell.month && selected.getFullYear() === cell.year;
    },
    isFocusedCell(cell) {
      if (this.focusedCell) {
        return this.focusedCell.day === cell.day && this.focusedCell.month === cell.month && this.focusedCell.year === cell.year;
      }
      return this.isSelected(cell);
    },
    isCellDisabled(cell) {
      const date = new Date(cell.year, cell.month, cell.day);
      if (this.minDate && date < stripTime(this.minDate)) return true;
      if (this.maxDate && date > stripTime(this.maxDate)) return true;
      return (this.disabledDates || []).some((d) => isSameDay(d, date));
    },
    onInputClick() {
      if (this.disabled) return;
      this.overlayVisible ? this.hide() : this.show();
    },
    onInputKeydown(event) {
      if (this.disabled) return;
      switch (event.code) {
        case "Enter":
        case "NumpadEnter":
        case "Space":
          event.preventDefault();
          this.overlayVisible ? this.hide() : this.show();
          break;
        case "Escape":
          if (this.overlayVisible) {
            this.hide();
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    },
    show() {
      if (this.disabled) return;
      const selected = this.selectedDate;
      if (selected) {
        this.viewMonth = selected.getMonth();
        this.viewYear = selected.getFullYear();
        this.focusedCell = { day: selected.getDate(), month: selected.getMonth(), year: selected.getFullYear() };
      } else {
        this.viewMonth = this.today.getMonth();
        this.viewYear = this.today.getFullYear();
        this.focusedCell = { day: this.today.getDate(), month: this.today.getMonth(), year: this.today.getFullYear() };
      }
      this.overlayVisible = true;
      this.$emit("show");
    },
    hide() {
      this.overlayVisible = false;
      this.$emit("hide");
    },
    navBackward() {
      if (this.viewMonth === 0) {
        this.viewMonth = 11;
        this.viewYear -= 1;
      } else {
        this.viewMonth -= 1;
      }
    },
    navForward() {
      if (this.viewMonth === 11) {
        this.viewMonth = 0;
        this.viewYear += 1;
      } else {
        this.viewMonth += 1;
      }
    },
    onDateSelect(cell, event) {
      if (this.isCellDisabled(cell)) return;
      const date = new Date(cell.year, cell.month, cell.day);
      this.writeValue(date, event);
      this.$emit("select", date);
      if (cell.otherMonth) {
        this.viewMonth = cell.month;
        this.viewYear = cell.year;
      }
      this.focusedCell = { day: cell.day, month: cell.month, year: cell.year };
      this.hide();
    },
    moveFocusByDays(cell, delta) {
      const next = new Date(cell.year, cell.month, cell.day + delta);
      if (next.getMonth() !== this.viewMonth || next.getFullYear() !== this.viewYear) {
        this.viewMonth = next.getMonth();
        this.viewYear = next.getFullYear();
      }
      this.focusedCell = { day: next.getDate(), month: next.getMonth(), year: next.getFullYear() };
    },
    onDateCellKeydown(event, cell) {
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
          this.onDateSelect(cell, event);
          break;
        case "Escape":
          event.preventDefault();
          this.hide();
          break;
        default:
          break;
      }
    },
    clear(event) {
      event.stopPropagation();
      this.writeValue(null, event);
      this.$emit("clear");
    },
  },
};
</script>
