import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { inputGroupAddonStyleModule, inputGroupStyleModule } from "./input-group-style";

export interface UInputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate addition with no PrimeReact counterpart (ADR-092): PrimeReact
 * ships no InputGroup, so Angular's `UInputGroup` (from PrimeNG) and Vue's
 * `UInputGroup` (from PrimeVue) are mirrored here to keep the three
 * frameworks on one API and one CSS. A layout wrapper that joins an input
 * with addons, buttons and icons; it is not a form control itself.
 *
 * The root div merges its own class, the remaining props and `ptm('root')`
 * and is the ref. The CSS is the shared module (ADR-082).
 */
export const UInputGroup = React.forwardRef<HTMLDivElement, UInputGroupProps>(function UInputGroup(
  { className, children, unstyled, pt, ptOptions, ...rest },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "inputgroup",
    styleModule: inputGroupStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("inputgroup", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();

  return (
    <div
      ref={ref}
      {...mergeProps(
        rest,
        { className: [cx("root"), className].filter(Boolean).join(" ") },
        ptm("root")
      )}
    >
      {children}
    </div>
  );
});

export interface UInputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Addon of a `UInputGroup`: text, an icon or a button placed before or after
 * the input (ADR-092). Its rules are owned by `UInputGroup`'s style module.
 */
export const UInputGroupAddon = React.forwardRef<HTMLDivElement, UInputGroupAddonProps>(
  function UInputGroupAddon({ className, children, unstyled, pt, ptOptions, ...rest }, ref) {
    const { cx } = useComponentBase({
      componentName: "inputgroupaddon",
      styleModule: inputGroupAddonStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("inputgroupaddon", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();

    return (
      <div
        ref={ref}
        {...mergeProps(
          rest,
          { className: [cx("root"), className].filter(Boolean).join(" ") },
          ptm("root")
        )}
      >
        {children}
      </div>
    );
  }
);
