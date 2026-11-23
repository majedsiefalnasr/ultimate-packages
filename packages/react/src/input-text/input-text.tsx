import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { inputTextStyleModule } from "./input-text-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputText` (real source:
 * `components/lib/inputtext/InputText.js`/`InputTextBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`). A thin
 * wrapper around a native `<input>` — matching real source's own shape
 * exactly: a single native input, no decorative wrapper.
 *
 * `value`/`onChange` make it controlled; `defaultValue` leaves the native
 * input uncontrolled, and its non-empty state is tracked for the `p-filled`
 * class. The `p-filled` class follows the value, like PrimeVue, not the
 * variant.
 *
 * `keyfilter` and `tooltip` are separate composition (`useKeyFilter`,
 * `UTooltip`), not props of this component (ADR-086).
 */
export interface UInputTextProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size"
> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  /** Visual size of the input. */
  size?: "small" | "large";
  fluid?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the input's root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function isNotEmpty(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export const UInputText = React.forwardRef<HTMLInputElement, UInputTextProps>(
  function UInputText(props, ref) {
    const {
      className,
      invalid = false,
      variant,
      size,
      fluid = false,
      inputRef,
      unstyled,
      pt,
      ptOptions,
      value,
      defaultValue,
      onChange,
      ...rest
    } = props;
    const { cx } = useComponentBase({
      componentName: "inputtext",
      styleModule: inputTextStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("inputtext", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const [uncontrolledFilled, setUncontrolledFilled] = React.useState(() =>
      isNotEmpty(defaultValue)
    );
    const filled = value !== undefined ? isNotEmpty(value) : uncontrolledFilled;

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef)
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref, inputRef]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setUncontrolledFilled(isNotEmpty(event.target.value));
      onChange?.(event);
    };

    const rootClassName = [
      cx("root", { filled, invalid, variantFilled: variant === "filled", fluid, size }),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={setRef}
        {...mergeProps(
          {
            type: "text",
            "aria-invalid": invalid || undefined,
            value,
            defaultValue,
          },
          rest,
          { className: rootClassName, onChange: handleChange },
          ptm("root")
        )}
      />
    );
  }
);
