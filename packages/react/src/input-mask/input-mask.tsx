import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputMaskStyleModule } from "./input-mask-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputMask` (real source:
 * `components/lib/inputmask/InputMask.js`/`InputMaskBase.js`, same
 * jQuery-MaskedInput-derived buffer algorithm as PrimeNG/PrimeVue's own
 * InputMask). Fully-controlled (`value`/`onChange`), matching React's
 * established no-shared-form-state-base-class convention.
 *
 * Ports real source's core masking algorithm faithfully: digit (`9`)/alpha
 * (`a`)/alphanumeric (`*`) slot characters, static separator characters,
 * `slotChar` placeholder, a `tests`/`buffer` character-position model,
 * `checkVal`/`shiftL`/`shiftR`/`seekNext`/`seekPrev`/`writeBuffer` exactly
 * mirroring real source's own method names and logic, backspace/delete
 * handling that respects mask boundaries (`onKeyDown`), paste re-masking
 * (`onPaste` → `handleInputChange(e, true)`), `unmask` (raw vs. formatted
 * value passed to `onChange`), and `autoClear`.
 *
 * Deliberately excludes real source's Android/iOS user-agent-sniffing
 * branches (`handleAndroidInput`, the `DomHandler.isIOS()`/`isAndroid()`
 * checks gating which key-handling path runs) — these are legacy mobile
 * IME-composition workarounds orthogonal to the actual masking algorithm,
 * not part of this task's Interfaces scope. Also excludes `tooltip`/
 * passthrough, same cuts as `input-text.tsx`/`input-textarea.tsx`.
 */
export interface UInputMaskChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: string;
  target: { name?: string; id?: string; value: string };
}

export interface UInputMaskProps {
  value?: string | null;
  mask: string;
  slotChar?: string;
  autoClear?: boolean;
  unmask?: boolean;
  onChange?: (event: UInputMaskChangeEvent) => void;
  onComplete?: (event: { originalEvent: React.SyntheticEvent; value: string }) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  fluid?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

const MASK_DEFS: Record<string, string> = { "9": "[0-9]", a: "[A-Za-z]", "*": "[A-Za-z0-9]" };

export const UInputMask = React.forwardRef<HTMLInputElement, UInputMaskProps>(function UInputMask(
  {
    value,
    mask,
    slotChar = "_",
    autoClear = true,
    unmask = false,
    onChange,
    onComplete,
    disabled = false,
    readOnly = false,
    invalid = false,
    variant,
    fluid = false,
    name,
    id,
    placeholder,
    className,
    inputRef,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "input-mask", styleModule: inputMaskStyleModule });
  const elementRef = React.useRef<HTMLInputElement | null>(null);

  const testsRef = React.useRef<Array<RegExp | null>>([]);
  const bufferRef = React.useRef<string[]>([]);
  const lenRef = React.useRef(0);
  const partialPositionRef = React.useRef(0);
  const firstNonMaskPosRef = React.useRef<number | null>(null);
  const lastRequiredNonMaskPosRef = React.useRef(0);
  const defaultBufferRef = React.useRef("");
  const focusTextRef = React.useRef("");

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      elementRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, inputRef]
  );

  const getPlaceholder = React.useCallback(
    (i: number) => (i < slotChar.length ? slotChar.charAt(i) : slotChar.charAt(0)),
    [slotChar]
  );

  const seekNext = React.useCallback((pos: number) => {
    let p = pos;
    while (++p < lenRef.current && !testsRef.current[p]);
    return p;
  }, []);

  const seekPrev = React.useCallback((pos: number) => {
    let p = pos;
    while (--p >= 0 && !testsRef.current[p]);
    return p;
  }, []);

  const writeBuffer = React.useCallback(() => {
    if (elementRef.current) elementRef.current.value = bufferRef.current.join("");
  }, []);

  const caret = React.useCallback((first?: number, last?: number) => {
    const el = elementRef.current;
    if (!el || el !== document.activeElement) return undefined;
    if (typeof first === "number") {
      const end = typeof last === "number" ? last : first;
      el.setSelectionRange?.(first, end);
      return undefined;
    }
    return { begin: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
  }, []);

  const clearBuffer = React.useCallback((start: number, end: number) => {
    for (let i = start; i < end && i < lenRef.current; i++) {
      if (testsRef.current[i]) bufferRef.current[i] = getPlaceholder(i);
    }
  }, [getPlaceholder]);

  const shiftL = React.useCallback(
    (begin: number, end: number) => {
      if (begin < 0) return;
      let j = seekNext(end);
      for (let i = begin; i < lenRef.current; i++) {
        if (testsRef.current[i]) {
          if (j < lenRef.current && testsRef.current[i]?.test(bufferRef.current[j])) {
            bufferRef.current[i] = bufferRef.current[j];
            bufferRef.current[j] = getPlaceholder(j);
          } else break;
          j = seekNext(j);
        }
      }
      writeBuffer();
      caret(Math.max(firstNonMaskPosRef.current ?? 0, begin));
    },
    [seekNext, getPlaceholder, writeBuffer, caret]
  );

  const shiftR = React.useCallback(
    (pos: number) => {
      let c = getPlaceholder(pos);
      for (let i = pos; i < lenRef.current; i++) {
        if (testsRef.current[i]) {
          const j = seekNext(i);
          const t = bufferRef.current[i];
          bufferRef.current[i] = c;
          if (j < lenRef.current && testsRef.current[j]?.test(t)) c = t;
          else break;
        }
      }
    },
    [getPlaceholder, seekNext]
  );

  const isCompleted = React.useCallback(() => {
    for (let i = firstNonMaskPosRef.current ?? 0; i <= lastRequiredNonMaskPosRef.current; i++) {
      if (testsRef.current[i] && bufferRef.current[i] === getPlaceholder(i)) return false;
    }
    return true;
  }, [getPlaceholder]);

  const getUnmaskedValue = React.useCallback(() => {
    const out: string[] = [];
    for (let i = 0; i < bufferRef.current.length; i++) {
      const c = bufferRef.current[i];
      if (testsRef.current[i] && c !== getPlaceholder(i)) out.push(c);
    }
    return out.join("");
  }, [getPlaceholder]);

  const checkVal = React.useCallback(
    (allow?: boolean) => {
      const test = elementRef.current?.value ?? "";
      let lastMatch = -1;
      let i = 0;
      let pos = 0;
      for (i = 0, pos = 0; i < lenRef.current; i++) {
        if (testsRef.current[i]) {
          bufferRef.current[i] = getPlaceholder(i);
          while (pos++ < test.length) {
            const c = test.charAt(pos - 1);
            if (testsRef.current[i]?.test(c)) {
              bufferRef.current[i] = c;
              lastMatch = i;
              break;
            }
          }
          if (pos > test.length) {
            clearBuffer(i + 1, lenRef.current);
            break;
          }
        } else {
          if (bufferRef.current[i] === test.charAt(pos)) pos++;
          if (i < partialPositionRef.current) lastMatch = i;
        }
      }
      if (allow) {
        writeBuffer();
      } else if (lastMatch + 1 < partialPositionRef.current) {
        if (autoClear || bufferRef.current.join("") === defaultBufferRef.current) {
          if (elementRef.current) elementRef.current.value = "";
          clearBuffer(0, lenRef.current);
        } else {
          writeBuffer();
        }
      } else {
        writeBuffer();
        if (elementRef.current) {
          elementRef.current.value = elementRef.current.value.substring(0, lastMatch + 1);
        }
      }
      return partialPositionRef.current ? i : (firstNonMaskPosRef.current ?? 0);
    },
    [getPlaceholder, clearBuffer, writeBuffer, autoClear]
  );

  const initMask = React.useCallback(() => {
    testsRef.current = [];
    partialPositionRef.current = mask.length;
    lenRef.current = mask.length;
    firstNonMaskPosRef.current = null;

    const tokens = mask.split("");
    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i];
      if (c === "?") {
        lenRef.current--;
        partialPositionRef.current = i;
      } else if (MASK_DEFS[c]) {
        testsRef.current.push(new RegExp(MASK_DEFS[c]));
        if (firstNonMaskPosRef.current === null) firstNonMaskPosRef.current = testsRef.current.length - 1;
        if (i < partialPositionRef.current) lastRequiredNonMaskPosRef.current = testsRef.current.length - 1;
      } else {
        testsRef.current.push(null);
      }
    }

    bufferRef.current = [];
    for (let i = 0; i < tokens.length; i++) {
      const c = tokens[i];
      if (c !== "?") {
        bufferRef.current.push(MASK_DEFS[c] ? getPlaceholder(i) : c);
      }
    }
    defaultBufferRef.current = bufferRef.current.join("");
  }, [mask, getPlaceholder]);

  const updateModel = React.useCallback(
    (event: React.SyntheticEvent) => {
      if (!onChange) return;
      const raw = elementRef.current?.value ?? "";
      const val = unmask ? getUnmaskedValue() : raw;
      const finalValue = defaultBufferRef.current !== val ? val : "";
      onChange({
        originalEvent: event,
        value: finalValue,
        target: { name, id, value: finalValue },
      });
    },
    [onChange, unmask, getUnmaskedValue, name, id]
  );

  const updateValue = React.useCallback(
    (allow?: boolean) => {
      const el = elementRef.current;
      if (!el) return undefined;
      if (value == null || value === "") {
        el.value = "";
      } else {
        el.value = value;
        checkVal(allow);
        writeBuffer();
        checkVal(allow);
      }
      focusTextRef.current = el.value;
      return undefined;
    },
    [value, checkVal, writeBuffer]
  );

  // Consolidated into a single effect keyed on [mask, value]: re-derives the
  // mask buffer and re-applies `value` together whenever either changes.
  // Real source splits this into a mount-time effect (init + updateValue)
  // and a separate value-only update effect gated by an `isUpdated` check
  // (to avoid clobbering the user's live typed value with a stale `value`
  // prop echo) — this fully-controlled port simplifies that to one effect,
  // since `initMask()` must always run before `updateValue()` can correctly
  // apply the (possibly new) mask, and running both together avoids the
  // ordering hazard of two separate mount-time effects racing to write
  // `elementRef.current.value` from two different bases (raw vs. already-
  // masked).
  React.useEffect(() => {
    initMask();
    updateValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateValue/initMask already depend on [mask, value] internally.
  }, [mask, value]);

  const handleInputChange = React.useCallback(
    (event: React.SyntheticEvent, isPaste = false) => {
      if (readOnly) return;
      if (!isPaste) {
        const pos = checkVal(true);
        caret(pos);
      }
      updateModel(event);
      if (onComplete && isCompleted()) onComplete({ originalEvent: event, value: unmask ? getUnmaskedValue() : elementRef.current?.value ?? "" });
    },
    [readOnly, checkVal, caret, updateModel, onComplete, isCompleted, unmask, getUnmaskedValue]
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (readOnly) return;
      focusTextRef.current = elementRef.current?.value ?? "";
      checkVal();
      writeBuffer();
    },
    [readOnly, checkVal, writeBuffer]
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      checkVal();
      updateModel(event);
    },
    [checkVal, updateModel]
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        const pos = caret();
        if (!pos) return;
        let { begin, end } = pos;
        if (end - begin === 0) {
          if (event.key === "Delete") {
            end = seekNext(begin - 1);
          } else {
            begin = seekPrev(begin);
          }
        }
        clearBuffer(begin, end);
        shiftL(begin, end - 1);
        updateModel(event);
        event.preventDefault();
      } else if (event.key === "Escape") {
        if (elementRef.current) elementRef.current.value = focusTextRef.current;
        caret(0, checkVal());
        updateModel(event);
        event.preventDefault();
      }
    },
    [readOnly, caret, seekNext, seekPrev, clearBuffer, shiftL, updateModel, checkVal]
  );

  const onKeyPress = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const pos = caret();
      if (!pos) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      let completed = false;
      const p = seekNext(pos.begin - 1);
      if (pos.end - pos.begin !== 0) {
        clearBuffer(pos.begin, pos.end);
        shiftL(pos.begin, pos.end - 1);
      }
      if (p < lenRef.current) {
        const c = event.key;
        if (testsRef.current[p]?.test(c)) {
          shiftR(p);
          bufferRef.current[p] = c;
          writeBuffer();
          const next = seekNext(p);
          caret(next);
          if (pos.begin <= lastRequiredNonMaskPosRef.current) completed = isCompleted();
        }
      }
      event.preventDefault();
      updateModel(event);
      if (onComplete && completed) onComplete({ originalEvent: event, value: unmask ? getUnmaskedValue() : elementRef.current?.value ?? "" });
    },
    [readOnly, caret, seekNext, clearBuffer, shiftL, shiftR, writeBuffer, updateModel, onComplete, isCompleted, unmask, getUnmaskedValue]
  );

  return (
    <input
      ref={setRef}
      type="text"
      id={id}
      name={name}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      className={[cx("root", { invalid, variantFilled: variant === "filled", fluid, disabled }), className]
        .filter(Boolean)
        .join(" ")}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyPress={onKeyPress}
      onInput={handleInputChange}
      onPaste={(event) => handleInputChange(event, true)}
    />
  );
});
