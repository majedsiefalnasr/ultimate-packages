import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { getWindowScrollTop } from "@ultimate/uix-utils/dom";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { UButton } from "../button";
import { scrollTopStyleModule } from "./scroll-top-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ScrollTop` component (see
 * `.vendor-extracted/ng/scrolltop/scrolltop.ts`). Confirmed against real
 * source (all 3 frameworks): extends the bare `BaseComponent` tier (no
 * CVA). Composes `Button`, matching this batch's own `UButton` composition
 * precedent from `USplitButton`/`UPanel`. Real source's own `target` option
 * (`'window' | 'parent'`) is honored — `'window'` tracks the document's own
 * scroll position, `'parent'` tracks this component's own parent element's
 * scroll position, both toggling visibility once past `threshold`.
 *
 * Uses a signal `effect()` to react to scroll-driven visibility changes
 * outside Angular's own change-detection triggers (matching this
 * codebase's zoneless-CVA-write precedent from Form sub-batch 5 / `UBlockUI`)
 * rather than manual `detectChanges()`-dependent patterns — the scroll
 * listener updates a `signal`, and Angular's signal-based reactivity
 * re-renders the `@if` automatically.
 *
 * Deliberately excludes real source's `@primeuix/motion`-driven show/hide
 * transition (plain signal-gated `@if` instead, no enter/leave animation)
 * and its icon-template override — same "smaller surface than upstream"
 * precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-scroll-top",
  imports: [UButton],
  template: `
    @if (visible()) {
      <u-button
        #buttonEl
        [class]="cx('root', { target: target() })"
        [rounded]="true"
        type="button"
        icon="pi pi-chevron-up"
        [attr.aria-label]="buttonAriaLabel()"
        (onClick)="onClick()"
      ></u-button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UScrollTop extends UBaseComponent implements OnInit {
  protected override readonly componentName = "scroll-top";
  protected override readonly styleModule = scrollTopStyleModule;

  /** Target of the ScrollTop: 'window' tracks document scroll, 'parent' tracks the host's parent element. */
  target = input<"window" | "parent">("window");
  /** Threshold value of the vertical scroll position to toggle visibility. */
  threshold = input(400, { transform: numberAttribute });
  /** Scrolling behavior: 'smooth' animates, 'auto' jumps. */
  behavior = input<"auto" | "smooth">("smooth");
  /** Accessible label for the scroll-to-top button. */
  buttonAriaLabel = input<string>("Scroll to top");

  /** Emitted when the button becomes visible. */
  onShow = output<void>();
  /** Emitted when the button becomes hidden. */
  onHide = output<void>();

  protected readonly visible = signal(false);

  @ViewChild("buttonEl", { read: ElementRef }) private buttonElRef?: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);
  private scrollListener?: () => void;
  private hasZIndex = false;

  constructor() {
    super();
    // Effect (not a manual detectChanges()-dependent hook) reacts to
    // visible() changes to manage the overlay zIndex and emit
    // onShow/onHide — matching this codebase's zoneless precedent
    // (UBlockUI's own effect()-based blocked()-change handling).
    effect(() => {
      const isVisible = this.visible();
      if (isVisible) {
        queueMicrotask(() => {
          const el = this.buttonElRef?.nativeElement;
          if (el && !this.hasZIndex) {
            ZIndex.set("overlay", el, 0);
            this.hasZIndex = true;
          }
        });
        this.onShow.emit();
      } else {
        this.hasZIndex = false;
        this.onHide.emit();
      }
    });
  }

  ngOnInit(): void {
    const el = this.el.nativeElement as HTMLElement;
    const scrollTarget: Window | HTMLElement | null =
      this.target() === "window" ? window : el.parentElement;

    const checkVisibility = () => {
      const scrollY =
        this.target() === "window"
          ? getWindowScrollTop()
          : ((scrollTarget as HTMLElement)?.scrollTop ?? 0);
      this.visible.set(scrollY > this.threshold());
    };

    scrollTarget?.addEventListener("scroll", checkVisibility);
    this.scrollListener = () => scrollTarget?.removeEventListener("scroll", checkVisibility);

    this.destroyRef.onDestroy(() => {
      this.scrollListener?.();
    });
  }

  protected onClick(): void {
    const el = this.el.nativeElement as HTMLElement;
    const scrollElement: Window | HTMLElement | null =
      this.target() === "window" ? window : el.parentElement;
    scrollElement?.scroll({ top: 0, behavior: this.behavior() });
  }
}
