import * as React from "react";
import { useComponentBase, UTimesIcon } from "@ultimate/react-core";
import { chipStyleModule } from "./chip-style";

export interface UChipProps {
  label?: string;
  icon?: string;
  image?: string;
  alt?: string;
  disabled?: boolean;
  removable?: boolean;
  removeAriaLabel?: string;
  onRemove?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Chip` component (real source:
 * `components/lib/chip/Chip.js`). Represents people/items using a text
 * `label`, an `icon`, or an `image`, with an optional removable close
 * control — matching real source's own label/icon/image/removable
 * structural shape and prop names.
 *
 * Deliberately excludes real source's `template` render-prop override and
 * its `TimesCircleIcon` remove glyph (no such icon exists yet in
 * `@ultimate/react-core`'s icon set — `UTimesIcon` is used instead, same
 * "smaller surface than upstream" precedent as every sibling component).
 * `visible` is internal state, not a controlled prop — matching real
 * source's own uncontrolled `visibleState`.
 */
export const UChip = React.forwardRef<HTMLDivElement, UChipProps>(function UChip(
  { label, icon, image, alt, disabled, removable, removeAriaLabel, onRemove, onImageError, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "chip", styleModule: chipStyleModule });
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

  return (
    <div
      ref={ref}
      className={[cx("root"), className].filter(Boolean).join(" ")}
      aria-label={label}
    >
      {image ? (
        <img className={cx("image")} src={image} alt={alt} onError={onImageError} />
      ) : icon ? (
        <span className={[cx("icon"), icon].filter(Boolean).join(" ")} />
      ) : null}
      {label && <span className={cx("label")}>{label}</span>}
      {removable && (
        <span
          className={cx("removeIcon")}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={removeAriaLabel}
          onClick={close}
          onKeyDown={onKeyDown}
        >
          <UTimesIcon />
        </span>
      )}
    </div>
  );
});
