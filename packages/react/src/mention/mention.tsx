import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { mentionStyleModule } from "./mention-style";

export interface UMentionSearchEvent {
  originalEvent: React.SyntheticEvent;
  trigger: string;
  query: string;
}

export interface UMentionSelectEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  suggestion: T;
}

export interface UMentionProps<T = unknown> {
  value?: string;
  onChange?: (value: string) => void;
  suggestions?: T[];
  field?: string;
  trigger?: string;
  delay?: number;
  autoHighlight?: boolean;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  inputId?: string;
  className?: string;
  onSearch?: (event: UMentionSearchEvent) => void;
  onSelect?: (event: UMentionSelectEvent<T>) => void;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}

function formatSuggestion<T>(suggestion: T, field?: string): string {
  if (suggestion == null) return "";
  if (field && typeof suggestion === "object") {
    return String((suggestion as Record<string, unknown>)[field] ?? "");
  }
  return String(suggestion);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Mention` (real source:
 * `components/lib/mention/Mention.js`/`MentionBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`). An
 * `@`-mention autocomplete textarea: typing the trigger character (default
 * `@`) opens a suggestion overlay driven by the consumer's `onSearch`
 * callback populating `suggestions`, matching real source's own
 * `trigger`/`onSearch`/`suggestions` contract exactly
 * (`MentionBase.js` `defaultProps`).
 *
 * PROOF-BY-EXCEPTION FINDING (per this task's brief — reporting, not
 * escalating, since real structure maps cleanly onto an existing pattern):
 * real source's own overlay is `Portal`/`ZIndexUtils`/`CSSTransition`-based
 * (React's overlay/z-index tier), cursor-positioned via
 * `DomHandler.getCursorOffset`. This realization does NOT reproduce that —
 * it follows this package's own already-Built `UAutoComplete`
 * (`packages/react/src/autocomplete/autocomplete.tsx`), which solves the
 * exact same shape (controlled value, consumer-driven `suggestions` array,
 * keyboard-navigable overlay list) with a plain in-flow `<div>` overlay
 * positioned by ordinary CSS (`position: absolute; top: 100%`), no Portal/
 * z-index tier at all. Mention's overlay differs from real source's own
 * AutoComplete-shaped precedent only in where it anchors (at the trigger's
 * cursor position vs. below the whole input) — a real difference, but not
 * one requiring a different architectural tier: this port anchors its
 * overlay below the whole textarea (matching `UAutoComplete`'s own
 * established precedent) rather than inventing per-character cursor-offset
 * positioning, which would need new DOM-measurement machinery this package
 * does not otherwise have. This is a deliberately smaller surface than
 * upstream, consistent with every sibling component's own "smaller surface
 * than upstream" convention (see `autocomplete.tsx`'s own doc comment).
 *
 * Fully-controlled (`value`/`onChange(value: string)`), matching React's
 * established no-shared-form-state-base-class convention — same shape
 * `UAutoComplete` follows. Real source instead mutates
 * `inputRef.current.value` imperatively on selection and forwards the raw
 * native event through `props.onChange(event)`; this port keeps the text
 * fully React-controlled instead (consistent with every sibling
 * component's own fully-controlled convention), so a mention-selection
 * commits by calling `onChange(nextText)` exactly like a normal keystroke
 * would, rather than reaching into the DOM.
 */
export function UMention<T = unknown>({
  value = "",
  onChange,
  suggestions = [],
  field,
  trigger = "@",
  delay = 0,
  autoHighlight = true,
  placeholder,
  disabled = false,
  rows = 3,
  inputId,
  className,
  onSearch,
  onSelect,
  onFocus,
  onBlur,
}: UMentionProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "mention", styleModule: mentionStyleModule });

  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(autoHighlight ? 0 : -1);
  const [triggerIndex, setTriggerIndex] = React.useState<number | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const idRef = React.useId();

  const hide = React.useCallback(() => {
    setOverlayVisible(false);
    setTriggerIndex(null);
    setHighlightIndex(autoHighlight ? 0 : -1);
  }, [autoHighlight]);

  const findTriggerIndex = React.useCallback(
    (text: string, caret: number): number => {
      const spaceIndex = text.substring(0, caret).lastIndexOf(" ");
      const triggerCharIndex = text.substring(0, caret).lastIndexOf(trigger);
      if (triggerCharIndex === -1) return -1;
      const candidateIndex = triggerCharIndex + 1;
      return candidateIndex > spaceIndex ? candidateIndex : -1;
    },
    [trigger]
  );

  const selectSuggestion = React.useCallback(
    (event: React.SyntheticEvent, suggestion: T) => {
      if (triggerIndex === null) return;
      const textarea = textareaRef.current;
      const caret = textarea?.selectionStart ?? value.length;
      const spaceIndex = value.indexOf(" ", triggerIndex);
      const currentText = value.substring(triggerIndex, spaceIndex > -1 ? spaceIndex : caret);
      const selectedText = formatSuggestion(suggestion, field).replace(/\s+/g, "");

      let nextValue = value;
      if (currentText.trim() !== selectedText) {
        const before = value.substring(0, triggerIndex);
        const after = value.substring(spaceIndex > -1 ? caret : triggerIndex + currentText.length);
        nextValue = after.startsWith(" ")
          ? `${before}${selectedText}${after}`
          : `${before}${selectedText} ${after}`;
        onChange?.(nextValue);
      }

      hide();
      onSelect?.({ originalEvent: event, suggestion });

      const cursor = triggerIndex + selectedText.length + 1;
      requestAnimationFrame(() => textarea?.setSelectionRange(cursor, cursor));
    },
    [triggerIndex, value, field, onChange, onSelect, hide]
  );

  const search = React.useCallback(
    (event: React.SyntheticEvent, query: string, atIndex: number) => {
      setTriggerIndex(atIndex);
      setOverlayVisible(true);
      onSearch?.({ originalEvent: event, trigger, query });
    },
    [onSearch, trigger]
  );

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    const caret = event.target.selectionStart;
    onChange?.(text);

    const lastChar = text.substring(caret - 1, caret);
    if (lastChar === " ") {
      hide();
      return;
    }

    const atIndex = findTriggerIndex(text, caret);
    if (atIndex === -1) {
      if (overlayVisible) hide();
      return;
    }

    const query = text.substring(atIndex, caret);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(event, query, atIndex), delay);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!overlayVisible) return;

    switch (event.key) {
      case "ArrowDown":
        setHighlightIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1));
        event.preventDefault();
        break;
      case "ArrowUp":
        setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        event.preventDefault();
        break;
      case "Enter":
        if (highlightIndex !== -1 && suggestions[highlightIndex] !== undefined) {
          selectSuggestion(event, suggestions[highlightIndex]);
        }
        event.preventDefault();
        break;
      case "Escape":
        hide();
        event.preventDefault();
        break;
      case "Backspace": {
        const caret = event.currentTarget.selectionStart;
        const key = event.currentTarget.value.substring(caret - 1, caret);
        if (key === trigger) hide();
        break;
      }
      default:
        break;
    }
  };

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <div className={[cx("root", { focused, filled: value.length > 0 }), className].filter(Boolean).join(" ")}>
      <textarea
        ref={textareaRef}
        id={inputId}
        rows={rows}
        className={cx("input")}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        role="combobox"
        aria-expanded={overlayVisible}
        aria-autocomplete="list"
        aria-activedescendant={
          overlayVisible && highlightIndex !== -1 ? `${idRef}_item_${highlightIndex}` : undefined
        }
      />
      {overlayVisible && (
        <div className={cx("panel")}>
          <ul className={cx("items")} role="listbox" id={`${idRef}_list`}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                id={`${idRef}_item_${index}`}
                role="option"
                aria-selected={highlightIndex === index}
                className={cx("item", { selected: highlightIndex === index })}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={(event) => selectSuggestion(event, suggestion)}
              >
                {formatSuggestion(suggestion, field)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
