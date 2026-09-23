import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { NgStyle } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  Renderer2,
  ViewChildren,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UBaseComponent } from "@ultimate/ng-core";
import { UListbox, UListboxChangeEvent } from "../listbox/listbox";
import { pickListStyleModule } from "./pick-list-style";

let nextPickListId = 0;

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
  const text = (candidate: unknown) =>
    String(candidate ?? "").toLocaleLowerCase(locale || undefined);
  if (mode === "in")
    return Array.isArray(query) && query.some((candidate) => text(value) === text(candidate));
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

@Component({
  selector: "u-pick-list",
  standalone: true,
  imports: [UListbox, FormsModule, DragDropModule, NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [id]="rootId" [class]="cx('root')" cdkDropListGroup>
      @for (side of sides; track side) {
        <section
          [attr.data-pc-section]="side === 0 ? 'sourcelist' : 'targetlist'"
          [class]="side === 0 ? cx('sourceList') : cx('targetList')"
          [ngStyle]="side === 0 ? sourceStyle() : targetStyle()"
        >
          <h3>{{ side === 0 ? sourceHeader() : targetHeader() }}</h3>
          @if (side === 0 ? showSourceControls() : showTargetControls()) {
            <div [class]="cx('controls')">
              @for (direction of directions; track direction) {
                <button
                  type="button"
                  [attr.data-move]="direction"
                  [disabled]="disabled() || !hasMovableSelection(side)"
                  (click)="move(side, direction)"
                >
                  Move {{ direction }}
                </button>
              }
            </div>
          }
          @if (filterBy() && (side === 0 ? showSourceFilter() : showTargetFilter())) {
            <input
              type="text"
              role="searchbox"
              [attr.aria-label]="side === 0 ? 'Filter source' : 'Filter target'"
              [value]="queries()[side]"
              [disabled]="disabled()"
              (input)="setQuery(side, $any($event.target).value)"
            />
          }
          @if (dragdrop()) {
            <ul
              cdkDropList
              [class]="cx('list')"
              [cdkDropListData]="side"
              [cdkDropListDisabled]="disabled()"
              (cdkDropListDropped)="drop($event)"
              role="listbox"
              aria-multiselectable="true"
              [attr.aria-label]="side === 0 ? sourceHeader() : targetHeader()"
            >
              @for (
                entry of visibleEntries(side);
                track trackItem(entry.side, $index, entry.item)
              ) {
                @let item = entry.item;
                <li
                  cdkDrag
                  [cdkDragData]="item"
                  [cdkDragDisabled]="disabled() || optionDisabled(side, item)"
                  [class]="isSelected(side, item) ? cx('itemSelected') : cx('listItem')"
                  role="option"
                  [attr.aria-disabled]="disabled() || optionDisabled(side, item)"
                  [attr.aria-selected]="isSelected(side, item)"
                  [attr.tabindex]="disabled() || optionDisabled(side, item) ? -1 : 0"
                  (click)="select(side, item, $event)"
                  (keydown.enter)="select(side, item, $event)"
                  (keydown.space)="$event.preventDefault(); select(side, item, $event)"
                >
                  {{ label(item) }}
                </li>
              }
            </ul>
          } @else {
            <div [class]="cx('list')">
              <u-listbox
                [options]="visible(side)"
                [multiple]="true"
                [ngModel]="listboxSelection()[side]"
                [ngModelOptions]="{ standalone: true }"
                [optionLabel]="label"
                [optionValue]="identity"
                [trackBy]="side === 0 ? sourceTrackBy() : targetTrackBy()"
                [optionDisabled]="side === 0 ? sourceListboxDisabled : targetListboxDisabled"
                [disabled]="disabled()"
                [ariaLabel]="side === 0 ? sourceHeader() : targetHeader()"
                (onChange)="fromListbox(side, $event)"
              />
            </div>
          }
        </section>
      }
      <div [class]="cx('controls')">
        <button
          type="button"
          data-pc-section="movetotargetbutton"
          [disabled]="disabled() || !selected()[0].length"
          (click)="transfer(0, false)"
        >
          To Target
        </button>
        <button
          type="button"
          data-pc-section="movealltotargetbutton"
          [disabled]="disabled() || !source().length"
          (click)="transfer(0, true)"
        >
          All To Target
        </button>
        <button
          type="button"
          data-pc-section="movetosourcebutton"
          [disabled]="disabled() || !selected()[1].length"
          (click)="transfer(1, false)"
        >
          To Source
        </button>
        <button
          type="button"
          data-pc-section="movealltosourcebutton"
          [disabled]="disabled() || !target().length"
          (click)="transfer(1, true)"
        >
          All To Source
        </button>
      </div>
    </div>
  `,
})
export class UPickList extends UBaseComponent {
  protected override readonly componentName = "pick-list";
  protected override readonly styleModule = pickListStyleModule;

  source = input<unknown[]>([]);
  target = input<unknown[]>([]);
  sourceChange = output<unknown[]>();
  targetChange = output<unknown[]>();
  dataKey = input("");
  dragdrop = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  metaKeySelection = input(false, { transform: booleanAttribute });
  filterBy = input("");
  filterMatchMode = input<MatchMode>("contains");
  filterLocale = input<string>();
  showSourceFilter = input(true, { transform: booleanAttribute });
  showTargetFilter = input(true, { transform: booleanAttribute });
  showSourceControls = input(true, { transform: booleanAttribute });
  showTargetControls = input(true, { transform: booleanAttribute });
  sourceHeader = input("Source");
  targetHeader = input("Target");
  sourceOptionDisabled = input<string | ((item: unknown) => boolean)>();
  targetOptionDisabled = input<string | ((item: unknown) => boolean)>();
  sourceStyle = input<Record<string, string | number>>({});
  targetStyle = input<Record<string, string | number>>({});
  sourceTrackBy = input<(index: number, item: unknown) => unknown>(
    (_index, item) => this.identity(item) ?? item
  );
  targetTrackBy = input<(index: number, item: unknown) => unknown>(
    (_index, item) => this.identity(item) ?? item
  );
  breakpoint = input("960px");

  protected readonly rootId = `u-pick-list-${++nextPickListId}`;
  protected readonly responsiveStyle = computed(
    () =>
      `@media (max-width: ${this.breakpoint()}) { #${this.rootId} { grid-template-columns: minmax(0, 1fr); } #${this.rootId} > * { grid-column: 1; grid-row: auto; } }`
  );
  protected readonly sides = [0, 1] as const;
  protected readonly directions = ["up", "top", "down", "bottom"] as const;
  protected readonly selected = signal<[unknown[], unknown[]]>([[], []]);
  protected readonly listboxSelection = signal<[unknown[], unknown[]]>([[], []]);
  protected readonly queries = signal<[string, string]>(["", ""]);
  protected readonly identity = (item: unknown): unknown =>
    this.dataKey() ? field(item, this.dataKey()) : item;
  protected readonly label = (item: unknown): string =>
    String(this.dataKey() ? field(item, this.dataKey()) : item);
  protected readonly sourceListboxDisabled = (item: unknown): boolean =>
    this.disabled() || this.optionDisabled(0, item);
  protected readonly targetListboxDisabled = (item: unknown): boolean =>
    this.disabled() || this.optionDisabled(1, item);

  @ViewChildren(UListbox) private listboxes?: QueryList<UListbox>;

  protected items(side: number): unknown[] {
    return side === 0 ? this.source() : this.target();
  }
  protected trackItem(side: number, index: number, item: unknown): unknown {
    return (side === 0 ? this.sourceTrackBy() : this.targetTrackBy())(index, item);
  }
  protected optionDisabled(side: number, item: unknown): boolean {
    const accessor = side === 0 ? this.sourceOptionDisabled() : this.targetOptionDisabled();
    return typeof accessor === "function"
      ? accessor(item)
      : accessor
        ? Boolean(field(item, accessor))
        : false;
  }
  protected visible(side: number): unknown[] {
    const gate = side === 0 ? this.showSourceFilter() : this.showTargetFilter();
    return !this.filterBy() || !gate
      ? this.items(side)
      : this.items(side).filter((item) =>
          this.filterBy()
            .split(",")
            .some((key) =>
              matches(
                field(item, key.trim()),
                this.queries()[side],
                this.filterMatchMode(),
                this.filterLocale()
              )
            )
        );
  }
  protected visibleEntries(side: 0 | 1): { side: 0 | 1; item: unknown }[] {
    return this.visible(side).map((item) => ({ side, item }));
  }
  protected setQuery(side: number, query: string): void {
    const next: [string, string] = [...this.queries()];
    next[side] = query;
    this.queries.set(next);
  }
  protected isSelected(side: number, item: unknown): boolean {
    return this.selected()[side].includes(this.identity(item));
  }
  protected hasMovableSelection(side: number): boolean {
    return this.items(side).some(
      (item) => this.isSelected(side, item) && !this.optionDisabled(side, item)
    );
  }
  protected select(side: number, item: unknown, event: Event): void {
    if (this.disabled() || this.optionDisabled(side, item)) return;
    const next: [unknown[], unknown[]] = [...this.selected()];
    const current = next[side];
    const key = this.identity(item);
    const toggled = current.includes(key)
      ? current.filter((value) => value !== key)
      : [...current, key];
    next[side] = this.normalizeSelection(toggled, current, event);
    this.selected.set(next);
  }
  protected fromListbox(side: number, event: UListboxChangeEvent): void {
    if (this.disabled()) return;
    const current = this.selected()[side];
    const next = Array.isArray(event.value) ? event.value : [];
    const normalized = this.normalizeSelection(next, current, event.originalEvent);
    const selection: [unknown[], unknown[]] = [...this.selected()];
    selection[side] = normalized;
    this.selected.set(selection);
    this.listboxSelection.set(selection);
    this.listboxes?.toArray()[side]?.writeValue(normalized);
  }
  private normalizeSelection(next: unknown[], current: unknown[], event: Event): unknown[] {
    const pointer = event as MouseEvent;
    if (!this.metaKeySelection() || pointer.ctrlKey || pointer.metaKey) return next;
    const added = next.find((value) => !current.includes(value));
    if (added !== undefined) return [added];
    const removed = current.find((value) => !next.includes(value));
    return removed !== undefined ? [removed] : current;
  }
  private emit(side: number, value: unknown[]): void {
    (side === 0 ? this.sourceChange : this.targetChange).emit(value);
  }
  protected move(side: number, direction: "up" | "top" | "down" | "bottom"): void {
    if (this.disabled() || !this.hasMovableSelection(side)) return;
    const next = [...this.items(side)];
    let movable = next.filter((item) => !this.optionDisabled(side, item));
    if (direction === "top" || direction === "bottom") {
      const chosen = movable.filter((item) => this.isSelected(side, item));
      const rest = movable.filter((item) => !this.isSelected(side, item));
      movable = direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen];
    } else {
      const delta = direction === "up" ? -1 : 1;
      const indexes = movable.map((_, index) => index);
      if (delta === 1) indexes.reverse();
      for (const index of indexes) {
        const to = index + delta;
        if (
          to >= 0 &&
          to < movable.length &&
          this.isSelected(side, movable[index]) &&
          !this.isSelected(side, movable[to])
        ) {
          moveItemInArray(movable, index, to);
        }
      }
    }
    let movableIndex = 0;
    this.emit(
      side,
      next.map((item) => (this.optionDisabled(side, item) ? item : movable[movableIndex++]))
    );
  }
  protected transfer(side: number, all: boolean): void {
    if (this.disabled()) return;
    const chosen = this.items(side).filter(
      (item) => !this.optionDisabled(side, item) && (all || this.isSelected(side, item))
    );
    this.emit(
      side,
      this.items(side).filter((item) => !chosen.includes(item))
    );
    this.emit(1 - side, [...this.items(1 - side), ...chosen]);
    this.selected.set([[], []]);
    this.listboxSelection.set([[], []]);
  }
  protected drop(event: CdkDragDrop<0 | 1>): void {
    if (!this.dragdrop() || this.disabled()) return;
    const fromSide = event.previousContainer.data;
    const toSide = event.container.data;
    const item = this.visible(fromSide)[event.previousIndex];
    if (this.optionDisabled(fromSide, item)) return;
    const from = [...this.items(fromSide)];
    const fromIndex = from.indexOf(item);
    const destination = this.visible(toSide)[event.currentIndex];
    if (fromIndex < 0) return;
    if (fromSide === toSide) {
      const toIndex = destination === undefined ? from.length - 1 : from.indexOf(destination);
      moveItemInArray(from, fromIndex, toIndex);
      this.emit(fromSide, from);
    } else {
      const to = [...this.items(toSide)];
      const toIndex = destination === undefined ? to.length : to.indexOf(destination);
      transferArrayItem(from, to, fromIndex, toIndex);
      this.emit(fromSide, from);
      this.emit(toSide, to);
    }
    this.selected.set([[], []]);
    this.listboxSelection.set([[], []]);
  }

  private styleEl?: HTMLStyleElement;
  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly styleRenderer: Renderer2
  ) {
    super();
    effect(() => {
      const style = this.responsiveStyle();
      if (!this.styleEl) {
        this.styleEl = this.styleRenderer.createElement("style");
        this.styleRenderer.appendChild(this.elementRef.nativeElement, this.styleEl);
      }
      this.styleRenderer.setProperty(this.styleEl, "textContent", style);
    });
  }
}
