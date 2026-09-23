import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { pickListStyleModule } from "./pick-list-style";

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
type Direction = "up" | "top" | "down" | "bottom";
type Side = 0 | 1;

function field(item: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value !== null && typeof value === "object"
          ? (value as Record<string, unknown>)[key]
          : undefined,
      item
    );
}

function matches(value: unknown, query: string, mode: MatchMode, locale?: string): boolean {
  if (!query) return true;
  const text = (candidate: unknown) => String(candidate ?? "").toLocaleLowerCase(locale);
  if (mode === "in") return query.split(",").some((part) => text(value) === text(part.trim()));
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

export interface UPickListProps<T = unknown> {
  source: T[];
  target: T[];
  onSourceChange: (value: T[]) => void;
  onTargetChange: (value: T[]) => void;
  itemTemplate: (item: T) => React.ReactNode;
  showSourceFilter?: boolean;
  showTargetFilter?: boolean;
  showSourceControls?: boolean;
  showTargetControls?: boolean;
  sourceHeader?: React.ReactNode;
  targetHeader?: React.ReactNode;
  sourceStyle?: React.CSSProperties;
  targetStyle?: React.CSSProperties;
  dataKey?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: MatchMode;
  filterLocale?: string;
  dragdrop?: boolean;
  metaKeySelection?: boolean;
  breakpoint?: string;
  className?: string;
}

export function UPickList<T = unknown>({
  source,
  target,
  onSourceChange,
  onTargetChange,
  itemTemplate,
  showSourceFilter = true,
  showTargetFilter = true,
  showSourceControls = true,
  showTargetControls = true,
  sourceHeader = "Source",
  targetHeader = "Target",
  sourceStyle,
  targetStyle,
  dataKey,
  filter = false,
  filterBy,
  filterMatchMode = "contains",
  filterLocale,
  dragdrop = false,
  metaKeySelection = false,
  breakpoint = "960px",
  className,
}: UPickListProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "pick-list", styleModule: pickListStyleModule });
  const id = React.useId().replace(/:/g, "");
  const lists = [source, target];
  const [selected, setSelected] = React.useState<[T[], T[]]>([[], []]);
  const [queries, setQueries] = React.useState<[string, string]>(["", ""]);
  const drag = React.useRef<{ side: Side; item: T } | null>(null);
  const identity = (item: T): unknown => (dataKey ? field(item, dataKey) : item);
  const same = (a: T, b: T): boolean => identity(a) === identity(b);
  const isSelected = (side: Side, item: T): boolean =>
    selected[side].some((candidate) => same(candidate, item));
  const emit = (side: Side, items: T[]): void =>
    (side === 0 ? onSourceChange : onTargetChange)(items);

  const select = (side: Side, item: T, event: React.MouseEvent | React.KeyboardEvent): void => {
    setSelected((previous) => {
      const next: [T[], T[]] = [[...previous[0]], [...previous[1]]];
      if (metaKeySelection && !event.ctrlKey && !event.metaKey) {
        if (previous[side].some((candidate) => same(candidate, item))) return previous;
        next[side] = [item];
        return next;
      }
      const current = next[side];
      next[side] = current.some((candidate) => same(candidate, item))
        ? current.filter((candidate) => !same(candidate, item))
        : [...current, item];
      return next;
    });
  };

  const move = (side: Side, direction: Direction): void => {
    const next = [...lists[side]];
    if (direction === "top" || direction === "bottom") {
      const chosen = next.filter((item) => isSelected(side, item));
      const rest = next.filter((item) => !isSelected(side, item));
      emit(side, direction === "top" ? [...chosen, ...rest] : [...rest, ...chosen]);
      return;
    }
    const delta = direction === "up" ? -1 : 1;
    const indexes = next.map((_, index) => index);
    if (delta === 1) indexes.reverse();
    for (const index of indexes) {
      const to = index + delta;
      if (
        to >= 0 &&
        to < next.length &&
        isSelected(side, next[index]) &&
        !isSelected(side, next[to])
      ) {
        [next[index], next[to]] = [next[to], next[index]];
      }
    }
    emit(side, next);
  };

  const transfer = (side: Side, all: boolean): void => {
    const chosen = lists[side].filter((item) => all || isSelected(side, item));
    if (!chosen.length) return;
    emit(
      side,
      lists[side].filter((item) => !chosen.some((candidate) => same(candidate, item)))
    );
    const other: Side = side === 0 ? 1 : 0;
    emit(other, [...lists[other], ...chosen]);
    setSelected([[], []]);
  };

  const drop = (side: Side, before: T | undefined, event: React.DragEvent): void => {
    if (!dragdrop || !drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    const { side: fromSide, item } = drag.current;
    drag.current = null;
    const from = [...lists[fromSide]];
    const fromIndex = from.findIndex((candidate) => same(candidate, item));
    if (fromIndex < 0) return;
    const [moved] = from.splice(fromIndex, 1);
    if (fromSide === side) {
      const to =
        before === undefined ? from.length : from.findIndex((candidate) => same(candidate, before));
      if (to < 0) return;
      from.splice(to, 0, moved);
      emit(side, from);
    } else {
      const destination = [...lists[side]];
      const to =
        before === undefined
          ? destination.length
          : destination.findIndex((candidate) => same(candidate, before));
      if (to < 0) return;
      destination.splice(to, 0, moved);
      emit(fromSide, from);
      emit(side, destination);
    }
    setSelected([[], []]);
  };

  const keyDown = (side: Side, item: T, event: React.KeyboardEvent<HTMLLIElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(side, item, event);
      return;
    }
    const options = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="option"]') ?? []
    );
    const index = options.indexOf(event.currentTarget);
    const to =
      event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowUp"
          ? index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? options.length - 1
              : -1;
    if (options[to]) {
      event.preventDefault();
      options[to].focus();
    }
  };

  const renderSide = (items: T[], side: Side): React.ReactElement => {
    const name = side === 0 ? "Source" : "Target";
    const showFilter = filter && (side === 0 ? showSourceFilter : showTargetFilter);
    const visible =
      !showFilter || !queries[side]
        ? items
        : items.filter((item) =>
            (filterBy ? filterBy.split(",").map((path) => field(item, path.trim())) : [item]).some(
              (value) => matches(value, queries[side], filterMatchMode, filterLocale)
            )
          );
    return (
      <section
        className={cx(side === 0 ? "sourceList" : "targetList")}
        data-pc-section={side === 0 ? "sourcelist" : "targetlist"}
        style={side === 0 ? sourceStyle : targetStyle}
      >
        <h3>{side === 0 ? sourceHeader : targetHeader}</h3>
        {(side === 0 ? showSourceControls : showTargetControls) && (
          <div className={cx("controls")}>
            {(["up", "top", "down", "bottom"] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                disabled={!items.some((item) => isSelected(side, item))}
                onClick={() => move(side, direction)}
              >
                Move {direction}
              </button>
            ))}
          </div>
        )}
        {showFilter && (
          <input
            type="search"
            aria-label={`Filter ${name.toLowerCase()}`}
            value={queries[side]}
            onChange={(event) =>
              setQueries((previous) => {
                const next: [string, string] = [...previous];
                next[side] = event.target.value;
                return next;
              })
            }
          />
        )}
        <ul
          className={cx("list")}
          role="listbox"
          aria-label={name}
          aria-multiselectable="true"
          tabIndex={0}
          onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
          onDrop={dragdrop ? (event) => drop(side, undefined, event) : undefined}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            const options = event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]');
            if (event.key === "ArrowDown" || event.key === "Home") options[0]?.focus();
            if (event.key === "ArrowUp" || event.key === "End")
              options[options.length - 1]?.focus();
          }}
        >
          {visible.map((item, index) => (
            <li
              key={dataKey ? String(identity(item)) : index}
              className={cx(isSelected(side, item) ? "itemSelected" : "listItem")}
              role="option"
              aria-selected={isSelected(side, item)}
              tabIndex={-1}
              draggable={dragdrop || undefined}
              onClick={(event) => select(side, item, event)}
              onKeyDown={(event) => keyDown(side, item, event)}
              onDragStart={
                dragdrop
                  ? (event) => {
                      drag.current = { side, item };
                      event.dataTransfer.setData("text/plain", String(index));
                      event.dataTransfer.effectAllowed = "move";
                    }
                  : undefined
              }
              onDragEnd={
                dragdrop
                  ? () => {
                      drag.current = null;
                    }
                  : undefined
              }
              onDragOver={dragdrop ? (event) => event.preventDefault() : undefined}
              onDrop={dragdrop ? (event) => drop(side, item, event) : undefined}
            >
              {itemTemplate(item)}
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div id={id} className={[cx("root"), className].filter(Boolean).join(" ")}>
      <style>{`@media (max-width: ${breakpoint}) { #${id} { grid-template-columns: minmax(0, 1fr); } }`}</style>
      {renderSide(source, 0)}
      <div className={cx("controls")}>
        <button
          type="button"
          disabled={!source.some((item) => isSelected(0, item))}
          onClick={() => transfer(0, false)}
        >
          To Target
        </button>
        <button type="button" disabled={!source.length} onClick={() => transfer(0, true)}>
          All To Target
        </button>
        <button
          type="button"
          disabled={!target.some((item) => isSelected(1, item))}
          onClick={() => transfer(1, false)}
        >
          To Source
        </button>
        <button type="button" disabled={!target.length} onClick={() => transfer(1, true)}>
          All To Source
        </button>
      </div>
      {renderSide(target, 1)}
    </div>
  );
}
