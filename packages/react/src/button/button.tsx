import * as React from "react";
import { useComponentBase, USpinnerIcon } from "@ultimate/react-core";
import { buttonStyleModule } from "./button-style";

export interface UButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  label?: string;
  icon?: React.ReactNode;
  iconPos?: "left" | "right" | "top" | "bottom";
  loading?: boolean;
  loadingIcon?: React.ReactNode;
  disabled?: boolean;
  severity?: "secondary" | "success" | "info" | "warning" | "danger" | "help" | "contrast";
  size?: "small" | "large";
  text?: boolean;
  raised?: boolean;
  rounded?: boolean;
  outlined?: boolean;
  link?: boolean;
  plain?: boolean;
  badge?: string;
  badgeClassName?: string;
  visible?: boolean;
  tooltip?: string;
  tooltipOptions?: Record<string, unknown>;
}

export const UButton = React.forwardRef<HTMLButtonElement, UButtonProps>(function UButton(
  {
    label,
    icon,
    iconPos = "left",
    loading = false,
    loadingIcon,
    disabled = false,
    severity,
    size,
    text,
    raised,
    rounded,
    outlined,
    link,
    plain,
    badge,
    badgeClassName,
    visible = true,
    className,
    children,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "button", styleModule: buttonStyleModule });
  const isDisabled = disabled || loading;
  const hasIcon = Boolean(icon || loading);

  if (!visible) return null;

  const defaultAriaLabel = label ? label + (badge ? " " + badge : "") : ariaLabel;

  const renderIcon = () => {
    if (loading) {
      return loadingIcon ?? <USpinnerIcon className={cx("loadingIcon")} spin />;
    }
    if (icon) {
      return <span className={cx("icon", { iconPos, label })}>{icon}</span>;
    }
    return null;
  };

  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      disabled={isDisabled}
      aria-label={defaultAriaLabel}
      className={[
        cx("root", { hasIcon, label, loading, severity, raised, rounded, text, outlined, link, plain, size }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {renderIcon()}
      {label && <span className={cx("label")}>{label}</span>}
      {children}
      {badge && <span className={badgeClassName}>{badge}</span>}
    </button>
  );
});
