import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  UTimesIcon,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { chipStyleModule } from "./chip-style";

export interface UChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text to display. */
  label?: string;
  /** Icon class to display. */
  icon?: string;
  /** Image source to display. */
  image?: string;
  /** Alt attribute of the image. */
  alt?: string;
  /** Whether the chip is disabled. */
  disabled?: boolean;
  /** Whether a remove icon is displayed. */
  removable?: boolean;
  /** Accessible label for the remove control. Defaults to the English "Remove". */
  removeAriaLabel?: string;
  /** Font icon class (string) or element that replaces the default remove glyph. */
  removeIcon?: string | React.ReactNode;
  /** Replaces the image, icon and label with custom content. */
  template?: React.ReactNode | ((props: UChipProps) => React.ReactNode);
  onRemove?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `image`, `icon`, `label` and `removeIcon` sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Chip` component (real source:
 * `components/lib/chip/Chip.js`). Represents people/items using a text
 * `label`, an `icon`, or an `image`, with an optional removable close
 * control — matching real source's own label/icon/image/removable
 * structural shape and prop names.
 *
 * `template` replaces the image, icon and label with custom content, and
 * `removeIcon` replaces the remove glyph with a font class or an element.
 * The root merges its own class, the remaining props and `ptm('root')`, and
 * is the forwarded ref. The CSS is the shared `@ultimate/uix-styles/chip`
 * module (ADR-082), so it reads the Aura `chip` tokens and matches Angular
 * and Vue.
 *
 * Deliberately excludes real source's `TimesCircleIcon` default glyph
 * (`UTimesIcon` is used instead), the `{ originalEvent, value }` remove
 * payload with its `return false` veto, and the imperative
 * `getVisible`/`setVisible` API; each is recorded in ADR-098. `visible` is
 * internal state, not a controlled prop — matching real source's own
 * uncontrolled `visibleState`.
 */
export const UChip = React.forwardRef<HTMLDivElement, UChipProps>(function UChip(props, ref) {
  const {
    label,
    icon,
    image,
    alt,
    disabled,
    removable,
    removeAriaLabel = "Remove",
    removeIcon,
    template,
    onRemove,
    onImageError,
    className,
    unstyled,
    pt,
    ptOptions,
    ...rest
  } = props;
  const { cx } = useComponentBase({
    componentName: "chip",
    styleModule: chipStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("chip", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();
  const [visible, setVisible] = React.useState(true);

  if (!visible) return null;

  const close = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return;
    setVisible(false);
    onRemove?.(event);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === "Backspace") {
      close(event);
    }
  };

  const joinClass = (...names: Array<string | undefined>) => names.filter(Boolean).join(" ");
  const removeIconClass = typeof removeIcon === "string" ? removeIcon : undefined;
  const removeIconNode =
    removeIcon && typeof removeIcon !== "string" ? (
      removeIcon
    ) : removeIconClass ? null : (
      <UTimesIcon />
    );

  const content = template ? (
    typeof template === "function" ? (
      template(props)
    ) : (
      template
    )
  ) : (
    <>
      {image ? (
        <img
          {...mergeProps(
            { className: cx("image"), src: image, alt, onError: onImageError },
            ptm("image")
          )}
        />
      ) : icon ? (
        <span {...mergeProps({ className: joinClass(cx("icon"), icon) }, ptm("icon"))} />
      ) : null}
      {label && <span {...mergeProps({ className: cx("label") }, ptm("label"))}>{label}</span>}
    </>
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        { "aria-label": label, "data-p": removable ? "removable" : undefined },
        rest,
        { className: [cx("root", { disabled }), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {content}
      {removable && (
        <span
          {...mergeProps(
            {
              className: joinClass(cx("removeIcon"), removeIconClass),
              role: "button",
              tabIndex: disabled ? -1 : 0,
              "aria-label": removeAriaLabel,
              onClick: close,
              onKeyDown,
            },
            ptm("removeIcon")
          )}
        >
          {removeIconNode}
        </span>
      )}
    </div>
  );
});
