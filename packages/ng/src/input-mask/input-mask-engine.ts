/**
 * Framework-neutral masking engine shared by `UInputMask` (the component)
 * and `UInputMaskDirective` (`[uInputMask]` on any native `<input>`).
 *
 * Ultimate-owned adaptation of the jQuery-MaskedInput-derived buffer, tests
 * and caret machinery that PrimeNG declares twice, once in `InputMask` and
 * once in `InputMaskDirective` (`primeng/src/inputmask/inputmask.ts`). A
 * single engine removes that duplication (ADR-095). It owns the DOM listeners
 * for focus, blur, keydown, keypress, input, paste and composition, and
 * reports to its host through {@link InputMaskEngineHost}.
 *
 * Behaviors ported from PrimeNG: backspace and delete re-insert the
 * placeholder and shift the buffer, Escape restores the value captured on
 * focus, Enter finalizes the value, paste and IME input are reformatted
 * after the browser has applied them (so the selection is respected), an
 * Android Chrome branch reconciles the value after each input event, and
 * `keepBuffer` skips the focus and blur reformatting.
 *
 * The engine writes through `input.value` and then dispatches a synthetic
 * `input` event so that `DefaultValueAccessor`, `NgModel` and other
 * listeners observe the formatted value. A re-entrancy flag keeps the
 * engine from processing its own event. Keys are read from `event.key`
 * (not the deprecated `keyCode`), so iPhone's `keyCode` 127 alias has no
 * counterpart.
 */
export interface InputMaskEngineHost {
  input(): HTMLInputElement | null;
  mask(): string | undefined;
  slotChar(): string;
  autoClear(): boolean;
  characterPattern(): string;
  keepBuffer(): boolean;
  /** The user changed the value; the synthetic `input` event has already been dispatched. */
  changed(): void;
  /** The mask became complete through user input. */
  completed(): void;
  /** The unmasked value after a user edit. */
  unmasked(value: string): void;
  /** Called at the end of the blur handling, after the value has been finalized. */
  blurred?(event: Event): void;
}

/** True for Chrome on Android, whose `input` events need the dedicated reconciliation branch. */
function detectAndroidChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return /chrome/i.test(navigator.userAgent) && /android/i.test(navigator.userAgent);
}

function detectAndroid(): boolean {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

export class InputMaskEngine {
  /** Overridable so tests can exercise both input branches. */
  androidChrome = detectAndroidChrome();
  /** Overridable so tests can exercise the Android caret timing. */
  android = detectAndroid();

  private tests: (RegExp | null)[] = [];
  private partialPosition = 0;
  private firstNonMaskPos: number | null = null;
  private lastRequiredNonMaskPos = -1;
  private len = 0;
  private buffer: string[] = [];
  private defaultBuffer = "";
  private focusText = "";
  private oldVal = "";
  private composing = false;
  private dispatching = false;
  private caretTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private pendingTimeoutIds = new Set<ReturnType<typeof setTimeout>>();
  private attachedInput: HTMLInputElement | null = null;
  private unlisteners: (() => void)[] = [];

  constructor(private readonly host: InputMaskEngineHost) {}

  /** Starts listening on `input`. Replaces any previously attached element. */
  attach(input: HTMLInputElement): void {
    this.detach();
    this.attachedInput = input;
    const handlers: [string, (event: Event) => void][] = [
      ["focus", () => this.handleFocus()],
      ["blur", (event) => this.handleBlur(event)],
      ["keydown", (event) => this.handleKeydown(event as KeyboardEvent)],
      ["keypress", (event) => this.handleKeypress(event as KeyboardEvent)],
      ["input", () => this.handleInput()],
      ["paste", () => this.handleInputChange()],
      [
        "compositionstart",
        () => {
          this.composing = true;
        },
      ],
      [
        "compositionend",
        () => {
          this.composing = false;
          this.handleInputChange();
        },
      ],
    ];
    for (const [name, handler] of handlers) {
      input.addEventListener(name, handler);
      this.unlisteners.push(() => input.removeEventListener(name, handler));
    }
  }

  detach(): void {
    for (const unlisten of this.unlisteners) unlisten();
    this.unlisteners = [];
    clearTimeout(this.caretTimeoutId);
    for (const id of this.pendingTimeoutIds) clearTimeout(id);
    this.pendingTimeoutIds.clear();
    this.attachedInput = null;
    this.composing = false;
  }

  /** Faithful port of `InputMask.initMask()`, also valid for a later mask change. */
  init(): void {
    const maskValue = this.host.mask();
    if (!maskValue) return;

    this.tests = [];
    this.partialPosition = maskValue.length;
    this.len = maskValue.length;
    this.firstNonMaskPos = null;
    this.lastRequiredNonMaskPos = -1;
    const characterPattern = this.host.characterPattern();
    const defs: Record<string, string> = {
      "9": "[0-9]",
      a: characterPattern,
      "*": `${characterPattern}|[0-9]`,
    };

    const maskTokens = maskValue.split("");
    for (let i = 0; i < maskTokens.length; i++) {
      const token = maskTokens[i];
      if (token === "?") {
        this.len--;
        this.partialPosition = i;
      } else if (defs[token]) {
        this.tests.push(new RegExp(defs[token]));
        if (this.firstNonMaskPos === null) {
          this.firstNonMaskPos = this.tests.length - 1;
        }
        if (i < this.partialPosition) {
          this.lastRequiredNonMaskPos = this.tests.length - 1;
        }
      } else {
        this.tests.push(null);
      }
    }

    this.buffer = [];
    for (let i = 0; i < maskTokens.length; i++) {
      const token = maskTokens[i];
      if (token !== "?") {
        this.buffer.push(defs[token] ? this.getPlaceholder(i) : token);
      }
    }
    this.defaultBuffer = this.buffer.join("");
  }

  /**
   * Re-applies the current mask to whatever the input holds, without
   * notifying the host. Used after a runtime mask change and for CVA writes.
   */
  reformat(): void {
    const input = this.host.input();
    if (!input || !this.host.mask()) return;
    this.checkVal(!!input.value);
    this.focusText = input.value;
  }

  /** Moves keyboard focus to the masked input. */
  focus(): void {
    this.host.input()?.focus();
  }

  getUnmaskedValue(): string {
    const unmasked: string[] = [];
    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i];
      if (this.tests[i] && char !== this.getPlaceholder(i)) {
        unmasked.push(char);
      }
    }
    return unmasked.join("");
  }

  isCompleted(): boolean {
    for (let i = this.firstNonMaskPos ?? 0; i <= this.lastRequiredNonMaskPos; i++) {
      if (this.tests[i] && this.buffer[i] === this.getPlaceholder(i)) {
        return false;
      }
    }
    return true;
  }

  private handleFocus(): void {
    const input = this.host.input();
    if (!input || input.readOnly || !this.host.mask()) return;

    this.focusText = input.value;
    clearTimeout(this.caretTimeoutId);
    const pos = this.host.keepBuffer() ? input.value.length : this.checkVal();
    this.writeBuffer();

    this.caretTimeoutId = setTimeout(() => {
      if (input !== input.ownerDocument.activeElement) return;
      if (pos === this.host.mask()?.replace("?", "").length) {
        this.setCaret(input, 0, pos);
      } else {
        this.setCaret(input, pos);
      }
    }, 10);
  }

  private handleBlur(event: Event): void {
    const input = this.host.input();
    if (!input || !this.host.mask()) return;

    if (!this.host.keepBuffer()) {
      const before = input.value;
      this.checkVal();
      if (input.value !== before) this.notify();
    }
    this.host.blurred?.(event);
  }

  private handleKeydown(event: KeyboardEvent): void {
    const input = this.host.input();
    if (!input || input.readOnly || !this.host.mask()) return;

    this.oldVal = input.value;

    if (event.key === "Backspace" || event.key === "Delete") {
      const caret = this.getCaret(input);
      let begin = caret.begin;
      let end = caret.end;
      if (end - begin === 0) {
        if (event.key === "Delete") {
          begin = end = this.seekNext(begin - 1);
          end = this.seekNext(end);
        } else {
          begin = this.seekPrev(begin);
        }
      }
      this.clearBuffer(begin, end);
      this.shiftL(begin, this.host.keepBuffer() ? end - 2 : end - 1);
      this.writeBuffer();
      this.setCaret(input, Math.max(this.firstNonMaskPos ?? 0, begin));
      this.notify();
      event.preventDefault();
    } else if (event.key === "Enter") {
      this.handleBlur(event);
    } else if (event.key === "Escape") {
      input.value = this.focusText;
      this.setCaret(input, 0, this.checkVal());
      this.notify();
      event.preventDefault();
    }
  }

  private handleKeypress(event: KeyboardEvent): void {
    const input = this.host.input();
    if (!input || input.readOnly || !this.host.mask()) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key.length !== 1) return;

    const { begin, end } = this.getCaret(input);
    if (end - begin !== 0) {
      this.clearBuffer(begin, end);
      this.shiftL(begin, end - 1);
    }

    const pos = this.seekNext(begin - 1);
    if (pos < this.len) {
      const char = event.key;
      if (this.tests[pos]?.test(char)) {
        this.shiftR(pos);
        this.buffer[pos] = char;
        this.writeBuffer();
        this.notify();

        const next = this.seekNext(pos);
        if (this.android) {
          this.defer(() => this.setCaret(input, next));
        } else {
          this.setCaret(input, next);
        }

        if (begin <= this.lastRequiredNonMaskPos && this.isCompleted()) {
          this.host.completed();
        }
      }
    }
    event.preventDefault();
  }

  private handleInput(): void {
    if (!this.host.mask() || this.dispatching || this.composing) return;
    if (this.androidChrome) {
      this.handleAndroidInput();
    } else {
      this.handleInputChange();
    }
  }

  /**
   * Reformats the value after the browser has applied a paste, a
   * composition or a native edit. Runs after the event so the selection and
   * the surrounding text are already part of the input value.
   */
  private handleInputChange(): void {
    const input = this.host.input();
    if (!input || input.readOnly || !this.host.mask() || this.composing) return;

    this.defer(() => {
      const pos = this.checkVal(true);
      this.setCaret(input, pos);
      this.afterReconcile();
    });
  }

  private handleAndroidInput(): void {
    const input = this.host.input();
    if (!input) return;

    const currentValue = input.value;
    const caret = this.getCaret(input);
    let begin = caret.begin;
    const deleted = this.oldVal.length > currentValue.length;
    this.checkVal(true);
    if (deleted) {
      while (begin > 0 && !this.tests[begin - 1]) begin--;
      if (begin === 0) {
        while (begin < (this.firstNonMaskPos ?? 0) && !this.tests[begin]) begin++;
      }
    } else {
      while (begin < this.len && !this.tests[begin]) begin++;
    }

    this.defer(() => {
      this.setCaret(input, begin, begin);
      this.afterReconcile();
    });
  }

  private afterReconcile(): void {
    this.notify();
    if (this.isCompleted()) this.host.completed();
  }

  private notify(): void {
    const input = this.host.input();
    if (input) {
      this.dispatching = true;
      try {
        input.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
      } finally {
        this.dispatching = false;
      }
    }
    this.host.unmasked(this.getUnmaskedValue());
    this.host.changed();
  }

  private defer(callback: () => void): void {
    const id = setTimeout(() => {
      this.pendingTimeoutIds.delete(id);
      callback();
    }, 0);
    this.pendingTimeoutIds.add(id);
  }

  private getPlaceholder(i: number): string {
    const slotChar = this.host.slotChar();
    return i < slotChar.length ? slotChar.charAt(i) : slotChar.charAt(0);
  }

  private seekNext(pos: number): number {
    let next = pos;
    while (++next < this.len && !this.tests[next]);
    return next;
  }

  private seekPrev(pos: number): number {
    let prev = pos;
    while (--prev >= 0 && !this.tests[prev]);
    return prev;
  }

  private shiftL(begin: number, end: number): void {
    if (begin < 0) return;
    let j = this.seekNext(end);
    for (let i = begin; i < this.len; i++) {
      const test = this.tests[i];
      if (test) {
        if (j < this.len && test.test(this.buffer[j])) {
          this.buffer[i] = this.buffer[j];
          this.buffer[j] = this.getPlaceholder(j);
        } else {
          break;
        }
        j = this.seekNext(j);
      }
    }
  }

  private shiftR(pos: number): void {
    let char = this.getPlaceholder(pos);
    for (let i = pos; i < this.len; i++) {
      if (this.tests[i]) {
        const j = this.seekNext(i);
        const previous = this.buffer[i];
        this.buffer[i] = char;
        if (j < this.len && this.tests[j]?.test(previous)) {
          char = previous;
        } else {
          break;
        }
      }
    }
  }

  private clearBuffer(start: number, end: number): void {
    if (this.host.keepBuffer()) return;
    for (let i = start; i < end && i < this.len; i++) {
      if (this.tests[i]) {
        this.buffer[i] = this.getPlaceholder(i);
      }
    }
  }

  private writeBuffer(): void {
    const input = this.host.input();
    if (input && this.buffer.length) {
      input.value = this.buffer.join("");
    }
  }

  /** Faithful port of `InputMask.checkVal()`: places the input value into the mask. */
  private checkVal(allow = false): number {
    const input = this.host.input();
    const test = input?.value ?? "";
    const keepBuffer = this.host.keepBuffer();
    let lastMatch = -1;
    let i = 0;
    let pos = 0;

    for (i = 0, pos = 0; i < this.len; i++) {
      if (this.tests[i]) {
        this.buffer[i] = this.getPlaceholder(i);
        while (pos++ < test.length) {
          const char = test.charAt(pos - 1);
          if (this.tests[i]?.test(char)) {
            if (!keepBuffer) this.buffer[i] = char;
            lastMatch = i;
            break;
          }
        }
        if (pos > test.length) {
          this.clearBuffer(i + 1, this.len);
          break;
        }
      } else {
        if (this.buffer[i] === test.charAt(pos)) {
          pos++;
        }
        if (i < this.partialPosition) {
          lastMatch = i;
        }
      }
    }

    if (allow) {
      this.writeBuffer();
    } else if (lastMatch + 1 < this.partialPosition) {
      if (this.host.autoClear() || this.buffer.join("") === this.defaultBuffer) {
        if (input?.value) input.value = "";
        this.clearBuffer(0, this.len);
      } else {
        this.writeBuffer();
      }
    } else {
      this.writeBuffer();
      if (input) input.value = input.value.substring(0, lastMatch + 1);
    }
    return this.partialPosition ? i : (this.firstNonMaskPos ?? 0);
  }

  private getCaret(input: HTMLInputElement): { begin: number; end: number } {
    return { begin: input.selectionStart ?? 0, end: input.selectionEnd ?? 0 };
  }

  private setCaret(input: HTMLInputElement, first: number, last = first): void {
    if (input !== input.ownerDocument.activeElement) return;
    input.setSelectionRange(first, last);
  }
}
