import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { iconFieldStyleModule, inputIconStyleModule } from "./icon-field-style";

export interface UIconFieldProps {
  iconPosition?: "left" | "right";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `IconField` (real source:
 * `components/lib/iconfield/IconField.js`/`IconFieldBase.js`, extracted
 * this session via `scripts/provenance/extract-primereact-source.mjs`).
 * IconField wraps an input and an icon (`UInputIcon`, below) — an input
 * decoration wrapper, not a form control itself.
 *
 * Real source is a plain functional component with no internal state — no
 * CVA/controlled-value concept, only an `iconPosition` prop (default
 * `'right'` in real source's own `defaultProps`) and `children`
 * passthrough via `Children.map`/`cloneElement`. This realization renders
 * `children` directly rather than cloning them to inject `iconPosition`
 * into each child: icon positioning is resolved entirely by CSS
 * `:first-child`/`:last-child` selectors against DOM order (see
 * `icon-field-style.ts`), matching real source's own shared
 * `@primeuix/styles/iconfield` CSS exactly — real source's `cloneElement`
 * call exists only to thread `iconPosition` into `InputIcon`'s own
 * `cx('root')` call for a redundant CSS hook this port does not need, since
 * `UInputIcon` has no per-position class variant of its own (verified: real
 * `InputIconBase.js`'s `classes.root` is a fixed string, not a function of
 * `iconPosition`).
 */
export const UIconField = React.forwardRef<HTMLDivElement, UIconFieldProps>(function UIconField(
  { iconPosition = "left", className, children },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "icon-field",
    styleModule: iconFieldStyleModule,
  });

  return (
    <div ref={ref} className={[cx("root", { iconPosition }), className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
});

export interface UInputIconProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `InputIcon` (real source:
 * `components/lib/inputicon/InputIcon.js`/`InputIconBase.js`). InputIcon
 * displays an icon, typically rendered inside a `UIconField` as its first
 * or last child — the CSS driving its leading/trailing position via DOM
 * order (see `icon-field-style.ts`).
 *
 * Real source is a plain functional component with no internal state — no
 * CVA/controlled-value concept, only `children` passthrough. Rendered
 * `aria-hidden="true"` by default since real source's own docs/usage always
 * pairs InputIcon with a purely decorative glyph.
 */
export const UInputIcon = React.forwardRef<HTMLSpanElement, UInputIconProps>(function UInputIcon(
  { className, children },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "input-icon",
    styleModule: inputIconStyleModule,
  });

  return (
    <span ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")} aria-hidden="true">
      {children}
    </span>
  );
});
