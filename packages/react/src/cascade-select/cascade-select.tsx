import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { cascadeSelectStyleModule } from "./cascade-select-style";

export interface UCascadeSelectChangeEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T;
}

export interface UCascadeSelectProps<T = unknown> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: unknown[];
  optionLabel?: string | ((item: unknown) => string);
  optionValue?: string | ((item: unknown) => unknown);
  optionGroupChildren?: string;
  optionDisabled?: string | ((item: unknown) => boolean);
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  onSelect?: (event: UCascadeSelectChangeEvent<T>) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

interface ProcessedOption {
  option: unknown;
  key: string;
  parentKey: string;
  children: ProcessedOption[];
}

function resolve<R>(
  accessor: string | ((item: unknown) => R) | undefined,
  option: unknown,
  fallback: (option: unknown) => R
): R {
  if (typeof accessor === "function") return accessor(option);
  if (typeof accessor === "string" && typeof option === "object" && option !== null) {
    return (option as Record<string, unknown>)[accessor] as R;
  }
  return fallback(option);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `CascadeSelect` (real source:
 * `components/lib/cascadeselect/CascadeSelect.js`/`CascadeSelectBase.js`,
 * extracted this session via `scripts/provenance/extract-primereact-source.mjs`).
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape every sibling React
 * component in this batch follows.
 *
 * **Real structure — genuinely more complex than a flat dropdown, reported
 * per the proof-by-exception gate, then mapped onto the existing overlay
 * pattern since it still fit:** real source's own `getOptionGroupChildren`/
 * `isOptionGroup` walk builds a recursive option tree and renders it via a
 * recursive `CascadeSelectSub` component with hover/click-to-drill submenu
 * panels (`CascadeSelect.js` lines ~100-130, `CascadeSelectSub.js`). This
 * port keeps the same two-tier concept (a processed tree plus a drilled-path
 * set) but renders the recursion as a same-file recursive `SublistItem`
 * function component, absolute-positioned to the right of its parent
 * (`.u-cascade-select-sublist`), rather than PrimeReact's own separate
 * `CascadeSelectSub.js` module — still the same "single overlay/panel
 * surface, real click-to-drill interaction" shape real source establishes,
 * not a different architectural pattern. Matches `USelect`/`UMultiSelect`'s
 * established "absolute-positioned panel, no Portal" convention for this
 * capability family in React, with the sub-panel absolute-positioned
 * relative to its own parent `<li>` rather than to the root trigger.
 *
 * `optionGroupChildren` (default `"items"`) names the property holding an
 * option's child array — an option with a non-empty children array is a
 * group (click drills in, no selection); an option without one is a leaf
 * (click selects, closes the overlay).
 *
 * Deliberately excludes real source's much larger surface: keyboard
 * drill-down/up (Arrow-Right/Left), search-by-typing, virtual scrolling,
 * item/header/footer render-prop slots, and PrimeReact's global `context`
 * config lookup — matching every sibling component's established "smaller
 * surface than upstream" precedent.
 */
export function UCascadeSelect<T = unknown>({
  value,
  onChange,
  options,
  optionLabel,
  optionValue,
  optionGroupChildren = "items",
  optionDisabled,
  placeholder,
  disabled = false,
  emptyMessage = "No results found",
  className,
  onSelect,
  onFocus,
  onBlur,
}: UCascadeSelectProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "cascade-select", styleModule: cascadeSelectStyleModule });

  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [activeOptionPath, setActiveOptionPath] = React.useState<string[]>([]);

  const getOptionLabel = React.useCallback(
    (option: unknown): string => resolve(optionLabel, option, (o) => String(o)),
    [optionLabel]
  );
  const getOptionValue = React.useCallback(
    (option: unknown): unknown => resolve(optionValue, option, (o) => o),
    [optionValue]
  );
  const isOptionDisabled = React.useCallback(
    (option: unknown): boolean => resolve(optionDisabled, option, () => false),
    [optionDisabled]
  );

  const getGroupChildren = React.useCallback(
    (option: unknown): unknown[] => {
      if (typeof option === "object" && option !== null) {
        const children = (option as Record<string, unknown>)[optionGroupChildren];
        return Array.isArray(children) ? children : [];
      }
      return [];
    },
    [optionGroupChildren]
  );

  const buildTree = React.useCallback(
    (opts: unknown[], parentKey: string): ProcessedOption[] =>
      opts.map((option, index) => {
        const key = parentKey === "" ? String(index) : `${parentKey}_${index}`;
        const childrenSource = getGroupChildren(option);
        return {
          option,
          key,
          parentKey,
          children: childrenSource.length > 0 ? buildTree(childrenSource, key) : [],
        };
      }),
    [getGroupChildren]
  );

  const processedOptions = React.useMemo(() => buildTree(options, ""), [options, buildTree]);

  const findPathToValue = React.useCallback(
    (val: unknown, nodes: ProcessedOption[] = processedOptions): ProcessedOption[] | null => {
      for (const node of nodes) {
        if (node.children.length === 0) {
          if (getOptionValue(node.option) === val) return [node];
        } else {
          const childPath = findPathToValue(val, node.children);
          if (childPath) return [node, ...childPath];
        }
      }
      return null;
    },
    [processedOptions, getOptionValue]
  );

  const label = React.useMemo(() => {
    if (value == null) return placeholder;
    const path = findPathToValue(value);
    return path ? getOptionLabel(path[path.length - 1].option) : placeholder;
  }, [value, findPathToValue, getOptionLabel, placeholder]);

  const hide = () => {
    setOverlayVisible(false);
    setActiveOptionPath([]);
  };

  const show = () => {
    if (disabled) return;
    setOverlayVisible(true);
    if (value != null) {
      const path = findPathToValue(value);
      if (path) setActiveOptionPath(path.slice(0, -1).map((n) => n.key));
    }
  };

  const handleOptionClick = (event: React.SyntheticEvent, node: ProcessedOption) => {
    if (isOptionDisabled(node.option)) return;
    if (node.children.length > 0) {
      setActiveOptionPath((path) =>
        path.includes(node.key)
          ? path.filter((key) => key !== node.key && !key.startsWith(`${node.key}_`))
          : [...path.filter((key) => key !== node.parentKey), node.key]
      );
      return;
    }
    const optionVal = getOptionValue(node.option) as T;
    onChange(optionVal);
    onSelect?.({ originalEvent: event, value: optionVal });
    hide();
  };

  const renderSublist = (nodes: ProcessedOption[], depth: number): React.ReactElement => (
    <ul className={depth === 0 ? cx("list") : cx("sublist")} role="tree">
      {nodes.length === 0 && (
        <li className={cx("emptyMessage")} role="treeitem">
          {emptyMessage}
        </li>
      )}
      {nodes.map((node) => {
        const isGroup = node.children.length > 0;
        const isActive = activeOptionPath.includes(node.key);
        const isSelected = !isGroup && getOptionValue(node.option) === value;
        return (
          <li
            key={node.key}
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={isGroup ? isActive : undefined}
            className={cx("option")}
            style={{ position: "relative" }}
          >
            <div
              className={cx("optionContent", { selected: isSelected, disabled: isOptionDisabled(node.option) })}
              onClick={(event) => handleOptionClick(event, node)}
            >
              <span>{getOptionLabel(node.option)}</span>
              {isGroup && (
                <span className={cx("groupIcon")} aria-hidden="true">
                  &#9656;
                </span>
              )}
            </div>
            {isGroup && isActive && renderSublist(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={[cx("root", { disabled, overlayVisible }), className].filter(Boolean).join(" ")}>
      <span
        role="combobox"
        aria-haspopup="tree"
        aria-expanded={overlayVisible}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cx("label", { placeholder: value == null })}
        onClick={(event) => {
          if (disabled) return;
          overlayVisible ? hide() : show();
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          switch (event.code) {
            case "Enter":
            case "NumpadEnter":
            case "Space":
            case "ArrowDown":
              if (!overlayVisible) show();
              event.preventDefault();
              break;
            case "Escape":
              if (overlayVisible) {
                hide();
                event.preventDefault();
              }
              break;
            default:
              break;
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {label === undefined ? " " : label}
      </span>
      <div
        className={cx("dropdown")}
        role="button"
        aria-hidden="true"
        onClick={(event) => {
          if (disabled) return;
          overlayVisible ? hide() : show();
          event.stopPropagation();
        }}
      >
        <span aria-hidden="true">&#9662;</span>
      </div>
      {overlayVisible && <div className={cx("overlay")}>{renderSublist(processedOptions, 0)}</div>}
    </div>
  );
}
