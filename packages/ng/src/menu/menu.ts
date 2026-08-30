import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChildren,
  ViewEncapsulation,
  type QueryList,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { UBaseComponent, type UMenuItem } from "@ultimate/ng-core";
import { URipple } from "../ripple";
import { UTooltip } from "../tooltip";
import { menuStyleModule } from "./menu-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Menu` component (see
 * `.vendor-extracted/ng/menu/menu.ts`). Renders a navigation/command list —
 * a flat `<ul role="menu">` of `UMenuItem` entries, each rendered as
 * `<li role="none"><a role="menuitem">`, or `<li role="separator">` for
 * separator entries.
 *
 * Deliberately excludes upstream's much larger surface — `popup` overlay
 * positioning/`show()`/`hide()`/`toggle()`, `appendTo`/overlay-append,
 * `autoZIndex`/`baseZIndex`/z-index stacking, motion (`pMotion`/
 * `computedMotionOptions`), submenu support (`hasSubMenu()`/
 * `submenuLabel`/nested `item.items`), `start`/`end`/`header`/`item`/
 * `submenuheader` `TemplateRef` content-projection slots, `styleClass`/
 * `style` inline-style inputs, `ariaLabel`/`ariaLabelledBy`, document
 * click/resize/scroll listener wiring, `MenuItemContent`'s separate
 * `[pMenuItemContent]` child component split, `command`-passthrough via a
 * dedicated `itemClick()` orchestration layer beyond a plain click handler,
 * and the `Home`/`End`/`Enter`/`Space`/`Escape`/`Tab` key handlers real
 * PrimeNG's `onListKeyDown()` also implements — none of these appear in
 * this task's Interfaces section, which defines a smaller, spec-mandated
 * signal-input surface: `model`, `popup` (`popup` is accepted as an input
 * per the Interfaces section, but this task's file list has no popup-overlay
 * component to render into, so it is currently inert beyond flagging the
 * `u-menu-overlay` style-class variant — matching `MenuStyle`'s own
 * `classes.root` popup branch). A future task can extend this component's
 * input/output surface for the popup overlay, submenu nesting, and the
 * additional key handlers.
 *
 * DISCREPANCY (brief vs. real extracted source) — roving tabindex: real
 * PrimeNG's `Menu` does NOT move native DOM focus between `<li>`/`<a>`
 * elements. It keeps the single native focus on the root `<ul>`
 * (`tabindex` from its own `tabindex` input, default `0`) and tracks a
 * `focusedOptionIndex` signal, publishing it via `aria-activedescendant` on
 * the `<ul>` and `data-p-focused` on each `<li>` (`onArrowDownKey` /
 * `changeFocusedOptionIndex` in `.vendor-extracted/ng/menu/menu.ts` lines
 * 698-761) — a virtual-focus / `aria-activedescendant` pattern, not a
 * literal roving-tabindex-with-`.focus()` pattern. This task's brief (Step
 * 5) and its own spec test (`moves focus to the next menuitem on
 * ArrowDown`, asserting `document.activeElement === menuItems[1]`) give an
 * explicit, different, and unambiguous resolution: implement a literal
 * roving-tabindex pattern — move `tabindex="0"`/`-1"` between anchors and
 * call `.focus()` on the next one — rather than porting upstream's
 * `aria-activedescendant` virtual-focus mechanism. Per this plan's stated
 * rule ("adapt to the real source... UNLESS the brief gives a clear,
 * explicit resolution path"), the brief's explicit path is followed here.
 *
 * Tooltip/Router wiring: real PrimeNG applies `pTooltip`/`routerLink` to
 * the anchor rendered by its separate `MenuItemContent` child component
 * (`.vendor-extracted/ng/menu/menu.ts` lines 74-110). This task's smaller
 * single-component surface applies the equivalent `[uTooltip]`/
 * `[routerLink]` bindings directly on this component's own `<a>` — same
 * dependency, same load-bearing behavior (internal navigation), adapted to
 * this task's flatter file-list scope. Unlike real PrimeNG (which gates its
 * tooltip behind `showOnEllipsis` truncation-detection, out of `UTooltip`'s
 * scope), the tooltip here is opt-in via `UMenuItem.tooltip` rather than
 * bound unconditionally to `item.label` — the latter showed a redundant
 * tooltip duplicating the visible label on every item, not just truncated
 * ones. `[routerLink]` is also suppressed when `item.disabled` is set, so a
 * disabled item is never a real navigable link (middle-click/ctrl-click/
 * screen-reader link lists would otherwise bypass `onItemClick`'s
 * `preventDefault`).
 *
 * `@ViewChildren` here (querying rendered `<a role="menuitem">` anchors)
 * is read only inside keydown handlers, which fire strictly after Angular
 * has rendered the `@for` loop from an already-set `model()` input — unlike
 * `UDialog`'s (Task 15) `@ViewChild` read inside a synchronous `effect()`
 * on the *same* tick a signal flips (which needed `afterNextRender`), there
 * is no equivalent same-tick post-render read here, so no
 * `afterNextRender`/`Injector` indirection is needed for this query.
 *
 * DISCREPANCY (brief vs. working code): Step 5 instructs importing `UBadge`
 * into `imports`. It is deliberately excluded here — `UMenuItem` (Task 10,
 * `packages/ng-core/src/api/types.ts`) has no `badge` field, so no template
 * element can bind a `<u-badge>` to it. As with `UButton`'s (Task 12) and
 * `UDialog`'s (Task 15) documented precedent, an unused `imports` entry
 * fails compilation with `NG8113` — confirmed here directly. A future task
 * adding a `badge` field to `UMenuItem` can add this import back.
 */
@Component({
  standalone: true,
  selector: "u-menu",
  imports: [RouterModule, URipple, UTooltip],
  template: `
    <div [class]="cx('root', classesParams())">
      <ul
        role="menu"
        [class]="cx('list')"
        (keydown.arrowDown)="onArrowDown($event)"
        (keydown.arrowUp)="onArrowUp($event)"
      >
        @for (item of model(); track $index) {
          @if (item.separator) {
            <li role="separator" [class]="cx('separator')"></li>
          } @else {
            <li role="none" [class]="cx('item', itemClassesParams(item))">
              <a
                role="menuitem"
                #menuItemLink
                [class]="cx('itemLink')"
                [tabindex]="$index === firstFocusableIndex() ? 0 : -1"
                [attr.aria-disabled]="item.disabled || null"
                [routerLink]="item.disabled ? null : (item.routerLink ?? null)"
                [uTooltip]="item.tooltip"
                uRipple
                (click)="onItemClick($event, item)"
              >
                @if (item.icon) {
                  <span [class]="item.icon + ' ' + cx('itemIcon')"></span>
                }
                <span [class]="cx('itemLabel')">{{ item.label }}</span>
              </a>
            </li>
          }
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMenu extends UBaseComponent {
  protected override readonly componentName = "menu";
  protected override readonly styleModule = menuStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** Defines if menu would displayed as a popup. */
  popup = input(false, { transform: booleanAttribute });

  /**
   * Model index of the first rendered `<a role="menuitem">` (i.e. the first
   * non-separator item), used to seed initial `tabindex="0"` placement.
   * `$index` in the template counts every model entry including separators
   * (which render no anchor), so comparing directly against `0` breaks
   * roving tabindex whenever a menu's first item is a separator — nothing
   * would ever receive `tabindex="0"`. Falls back to `0` for an all-
   * separator model (harmless: no anchor exists to receive it either way).
   */
  protected readonly firstFocusableIndex = computed(() => {
    const index = this.model().findIndex((item) => !item.separator);
    return index === -1 ? 0 : index;
  });

  @ViewChildren("menuItemLink") private menuItemLinks?: QueryList<ElementRef<HTMLAnchorElement>>;

  protected classesParams() {
    return { popup: this.popup() };
  }

  protected itemClassesParams(item: UMenuItem) {
    return { disabled: !!item.disabled };
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.(event);
  }

  protected onArrowDown(event: Event): void {
    event.preventDefault();
    this.moveFocus(event.target as HTMLElement, 1);
  }

  protected onArrowUp(event: Event): void {
    event.preventDefault();
    this.moveFocus(event.target as HTMLElement, -1);
  }

  /**
   * Roving tabindex: moves `tabindex="0"` off `current` and onto the
   * next/previous enabled, non-separator `<a role="menuitem">`, then calls
   * `.focus()` on it. See this class's doc comment for why this literal
   * DOM-focus-moving pattern is used instead of upstream's
   * `aria-activedescendant` virtual-focus mechanism.
   */
  private moveFocus(current: HTMLElement, direction: 1 | -1): void {
    const links = this.menuItemLinks?.toArray().map((ref) => ref.nativeElement) ?? [];
    if (links.length === 0) {
      return;
    }

    const currentIndex = links.indexOf(current as HTMLAnchorElement);
    if (currentIndex === -1) {
      return;
    }

    // Skip disabled items: aria-disabled is rendered on every anchor per the
    // model's own item.disabled value (see template), so checking it here
    // (rather than threading model data through this method) keeps the skip
    // logic DOM-local and correct even if links and model() ever diverge in
    // order. Bounded by links.length so an all-disabled menu can't loop
    // forever.
    let nextIndex = currentIndex;
    for (let i = 0; i < links.length; i++) {
      nextIndex = (nextIndex + direction + links.length) % links.length;
      if (links[nextIndex].getAttribute("aria-disabled") !== "true") {
        break;
      }
    }

    const nextLink = links[nextIndex];
    if (nextLink === links[currentIndex]) {
      return;
    }

    links[currentIndex].setAttribute("tabindex", "-1");
    nextLink.setAttribute("tabindex", "0");
    nextLink.focus();
  }
}
