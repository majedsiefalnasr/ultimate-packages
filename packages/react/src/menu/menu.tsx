import * as React from "react";
import {
  useComponentBase,
  Portal,
  useOverlayListener,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  useMotion,
  useUpdateEffect,
  useUnmountEffect,
} from "@ultimate/react-core";
import { menuStyleModule } from "./menu-style";

export interface UMenuItem {
  label?: string;
  icon?: React.ReactNode;
  command?: (event: { originalEvent: React.SyntheticEvent; item: UMenuItem }) => void;
  disabled?: boolean;
  separator?: boolean;
  visible?: boolean;
  url?: string;
  items?: UMenuItem[];
}

export interface UMenuProps {
  model: UMenuItem[];
  popup?: boolean;
  // Accepted for API-surface parity with upstream's real prop (which drives
  // DomHandler.absolutePosition's overlay-vs-target alignment via imperative JS
  // measurement). Positioning/placement logic is explicitly deferred — not wired to
  // any CSS or measurement logic here — since it is a nontrivial, viewport-aware
  // feature outside this task's brief and its test coverage; see provenance.
  popupAlignment?: "left" | "right";
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  style?: React.CSSProperties;
  baseZIndex?: number;
  appendTo?: HTMLElement | (() => HTMLElement);
  closeOnEscape?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

export interface UMenuHandle {
  toggle: (event: React.SyntheticEvent) => void;
  show: (event: React.SyntheticEvent) => void;
  hide: (event?: React.SyntheticEvent) => void;
}

// Ultimate-owned stable data-attribute convention, independent of any passthrough
// system (spec §10 — PrimeReact's own data-pc-* selectors are passthrough-derived
// and not ported since pt is excluded).
const MENUITEM_ATTR = "data-u-menuitem";
const DISABLED_ATTR = "data-u-disabled";
const MENUITEM_SELECTOR = `li[${MENUITEM_ATTR}][${DISABLED_ATTR}="false"]`;

export const UMenu = React.forwardRef<UMenuHandle, UMenuProps>(function UMenu(
  {
    model,
    popup = false,
    // popupAlignment: accepted for API-surface parity only (see UMenuProps doc comment
    // above) — intentionally not destructured here since positioning logic is deferred
    // and nothing in this component reads it.
    id,
    ariaLabel,
    ariaLabelledBy,
    className,
    style,
    baseZIndex,
    appendTo,
    closeOnEscape = true,
    onShow,
    onHide,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "menu", styleModule: menuStyleModule });
  const generatedMenuId = React.useId();
  const menuId = id ?? generatedMenuId;
  const [visible, setVisible] = React.useState(!popup);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [focused, setFocused] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();

  // Two-state mount/motion model, matching verified upstream Menu.js (visibleState +
  // CSSTransition's unmountOnExit/onExited) and re-applying the fix already proven in
  // UDialog (Task 17): a plain `if (!visible) return null` unmounts synchronously and
  // detaches menuRef.current before useMotion's leave-phase effect can run against it,
  // defeating the leave animation entirely. `containerVisible` gates mount/unmount and
  // stays `true` through the leave animation; useMotion's onAfterLeave hook (fired once
  // the leave phase genuinely completes) is what actually unmounts. Inline mode
  // (`popup: false`) never toggles `visible` after mount, so this two-state machinery is
  // popup-mode-relevant only, matching upstream's `visibleState` initializing to
  // `!props.popup` and never changing for inline menus.
  const [containerVisible, setContainerVisible] = React.useState(visible);

  // Portal defers its first real DOM commit by one render pass (SSR-guard mount effect,
  // see portal.tsx). When `visible` is already `true` on this component's very first
  // render (popup mode), the z-index and motion effects below would run against a ref
  // that Portal hasn't attached to the DOM yet. `portalReady` flips true once Portal's
  // `onMount` callback confirms the portalled content actually committed, giving those
  // effects a signal to re-run after the ref is populated.
  const [portalReady, setPortalReady] = React.useState(false);

  const isCloseOnEscape = !!(visible && popup && closeOnEscape);
  const displayOrder = useDisplayOrder("menu", isCloseOnEscape);

  const hide = React.useCallback(
    (event?: React.SyntheticEvent) => {
      // Guard against re-entrancy: hide() can be reached from multiple independent
      // triggers (Escape, outside click, Tab, item click, Alt+ArrowUp) that can race
      // (e.g. Escape and an outside click in the same tick) — without this guard a
      // second call would redundantly call setVisible(false) again. onHide itself is
      // NOT called here; it fires from useMotion's onAfterLeave below, once the leave
      // phase genuinely completes, consistent with the two-state model's onShow/onHide
      // timing (onShow fires at the start of the enter phase in show(), matching
      // upstream; onHide fires at the end of the leave phase, matching upstream's
      // onExited-driven ZIndexUtils.clear/unbindOverlayListener timing).
      if (!visible) return;
      if (event) targetRef.current = event.currentTarget as HTMLElement;
      setVisible(false);
    },
    [visible]
  );

  const show = React.useCallback(
    (event: React.SyntheticEvent) => {
      targetRef.current = event.currentTarget as HTMLElement;
      setVisible(true);
      onShow?.();
    },
    [onShow]
  );

  const toggle = React.useCallback(
    (event: React.SyntheticEvent) => {
      if (!popup) return;
      if (visible) {
        hide(event);
      } else {
        show(event);
      }
    },
    [popup, visible, hide, show]
  );

  React.useImperativeHandle(ref, () => ({ toggle, show, hide }));

  useGlobalEscapeKey({
    callback: () => hide(),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.MENU, displayOrder],
  });

  // Stabilized via useCallback: useOverlayListener's own bind/unbind memoization keys
  // on this exact listener reference, so a fresh inline arrow function on every render
  // would defeat that memoization and leak the underlying document click listener past
  // unbind/unmount (verified regression, see menu.spec.tsx's teardown test).
  const onOverlayEvent = React.useCallback(
    (_event: Event, meta: { valid: boolean; type: string }) => {
      if (meta.valid && meta.type === "outside") {
        hide();
        setFocusedId(null);
      }
    },
    [hide]
  );

  const [bindOverlay, unbindOverlay] = useOverlayListener({
    target: targetRef as React.RefObject<HTMLElement>,
    overlay: menuRef,
    listener: onOverlayEvent,
    when: visible && popup,
  });

  useUpdateEffect(() => {
    if (visible) setContainerVisible(true);
    // The visible=false case is handled by useMotion's onAfterLeave below, once the
    // leave animation actually completes — see the containerVisible comment above.
  }, [visible]);

  useUpdateEffect(() => {
    if (!containerVisible || !popup) return;

    if (visible) {
      setZIndex("menu", menuRef.current, baseZIndex);
      bindOverlay();
    }
    // `portalReady` is included so this effect also re-runs once Portal's deferred first
    // commit actually attaches the DOM (mount-time-visible popup case, see portal.tsx/
    // use-motion.ts) — it adds one extra, already-stable dependency for the normal
    // toggle-open case.
  }, [visible, containerVisible, portalReady]);

  useMotion(
    menuRef,
    visible && containerVisible,
    {
      name: "u-menu",
      onAfterLeave: () => {
        if (!popup) return;
        clearZIndex(menuRef.current);
        unbindOverlay();
        setContainerVisible(false);
        // Portal fully unmounts whenever containerVisible goes false (the `if
        // (!containerVisible) return null` above removes it from the tree), so its next
        // mount will start with a fresh internal `mounted=false` again. Reset
        // `portalReady` here so the NEXT open's onMount callback produces a real
        // false→true transition instead of a same-value no-op that React would bail out
        // of — otherwise the z-index/motion effects would silently no-op on every open
        // after the first (menuRef.current is still null when they first run post-open,
        // same defect as Finding 1, just recurring instead of mount-only).
        setPortalReady(false);
        onHide?.();
      },
    },
    portalReady
  );

  useUnmountEffect(() => {
    if (!popup) return;
    clearZIndex(menuRef.current);
    unbindOverlay();
  });

  const getMenuItemEls = React.useCallback((): HTMLLIElement[] => {
    return listRef.current
      ? [...listRef.current.querySelectorAll<HTMLLIElement>(MENUITEM_SELECTOR)]
      : [];
  }, []);

  const changeFocusedIndex = (index: number) => {
    const items = getMenuItemEls();
    const clamped = index >= items.length ? items.length - 1 : index < 0 ? 0 : index;
    if (clamped >= 0 && items[clamped]) setFocusedId(items[clamped].id);
  };

  const findCurrentIndex = () => getMenuItemEls().findIndex((el) => el.id === focusedId);

  const onListFocus = () => {
    setFocused(true);
    if (focusedId === null) changeFocusedIndex(0);
  };

  const onListBlur = () => {
    setFocused(false);
    setFocusedId(null);
  };

  const invokeFocused = (event: React.SyntheticEvent) => {
    const items = getMenuItemEls();
    const current = items.find((el) => el.id === focusedId);
    const anchor = current?.querySelector<HTMLAnchorElement>("a");
    (anchor ?? current)?.click();
    event.preventDefault();
  };

  const onListKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    switch (event.code) {
      case "ArrowDown":
        changeFocusedIndex(findCurrentIndex() + 1);
        event.preventDefault();
        break;
      case "ArrowUp":
        if (event.altKey && popup) {
          targetRef.current?.focus();
          hide();
        } else {
          changeFocusedIndex(findCurrentIndex() - 1);
        }
        event.preventDefault();
        break;
      case "Home":
        changeFocusedIndex(0);
        event.preventDefault();
        break;
      case "End":
        changeFocusedIndex(getMenuItemEls().length - 1);
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        invokeFocused(event);
        break;
      case "Escape":
        if (popup) {
          targetRef.current?.focus();
          hide();
        }
        break;
      case "Tab":
        if (popup && visible) hide();
        break;
      default:
        break;
    }
  };

  const onItemClick = (event: React.MouseEvent, item: UMenuItem, itemId: string) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.command?.({ originalEvent: event, item });
    if (popup) hide();
    if (!popup) setFocusedId(itemId);
    if (!item.url) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const renderItem = (item: UMenuItem, index: number): React.ReactNode => {
    if (item.visible === false) return null;
    if (item.separator) {
      return <li key={`${menuId}_sep_${index}`} className={cx("separator")} role="separator" />;
    }
    const itemId = `${menuId}_${index}`;
    return (
      <li
        key={itemId}
        id={itemId}
        {...{ [MENUITEM_ATTR]: "" }}
        {...{ [DISABLED_ATTR]: String(!!item.disabled) }}
        role="menuitem"
        aria-disabled={item.disabled}
        aria-label={item.label}
        className={cx("menuitem", { focused: focusedId === itemId })}
        onClick={(e) => onItemClick(e, item, itemId)}
      >
        <div className={cx("content")}>
          <a href={item.url ?? "#"} className={cx("action")} tabIndex={-1}>
            {item.icon && <span className={cx("icon")}>{item.icon}</span>}
            {item.label && <span className={cx("label")}>{item.label}</span>}
          </a>
        </div>
      </li>
    );
  };

  if (!containerVisible) return null;

  const menuElement = (
    <div
      ref={menuRef}
      id={popup ? undefined : menuId}
      className={[cx("root", { popup }), className].filter(Boolean).join(" ")}
      style={style}
    >
      <ul
        ref={listRef}
        id={`${menuId}_list`}
        className={cx("menu")}
        role="menu"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-activedescendant={focused ? (focusedId ?? undefined) : undefined}
        onFocus={onListFocus}
        onBlur={onListBlur}
        onKeyDown={onListKeyDown}
      >
        {model.map((item, index) => renderItem(item, index))}
      </ul>
    </div>
  );

  return popup ? (
    <Portal
      element={menuElement}
      appendTo={appendTo}
      visible
      onMount={() => setPortalReady(true)}
    />
  ) : (
    menuElement
  );
});
