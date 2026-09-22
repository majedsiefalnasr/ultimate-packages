import { CdkDragDrop, DragDropModule, moveItemInArray } from "@angular/cdk/drag-drop";
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
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
import { orderListStyleModule } from "./order-list-style";

let nextOrderListId = 0;

export interface UOrderListButtonProps {
  class?: string;
  id?: string;
  title?: string;
  name?: string;
  value?: string;
  tabindex?: number;
  disabled?: boolean;
}

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
  selector: "u-order-list",
  standalone: true,
  imports: [UListbox, FormsModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [id]="rootId" [class]="cx('root')" [class.u-striped]="stripedRows()">
      <div [class]="cx('controls')">
        @for (direction of directions; track direction) {
          <button
            type="button"
            [attr.data-pc-section]="'move' + direction + 'button'"
            [disabled]="disabled() || selected().length === 0 || buttonPropsFor(direction).disabled"
            (click)="move(direction)"
            [class]="buttonPropsFor(direction).class"
            [attr.id]="buttonPropsFor(direction).id"
            [attr.title]="buttonPropsFor(direction).title"
            [attr.name]="buttonPropsFor(direction).name"
            [attr.value]="buttonPropsFor(direction).value"
            [attr.tabindex]="buttonPropsFor(direction).tabindex"
          >
            Move {{ direction }}
          </button>
        }
      </div>
      <div
        data-pc-section="listcontainer"
        [style.max-height]="scrollHeight()"
        style="overflow:auto"
      >
        @if (filterBy()) {
          <input
            type="text"
            role="searchbox"
            aria-label="Filter"
            [value]="query()"
            [disabled]="disabled()"
            (input)="query.set($any($event.target).value)"
          />
        }
        @if (dragdrop()) {
          <ul
            cdkDropList
            [class]="cx('list')"
            [cdkDropListData]="visible()"
            [cdkDropListDisabled]="disabled()"
            (cdkDropListDropped)="drop($event)"
            role="listbox"
            aria-multiselectable="true"
            [attr.aria-label]="ariaLabel()"
            [attr.tabindex]="disabled() ? -1 : tabindex()"
          >
            @for (item of visible(); track identity(item)) {
              <li
                cdkDrag
                [class]="isSelected(item) ? cx('itemSelected') : cx('listItem')"
                [cdkDragData]="item"
                [cdkDragDisabled]="disabled()"
                role="option"
                [attr.aria-selected]="isSelected(item)"
                [attr.aria-disabled]="disabled()"
                [attr.tabindex]="disabled() ? -1 : 0"
                (click)="select(item, $event)"
                (keydown.enter)="select(item, $event)"
                (keydown.space)="$event.preventDefault(); select(item, $event)"
              >
                {{ label(item) }}
              </li>
            }
          </ul>
        } @else {
          <div [class]="cx('list')">
            <u-listbox
              #listbox
              [options]="visible()"
              [multiple]="true"
              [ngModel]="listboxSelection()"
              (ngModelChange)="listboxSelection.set($event)"
              [optionLabel]="label"
              [optionValue]="identity"
              [optionDisabled]="isOptionDisabled"
              [disabled]="disabled()"
              [ariaLabel]="ariaLabel()"
              (onChange)="fromListbox($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class UOrderList extends UBaseComponent implements AfterViewChecked {
  protected override readonly componentName = "order-list";
  protected override readonly styleModule = orderListStyleModule;

  value = input<unknown[]>([]);
  valueChange = output<unknown[]>();
  dataKey = input("");
  filterBy = input("");
  filterMatchMode = input<MatchMode>("contains");
  filterLocale = input<string>();
  dragdrop = input(false, { transform: booleanAttribute });
  metaKeySelection = input(false, { transform: booleanAttribute });
  breakpoint = input("960px");
  scrollHeight = input("14rem");
  stripedRows = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  tabindex = input(0);
  ariaLabel = input("Order list");
  buttonProps = input<UOrderListButtonProps>({});
  moveUpButtonProps = input<UOrderListButtonProps>({});
  moveTopButtonProps = input<UOrderListButtonProps>({});
  moveDownButtonProps = input<UOrderListButtonProps>({});
  moveBottomButtonProps = input<UOrderListButtonProps>({});

  protected readonly rootId = `u-order-list-${++nextOrderListId}`;
  protected readonly responsiveStyle = computed(
    () =>
      `@media (max-width: ${this.breakpoint()}) { #${this.rootId} { grid-template-columns: minmax(0, 1fr); } }`
  );
  protected readonly directions = ["up", "top", "down", "bottom"] as const;
  protected readonly selected = signal<unknown[]>([]);
  protected readonly listboxSelection = signal<unknown[]>([]);
  protected readonly query = signal("");
  protected readonly visible = computed(() =>
    !this.filterBy()
      ? this.value()
      : this.value().filter((item) =>
          this.filterBy()
            .split(",")
            .some((key) =>
              matches(
                field(item, key.trim()),
                this.query(),
                this.filterMatchMode(),
                this.filterLocale()
              )
            )
        )
  );
  protected readonly identity = (item: unknown): unknown =>
    this.dataKey() ? field(item, this.dataKey()) : item;
  protected readonly label = (item: unknown): string =>
    String(this.dataKey() ? field(item, this.dataKey()) : item);
  protected readonly isOptionDisabled = () => this.disabled();

  @ViewChild(UListbox) private listbox?: UListbox;
  @ViewChild(UListbox, { read: ElementRef }) private listboxElement?: ElementRef<HTMLElement>;

  ngAfterViewChecked(): void {
    const listbox =
      this.listboxElement?.nativeElement.querySelector<HTMLElement>('[role="listbox"]');
    if (listbox) {
      this.styleRenderer.setAttribute(
        listbox,
        "tabindex",
        String(this.disabled() ? -1 : this.tabindex())
      );
    }
  }

  protected isSelected(item: unknown): boolean {
    return this.selected().includes(this.identity(item));
  }

  protected select(item: unknown, event: Event): void {
    if (this.disabled()) return;
    const key = this.identity(item);
    const current = this.selected();
    const toggled = current.includes(key)
      ? current.filter((value) => value !== key)
      : [...current, key];
    this.selected.set(this.normalizeSelection(toggled, current, event));
  }

  protected fromListbox(event: UListboxChangeEvent): void {
    if (this.disabled()) return;
    const current = this.selected();
    const next = Array.isArray(event.value) ? event.value : [];
    const normalized = this.normalizeSelection(next, current, event.originalEvent);
    this.selected.set(normalized);
    this.listboxSelection.set(normalized);
    this.listbox?.writeValue(normalized);
  }

  private normalizeSelection(next: unknown[], current: unknown[], event: Event): unknown[] {
    const pointer = event as MouseEvent;
    if (!this.metaKeySelection() || pointer.ctrlKey || pointer.metaKey) return next;
    const added = next.find((value) => !current.includes(value));
    if (added !== undefined) return [added];
    const removed = current.find((value) => !next.includes(value));
    return removed !== undefined ? [removed] : current;
  }

  protected buttonPropsFor(direction: "up" | "top" | "down" | "bottom"): UOrderListButtonProps {
    const overrides = {
      up: this.moveUpButtonProps(),
      top: this.moveTopButtonProps(),
      down: this.moveDownButtonProps(),
      bottom: this.moveBottomButtonProps(),
    };
    const shared = this.buttonProps();
    const specific = overrides[direction];
    return {
      ...shared,
      ...specific,
      class: [shared.class, specific.class].filter(Boolean).join(" ") || undefined,
    };
  }

  protected move(direction: "up" | "top" | "down" | "bottom"): void {
    if (this.disabled()) return;
    const next = [...this.value()];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => this.isSelected(item));
      const rest = next.filter((item) => !this.isSelected(item));
      this.valueChange.emit(direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const destination = index + delta;
      if (
        destination >= 0 &&
        destination < next.length &&
        this.isSelected(next[index]) &&
        !this.isSelected(next[destination])
      ) {
        moveItemInArray(next, index, destination);
      }
    }
    this.valueChange.emit(next);
  }

  protected drop(event: CdkDragDrop<unknown[]>): void {
    if (!this.dragdrop() || this.disabled()) return;
    const visible = this.visible();
    const from = this.value().indexOf(visible[event.previousIndex]);
    const to = this.value().indexOf(visible[event.currentIndex]);
    if (from < 0 || to < 0) return;
    const next = [...this.value()];
    moveItemInArray(next, from, to);
    this.valueChange.emit(next);
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
