import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { inputTextareaStyleModule } from "./input-textarea-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputTextarea` (real source:
 * `components/lib/inputtextarea/InputTextarea.js`/`InputTextareaBase.js`).
 * React's own framework-native name for this capability — kept as-is (not
 * renamed to "Textarea" to match Angular/Vue). Its component name, style
 * registration and pass-through key are `textarea`, the Aura token key.
 *
 * `value`/`onChange` make it controlled; `defaultValue` leaves the native
 * textarea uncontrolled, and its non-empty state is tracked for the
 * `p-filled` class, which follows the value like PrimeVue.
 *
 * Real `autoResize` behavior is ported for real (not stubbed): grows/shrinks
 * the textarea's height to fit its scrollHeight on mount, on every input,
 * on focus, blur and keyup, and whenever `value` changes externally —
 * matching real source's own `resize()`/`useEffect([props.autoResize,
 * props.value])` pair. Uses a cached-scrollHeight comparison
 * (`cachedScrollHeight`) to avoid redundant reflows, same as real source. A
 * missing `max-height` means no cap, as in Prime.
 *
 * `keyfilter` and `tooltip` are separate composition (`useKeyFilter`,
 * `UTooltip`), not props of this component (ADR-086, ADR-095). `size` has no
 * PrimeReact counterpart; it is added here so the three frameworks expose
 * the same visual sizes.
 */
export interface UInputTextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  /** Visual size of the textarea. */
  size?: "small" | "large";
  fluid?: boolean;
  autoResize?: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the textarea's root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function isNotEmpty(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export const UInputTextarea = React.forwardRef<HTMLTextAreaElement, UInputTextareaProps>(
  function UInputTextarea(props, ref) {
    const {
      className,
      invalid = false,
      variant,
      size,
      fluid = false,
      autoResize = false,
      disabled,
      inputRef,
      unstyled,
      pt,
      ptOptions,
      value,
      defaultValue,
      onInput,
      onFocus,
      onBlur,
      onKeyUp,
      ...rest
    } = props;
    const { cx } = useComponentBase({
      componentName: "textarea",
      styleModule: inputTextareaStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("textarea", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const elementRef = React.useRef<HTMLTextAreaElement | null>(null);
    const cachedScrollHeight = React.useRef(0);
    const [uncontrolledFilled, setUncontrolledFilled] = React.useState(() =>
      isNotEmpty(defaultValue)
    );
    const filled = value !== undefined ? isNotEmpty(value) : uncontrolledFilled;

    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        elementRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef)
          (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      },
      [ref, inputRef]
    );

    const resize = React.useCallback((initial?: boolean) => {
      const el = elementRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!(rect.width > 0 && rect.height > 0)) return;

      if (!cachedScrollHeight.current) {
        cachedScrollHeight.current = el.scrollHeight;
        el.style.overflow = "hidden";
      }

      if (cachedScrollHeight.current !== el.scrollHeight || initial) {
        el.style.height = "";
        el.style.height = `${el.scrollHeight}px`;

        const maxHeight = parseFloat(el.style.maxHeight);
        if (!Number.isNaN(maxHeight) && parseFloat(el.style.height) >= maxHeight) {
          el.style.overflowY = "scroll";
          el.style.height = el.style.maxHeight;
        } else {
          el.style.overflow = "hidden";
        }

        cachedScrollHeight.current = el.scrollHeight;
      }
    }, []);

    React.useEffect(() => {
      if (autoResize) resize(true);
    }, [autoResize, value, resize]);

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize(event.currentTarget.value === "");
      if (value === undefined) setUncontrolledFilled(isNotEmpty(event.currentTarget.value));
      onInput?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize();
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize();
      onBlur?.(event);
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize();
      onKeyUp?.(event);
    };

    const rootClassName = [
      cx("root", {
        filled,
        invalid,
        variantFilled: variant === "filled",
        fluid,
        autoResize,
        size,
      }),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        ref={setRef}
        {...mergeProps(
          {
            disabled,
            "aria-invalid": invalid || undefined,
            value,
            defaultValue,
          },
          rest,
          {
            className: rootClassName,
            onInput: handleInput,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onKeyUp: handleKeyUp,
          },
          ptm("root")
        )}
      />
    );
  }
);
