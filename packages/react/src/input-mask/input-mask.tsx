import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { inputMaskStyleModule } from "./input-mask-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputMask` (real source:
 * `components/lib/inputmask/InputMask.js`/`InputMaskBase.js`, same
 * jQuery-MaskedInput-derived buffer algorithm as PrimeNG/PrimeVue's own
 * InputMask). Fully-controlled (`value`/`onChange`), matching React's
 * established no-shared-form-state-base-class convention.
 *
 * Ports real source's masking algorithm: digit (`9`)/alpha (`a`)/
 * alphanumeric (`*`) slot characters, static separators, `slotChar`,
 * `characterPattern`, `autoClear`, `keepBuffer`, `unmask`, the `tests`/
 * `buffer` position model with `checkVal`/`shiftL`/`shiftR`/`seekNext`/
 * `seekPrev`/`writeBuffer`, Backspace and Delete, Escape (restores the value
 * captured on focus) and Enter (finalizes the value).
 *
 * Paste is reformatted after the browser has applied it, so the selection and
 * the text around it are kept. `compositionstart`/`compositionend` hold back
 * reformatting while an IME composes, and an Android Chrome branch
 * reconciles the value after each input event (ADR-095). These paths are
 * covered with simulated events; real devices are not verified.
 *
 * Native attributes (`aria-label`, `required`, `autoComplete`, event
 * handlers and so on) go to the input. `pt`, `ptOptions` and `unstyled` come
 * from the shared pass-through machinery (ADR-077, ADR-080).
 *
 * `keyfilter`, `tooltip` and `validateOnly` are composition (`useKeyFilter`,
 * `UTooltip`), not props of this component (ADR-086).
 */
export interface UInputMaskChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: string;
  target: { name?: string; id?: string; value: string };
}

export interface UInputMaskProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "size"
> {
  value?: string | null;
  mask: string;
  slotChar?: string;
  autoClear?: boolean;
  /** Regex source for alpha (`a`) mask characters. */
  characterPattern?: string;
  /** Keeps the value instead of reformatting or clearing it on focus and blur. */
  keepBuffer?: boolean;
  unmask?: boolean;
  onChange?: (event: UInputMaskChangeEvent) => void;
  onComplete?: (event: { originalEvent: React.SyntheticEvent; value: string }) => void;
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

function isAndroidChrome(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /chrome/i.test(navigator.userAgent) &&
    /android/i.test(navigator.userAgent)
  );
}

function isNotEmpty(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export const UInputMask = React.forwardRef<HTMLInputElement, UInputMaskProps>(
  function UInputMask(props, ref) {
    const {
      value,
      mask,
      slotChar = "_",
      autoClear = true,
      characterPattern = "[A-Za-z]",
      keepBuffer = false,
      unmask = false,
      onChange,
      onComplete,
      readOnly = false,
      invalid = false,
      variant,
      size,
      fluid = false,
      className,
      inputRef,
      unstyled,
      pt,
      ptOptions,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      onKeyDown: onKeyDownProp,
      onKeyPress: onKeyPressProp,
      onInput: onInputProp,
      onPaste: onPasteProp,
      onCompositionStart: onCompositionStartProp,
      onCompositionEnd: onCompositionEndProp,
      ...rest
    } = props;
    const { name, id } = rest;
    const { cx } = useComponentBase({
      componentName: "inputtext",
      styleModule: inputMaskStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("inputmask", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const elementRef = React.useRef<HTMLInputElement | null>(null);

    const testsRef = React.useRef<Array<RegExp | null>>([]);
    const bufferRef = React.useRef<string[]>([]);
    const lenRef = React.useRef(0);
    const partialPositionRef = React.useRef(0);
    const firstNonMaskPosRef = React.useRef<number | null>(null);
    const lastRequiredNonMaskPosRef = React.useRef(-1);
    const defaultBufferRef = React.useRef("");
    const focusTextRef = React.useRef("");
    const oldValRef = React.useRef("");
    const composingRef = React.useRef(false);
    const caretTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const androidChrome = React.useMemo(() => isAndroidChrome(), []);

    const setRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        elementRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef)
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref, inputRef]
    );

    React.useEffect(() => () => clearTimeout(caretTimeoutRef.current), []);

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

    const clearBuffer = React.useCallback(
      (start: number, end: number) => {
        if (keepBuffer) return;
        for (let i = start; i < end && i < lenRef.current; i++) {
          if (testsRef.current[i]) bufferRef.current[i] = getPlaceholder(i);
        }
      },
      [getPlaceholder, keepBuffer]
    );

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
                if (!keepBuffer) bufferRef.current[i] = c;
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
      [getPlaceholder, clearBuffer, writeBuffer, autoClear, keepBuffer]
    );

    const initMask = React.useCallback(() => {
      const defs: Record<string, string> = {
        "9": "[0-9]",
        a: characterPattern,
        "*": `${characterPattern}|[0-9]`,
      };
      testsRef.current = [];
      partialPositionRef.current = mask.length;
      lenRef.current = mask.length;
      firstNonMaskPosRef.current = null;
      lastRequiredNonMaskPosRef.current = -1;

      const tokens = mask.split("");
      for (let i = 0; i < tokens.length; i++) {
        const c = tokens[i];
        if (c === "?") {
          lenRef.current--;
          partialPositionRef.current = i;
        } else if (defs[c]) {
          testsRef.current.push(new RegExp(defs[c]));
          if (firstNonMaskPosRef.current === null)
            firstNonMaskPosRef.current = testsRef.current.length - 1;
          if (i < partialPositionRef.current)
            lastRequiredNonMaskPosRef.current = testsRef.current.length - 1;
        } else {
          testsRef.current.push(null);
        }
      }

      bufferRef.current = [];
      for (let i = 0; i < tokens.length; i++) {
        const c = tokens[i];
        if (c !== "?") {
          bufferRef.current.push(defs[c] ? getPlaceholder(i) : c);
        }
      }
      defaultBufferRef.current = bufferRef.current.join("");
    }, [mask, characterPattern, getPlaceholder]);

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

    // One effect keyed on the mask inputs and the value: it re-derives the mask
    // buffer and re-applies `value` together, so a runtime change of `mask`,
    // `slotChar` or `characterPattern` reformats the current value too. A
    // `value` that only echoes what the input already holds is not re-applied,
    // as in PrimeReact's `isValueUpdated`: re-applying an echoed incomplete
    // value would let `autoClear` wipe it while the user types.
    const maskKeyRef = React.useRef<string | null>(null);
    React.useEffect(() => {
      const maskKey = `${mask}\u0000${slotChar}\u0000${characterPattern}`;
      const maskChanged = maskKeyRef.current !== maskKey;
      maskKeyRef.current = maskKey;
      if (maskChanged) initMask();
      const el = elementRef.current;
      if (!el) return;
      const held = unmask ? getUnmaskedValue() : el.value;
      if (maskChanged || (value ?? "") !== held) updateValue();
      // initMask and updateValue already depend on these inputs internally.
    }, [mask, slotChar, characterPattern, value]);

    const finishEdit = React.useCallback(
      (event: React.SyntheticEvent) => {
        updateModel(event);
        if (onComplete && isCompleted())
          onComplete({
            originalEvent: event,
            value: unmask ? getUnmaskedValue() : (elementRef.current?.value ?? ""),
          });
      },
      [updateModel, onComplete, isCompleted, unmask, getUnmaskedValue]
    );

    const handleAndroidInput = React.useCallback(
      (event: React.SyntheticEvent) => {
        const el = elementRef.current;
        if (!el) return;
        const curVal = el.value;
        let begin = el.selectionStart ?? 0;
        const deleted = oldValRef.current.length > curVal.length;
        checkVal(true);
        if (deleted) {
          while (begin > 0 && !testsRef.current[begin - 1]) begin--;
          if (begin === 0) {
            while (begin < (firstNonMaskPosRef.current ?? 0) && !testsRef.current[begin]) begin++;
          }
        } else {
          while (begin < lenRef.current && !testsRef.current[begin]) begin++;
        }
        setTimeout(() => {
          caret(begin, begin);
          finishEdit(event);
        }, 0);
      },
      [checkVal, caret, finishEdit]
    );

    const handleInputChange = React.useCallback(
      (event: React.SyntheticEvent, isPaste = false) => {
        if (readOnly) return;
        const apply = () => {
          const pos = checkVal(true);
          caret(pos);
          finishEdit(event);
        };
        if (isPaste) setTimeout(apply, 0);
        else apply();
      },
      [readOnly, checkVal, caret, finishEdit]
    );

    const finalize = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (!keepBuffer) checkVal();
        updateModel(event);
      },
      [keepBuffer, checkVal, updateModel]
    );

    const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (!readOnly) {
        focusTextRef.current = elementRef.current?.value ?? "";
        clearTimeout(caretTimeoutRef.current);
        const pos = keepBuffer ? (elementRef.current?.value.length ?? 0) : checkVal();
        writeBuffer();
        caretTimeoutRef.current = setTimeout(() => {
          const el = elementRef.current;
          if (!el || el !== el.ownerDocument.activeElement) return;
          if (pos === mask.replace("?", "").length) caret(0, pos);
          else caret(pos);
        }, 10);
      }
      onFocusProp?.(event);
    };

    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      finalize(event);
      onBlurProp?.(event);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(event);
      if (readOnly) return;
      oldValRef.current = elementRef.current?.value ?? "";
      if (event.key === "Backspace" || event.key === "Delete") {
        const pos = caret();
        if (!pos) return;
        let { begin, end } = pos;
        if (end - begin === 0) {
          if (event.key === "Delete") {
            begin = end = seekNext(begin - 1);
            end = seekNext(end);
          } else {
            begin = seekPrev(begin);
          }
        }
        clearBuffer(begin, end);
        shiftL(begin, keepBuffer ? end - 2 : end - 1);
        updateModel(event);
        event.preventDefault();
      } else if (event.key === "Enter") {
        finalize(event);
      } else if (event.key === "Escape") {
        if (elementRef.current) elementRef.current.value = focusTextRef.current;
        caret(0, checkVal());
        updateModel(event);
        event.preventDefault();
      }
    };

    const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyPressProp?.(event);
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
      if (onComplete && completed)
        onComplete({
          originalEvent: event,
          value: unmask ? getUnmaskedValue() : (elementRef.current?.value ?? ""),
        });
    };

    const onInput = (event: React.FormEvent<HTMLInputElement>) => {
      onInputProp?.(event);
      if (composingRef.current) return;
      if (androidChrome) handleAndroidInput(event);
      else handleInputChange(event);
    };

    const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
      onPasteProp?.(event);
      handleInputChange(event, true);
    };

    const onCompositionStart = (event: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = true;
      onCompositionStartProp?.(event);
    };

    const onCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
      composingRef.current = false;
      onCompositionEndProp?.(event);
      handleInputChange(event, true);
    };

    const rootClassName = [
      cx("root", {
        filled: isNotEmpty(value),
        invalid,
        variantFilled: variant === "filled",
        fluid,
        size,
      }),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={setRef}
        {...mergeProps(
          { type: "text", "aria-invalid": invalid || undefined, readOnly },
          rest,
          {
            className: rootClassName,
            onFocus,
            onBlur,
            onKeyDown,
            onKeyPress,
            onInput,
            onPaste,
            onCompositionStart,
            onCompositionEnd,
          },
          ptm("root")
        )}
      />
    );
  }
);
