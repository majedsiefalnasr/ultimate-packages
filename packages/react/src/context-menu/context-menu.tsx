import * as React from "react";
import {
  useComponentBase,
  Portal,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  useEventListener,
  useResizeListener,
} from "@ultimate/react-core";
import { contextMenuStyleModule } from "./context-menu-style";

export interface UContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  command?: (event: { originalEvent: React.SyntheticEvent; item: UContextMenuItem }) => void;
  disabled?: boolean;
  separator?: boolean;
  visible?: boolean;
  url?: string;
}

export interface UContextMenuProps {
  model: UContextMenuItem[];
  /** When true, listens for `contextmenu` on the whole document instead of just this component's own trigger element. */
  global?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  onItemSelect?: (event: { originalEvent: React.SyntheticEvent; item: UContextMenuItem }) => void;
  children?: React.ReactNode;
}

export interface UContextMenuHandle {
  show: (event: React.MouseEvent) => void;
  hide: () => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ContextMenu` component (real
 * source: `components/lib/contextmenu/ContextMenu.js`). Confirmed against
 * real source: ContextMenu's real activation mechanism is the browser's
 * native `contextmenu` DOM event (right-click) — real source's
 * `useEventListener({type: 'contextmenu', when: props.global, ...})`
 * listens on `document` when `global` is set, or its own root element
 * otherwise, calling `show(event)` which reads `event.pageX`/`event.pageY`
 * to position the menu and calls `event.preventDefault()` to suppress the
 * browser's own native context menu.
 *
 * This port wraps `children` in a trigger `<div onContextMenu>` (when not
 * `global`) or listens on `document` (when `global`), matching that same
 * real mechanism. Renders a flat `UContextMenuItem[]` list (no nested
 * submenus) — matching `UMenu`'s own established reduction of PrimeReact's
 * real recursive `ContextMenuSub` structure; nested-submenu support belongs
 * to `UTieredMenu`, not duplicated here. Composes `react-core`'s
 * already-Built `Portal`/`useGlobalEscapeKey`/`useZIndex` the same way
 * `UMenu` already does for its own popup mode. Dismissed on outside click,
 * Escape, and window resize.
 */
export const UContextMenu = React.forwardRef<UContextMenuHandle, UContextMenuProps>(
  function UContextMenu({ model, global = false, onShow, onHide, onItemSelect, children }, ref) {
    const { cx } = useComponentBase({
      componentName: "context-menu",
      styleModule: contextMenuStyleModule,
    });
    const [visible, setVisible] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const { set: setZIndex, clear: clearZIndex } = useZIndex();

    const isCloseOnEscape = visible;
    const displayOrder = useDisplayOrder("menu", isCloseOnEscape);

    const hide = React.useCallback(() => {
      setVisible(false);
      onHide?.();
    }, [onHide]);

    const position = React.useCallback((pageX: number, pageY: number) => {
      const container = containerRef.current;
      if (!container) return;
      let left = pageX + 1;
      let top = pageY + 1;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (left + width > window.innerWidth) left -= width;
      if (top + height > window.innerHeight) top -= height;
      container.style.left = `${Math.max(0, left)}px`;
      container.style.top = `${Math.max(0, top)}px`;
      setZIndex("menu", container, undefined);
    }, [setZIndex]);

    const show = React.useCallback(
      (event: React.MouseEvent | MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setFocusedIndex(-1);
        setVisible(true);
        onShow?.();
        const pageX = event.pageX;
        const pageY = event.pageY;
        // container isn't mounted yet on this same tick — position on next microtask.
        Promise.resolve().then(() => position(pageX, pageY));
      },
      [onShow, position]
    );

    React.useImperativeHandle(ref, () => ({
      show: (event: React.MouseEvent) => show(event),
      hide,
    }));

    const onTriggerContextMenu = (event: React.MouseEvent) => {
      if (!global) show(event);
    };

    const [bindGlobalContextMenu, unbindGlobalContextMenu] = useEventListener({
      target: "document",
      type: "contextmenu",
      listener: (event) => show(event as MouseEvent),
      when: global,
    });

    React.useEffect(() => {
      if (global) bindGlobalContextMenu();
      return unbindGlobalContextMenu;
    }, [global, bindGlobalContextMenu, unbindGlobalContextMenu]);

    useGlobalEscapeKey({
      callback: () => hide(),
      when: isCloseOnEscape,
      priority: [ESCAPE_PRIORITIES.MENU, displayOrder],
    });

    const [bindOutsideClick, unbindOutsideClick] = useEventListener({
      target: "document",
      type: "click",
      listener: (event) => {
        const container = containerRef.current;
        if (container && !container.contains(event.target as Node) && (event as MouseEvent).button !== 2) {
          hide();
        }
      },
      when: visible,
    });

    const [bindResize, unbindResize] = useResizeListener({ listener: () => hide(), when: visible });

    React.useEffect(() => {
      if (visible) {
        bindOutsideClick();
        bindResize();
      }
      return () => {
        unbindOutsideClick();
        unbindResize();
        clearZIndex(containerRef.current);
      };
    }, [visible, bindOutsideClick, unbindOutsideClick, bindResize, unbindResize, clearZIndex]);

    const onItemClick = (event: React.MouseEvent, item: UContextMenuItem) => {
      if (item.disabled) {
        event.preventDefault();
        return;
      }
      if (!item.url) event.preventDefault();
      item.command?.({ originalEvent: event, item });
      onItemSelect?.({ originalEvent: event, item });
      hide();
    };

    const menuElement = visible && (
      <div ref={containerRef} className={cx("root")}>
        <ul className={cx("rootList")} role="menu">
          {model.map((item, index) =>
            item.separator ? (
              <li key={`sep-${index}`} className={cx("separator")} role="separator" />
            ) : item.visible === false ? null : (
              <li
                key={item.label ?? index}
                className={cx("item", { disabled: item.disabled, focused: focusedIndex === index })}
                role="menuitem"
                data-u-disabled={!!item.disabled}
              >
                <div className={cx("itemContent")}>
                  <a
                    href={item.url ?? "#"}
                    className={cx("itemLink")}
                    aria-disabled={item.disabled || undefined}
                    tabIndex={-1}
                    onClick={(e) => onItemClick(e, item)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {item.icon}
                    {item.label && <span className={cx("itemLabel")}>{item.label}</span>}
                  </a>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    );

    return (
      <>
        {!global && (
          <div ref={triggerRef} onContextMenu={onTriggerContextMenu}>
            {children}
          </div>
        )}
        {visible && <Portal element={menuElement} visible />}
      </>
    );
  }
);
