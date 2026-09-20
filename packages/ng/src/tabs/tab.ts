import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { UTabList } from "./tab-list";
import { UTabs } from "./tabs";
import { tabsStyleModule } from "./tabs-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Tab` component (see
 * `.vendor-extracted/ng/tabs/tab.ts`). A single tab trigger inside
 * `UTabList`; owns keyboard roving-focus navigation (ArrowLeft/ArrowRight/
 * Home/End) across sibling `u-tab` elements, matching real PrimeNG's own
 * `findNextTab`/`findPrevTab`/`findFirstTab`/`findLastTab` DOM-sibling
 * traversal.
 */
@Component({
  standalone: true,
  selector: "u-tab",
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('tab', { active: active(), disabled: disabled() })",
    role: "tab",
    "[attr.aria-selected]": "active()",
    "[attr.aria-disabled]": "disabled()",
    "[attr.data-u-active]": "active()",
    "[attr.data-u-disabled]": "disabled()",
    "[attr.tabindex]": "tabindexAttr()",
  },
})
export class UTab extends UBaseComponent {
  protected override readonly componentName = "tabs";
  protected override readonly styleModule = tabsStyleModule;

  private readonly pcTabs = inject(UTabs);
  private readonly pcTabList = inject(UTabList);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  /** Value of this tab — must match a `UTabPanel`'s own `value` to link them. */
  value = input.required<string | number>();
  /** Whether this tab is disabled. */
  disabled = input(false, { transform: booleanAttribute });

  protected readonly active = computed(() => this.pcTabs.value() === this.value());
  protected readonly tabindexAttr = computed(() => (this.disabled() ? -1 : this.active() ? this.pcTabs.tabindex() : -1));

  @HostListener("focus")
  protected onFocus(): void {
    if (!this.disabled() && this.pcTabs.selectOnFocus()) {
      this.activate();
    }
  }

  @HostListener("click")
  protected onClick(): void {
    if (!this.disabled()) {
      this.activate();
    }
  }

  @HostListener("keydown", ["$event"])
  protected onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "ArrowRight":
        this.focusSibling(this.findNext(this.elementRef.nativeElement) ?? this.findFirst());
        event.preventDefault();
        break;
      case "ArrowLeft":
        this.focusSibling(this.findPrev(this.elementRef.nativeElement) ?? this.findLast());
        event.preventDefault();
        break;
      case "Home":
        this.focusSibling(this.findFirst());
        event.preventDefault();
        break;
      case "End":
        this.focusSibling(this.findLast());
        event.preventDefault();
        break;
      case "Enter":
      case "Space":
      case "NumpadEnter":
        if (!this.disabled()) this.activate();
        event.preventDefault();
        break;
      default:
        break;
    }
    event.stopPropagation();
  }

  private activate(): void {
    this.pcTabs.updateValue(this.value());
    setTimeout(() => this.pcTabList.updateInkBar());
  }

  private isEligible(el: Element | null): el is HTMLElement {
    return !!el && el.getAttribute("data-u-disabled") !== "true" && el.tagName.toLowerCase() === "u-tab";
  }

  private findNext(el: Element, selfCheck = false): HTMLElement | null {
    const candidate = selfCheck ? el : el.nextElementSibling;
    if (!candidate) return null;
    return this.isEligible(candidate) ? candidate : this.findNext(candidate);
  }

  private findPrev(el: Element, selfCheck = false): HTMLElement | null {
    const candidate = selfCheck ? el : el.previousElementSibling;
    if (!candidate) return null;
    return this.isEligible(candidate) ? candidate : this.findPrev(candidate);
  }

  private findFirst(): HTMLElement | null {
    const first = this.elementRef.nativeElement.parentElement?.firstElementChild ?? null;
    return first ? this.findNext(first, true) : null;
  }

  private findLast(): HTMLElement | null {
    const last = this.elementRef.nativeElement.parentElement?.lastElementChild ?? null;
    return last ? this.findPrev(last, true) : null;
  }

  private focusSibling(el: HTMLElement | null): void {
    el?.focus();
    el?.scrollIntoView?.({ block: "nearest" });
  }
}
