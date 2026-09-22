import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { orderListStyleModule } from "./order-list-style";

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

export interface UOrderListProps<T = unknown> {
  value: T[];
  onChange: (value: T[]) => void;
  autoOptionFocus?: boolean;
  focusOnHover?: boolean;
  tabIndex?: number;
  listStyle?: React.CSSProperties;
  itemTemplate: (item: T) => React.ReactNode;
  dataKey?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: MatchMode;
  filterLocale?: string;
  dragdrop?: boolean;
  breakpoint?: string;
  className?: string;
}

export function UOrderList<T = unknown>({
  value,
  onChange,
  autoOptionFocus = true,
  focusOnHover = false,
  tabIndex = 0,
  listStyle,
  itemTemplate,
  dataKey,
  filter = false,
  filterBy,
  filterMatchMode = "contains",
  filterLocale,
  dragdrop = false,
  breakpoint = "960px",
  className,
}: UOrderListProps<T>): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "order-list",
    styleModule: orderListStyleModule,
  });
  const id = React.useId().replace(/:/g, "");
  const [selected, setSelected] = React.useState<T[]>([]);
  const [query, setQuery] = React.useState("");
  const drag = React.useRef<T | null>(null);
  const identity = (item: T): unknown => (dataKey ? field(item, dataKey) : item);
  const isSelected = (item: T): boolean =>
    selected.some((selectedItem) => identity(selectedItem) === identity(item));

  const select = (item: T): void => {
    setSelected((current) =>
      current.some((selectedItem) => identity(selectedItem) === identity(item))
        ? current.filter((selectedItem) => identity(selectedItem) !== identity(item))
        : [...current, item]
    );
  };

  const move = (direction: "up" | "top" | "down" | "bottom"): void => {
    const next = [...value];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter(isSelected);
      const rest = next.filter((item) => !isSelected(item));
      onChange(direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
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
        isSelected(next[index]) &&
        !isSelected(next[destination])
      ) {
        [next[index], next[destination]] = [next[destination], next[index]];
      }
    }
    onChange(next);
  };

  const drop = (before: T | undefined, event: React.DragEvent): void => {
    if (!dragdrop || drag.current === null) return;
    event.preventDefault();
    event.stopPropagation();
    const item = drag.current;
    drag.current = null;
    const from = value.indexOf(item);
    if (from < 0) return;

    const next = [...value];
    const destination = before === undefined ? next.length - 1 : next.indexOf(before);
    if (destination < 0) return;
    next.splice(from, 1);
    next.splice(destination, 0, item);
    onChange(next);
    setSelected([]);
  };

  const keyDown = (item: T, event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(item);
      return;
    }

    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
    );
    const index = options.indexOf(event.currentTarget);
    const destination =
      event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowUp"
          ? index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : -1;
    if (options[destination]) {
      event.preventDefault();
      options[destination].focus();
    }
  };

  const visible =
    !filter || !query
      ? value
      : value.filter((item) =>
          (filterBy ? filterBy.split(",").map((path) => field(item, path.trim())) : [item]).some(
            (candidate) => matches(candidate, query, filterMatchMode, filterLocale)
          )
        );

  return (
    <div id={id} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <style>{`@media (max-width: ${breakpoint}) { #${id} { grid-template-columns: minmax(0, 1fr); } }`}</style>
      <section data-pc-section="sourcelist">
        <div className={cx("controls")}>
          {(["up", "top", "down", "bottom"] as const).map((direction) => (
            <button
              key={direction}
              type="button"
              data-move={direction}
              disabled={selected.length === 0}
              onClick={() => move(direction)}
            >
              Move {direction}
            </button>
          ))}
        </div>
        {filter && (
          <input
            type="text"
            role="searchbox"
            aria-label="Filter source"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        )}
        <ul
          className={cx("list")}
          role="listbox"
          aria-label="Source"
          aria-multiselectable="true"
          tabIndex={tabIndex}
          style={listStyle}
          onFocus={(event) => {
            if (autoOptionFocus && event.target === event.currentTarget) {
              event.currentTarget.querySelector<HTMLElement>('[role="option"]')?.focus();
            }
          }}
          onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
          onDrop={dragdrop ? (event) => drop(undefined, event) : undefined}
        >
          {visible.map((item, index) => (
            <li
              key={dataKey ? String(identity(item)) : index}
              className={isSelected(item) ? cx("itemSelected") : cx("listItem")}
              role="option"
              aria-selected={isSelected(item)}
              tabIndex={-1}
              draggable={dragdrop || undefined}
              onClick={() => select(item)}
              onKeyDown={(event) => keyDown(item, event)}
              onMouseEnter={(event) => {
                if (focusOnHover) event.currentTarget.focus();
              }}
              onDragStart={
                dragdrop
                  ? (event) => {
                      drag.current = item;
                      event.dataTransfer.setData("text/plain", String(index));
                      event.dataTransfer.effectAllowed = "move";
                    }
                  : undefined
              }
              onDragEnd={dragdrop ? () => (drag.current = null) : undefined}
              onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
              onDrop={dragdrop ? (event) => drop(item, event) : undefined}
            >
              {itemTemplate(item)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
