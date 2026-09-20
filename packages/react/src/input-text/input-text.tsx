import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputTextStyleModule } from "./input-text-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputText` (real source:
 * `components/lib/inputtext/InputText.js`/`InputTextBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`). A thin,
 * fully-controlled wrapper around a native `<input>` — matching real
 * source's own shape exactly: a single native input, no decorative wrapper.
 *
 * Fully-controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention (`checkbox.tsx`'s own precedent) — no
 * internal value state is kept here.
 *
 * Deliberately excludes real source's `keyfilter`/`tooltip`/passthrough
 * surface (no `pt`, per this repo's platform-wide Option-B posture) and
 * `iconPosition` (IconField/InputIcon composition, out of this task's
 * scope).
 */
export interface UInputTextProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  fluid?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const UInputText = React.forwardRef<HTMLInputElement, UInputTextProps>(function UInputText(
  { className, invalid = false, variant, fluid = false, disabled, inputRef, ...rest },
  ref
) {
  const { cx } = useComponentBase({ componentName: "input-text", styleModule: inputTextStyleModule });

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, inputRef]
  );

  return (
    <input
      ref={setRef}
      type="text"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={[
        cx("root", { invalid, variantFilled: variant === "filled", fluid, disabled }),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
});
