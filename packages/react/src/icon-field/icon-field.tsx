import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { iconFieldStyleModule, inputIconStyleModule } from "./icon-field-style";

export interface UIconFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Position of the icon relative to the input. Defaults to `left`; PrimeReact
   * defaults to `right` (ADR-091). Only adds a root class: the icon sits where
   * it is placed in the DOM.
   */
  iconPosition?: "left" | "right";
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `IconField` (real source:
 * `components/lib/iconfield/IconField.js`/`IconFieldBase.js`). IconField
 * wraps an input and an icon (`UInputIcon`, below) — an input decoration
 * wrapper, not a form control itself.
 *
 * Real source is a plain functional component with no internal state, only
 * an `iconPosition` prop and `children`. Icon positioning is resolved
 * entirely by CSS `:first-child`/`:last-child` selectors against DOM order
 * (see `@ultimate/uix-styles/iconfield`). This realization renders
 * `children` directly instead of cloning them to inject `iconPosition`, and
 * the root div merges its own class, the remaining props and `ptm('root')`
 * and is the ref. The CSS is the shared module (ADR-082), so it reads the
 * Aura `iconfield` tokens and matches Angular and Vue.
 */
export const UIconField = React.forwardRef<HTMLDivElement, UIconFieldProps>(function UIconField(
  { iconPosition = "left", className, children, unstyled, pt, ptOptions, ...rest },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "iconfield",
    styleModule: iconFieldStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("iconfield", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  return (
    <div
      ref={ref}
      {...mergeProps(
        rest,
        { className: [cx("root", { iconPosition }), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {children}
    </div>
  );
});

export interface UInputIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `InputIcon` (real source:
 * `components/lib/inputicon/InputIcon.js`/`InputIconBase.js`). InputIcon
 * displays an icon, typically rendered inside a `UIconField` as its first
 * or last child — the CSS driving its leading/trailing position via DOM
 * order (see `@ultimate/uix-styles/iconfield`).
 *
 * The root span is `aria-hidden="true"` by default because the icon is
 * decorative (ADR-091; PrimeReact sets nothing). An `aria-hidden` prop or
 * `pt` entry replaces it, so interactive content such as a clear button
 * stays reachable.
 */
export const UInputIcon = React.forwardRef<HTMLSpanElement, UInputIconProps>(function UInputIcon(
  { className, children, unstyled, pt, ptOptions, ...rest },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "inputicon",
    styleModule: inputIconStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("inputicon", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  return (
    <span
      ref={ref}
      {...mergeProps(
        { "aria-hidden": true },
        rest,
        { className: [cx("root"), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {children}
    </span>
  );
});
