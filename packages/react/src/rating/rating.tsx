import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { RATING_BAN_PATH, RATING_STAR_FILL_PATH, RATING_STAR_PATH } from "./rating-icons";
import { ratingStyleModule } from "./rating-style";

export interface URatingChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: number | null;
  stopPropagation: () => void;
  preventDefault: () => void;
  target: { name?: string; id?: string; value: number | null };
}

export interface URatingHandle {
  /** Returns the root element. */
  getElement: () => HTMLDivElement | null;
}

/** Props an icon receives: the classes and pass-through attributes of its slot. */
export type URatingIconProps = React.HTMLAttributes<HTMLElement> & Record<string, unknown>;

/**
 * An icon: a class string rendered on a `span`, an element that receives the
 * icon props, or a function of the icon props.
 */
export type URatingIcon =
  string | React.ReactElement | ((iconProps: URatingIconProps) => React.ReactNode);

export interface URatingProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> {
  value?: number | null;
  onChange?: (event: URatingChangeEvent) => void;
  stars?: number;
  readOnly?: boolean;
  disabled?: boolean;
  /** Shows the invalid state. */
  invalid?: boolean;
  /** Renders a clear item before the stars. */
  cancel?: boolean;
  /** Name reported in the change event's `target`. */
  name?: string;
  onIcon?: URatingIcon;
  offIcon?: URatingIcon;
  cancelIcon?: URatingIcon;
  onIconProps?: URatingIconProps;
  offIconProps?: URatingIconProps;
  cancelIconProps?: URatingIconProps;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `item`, `onIcon`, `offIcon`, `cancelItem` and `cancelIcon` sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function renderIcon(icon: URatingIcon, iconProps: URatingIconProps): React.ReactNode {
  if (typeof icon === "function") return icon(iconProps);
  if (typeof icon === "string") {
    return (
      <span
        {...iconProps}
        className={[iconProps.className, icon].filter(Boolean).join(" ") || undefined}
      />
    );
  }
  const own = icon.props as { className?: string };
  return React.cloneElement(icon as React.ReactElement<Record<string, unknown>>, {
    ...iconProps,
    className: [iconProps.className, own.className].filter(Boolean).join(" ") || undefined,
  });
}

function svgIcon(path: string, iconProps: URatingIconProps): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      {...(iconProps as React.SVGAttributes<SVGSVGElement>)}
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Rating` (see
 * `.vendor-extracted/react/rating/Rating.js` and `RatingBase.js`). Fully
 * controlled through `value` and `onChange`.
 *
 * Each star is a focusable `role="radio"` element with `aria-checked`, an
 * English `aria-label` and, when `invalid`, `aria-invalid`. Enter and Space
 * select the focused star and the arrow keys step the value and wrap, as in
 * PrimeReact; the keyboard never clears. Clicking the selected star with a
 * pointer clears it, and `cancel` adds PrimeReact's clear item (off by
 * default). The focus ring shows only for keyboard focus.
 *
 * The change event carries `stopPropagation`, `preventDefault` and `target`.
 * Every other prop, including `onFocus` and `onBlur`, goes on the root, and
 * the ref exposes `getElement()`. `onIcon`, `offIcon` and `cancelIcon` (with
 * their `*IconProps`) replace the default icons. `pt`, `ptOptions` and
 * `unstyled` come from the shared foundations, and the CSS is the shared
 * `@ultimate/uix-styles/rating` module on the Aura `rating` tokens.
 *
 * Deliberately excludes the `tooltip` props (composition through `UTooltip`)
 * and the `props` entry of PrimeReact's ref handle; both are recorded in the
 * Rating ADR.
 */
export const URating = React.forwardRef<URatingHandle, URatingProps>(function URating(props, ref) {
  const {
    value = null,
    onChange,
    stars = 5,
    readOnly = false,
    disabled = false,
    invalid = false,
    cancel = false,
    name,
    id,
    onIcon,
    offIcon,
    cancelIcon,
    onIconProps,
    offIconProps,
    cancelIconProps,
    className,
    unstyled,
    pt,
    ptOptions,
    ...rest
  } = props;
  const { cx } = useComponentBase({
    componentName: "rating",
    styleModule: ratingStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("rating", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const pointerDown = React.useRef(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = React.useState(-1);
  const [isFocusVisibleItem, setFocusVisibleItem] = React.useState(true);

  React.useImperativeHandle(ref, () => ({ getElement: () => rootRef.current }));

  const enabled = !disabled && !readOnly;
  const tabIndex = enabled ? 0 : undefined;
  const current = value ?? 0;

  const emit = (event: React.SyntheticEvent, next: number | null) => {
    if (!enabled || !onChange) return;
    onChange({
      originalEvent: event,
      value: next,
      stopPropagation: () => event.stopPropagation(),
      preventDefault: () => event.preventDefault(),
      target: { name, id, value: next },
    });
  };

  const rate = (event: React.SyntheticEvent, next: number) => {
    emit(event, next);
    setFocusedOptionIndex(next);
    event.preventDefault();
  };

  const onItemClick = (event: React.MouseEvent, starValue: number) => {
    pointerDown.current = false;
    setFocusVisibleItem(false);
    if (enabled && starValue === value) {
      emit(event, null);
      event.preventDefault();
      return;
    }
    rate(event, starValue);
  };

  const onStarKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (!enabled) return;
    switch (event.key) {
      case "Enter":
      case " ":
        rate(event, starValue);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        rate(event, current - 1 < 1 ? stars : current - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        rate(event, current + 1 > stars ? 1 : current + 1);
        break;
      default:
        break;
    }
  };

  const onItemFocus = (starValue: number) => {
    setFocusedOptionIndex(starValue);
    setFocusVisibleItem(!pointerDown.current);
    pointerDown.current = false;
  };

  const onCancelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      emit(event, null);
      event.preventDefault();
    }
  };

  const iconParams = { invalid };

  const createCancelItem = () => {
    if (!cancel) return null;
    const iconProps = mergeProps(
      { className: cx("cancelIcon") },
      ptm("cancelIcon"),
      cancelIconProps
    ) as URatingIconProps;
    const content = cancelIcon
      ? renderIcon(cancelIcon, iconProps)
      : svgIcon(RATING_BAN_PATH, iconProps);
    return (
      <div
        {...mergeProps(
          {
            className: cx("cancelItem"),
            role: "button",
            "aria-label": "Clear",
            tabIndex,
            onClick: (event: React.MouseEvent) => {
              emit(event, null);
              event.preventDefault();
            },
            onKeyDown: onCancelKeyDown,
          },
          ptm("cancelItem")
        )}
      >
        {content}
      </div>
    );
  };

  const createItems = () =>
    Array.from({ length: stars }, (_, index) => index + 1).map((starValue) => {
      const active = starValue <= current;
      const ptParams = { context: { active } };
      const iconProps = (
        active
          ? mergeProps(
              { className: cx("onIcon", iconParams) },
              ptm("onIcon", ptParams),
              onIconProps
            )
          : mergeProps(
              { className: cx("offIcon", iconParams) },
              ptm("offIcon", ptParams),
              offIconProps
            )
      ) as URatingIconProps;
      const custom = active ? onIcon : offIcon;
      const content = custom
        ? renderIcon(custom, iconProps)
        : svgIcon(active ? RATING_STAR_FILL_PATH : RATING_STAR_PATH, iconProps);

      return (
        <div
          key={starValue}
          {...mergeProps(
            {
              className: cx("item", {
                active,
                focusVisible: starValue === focusedOptionIndex && isFocusVisibleItem,
              }),
              "data-p-focused": starValue === focusedOptionIndex,
              tabIndex,
              role: "radio",
              "aria-checked": value === starValue,
              "aria-label": starValue === 1 ? "1 star" : `${starValue} stars`,
              "aria-invalid": invalid || undefined,
              onMouseDown: () => {
                pointerDown.current = true;
              },
              onClick: (event: React.MouseEvent) => onItemClick(event, starValue),
              onKeyDown: (event: React.KeyboardEvent) => onStarKeyDown(event, starValue),
              onFocus: () => onItemFocus(starValue),
              onBlur: () => setFocusedOptionIndex(-1),
            },
            ptm("item", ptParams)
          )}
        >
          {content}
        </div>
      );
    });

  return (
    <div
      ref={rootRef}
      {...mergeProps(
        {
          id,
          role: "group",
          className: [cx("root", { disabled, readOnly }), className].filter(Boolean).join(" "),
        },
        rest,
        ptm("root")
      )}
    >
      {createCancelItem()}
      {createItems()}
    </div>
  );
});
