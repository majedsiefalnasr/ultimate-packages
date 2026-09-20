import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  Directive,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { UBaseComponent } from "@ultimate/ng-core";
import { splitterStyleModule } from "./splitter-style";

/** Marks an `ng-template` as one `USplitter` panel's content, with an optional per-panel minimum size (percent, 0-100). */
@Directive({ standalone: true, selector: "ng-template[uSplitterPanel]" })
export class USplitterPanel {
  readonly templateRef = inject(TemplateRef);
  /** Minimum size of this panel, as a percentage of the splitter's total size. */
  minSize = input(0, { alias: "uSplitterPanelMinSize", transform: numberAttribute });
}

export interface USplitterResizeEvent {
  originalEvent: Event;
  sizes: number[];
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Splitter`/`SplitterPanel`
 * components (see `.vendor-extracted/ng/splitter/splitter.ts`). Confirmed
 * against real source (all 3 frameworks): extends the bare `BaseComponent`
 * tier (no CVA) — real source's drag-resize mechanism is a `mousedown`/
 * `mousemove`/`mouseup` (and `touchstart`/`touchmove`/`touchend`) chain
 * computing each panel's new `flex-basis` from the pointer's delta
 * relative to the gutter's start position, clamped against each panel's
 * own `minSize`, plus an `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown`
 * keyboard-repeat path stepping by `step` on a 40ms interval while held.
 * This port keeps that same real mechanism (mouse-drag + min/max clamping
 * + keyboard arrow-step resize).
 *
 * Real source scans `SplitterPanel` child components/slot children to
 * build its panel list (a genuine multi-component family per framework).
 * This port instead takes an array of `ng-template[uSplitterPanel]`
 * `ContentChildren` — an explicit, config-driven panel list rather than a
 * child-component-scanning tree — same "reduce a multi-component family to
 * one component with a config surface" precedent as this session's
 * `UAccordion`/`UPanelMenu` reductions, disclosed here rather than
 * silently presented as matching upstream's own nested-component shape.
 *
 * Deliberately excludes real source's `stateStorage`/`stateKey`
 * session/localStorage persistence, RTL-aware drag-direction flip, and
 * touch-drag support (touch listeners are wired for parity but genuine
 * touch-event testing is out of this task's scope) — same "smaller
 * surface than upstream" precedent as every sibling component; nested
 * splitters (a `USplitter` panel containing another `USplitter`) are not
 * specially detected (no `nested` `data-p` attribute), also disclosed.
 */
@Component({
  standalone: true,
  selector: "u-splitter",
  imports: [CommonModule],
  template: `
    @for (panel of panels(); track $index; let last = $last) {
      <div [class]="cx('panel')" [style.flex-basis]="panelBasis($index)" tabindex="-1">
        <ng-container *ngTemplateOutlet="panel.templateRef"></ng-container>
      </div>
      @if (!last) {
        <div
          #gutter
          [class]="cx('gutter')"
          role="separator"
          tabindex="-1"
          (mousedown)="onGutterMouseDown($event, $index)"
          (touchstart)="onGutterTouchStart($event, $index)"
          (touchmove)="onGutterTouchMove($event)"
          (touchend)="onGutterTouchEnd($event)"
        >
          <div
            [class]="cx('gutterHandle')"
            tabindex="0"
            [style]="gutterStyle()"
            [attr.aria-orientation]="layout()"
            [attr.aria-valuenow]="panelSizes()[$index]"
            (keyup)="onGutterKeyUp()"
            (keydown)="onGutterKeyDown($event, $index)"
          ></div>
        </div>
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root', { layout: layout() })",
    "[attr.data-resizing]": "dragging() || null",
  },
})
export class USplitter extends UBaseComponent {
  protected override readonly componentName = "splitter";
  protected override readonly styleModule = splitterStyleModule;

  /** Orientation of the panels. */
  layout = input<"horizontal" | "vertical">("horizontal");
  /** Size of the gutter divider, in pixels. */
  gutterSize = input(4, { transform: numberAttribute });
  /** Step factor to increment/decrement panel size while pressing the arrow keys. */
  step = input(5, { transform: numberAttribute });

  /** Emitted when a resize drag/keyboard-step ends. */
  onResizeEnd = output<USplitterResizeEvent>();
  /** Emitted when a resize drag/keyboard-step starts. */
  onResizeStart = output<USplitterResizeEvent>();

  @ContentChildren(USplitterPanel) protected panels_!: QueryList<USplitterPanel>;

  protected readonly panelSizes = signal<number[]>([]);

  private readonly destroyRef = inject(DestroyRef);

  protected readonly dragging = signal(false);
  private size = 0;
  private startPos = 0;
  private prevPanelIndex = 0;
  private prevPanelSize = 0;
  private nextPanelSize = 0;
  private mouseMoveListener?: (event: MouseEvent) => void;
  private mouseUpListener?: (event: MouseEvent) => void;
  private touchMoveListener?: (event: TouchEvent) => void;
  private touchEndListener?: (event: TouchEvent) => void;
  private repeatTimer?: ReturnType<typeof setInterval>;

  protected panels(): USplitterPanel[] {
    return this.panels_?.toArray() ?? [];
  }

  ngAfterContentInit(): void {
    const count = this.panels().length;
    if (count > 0 && this.panelSizes().length === 0) {
      this.panelSizes.set(this.panels().map(() => 100 / count));
    }
    this.destroyRef.onDestroy(() => this.unbindMouseListeners());
  }

  protected panelBasis(index: number): string {
    const sizes = this.panelSizes();
    const size = sizes[index] ?? 100 / Math.max(this.panels().length, 1);
    const gutterCount = Math.max(this.panels().length - 1, 0);
    return `calc(${size}% - ${gutterCount * this.gutterSize()}px)`;
  }

  protected gutterStyle(): Record<string, string> {
    return this.layout() === "horizontal"
      ? { width: `${this.gutterSize()}px` }
      : { height: `${this.gutterSize()}px` };
  }

  private minSizeOf(index: number): number {
    return this.panels()[index]?.minSize() ?? 0;
  }

  /** Extracts a `{pageX, pageY}` point from a mouse or touch event. */
  private pointFromEvent(event: Event): { pageX: number; pageY: number } {
    if (event instanceof TouchEvent) {
      const touch = event.changedTouches[0];
      return { pageX: touch.pageX, pageY: touch.pageY };
    }
    const mouseEvent = event as MouseEvent;
    return { pageX: mouseEvent.pageX, pageY: mouseEvent.pageY };
  }

  private resizeStart(event: Event, index: number, isKeyDown = false): void {
    const rootEl = this.el.nativeElement as HTMLElement;
    this.size = this.layout() === "horizontal" ? rootEl.offsetWidth : rootEl.offsetHeight;

    if (!isKeyDown) {
      this.dragging.set(true);
      const point = this.pointFromEvent(event);
      this.startPos = this.layout() === "horizontal" ? point.pageX : point.pageY;
    }

    const sizes = this.panelSizes();
    this.prevPanelIndex = index;
    this.prevPanelSize = sizes[index] ?? 0;
    this.nextPanelSize = sizes[index + 1] ?? 0;

    this.onResizeStart.emit({ originalEvent: event, sizes: [...sizes] });
  }

  private resize(event: Event, step?: number, isKeyDown = false): void {
    let newPrevPanelSize: number;
    let newNextPanelSize: number;

    if (isKeyDown) {
      newPrevPanelSize = this.prevPanelSize + (step ?? 0);
      newNextPanelSize = this.nextPanelSize - (step ?? 0);
    } else {
      const point = this.pointFromEvent(event);
      const pos = this.layout() === "horizontal" ? point.pageX : point.pageY;
      const delta = ((pos - this.startPos) * 100) / this.size;
      newPrevPanelSize = this.prevPanelSize + delta;
      newNextPanelSize = this.nextPanelSize - delta;
    }

    const prevMin = this.minSizeOf(this.prevPanelIndex);
    const nextMin = this.minSizeOf(this.prevPanelIndex + 1);

    if (
      newPrevPanelSize < prevMin ||
      newNextPanelSize < nextMin ||
      newPrevPanelSize > 100 - nextMin ||
      newNextPanelSize > 100 - prevMin
    ) {
      newPrevPanelSize = Math.min(Math.max(prevMin, newPrevPanelSize), 100 - nextMin);
      newNextPanelSize = Math.min(Math.max(nextMin, newNextPanelSize), 100 - prevMin);
    }

    this.panelSizes.update((sizes) => {
      const next = [...sizes];
      next[this.prevPanelIndex] = newPrevPanelSize;
      next[this.prevPanelIndex + 1] = newNextPanelSize;
      return next;
    });
  }

  private resizeEnd(event: Event): void {
    this.onResizeEnd.emit({ originalEvent: event, sizes: [...this.panelSizes()] });
    this.clear();
  }

  protected onGutterMouseDown(event: MouseEvent, index: number): void {
    this.resizeStart(event, index);
    this.bindMouseListeners();
  }

  protected onGutterTouchStart(event: TouchEvent, index: number): void {
    this.resizeStart(event, index);
    this.bindTouchListeners();
  }

  protected onGutterTouchMove(event: TouchEvent): void {
    this.resize(event);
  }

  protected onGutterTouchEnd(event: TouchEvent): void {
    this.resizeEnd(event);
    this.unbindTouchListeners();
  }

  protected onGutterKeyUp(): void {
    this.clearRepeatTimer();
    this.resizeEnd(new Event("keyup"));
  }

  protected onGutterKeyDown(event: KeyboardEvent, index: number): void {
    const horizontal = this.layout() === "horizontal";
    switch (event.code) {
      case "ArrowLeft":
        if (horizontal) this.setRepeatTimer(event, index, this.step() * -1);
        event.preventDefault();
        break;
      case "ArrowRight":
        if (horizontal) this.setRepeatTimer(event, index, this.step());
        event.preventDefault();
        break;
      case "ArrowDown":
        if (!horizontal) this.setRepeatTimer(event, index, this.step() * -1);
        event.preventDefault();
        break;
      case "ArrowUp":
        if (!horizontal) this.setRepeatTimer(event, index, this.step());
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  private setRepeatTimer(event: KeyboardEvent, index: number, step: number): void {
    this.clearRepeatTimer();
    const repeat = () => {
      this.resizeStart(event, index, true);
      this.resize(event, step, true);
    };
    repeat();
    this.repeatTimer = setInterval(repeat, 40);
  }

  private clearRepeatTimer(): void {
    if (this.repeatTimer) {
      clearInterval(this.repeatTimer);
      this.repeatTimer = undefined;
    }
  }

  private bindMouseListeners(): void {
    if (!this.mouseMoveListener) {
      this.mouseMoveListener = (event) => this.resize(event);
      document.addEventListener("mousemove", this.mouseMoveListener);
    }
    if (!this.mouseUpListener) {
      this.mouseUpListener = (event) => {
        this.resizeEnd(event);
        this.unbindMouseListeners();
      };
      document.addEventListener("mouseup", this.mouseUpListener);
    }
  }

  private bindTouchListeners(): void {
    if (!this.touchMoveListener) {
      this.touchMoveListener = (event) => this.resize(event);
      document.addEventListener("touchmove", this.touchMoveListener);
    }
    if (!this.touchEndListener) {
      this.touchEndListener = (event) => {
        this.resizeEnd(event);
        this.unbindTouchListeners();
      };
      document.addEventListener("touchend", this.touchEndListener);
    }
  }

  private unbindMouseListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener("mousemove", this.mouseMoveListener);
      this.mouseMoveListener = undefined;
    }
    if (this.mouseUpListener) {
      document.removeEventListener("mouseup", this.mouseUpListener);
      this.mouseUpListener = undefined;
    }
  }

  private unbindTouchListeners(): void {
    if (this.touchMoveListener) {
      document.removeEventListener("touchmove", this.touchMoveListener);
      this.touchMoveListener = undefined;
    }
    if (this.touchEndListener) {
      document.removeEventListener("touchend", this.touchEndListener);
      this.touchEndListener = undefined;
    }
  }

  private clear(): void {
    this.dragging.set(false);
    this.size = 0;
    this.startPos = 0;
  }
}
