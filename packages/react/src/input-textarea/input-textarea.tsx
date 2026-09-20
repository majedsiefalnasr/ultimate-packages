import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputTextareaStyleModule } from "./input-textarea-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputTextarea` (real source:
 * `components/lib/inputtextarea/InputTextarea.js`/`InputTextareaBase.js`).
 * React's own framework-native name for this capability — kept as-is per
 * this task's scope (not renamed to "Textarea" to match Angular/Vue).
 *
 * Fully-controlled (`value`/`onChange`), same no-shared-form-state-base-
 * class convention as `input-text.tsx`.
 *
 * Real `autoResize` behavior is ported for real (not stubbed): grows/shrinks
 * the textarea's height to fit its scrollHeight on mount, on every input,
 * and whenever `value` changes externally — matching real source's own
 * `resize()`/`useEffect([props.autoResize, props.value])` pair. Uses a
 * cached-scrollHeight comparison (`cachedScrollHeight`) to avoid redundant
 * reflows, same as real source.
 *
 * Deliberately excludes real source's `keyfilter`/`tooltip`/passthrough
 * surface, same cuts as `input-text.tsx`.
 */
export interface UInputTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  fluid?: boolean;
  autoResize?: boolean;
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

export const UInputTextarea = React.forwardRef<HTMLTextAreaElement, UInputTextareaProps>(
  function UInputTextarea(
    { className, invalid = false, variant, fluid = false, autoResize = false, disabled, inputRef, onInput, ...rest },
    ref
  ) {
    const { cx } = useComponentBase({
      componentName: "input-textarea",
      styleModule: inputTextareaStyleModule,
    });
    const elementRef = React.useRef<HTMLTextAreaElement | null>(null);
    const cachedScrollHeight = React.useRef(0);

    const setRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        elementRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef) (inputRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
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
    }, [autoResize, rest.value, resize]);

    const handleInput = React.useCallback(
      (event: React.FormEvent<HTMLTextAreaElement>) => {
        if (autoResize) resize(event.currentTarget.value === "");
        onInput?.(event);
      },
      [autoResize, resize, onInput]
    );

    return (
      <textarea
        ref={setRef}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onInput={handleInput}
        className={[
          cx("root", { invalid, variantFilled: variant === "filled", fluid, disabled, autoResize }),
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    );
  }
);
