import * as React from "react";
import {
  Portal,
  createPassThrough,
  useComponentBase,
  useMergeProps,
  useMotion,
  useOverlayListener,
  useUnmountEffect,
  useUpdateEffect,
  useZIndex,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import type { MotionOptions } from "@ultimate/uix-motion";
import { resolveFieldData } from "@ultimate/uix-utils";
import {
  ConnectedOverlayScrollHandler,
  getCursorOffset,
  scrollInView,
} from "@ultimate/uix-utils/dom";
import { UInputTextarea, type UInputTextareaProps } from "../input-textarea";
import { mentionPresetKeys, mentionStyleModule } from "./mention-style";

/**
 * The `onChange` event: PrimeReact's shape, whose `target` is the textarea.
 * Typing passes the textarea's change event; picking a suggestion passes the
 * click or key event with `target` set to the textarea, after the textarea's
 * value has been updated. Read the text from `event.target.value`.
 */
export type UMentionChangeEvent = React.SyntheticEvent<HTMLTextAreaElement> & {
  target: HTMLTextAreaElement;
};

export interface UMentionSearchEvent {
  originalEvent: React.SyntheticEvent;
  trigger: string;
  query: string;
}

export interface UMentionSelectEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  suggestion: T;
}

/** The options passed to a function `itemTemplate`. */
export interface UMentionItemTemplateOptions {
  /** The trigger that opened the panel. */
  trigger: string;
  index: number;
}

/** The `ref` handle of `UMention`. */
export interface UMentionRef {
  show: () => void;
  hide: () => void;
  focus: () => void;
  getElement: () => HTMLDivElement | null;
  getOverlay: () => HTMLDivElement | null;
  getInput: () => HTMLTextAreaElement | null;
}

export interface UMentionProps<T = unknown> extends Omit<
  UInputTextareaProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onInput"
  | "onFocus"
  | "onBlur"
  | "onSelect"
  | "inputRef"
  | "unstyled"
  | "pt"
  | "ptOptions"
  | "children"
> {
  /** Controlled text. Leave it undefined and use `defaultValue` for an uncontrolled textarea. */
  value?: string;
  defaultValue?: string;
  onChange?: (event: UMentionChangeEvent) => void;
  onInput?: React.FormEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  suggestions?: T[];
  /**
   * Field of an object suggestion to insert and show; a dot path is resolved.
   * With several triggers, an array gives one field per trigger, in order.
   */
  field?: string | string[];
  /** Character, or characters, that start a search. */
  trigger?: string | string[];
  /** Milliseconds to wait after a keystroke before `onSearch`. */
  delay?: number;
  autoHighlight?: boolean;
  /** Maximum height of the panel. */
  scrollHeight?: string;
  itemTemplate?:
    React.ReactNode | ((suggestion: T, options: UMentionItemTemplateOptions) => React.ReactNode);
  headerTemplate?: React.ReactNode | ((props: UMentionProps<T>) => React.ReactNode);
  footerTemplate?: React.ReactNode | ((props: UMentionProps<T>) => React.ReactNode);
  inputId?: string;
  inputRef?: React.Ref<HTMLTextAreaElement>;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  /** Motion options of the panel; merged over `{ name: "u-anchored-overlay" }`. */
  transitionOptions?: MotionOptions;
  onSearch?: (event: UMentionSearchEvent) => void;
  onSelect?: (event: UMentionSelectEvent<T>) => void;
  onShow?: () => void;
  onHide?: () => void;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `input`, `panel`, `items` and `item` sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

interface TriggerState {
  key: string;
  /** Index of the first character after the trigger. */
  index: number;
}

function isNotEmpty(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

function assignRef<V>(ref: React.Ref<V> | undefined, value: V): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<V>).current = value;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Mention` (real source:
 * `components/lib/mention/Mention.js`/`MentionBase.js`). A textarea that
 * calls `onSearch` when a trigger (default `@`) is typed and shows the
 * `suggestions` the consumer returns in a panel at the caret.
 *
 * The textarea is `UInputTextarea`, so `variant`, `invalid`, `autoResize`
 * and every other textarea attribute pass through; `id`, `className` and
 * `style` go to the root. `value` makes it controlled and `defaultValue`
 * leaves it uncontrolled. `onChange` gets PrimeReact's event with the
 * textarea as `target`, on typing and on picking a suggestion.
 *
 * `trigger` and `field` take one value or one per trigger. The trigger is
 * searched again on every keystroke and on ArrowLeft/ArrowRight; the panel
 * closes when a space is typed or the caret leaves the trigger's word. The
 * panel opens only when `onSearch` returns a non-empty `suggestions` list.
 * ArrowUp/ArrowDown move the highlight without wrapping, Enter picks, Escape
 * closes, and Backspace over the trigger closes.
 *
 * The panel is rendered in place through `Portal`, placed at the caret with
 * the uix-utils `getCursorOffset`, stacked with `useZIndex`, animated with
 * `useMotion` (`u-anchored-overlay`, overridable through
 * `transitionOptions`), closed on an outside click, and realigned on a window
 * resize or a scroll of any scrollable ancestor
 * (`ConnectedOverlayScrollHandler`), as PrimeReact does. `onShow` fires once
 * the enter motion ends and `onHide` once the leave motion ends.
 *
 * The textarea is a `combobox` with `aria-controls`, `aria-haspopup`,
 * `aria-expanded` and `aria-activedescendant` over a `listbox` of `option`
 * items, which PrimeReact's source does not set. `pt`, `ptOptions` and
 * `unstyled` follow the shared pass-through contract.
 *
 * Excluded (ADR-105): PrimeReact's `Ripple`, its `overlay-click` bus event,
 * its global `context` lookup and the `props` entry of the ref handle.
 */
function UMentionInner<T = unknown>(
  props: UMentionProps<T>,
  ref: React.ForwardedRef<UMentionRef>
): React.ReactElement {
  const {
    value,
    defaultValue,
    onChange,
    onInput,
    onFocus,
    onBlur,
    suggestions,
    field,
    trigger = "@",
    delay = 0,
    autoHighlight = true,
    scrollHeight = "200px",
    itemTemplate,
    headerTemplate,
    footerTemplate,
    id,
    className,
    style,
    inputId,
    inputRef,
    inputClassName,
    inputStyle,
    panelClassName,
    panelStyle,
    transitionOptions,
    onSearch,
    onSelect,
    onShow,
    onHide,
    unstyled,
    pt,
    ptOptions,
    ...rest
  } = props;

  const { cx, isUnstyled } = useComponentBase({
    componentName: "mention",
    styleModule: mentionStyleModule,
    unstyled,
    additionalPresetKeys: mentionPresetKeys,
  });
  const { ptm } = createPassThrough("mention", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();
  const { set: setZIndex, clear: clearZIndex } = useZIndex();

  const elementRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const inputElementRef = React.useRef<HTMLTextAreaElement | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const scrollHandlerRef = React.useRef<ConnectedOverlayScrollHandler | null>(null);
  const baseId = React.useId();
  const listId = `${baseId}_list`;

  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [containerVisible, setContainerVisible] = React.useState(false);
  const [portalReady, setPortalReady] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [triggerState, setTriggerState] = React.useState<TriggerState | null>(null);
  const [highlightIndex, setHighlightIndex] = React.useState(-1);
  const [uncontrolledFilled, setUncontrolledFilled] = React.useState(() =>
    isNotEmpty(defaultValue)
  );
  const filled = value !== undefined ? isNotEmpty(value) : uncontrolledFilled;

  const triggerRef = React.useRef(triggerState);
  triggerRef.current = triggerState;
  const propsRef = React.useRef({ onShow, onHide });
  propsRef.current = { onShow, onHide };

  const show = React.useCallback(() => setOverlayVisible(true), []);
  const hide = React.useCallback(() => {
    setOverlayVisible(false);
    setSearching(false);
    setTriggerState(null);
  }, []);

  const align = React.useCallback(() => {
    const overlay = overlayRef.current;
    const input = inputElementRef.current;
    const current = triggerRef.current;
    if (!overlay || !input || !current) return;
    const text = input.value;
    const position = getCursorOffset(
      input,
      text.substring(0, current.index - current.key.length),
      text.substring(current.index),
      current.key
    );
    overlay.style.transformOrigin = "top";
    overlay.style.left = `calc(${position.left}px + 1rem)`;
    overlay.style.top = `calc(${position.top}px + 1.2rem)`;
  }, []);

  React.useImperativeHandle(ref, () => ({
    show,
    hide,
    focus: () => inputElementRef.current?.focus(),
    getElement: () => elementRef.current,
    getOverlay: () => overlayRef.current,
    getInput: () => inputElementRef.current,
  }));

  const onOverlayEvent = React.useCallback(
    (_event: Event, meta: { valid: boolean; type: string }) => {
      if (!meta.valid) return;
      if (meta.type === "outside") hide();
      else align();
    },
    [hide, align]
  );

  const [bindOverlay, unbindOverlay] = useOverlayListener({
    target: elementRef as React.RefObject<HTMLElement>,
    overlay: overlayRef as React.RefObject<HTMLElement>,
    listener: onOverlayEvent,
    when: overlayVisible,
  });

  const unbindScroll = () => {
    scrollHandlerRef.current?.destroy();
    scrollHandlerRef.current = null;
  };

  useUpdateEffect(() => {
    if (overlayVisible) {
      setContainerVisible(true);
    } else {
      unbindOverlay();
      unbindScroll();
    }
  }, [overlayVisible]);

  useUpdateEffect(() => {
    if (!overlayVisible || !containerVisible || !overlayRef.current) return;
    setZIndex("overlay", overlayRef.current);
    align();
    bindOverlay();
    if (!scrollHandlerRef.current && elementRef.current) {
      scrollHandlerRef.current = new ConnectedOverlayScrollHandler(elementRef.current, (event) => {
        if (event.target !== document) align();
      });
      scrollHandlerRef.current.bindScrollListener();
    }
  }, [overlayVisible, containerVisible, portalReady]);

  useMotion(
    overlayRef,
    overlayVisible && containerVisible,
    {
      name: "u-anchored-overlay",
      ...transitionOptions,
      onAfterEnter: (event) => {
        transitionOptions?.onAfterEnter?.(event);
        propsRef.current.onShow?.();
      },
      onAfterLeave: (event) => {
        transitionOptions?.onAfterLeave?.(event);
        clearZIndex(overlayRef.current);
        setContainerVisible(false);
        setPortalReady(false);
        propsRef.current.onHide?.();
      },
    },
    portalReady
  );

  useUpdateEffect(() => {
    const hasSuggestions = Boolean(suggestions && suggestions.length);
    if (hasSuggestions) setHighlightIndex(autoHighlight ? 0 : -1);
    if (searching) {
      if (hasSuggestions) show();
      else hide();
      if (overlayVisible) align();
      setSearching(false);
    }
  }, [suggestions]);

  useUnmountEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    unbindOverlay();
    unbindScroll();
    clearZIndex(overlayRef.current);
  });

  const triggers = Array.isArray(trigger) ? trigger : [trigger];

  const findTrigger = (text: string, caret: number): TriggerState | null => {
    const before = text.substring(0, caret);
    let latest: TriggerState | null = null;
    for (const key of triggers) {
      const position = before.lastIndexOf(key);
      if (position !== -1 && (!latest || position + key.length > latest.index)) {
        latest = { key, index: position + key.length };
      }
    }
    if (!latest || latest.index <= before.lastIndexOf(" ")) return null;
    return latest;
  };

  const search = (event: React.SyntheticEvent, query: string, found: TriggerState) => {
    if (!onSearch) return;
    setSearching(true);
    setTriggerState(found);
    onSearch({ originalEvent: event, trigger: found.key, query });
  };

  const runSearch = (event: React.SyntheticEvent) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const input = inputElementRef.current;
    if (!input) return;
    const text = input.value;
    const caret = input.selectionStart ?? text.length;

    if (text.substring(caret - 1, caret) === " ") {
      hide();
      return;
    }

    const found = findTrigger(text, caret);
    if (!found) {
      hide();
      return;
    }

    const query = text.substring(found.index, caret);
    timeoutRef.current = setTimeout(() => search(event, query, found), delay);
  };

  const formatValue = (suggestion: T, key: string | undefined): string => {
    if (!suggestion) return "";
    let fieldName: string | undefined;
    if (Array.isArray(field)) {
      fieldName = Array.isArray(trigger)
        ? field[key === undefined ? -1 : trigger.indexOf(key)]
        : field[0];
    } else {
      fieldName = field;
    }
    const resolved = fieldName ? resolveFieldData(suggestion, fieldName) : suggestion;
    return resolved == null ? "" : String(resolved);
  };

  const selectItem = (event: React.SyntheticEvent, suggestion: T) => {
    const input = inputElementRef.current;
    const current = triggerState;
    if (!input || !current) return;
    const text = input.value;
    const caret = input.selectionStart ?? text.length;

    const spaceIndex = text.indexOf(" ", current.index);
    const currentText = text.substring(current.index, spaceIndex > -1 ? spaceIndex : caret);
    const selectedText = formatValue(suggestion, current.key).replace(/\s+/g, "");

    if (currentText.trim() !== selectedText) {
      const prevText = text.substring(0, current.index);
      const nextText = text.substring(spaceIndex > -1 ? caret : current.index + currentText.length);
      input.value =
        nextText[0] === " "
          ? `${prevText}${selectedText}${nextText}`
          : `${prevText}${selectedText} ${nextText}`;
      if (value === undefined) setUncontrolledFilled(isNotEmpty(input.value));
      event.target = input;
      onChange?.(event as UMentionChangeEvent);
    }

    const cursor = current.index + selectedText.length + 1;
    input.setSelectionRange(cursor, cursor);

    hide();
    onSelect?.({ originalEvent: event, suggestion });
  };

  const highlight = (index: number) => {
    setHighlightIndex(index);
    const item = listRef.current?.children[index];
    if (overlayRef.current && item) scrollInView(overlayRef.current, item as HTMLElement);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!overlayVisible) return;
    const count = suggestions ? suggestions.length : 0;

    switch (event.key) {
      case "ArrowDown":
        if (highlightIndex === -1) {
          if (count > 0) setHighlightIndex(0);
        } else if (highlightIndex < count - 1) {
          highlight(highlightIndex + 1);
        }
        event.preventDefault();
        break;
      case "ArrowUp":
        if (highlightIndex > 0) highlight(highlightIndex - 1);
        event.preventDefault();
        break;
      case "Backspace": {
        const input = event.currentTarget;
        const caret = input.selectionStart ?? 0;
        if (triggerState && input.value.substring(caret - 1, caret) === triggerState.key) hide();
        break;
      }
      case "Enter":
        if (suggestions && highlightIndex !== -1 && highlightIndex < count) {
          selectItem(event, suggestions[highlightIndex]);
        }
        event.preventDefault();
        break;
      case "Escape":
        hide();
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") runSearch(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    runSearch(event);
  };

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    onInput?.(event);
    if (value === undefined) setUncontrolledFilled(isNotEmpty(event.currentTarget.value));
  };

  const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const onItemClick = (event: React.MouseEvent, suggestion: T) => {
    inputElementRef.current?.focus();
    selectItem(event, suggestion);
  };

  const triggerKey = triggerState ? triggerState.key : "";
  const listVisible = overlayVisible && containerVisible;

  const createItem = (suggestion: T, index: number) => {
    const selected = highlightIndex === index;
    const content =
      typeof itemTemplate === "function"
        ? itemTemplate(suggestion, { trigger: triggerKey, index })
        : itemTemplate !== undefined
          ? itemTemplate
          : formatValue(suggestion, triggerState?.key);

    return (
      <li
        key={`${index}_item`}
        {...mergeProps(
          {
            id: `${baseId}_item_${index}`,
            role: "option",
            "aria-selected": selected,
            className: cx("item", { selected }),
            "data-p-highlight": selected,
            onClick: (event: React.MouseEvent) => onItemClick(event, suggestion),
          },
          ptm("item", { context: { trigger: triggerKey }, state: { selected } })
        )}
      >
        {content}
      </li>
    );
  };

  const header = typeof headerTemplate === "function" ? headerTemplate(props) : headerTemplate;
  const footer = typeof footerTemplate === "function" ? footerTemplate(props) : footerTemplate;

  const panel = (
    <div
      ref={overlayRef}
      {...mergeProps(
        {
          className: [cx("panel"), panelClassName].filter(Boolean).join(" ") || undefined,
          style: { maxHeight: scrollHeight, ...panelStyle },
        },
        ptm("panel")
      )}
    >
      {header}
      {suggestions ? (
        <ul
          ref={listRef}
          {...mergeProps({ id: listId, role: "listbox", className: cx("items") }, ptm("items"))}
        >
          {suggestions.map(createItem)}
        </ul>
      ) : null}
      {footer}
    </div>
  );

  return (
    <div
      ref={elementRef}
      {...mergeProps(
        {
          id,
          className:
            [cx("root", { focused, filled }), className].filter(Boolean).join(" ") || undefined,
          style,
          "data-p-inputwrapper-filled": isUnstyled ? filled : undefined,
        },
        ptm("root")
      )}
    >
      <UInputTextarea
        ref={(element: HTMLTextAreaElement | null) => {
          inputElementRef.current = element;
          assignRef(inputRef, element);
        }}
        {...(mergeProps(
          rest,
          {
            id: inputId,
            className: [cx("input"), inputClassName].filter(Boolean).join(" ") || undefined,
            style: inputStyle,
            value,
            defaultValue,
            unstyled,
            role: "combobox",
            "aria-autocomplete": "list",
            "aria-haspopup": "listbox",
            "aria-expanded": listVisible,
            "aria-controls": listVisible && suggestions ? listId : undefined,
            "aria-activedescendant":
              listVisible && highlightIndex !== -1 ? `${baseId}_item_${highlightIndex}` : undefined,
            onChange: handleChange,
            onInput: handleInput,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
            onFocus: handleFocus,
            onBlur: handleBlur,
          },
          ptm("input")
        ) as UInputTextareaProps)}
      />
      {containerVisible ? (
        <Portal element={panel} appendTo="self" visible onMount={() => setPortalReady(true)} />
      ) : null}
    </div>
  );
}

const UMentionBase = React.forwardRef(UMentionInner);
UMentionBase.displayName = "UMention";

/**
 * See `UMentionInner`. The cast keeps the suggestion type `T` generic, which
 * `React.forwardRef` would otherwise fix to `unknown`.
 */
export const UMention = UMentionBase as <T = unknown>(
  props: UMentionProps<T> & React.RefAttributes<UMentionRef>
) => React.ReactElement | null;
