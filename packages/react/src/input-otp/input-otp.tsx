import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputOtpStyleModule } from "./input-otp-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputOtp` (real source:
 * `components/lib/inputotp/InputOtp.js`/`BaseInputOtp.js`). Renders `length`
 * real native `<input>` segments — matching real source's own
 * `createInputElements` recursion exactly (one native input per token
 * position, no single-input-with-per-character-styling alternative; same
 * segmented-DOM structure as Angular's/Vue's InputOtp).
 *
 * Fully-controlled (`value`/`onChange`), matching React's established
 * no-shared-form-state-base-class convention — unlike real source (which
 * keeps its own internal `tokens` state seeded from `props.value` and only
 * resyncs it via a `useUpdateEffect` on `props.value` changes), this
 * component derives `tokens` directly from `value` on every render (a
 * simpler, fully-controlled equivalent consistent with `checkbox.tsx`'s own
 * "no internal value state" convention) rather than keeping a separate
 * internal copy that could drift from a fully-controlled `value` prop.
 *
 * Ports real source's real segment behavior: arrow-key navigation
 * (left/right) via sibling-DOM-walk (`findNextInput`/`findPrevInput`,
 * matching real source's own DOM-sibling approach exactly since each
 * segment is a real, separate sibling `<input>`), backspace-to-previous-
 * segment, paste-splitting a full code across segments, `integerOnly`
 * digit-only filtering, `mask` (password-style masking of each segment's
 * input `type`).
 */
export interface UInputOtpChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: string;
}

export interface UInputOtpProps {
  value?: string;
  length?: number;
  mask?: boolean;
  integerOnly?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  onChange?: (event: UInputOtpChangeEvent) => void;
  className?: string;
}

function findNextInput(element: HTMLElement): HTMLInputElement | undefined {
  const next = element.nextElementSibling;
  if (!next) return undefined;
  return next.nodeName === "INPUT" ? (next as HTMLInputElement) : findNextInput(next as HTMLElement);
}

function findPrevInput(element: HTMLElement): HTMLInputElement | undefined {
  const prev = element.previousElementSibling;
  if (!prev) return undefined;
  return prev.nodeName === "INPUT" ? (prev as HTMLInputElement) : findPrevInput(prev as HTMLElement);
}

export const UInputOtp = React.forwardRef<HTMLDivElement, UInputOtpProps>(function UInputOtp(
  { value = "", length = 4, mask = false, integerOnly = false, disabled = false, readOnly = false, invalid = false, onChange, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "input-otp", styleModule: inputOtpStyleModule });

  const tokens = React.useMemo(() => {
    const chars = value ? value.split("") : [];
    return Array.from({ length }, (_, i) => chars[i] ?? "");
  }, [value, length]);

  const emitChange = React.useCallback(
    (event: React.SyntheticEvent, newTokens: string[]) => {
      onChange?.({ originalEvent: event, value: newTokens.join("") });
    },
    [onChange]
  );

  const moveToNext = React.useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
    findNextInput(event.currentTarget)?.focus();
    findNextInput(event.currentTarget)?.select();
  }, []);

  const moveToPrev = React.useCallback((event: React.SyntheticEvent<HTMLInputElement>) => {
    findPrevInput(event.currentTarget)?.focus();
    findPrevInput(event.currentTarget)?.select();
  }, []);

  const onInput = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>, index: number) => {
      if (disabled || readOnly) return;
      const nativeEvent = event.nativeEvent as InputEvent;
      if (nativeEvent.inputType === "insertFromPaste") return;

      const inputValue = event.currentTarget.value;
      const newTokens = [...tokens];
      newTokens[index] = inputValue.slice(-1);
      emitChange(event, newTokens);

      if (nativeEvent.inputType === "deleteContentBackward") {
        moveToPrev(event);
      } else if (nativeEvent.inputType === "insertText") {
        moveToNext(event);
      }
    },
    [disabled, readOnly, tokens, emitChange, moveToPrev, moveToNext]
  );

  const onPaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      const paste = event.clipboardData.getData("text");
      if (!paste.length) return;
      const pasted = paste.substring(0, length);
      if (!integerOnly || !Number.isNaN(Number(pasted))) {
        const newTokens = Array.from({ length }, (_, i) => pasted[i] ?? "");
        emitChange(event, newTokens);
      }
      event.preventDefault();
    },
    [disabled, readOnly, length, integerOnly, emitChange]
  );

  const onFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  }, []);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (disabled || readOnly) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      switch (event.code) {
        case "ArrowLeft":
          moveToPrev(event);
          event.preventDefault();
          break;
        case "ArrowRight":
          moveToNext(event);
          event.preventDefault();
          break;
        case "Delete": {
          event.preventDefault();
          const newTokens = [...tokens];
          newTokens[index] = "";
          emitChange(event, newTokens);
          moveToNext(event);
          break;
        }
        case "Backspace":
          if (event.currentTarget.value.length === 0) {
            moveToPrev(event);
            event.preventDefault();
          }
          break;
        case "ArrowUp":
        case "ArrowDown":
          event.preventDefault();
          break;
        case "Tab":
        case "NumpadEnter":
        case "Enter":
          break;
        default: {
          const target = event.currentTarget;
          const hasSelection = target.selectionStart !== target.selectionEnd;
          const isAtMaxLength = tokens.join("").length >= length;
          const isValidKey = integerOnly ? /^[0-9]$/.test(event.key) : true;
          if (!isValidKey || (isAtMaxLength && event.code !== "Delete" && !hasSelection)) {
            event.preventDefault();
          }
          break;
        }
      }
    },
    [disabled, readOnly, tokens, length, integerOnly, emitChange, moveToPrev, moveToNext]
  );

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      {tokens.map((token, index) => (
        // eslint-disable-next-line react/no-array-index-key -- positional segment, stable per-render.
        <input
          key={index}
          type={mask ? "password" : "text"}
          inputMode={integerOnly ? "numeric" : "text"}
          className={cx("input", { invalid })}
          value={token}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid || undefined}
          aria-label={`Character ${index + 1}`}
          data-index={index}
          onInput={(event) => onInput(event, index)}
          onKeyDown={(event) => onKeyDown(event, index)}
          onFocus={onFocus}
          onPaste={onPaste}
          onChange={() => {}}
        />
      ))}
    </div>
  );
});
