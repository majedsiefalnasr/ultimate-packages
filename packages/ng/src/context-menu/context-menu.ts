import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewChild,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { UBaseComponent, UOverlay, type UMenuItem } from "@ultimate/ng-core";
import {
  ESCAPE_PRIORITIES,
  displayOrderRegistry,
  escapeRegistry,
} from "@ultimate/uix-utils/escape";
import { ZIndex } from "@ultimate/uix-utils/zindex";
import { contextMenuStyleModule } from "./context-menu-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `ContextMenu` component (see
 * `.vendor-extracted/ng/contextmenu/contextmenu.ts`). Confirmed against real
 * source: ContextMenu's real activation mechanism is the browser's native
 * `contextmenu` DOM event (right-click) — real source's `bindTriggerEventListener`
 * defaults `triggerEvent = 'contextmenu'` and listens either on `document`
 * (`global: true`) or on a given `target` element, calling `show(event)`,
 * which reads `event.pageX`/`event.pageY` to position the menu and calls
 * `event.preventDefault()` to suppress the browser's own native context menu.
 *
 * This port has no `target` input. It supports two triggers:
 * - `global: true` — listens for `contextmenu` on the whole document;
 * - otherwise — a right-click on this component's own `<u-context-menu>` host
 *   element (an Ultimate adaptation; PrimeNG has no host fallback). The host
 *   renders no content of its own (the menu is appended to `document.body`),
 *   so a consumer using this mode must give the host element a hit area, for
 *   example `style="display: block; min-height: 6rem"`, or use `global`.
 *
 * The menu is positioned at the right-click's page coordinates once its list
 * has rendered.
 *
 * Renders a flat `UMenuItem[]` list (no nested submenus) — matching
 * `UMenu`'s own established reduction of PrimeNG's real recursive
 * `ContextMenuSub` structure; nested-submenu support is `UTieredMenu`'s own
 * distinct capability, not duplicated here. Composes `UOverlay` for the
 * body-append + z-index behavior. Dismissed on outside click, Escape, and
 * window resize — the same real dismissal triggers upstream's own
 * `bindGlobalListeners`/`onEscapeKey`/`resizeListener` implement.
 *
 * Deliberately excludes upstream's much larger surface: nested submenus,
 * roving/virtual keyboard focus beyond a simple focused-index highlight,
 * touch long-press activation, `breakpoints`-driven responsive `<style>`
 * injection, and router-link items — none of these appear in this
 * capability's spec-mandated surface (same "smaller surface than upstream"
 * precedent as every sibling component).
 */
@Component({
  standalone: true,
  selector: "u-context-menu",
  imports: [UOverlay],
  host: {
    "(contextmenu)": "onHostContextMenu($event)",
  },
  template: `
    @if (render()) {
      <div uOverlay [visible]="visible()" appendTo="body" [class]="cx('root')">
        <ul #list [class]="cx('rootList')" role="menu">
          @for (item of model(); track $index) {
            @if (item.separator) {
              <li [class]="cx('separator')" role="separator"></li>
            } @else if (item.visible !== false) {
              <li
                [class]="cx('item', itemParams(item, $index))"
                role="menuitem"
                [attr.data-u-disabled]="!!item.disabled"
              >
                <div [class]="cx('itemContent')">
                  <a
                    [attr.href]="item.url ?? '#'"
                    [class]="cx('itemLink')"
                    [attr.aria-disabled]="item.disabled || null"
                    [attr.tabindex]="-1"
                    (click)="onItemClick($event, item)"
                    (mouseenter)="focusedIndex.set($index)"
                  >
                    @if (item.icon) {
                      <span [class]="item.icon + ' ' + cx('itemIcon')"></span>
                    }
                    @if (item.label) {
                      <span [class]="cx('itemLabel')">{{ item.label }}</span>
                    }
                  </a>
                </div>
              </li>
            }
          }
        </ul>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UContextMenu extends UBaseComponent {
  protected override readonly componentName = "context-menu";
  protected override readonly styleModule = contextMenuStyleModule;

  /** An array of menuitems. */
  model = input<UMenuItem[]>([]);
  /** When true, listens for `contextmenu` on the whole document instead of just this component's own host element. */
  global = input(false);

  /** Callback to invoke when overlay menu is shown. */
  onShow = output<void>();
  /** Callback to invoke when overlay menu is hidden. */
  onHide = output<void>();
  /** Fired when a menu item is selected. */
  onItemSelect = output<{ originalEvent: MouseEvent; item: UMenuItem }>();

  @ViewChild("list") private listRef?: ElementRef<HTMLUListElement>;

  protected readonly visible = signal(false);
  protected readonly render = signal(false);
  protected readonly focusedIndex = signal(-1);

  private documentClickListener: ((event: MouseEvent) => void) | null = null;
  private documentContextMenuListener: ((event: MouseEvent) => void) | null = null;
  private windowResizeListener: (() => void) | null = null;
  private displayOrder: number | undefined;
  private static instanceCount = 0;
  private readonly instanceUid = ++UContextMenu.instanceCount;
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    super.ngOnInit();
    if (this.global() && isPlatformBrowser(this.platformId)) {
      this.documentContextMenuListener = (event: MouseEvent) => this.show(event);
      document.addEventListener("contextmenu", this.documentContextMenuListener);
    }
  }

  protected onHostContextMenu(event: MouseEvent): void {
    if (!this.global()) {
      this.show(event);
    }
  }

  protected itemParams(item: UMenuItem, index: number) {
    return { disabled: !!item.disabled, focused: this.focusedIndex() === index };
  }

  protected onItemClick(event: MouseEvent, item: UMenuItem): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.url) {
      event.preventDefault();
    }
    item.command?.({ originalEvent: event, item });
    this.onItemSelect.emit({ originalEvent: event, item });
    this.hide();
  }

  /** Shows the menu positioned at the given event's page coordinates. */
  show(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.focusedIndex.set(-1);
    this.visible.set(true);
    this.render.set(true);
    this.bindDismissListeners();
    this.registerEscape();
    const pageX = event.pageX;
    const pageY = event.pageY;
    // The list only exists once Angular renders the @if (render()) block, so
    // position after the next render (PrimeNG positions in onBeforeEnter,
    // once its container exists). position() is unchanged and still returns
    // early if the menu was hidden before this runs.
    afterNextRender(() => this.position(pageX, pageY), { injector: this.injector });
    this.onShow.emit();
  }

  /** Hides the menu. */
  hide(): void {
    if (!this.visible()) {
      return;
    }
    this.visible.set(false);
    this.render.set(false);
    this.unbindDismissListeners();
    this.unregisterEscape();
    this.onHide.emit();
  }

  private position(pageX: number, pageY: number): void {
    const list = this.listRef?.nativeElement;
    const container = list?.parentElement;
    if (!container) {
      return;
    }
    let left = pageX + 1;
    let top = pageY + 1;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + width > viewportWidth) {
      left -= width;
    }
    if (top + height > viewportHeight) {
      top -= height;
    }
    container.style.left = `${Math.max(0, left)}px`;
    container.style.top = `${Math.max(0, top)}px`;
    ZIndex.set("menu", container, 1000);
  }

  private bindDismissListeners(): void {
    if (!this.documentClickListener) {
      this.documentClickListener = (event: MouseEvent) => {
        const container = this.listRef?.nativeElement.parentElement;
        if (container && !container.contains(event.target as Node) && event.button !== 2) {
          this.hide();
        }
      };
      document.addEventListener("click", this.documentClickListener);
    }
    if (!this.windowResizeListener) {
      this.windowResizeListener = () => this.hide();
      window.addEventListener("resize", this.windowResizeListener);
    }
  }

  private unbindDismissListeners(): void {
    if (this.documentClickListener) {
      document.removeEventListener("click", this.documentClickListener);
      this.documentClickListener = null;
    }
    if (this.windowResizeListener) {
      window.removeEventListener("resize", this.windowResizeListener);
      this.windowResizeListener = null;
    }
  }

  /**
   * Keys Escape by open order in the "menu" display-order group shared with
   * `UMenu` popups (React/Vue ContextMenu's `useDisplayOrder`/
   * `createDisplayOrderMixin` parity), so the most recently opened menu of
   * either kind closes first and the two never share an `escapeRegistry` key.
   */
  private registerEscape(): void {
    if (this.displayOrder !== undefined) {
      return;
    }
    this.displayOrder = displayOrderRegistry.register("menu", this.instanceUid);
    escapeRegistry.register(ESCAPE_PRIORITIES.MENU, this.displayOrder, () => this.hide());
  }

  private unregisterEscape(): void {
    if (this.displayOrder === undefined) {
      return;
    }
    escapeRegistry.unregister(ESCAPE_PRIORITIES.MENU, this.displayOrder);
    displayOrderRegistry.unregister("menu", this.instanceUid);
    this.displayOrder = undefined;
  }

  ngOnDestroy(): void {
    this.unbindDismissListeners();
    this.unregisterEscape();
    if (this.documentContextMenuListener) {
      document.removeEventListener("contextmenu", this.documentContextMenuListener);
      this.documentContextMenuListener = null;
    }
    const container = this.listRef?.nativeElement.parentElement;
    if (container) {
      ZIndex.clear(container);
    }
  }
}
