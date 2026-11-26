import * as React from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { act, render, fireEvent, waitFor } from "@testing-library/react";
import { reactCoreStyleSheet } from "@ultimate/react-core";
import { Theme } from "@ultimate/uix-styled";
import { auraPreset } from "@ultimate/themes";
import { getCursorOffset } from "@ultimate/uix-utils/dom";
import {
  UMention,
  type UMentionChangeEvent,
  type UMentionProps,
  type UMentionRef,
  type UMentionSearchEvent,
} from "./mention";

const cursorOffset = vi.hoisted(() => ({ left: 40, top: 20 }));

vi.mock("@ultimate/uix-utils/dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@ultimate/uix-utils/dom")>();
  return { ...actual, getCursorOffset: vi.fn(() => ({ ...cursorOffset })) };
});

interface Person {
  nickname: string;
  profile: { handle: string };
}

const PEOPLE: Person[] = [
  { nickname: "john", profile: { handle: "johnny" } },
  { nickname: "joanna", profile: { handle: "jo" } },
  { nickname: "jack", profile: { handle: "jacky" } },
];
const NAMES = ["john", "joanna", "jack"];

type Source = (event: UMentionSearchEvent) => unknown[];

const byPrefix: Source = (event) => NAMES.filter((name) => name.startsWith(event.query));

function Harness({
  source = byPrefix,
  initial = "",
  uncontrolled = false,
  mentionRef,
  onValue,
  onSearchSpy,
  ...props
}: Omit<UMentionProps<unknown>, "suggestions" | "onSearch"> & {
  source?: Source;
  initial?: string;
  uncontrolled?: boolean;
  mentionRef?: React.Ref<UMentionRef>;
  onValue?: (event: UMentionChangeEvent) => void;
  onSearchSpy?: (event: UMentionSearchEvent) => void;
}) {
  const [value, setValue] = React.useState(initial);
  const [suggestions, setSuggestions] = React.useState<unknown[]>([]);
  const valueProps = uncontrolled
    ? { defaultValue: initial }
    : {
        value,
        onChange: (event: UMentionChangeEvent) => {
          setValue(event.target.value);
          onValue?.(event);
        },
      };
  return (
    <UMention
      ref={mentionRef}
      {...valueProps}
      {...(uncontrolled && onValue ? { onChange: onValue } : {})}
      suggestions={suggestions}
      onSearch={(event) => {
        onSearchSpy?.(event);
        setSuggestions(source(event));
      }}
      {...props}
    />
  );
}

function textareaOf(container: HTMLElement): HTMLTextAreaElement {
  return container.querySelector("textarea") as HTMLTextAreaElement;
}

function panel(): HTMLElement | null {
  return document.querySelector(".u-mention-panel");
}

function options(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="option"]'));
}

function type(textarea: HTMLTextAreaElement, text: string, caret = text.length) {
  fireEvent.change(textarea, {
    target: { value: text, selectionStart: caret, selectionEnd: caret },
  });
}

async function typeAndOpen(textarea: HTMLTextAreaElement, text: string, caret?: number) {
  type(textarea, text, caret);
  await waitFor(() => expect(panel()).not.toBeNull());
}

async function closed() {
  await waitFor(() => expect(panel()).toBeNull());
}

async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.mocked(getCursorOffset).mockClear();
  cursorOffset.left = 40;
  cursorOffset.top = 20;
});

describe("UMention", () => {
  it("[row 1] calls onSearch with the trigger and query after the configured delay", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { container } = render(<UMention onSearch={onSearch} delay={300} />);
    type(textareaOf(container), "hi @jo");
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onSearch).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({ trigger: "@", query: "jo" }));
  });

  it("[row 1] does not search without the trigger, and never opens without onSearch", async () => {
    const onSearchSpy = vi.fn();
    const { container } = render(<Harness onSearchSpy={onSearchSpy} />);
    type(textareaOf(container), "hello");
    await settle();
    expect(onSearchSpy).not.toHaveBeenCalled();

    const { container: second } = render(<UMention suggestions={NAMES} />);
    type(textareaOf(second), "@j");
    await settle();
    expect(second.querySelector(".u-mention-panel")).toBeNull();
  });

  it("[row 2] searches with each trigger of an array and inserts the field of that trigger", async () => {
    const onSearchSpy = vi.fn();
    const source: Source = (event) =>
      event.trigger === "#" ? [{ label: "aura" }, { label: "ultimate" }] : PEOPLE;
    const { container } = render(
      <Harness
        trigger={["@", "#"]}
        field={["nickname", "label"]}
        source={source}
        onSearchSpy={onSearchSpy}
      />
    );
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "hi #a");
    expect(onSearchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ trigger: "#", query: "a" })
    );
    expect(options().map((option) => option.textContent)).toEqual(["aura", "ultimate"]);
    fireEvent.click(options()[0]);
    expect(textarea.value).toBe("hi #aura ");
    await closed();

    await typeAndOpen(textarea, "hi #aura @j");
    expect(onSearchSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ trigger: "@", query: "j" })
    );
    expect(options()[0].textContent).toBe("john");
  });

  it("[row 2] uses the first field when field is an array and trigger is a single string", async () => {
    const { container } = render(<Harness field={["nickname"]} source={() => PEOPLE} />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    expect(options()[0].textContent).toBe("john");
    fireEvent.click(options()[0]);
    expect(textarea.value).toBe("@john ");
  });

  it("[row 3] searches again at the new caret on ArrowLeft and ArrowRight", async () => {
    const onSearchSpy = vi.fn();
    const { container } = render(<Harness onSearchSpy={onSearchSpy} />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@jo");
    expect(onSearchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ query: "jo" }));

    textarea.setSelectionRange(2, 2);
    fireEvent.keyUp(textarea, { key: "ArrowLeft" });
    await waitFor(() =>
      expect(onSearchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ query: "j" }))
    );
    textarea.setSelectionRange(3, 3);
    fireEvent.keyUp(textarea, { key: "ArrowRight" });
    await waitFor(() =>
      expect(onSearchSpy).toHaveBeenLastCalledWith(expect.objectContaining({ query: "jo" }))
    );
  });

  it("[row 3] closes when the caret leaves the trigger's word or a space is typed", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "hi @jo");
    textarea.setSelectionRange(2, 2);
    fireEvent.keyUp(textarea, { key: "ArrowLeft" });
    await closed();

    await typeAndOpen(textarea, "hi @j");
    type(textarea, "hi @j ");
    await closed();
  });

  it("[row 4] opens only when the search returns suggestions, and closes when a later search returns none", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    type(textarea, "@z");
    await settle();
    expect(panel()).toBeNull();

    await typeAndOpen(textarea, "@j");
    expect(options()).toHaveLength(3);
    type(textarea, "@jz");
    await closed();
  });

  it("[row 5] inserts a nested field and hands back the PrimeReact change event", async () => {
    const onValue = vi.fn();
    const { container } = render(
      <Harness field="profile.handle" source={() => PEOPLE} onValue={onValue} />
    );
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@jo");
    const typed: UMentionChangeEvent = onValue.mock.calls.at(-1)![0];
    expect(typed.type).toBe("change");
    expect(typed.target).toBe(textarea);

    fireEvent.click(options()[0]);
    const picked: UMentionChangeEvent = onValue.mock.calls.at(-1)![0];
    expect(picked.type).toBe("click");
    expect(picked.target).toBe(textarea);
    expect(picked.target.value).toBe("@johnny ");
    expect(textarea.value).toBe("@johnny ");
    expect(textarea.selectionStart).toBe(8);
  });

  it("[row 5] keeps the text after the word and adds no second space", async () => {
    const { container } = render(<Harness initial="" />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@jo world", 3);
    fireEvent.click(options()[0]);
    expect(textarea.value).toBe("@john world");
    expect(textarea.selectionStart).toBe(6);
  });

  it("[row 6] calls onSelect with the original event and the suggestion", async () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Harness source={() => PEOPLE} field="nickname" onSelect={onSelect} />
    );
    await typeAndOpen(textareaOf(container), "@j");
    fireEvent.click(options()[2]);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ suggestion: PEOPLE[2], originalEvent: expect.anything() })
    );
  });

  it("[row 7] moves the highlight with the arrow keys without wrapping and picks it with Enter", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    const activeId = () => textarea.getAttribute("aria-activedescendant");
    expect(activeId()).toBe(options()[0].id);

    fireEvent.keyDown(textarea, { key: "ArrowUp" });
    expect(activeId()).toBe(options()[0].id);
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    expect(activeId()).toBe(options()[2].id);
    fireEvent.keyDown(textarea, { key: "ArrowUp" });
    expect(activeId()).toBe(options()[1].id);

    const notPrevented = fireEvent.keyDown(textarea, { key: "Enter" });
    expect(notPrevented).toBe(false);
    expect(textarea.value).toBe("@joanna ");
    await closed();
  });

  it("[row 7] Escape closes, and Backspace over the trigger closes", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    fireEvent.keyDown(textarea, { key: "Escape" });
    await closed();

    await typeAndOpen(textarea, "@");
    fireEvent.keyDown(textarea, { key: "Backspace" });
    await closed();
  });

  it("[row 7] Enter without a highlight picks nothing", async () => {
    const onSelect = vi.fn();
    const { container } = render(<Harness autoHighlight={false} onSelect={onSelect} />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSelect).not.toHaveBeenCalled();
    expect(panel()).not.toBeNull();
  });

  it("[row 8] highlights the first item of every new list when autoHighlight is on", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    expect(options()[1]).toHaveAttribute("aria-selected", "true");

    type(textarea, "@jo");
    await waitFor(() => expect(options()).toHaveLength(2));
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
    expect(options()[1]).toHaveAttribute("aria-selected", "false");
  });

  it("[row 8] highlights nothing until ArrowDown when autoHighlight is off", async () => {
    const { container } = render(<Harness autoHighlight={false} />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    expect(options().every((option) => option.getAttribute("aria-selected") === "false")).toBe(
      true
    );
    expect(textarea).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
  });

  it("[row 9] renders the item, header and footer templates", async () => {
    const itemTemplate = vi.fn(
      (suggestion: unknown, options: { trigger: string; index: number }) => (
        <b>{`${options.trigger}${String(suggestion)}#${options.index}`}</b>
      )
    );
    const footerTemplate = vi.fn((props: UMentionProps<unknown>) => (
      <span className="footer">{String(props.suggestions?.length)}</span>
    ));
    const { container } = render(
      <Harness
        itemTemplate={itemTemplate}
        headerTemplate={<span className="header">People</span>}
        footerTemplate={footerTemplate}
      />
    );
    await typeAndOpen(textareaOf(container), "@j");
    expect(options().map((option) => option.textContent)).toEqual([
      "@john#0",
      "@joanna#1",
      "@jack#2",
    ]);
    expect(panel()!.querySelector(".header")).toHaveTextContent("People");
    expect(panel()!.querySelector(".footer")).toHaveTextContent("3");
  });

  it("[row 10] places the panel at the caret from getCursorOffset", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "hi @jo");
    expect(getCursorOffset).toHaveBeenCalledWith(textarea, "hi ", "jo", "@");
    expect(panel()!.style.left).toBe("calc(40px + 1rem)");
    expect(panel()!.style.top).toBe("calc(20px + 1.2rem)");
    expect(panel()!.style.transformOrigin).toBe("top");
  });

  it("[row 11] closes on an outside click but not on a click inside the panel", async () => {
    const { container } = render(<Harness headerTemplate={<span className="header">h</span>} />);
    await typeAndOpen(textareaOf(container), "@j");
    fireEvent.click(panel()!.querySelector(".header")!);
    await settle();
    expect(panel()).not.toBeNull();
    fireEvent.click(document.body);
    await closed();
  });

  it("[row 11] realigns on a scroll of a scrollable ancestor and on a window resize", async () => {
    const { container } = render(
      <div className="scroller" style={{ overflow: "scroll" }}>
        <Harness />
      </div>
    );
    await typeAndOpen(textareaOf(container), "@j");
    cursorOffset.left = 99;
    act(() => {
      (container.querySelector(".scroller") as HTMLElement).dispatchEvent(new Event("scroll"));
    });
    expect(panel()).not.toBeNull();
    expect(panel()!.style.left).toBe("calc(99px + 1rem)");

    cursorOffset.top = 77;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(panel()!.style.top).toBe("calc(77px + 1.2rem)");
  });

  it("[row 12] keeps the panel inside the root with an overlay z-index", async () => {
    const { container } = render(<Harness />);
    await typeAndOpen(textareaOf(container), "@j");
    expect(container.querySelector(".u-mention")!.contains(panel())).toBe(true);
    expect(panel()!.style.zIndex).not.toBe("");
  });

  it("[row 13] emits onShow and onHide around the uix-motion transition and its options", async () => {
    const onShow = vi.fn();
    const onHide = vi.fn();
    const onAfterEnter = vi.fn();
    const { container } = render(
      <Harness onShow={onShow} onHide={onHide} transitionOptions={{ onAfterEnter }} />
    );
    const textarea = textareaOf(container);
    await typeAndOpen(textarea, "@j");
    await waitFor(() => expect(onShow).toHaveBeenCalledTimes(1));
    expect(onAfterEnter).toHaveBeenCalledTimes(1);
    expect(onHide).not.toHaveBeenCalled();
    fireEvent.keyDown(textarea, { key: "Escape" });
    await closed();
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("[row 14] sizes and decorates the panel and the textarea", async () => {
    const { container, rerender } = render(<Harness />);
    await typeAndOpen(textareaOf(container), "@j");
    expect(panel()!.style.maxHeight).toBe("200px");

    rerender(
      <Harness
        scrollHeight="120px"
        panelStyle={{ width: "300px" }}
        panelClassName="my-panel"
        inputClassName="my-input"
        inputStyle={{ color: "red" }}
      />
    );
    expect(panel()!.style.maxHeight).toBe("120px");
    expect(panel()!.style.width).toBe("300px");
    expect(panel()).toHaveClass("u-mention-panel", "my-panel");
    const textarea = textareaOf(container);
    expect(textarea).toHaveClass("u-mention-input", "my-input", "u-textarea");
    expect(textarea.style.color).toBe("red");
  });

  it("[row 15] passes native textarea attributes to the textarea only", () => {
    const { container } = render(
      <UMention
        placeholder="Mention"
        rows={4}
        cols={30}
        name="comment"
        maxLength={80}
        disabled
        aria-label="Comment"
        data-testid="mention-input"
      />
    );
    const textarea = textareaOf(container);
    expect(textarea).toHaveAttribute("placeholder", "Mention");
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("cols", "30");
    expect(textarea).toHaveAttribute("name", "comment");
    expect(textarea).toHaveAttribute("maxlength", "80");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("aria-label", "Comment");
    expect(textarea).toHaveAttribute("data-testid", "mention-input");
    const root = container.querySelector(".u-mention")!;
    expect(root).not.toHaveAttribute("data-testid");
    expect(root).not.toHaveAttribute("aria-label");
  });

  it("[row 16] forwards autoResize to UInputTextarea", () => {
    const { container } = render(<UMention autoResize />);
    expect(textareaOf(container)).toHaveClass("u-textarea-resizable");
  });

  it("[row 17] forwards variant and invalid to UInputTextarea", () => {
    const { container } = render(<UMention variant="filled" invalid />);
    const textarea = textareaOf(container);
    expect(textarea).toHaveClass("p-variant-filled", "p-invalid");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("[row 18] exposes the ref handle and the inputRef", async () => {
    const mentionRef = React.createRef<UMentionRef>();
    const inputRef = React.createRef<HTMLTextAreaElement>();
    const { container } = render(<Harness mentionRef={mentionRef} inputRef={inputRef} />);
    const textarea = textareaOf(container);
    expect(inputRef.current).toBe(textarea);
    expect(mentionRef.current!.getInput()).toBe(textarea);
    expect(mentionRef.current!.getElement()).toBe(container.querySelector(".u-mention"));
    act(() => mentionRef.current!.focus());
    expect(document.activeElement).toBe(textarea);

    await typeAndOpen(textarea, "@j");
    expect(mentionRef.current!.getOverlay()).toBe(panel());
    act(() => mentionRef.current!.hide());
    await closed();
    expect(mentionRef.current).not.toHaveProperty("props");
  });

  it("[row 19] puts id, className and style on the root", () => {
    const { container } = render(
      <UMention id="mention" className="extra" style={{ width: "50%" }} inputId="mention-input" />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "mention");
    expect(root).toHaveClass("u-mention", "extra");
    expect(root.style.width).toBe("50%");
    expect(textareaOf(container)).toHaveAttribute("id", "mention-input");
  });

  it("[row 20] works uncontrolled with defaultValue", async () => {
    const onValue = vi.fn();
    const { container } = render(<Harness uncontrolled initial="Hi " onValue={onValue} />);
    const textarea = textareaOf(container);
    expect(textarea.value).toBe("Hi ");
    expect(container.querySelector(".u-mention")).toHaveClass("p-inputwrapper-filled");
    await typeAndOpen(textarea, "Hi @ja");
    fireEvent.click(options()[0]);
    expect(textarea.value).toBe("Hi @jack ");
    expect((onValue.mock.calls.at(-1)![0] as UMentionChangeEvent).target.value).toBe("Hi @jack ");
  });

  it("[row 21] calls onFocus and onBlur and marks the root focused", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(<UMention onFocus={onFocus} onBlur={onBlur} />);
    const textarea = textareaOf(container);
    const root = container.querySelector(".u-mention")!;
    fireEvent.focus(textarea);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass("p-inputwrapper-focus");
    fireEvent.blur(textarea);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(root).not.toHaveClass("p-inputwrapper-focus");
  });

  it("[row 22] calls onInput and tracks the filled state of an uncontrolled textarea", () => {
    const onInput = vi.fn();
    const { container } = render(<UMention onInput={onInput} />);
    const textarea = textareaOf(container);
    const root = container.querySelector(".u-mention")!;
    expect(root).not.toHaveClass("p-inputwrapper-filled");
    textarea.value = "abc";
    fireEvent.input(textarea);
    expect(onInput).toHaveBeenCalledTimes(1);
    expect(root).toHaveClass("p-inputwrapper-filled");
    textarea.value = "";
    fireEvent.input(textarea);
    expect(root).not.toHaveClass("p-inputwrapper-filled");
  });

  it("[row 23, Ultimate extra] links the combobox to its listbox", async () => {
    const { container } = render(<Harness />);
    const textarea = textareaOf(container);
    expect(textarea).toHaveAttribute("role", "combobox");
    expect(textarea).toHaveAttribute("aria-haspopup", "listbox");
    expect(textarea).toHaveAttribute("aria-autocomplete", "list");
    expect(textarea).toHaveAttribute("aria-expanded", "false");
    expect(textarea).not.toHaveAttribute("aria-controls");
    await typeAndOpen(textarea, "@j");
    const listbox = document.querySelector('[role="listbox"]')!;
    await waitFor(() => expect(textarea).toHaveAttribute("aria-controls", listbox.id));
    expect(textarea).toHaveAttribute("aria-expanded", "true");
    expect(textarea).toHaveAttribute("aria-activedescendant", options()[0].id);
  });

  it("[row 24] carries PrimeReact's inputwrapper state classes, and the filled data attribute when unstyled", () => {
    const { container, rerender } = render(<UMention value="text" onChange={() => {}} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("u-mention", "u-component", "p-inputwrapper", "p-inputwrapper-filled");
    rerender(<UMention value="" onChange={() => {}} />);
    expect(root).not.toHaveClass("p-inputwrapper-filled");
    expect(root).not.toHaveAttribute("data-p-inputwrapper-filled");

    rerender(<UMention value="text" onChange={() => {}} unstyled />);
    expect(root).toHaveAttribute("data-p-inputwrapper-filled", "true");
  });

  it("[row 25] styles the panel with the Aura autocomplete tokens", () => {
    reactCoreStyleSheet.clear();
    Theme.setTheme({
      preset: auraPreset,
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    render(<UMention />);
    const styles = reactCoreStyleSheet.getStyles();
    expect(styles.get("autocomplete-variables")?.css).toContain(
      "--u-autocomplete-overlay-background"
    );
    expect(styles.has("autocomplete")).toBe(false);
    const css = styles.get("mention")?.css ?? "";
    expect(css).toContain("var(--u-autocomplete-overlay-background");
    expect(css).toContain("var(--u-autocomplete-option-focus-background");
    expect(css).toContain("var(--u-autocomplete-list-padding");
    expect(css).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    expect(styles.has("textarea")).toBe(true);
  });

  it("[row 26] applies the pt sections, with the item's selected state and trigger context", async () => {
    const { container } = render(
      <Harness
        pt={{
          root: { "data-part": "root" },
          input: { "data-part": "input" },
          panel: { "data-part": "panel" },
          items: { "data-part": "items" },
          item: ({
            context,
            state,
          }: {
            context: { trigger: string };
            state: { selected: boolean };
          }) => ({
            "data-trigger": context.trigger,
            "data-selected": String(state.selected),
          }),
        }}
      />
    );
    const textarea = textareaOf(container);
    expect(container.querySelector(".u-mention")).toHaveAttribute("data-part", "root");
    expect(textarea).toHaveAttribute("data-part", "input");
    await typeAndOpen(textarea, "@j");
    expect(panel()).toHaveAttribute("data-part", "panel");
    expect(document.querySelector('[role="listbox"]')).toHaveAttribute("data-part", "items");
    expect(options()[0]).toHaveAttribute("data-trigger", "@");
    expect(options()[0]).toHaveAttribute("data-selected", "true");
    expect(options()[1]).toHaveAttribute("data-selected", "false");
  });

  it("[row 27] hands ptOptions to the pass-through resolver", () => {
    const merge = vi.fn((_global: unknown, self: unknown, datasets: unknown) => ({
      ...(self as object),
      ...(datasets as object),
      "data-merged": "yes",
    }));
    const { container } = render(
      <UMention pt={{ root: { "data-part": "root" } }} ptOptions={{ mergeProps: merge }} />
    );
    const root = container.querySelector(".u-mention")!;
    expect(root).toHaveAttribute("data-part", "root");
    expect(root).toHaveAttribute("data-merged", "yes");
    expect(merge).toHaveBeenCalledWith(
      undefined,
      { "data-part": "root" },
      expect.objectContaining({ "data-pc-section": "root" })
    );
  });

  it("[row 28] renders no Ultimate classes when unstyled and still works", async () => {
    const { container } = render(<Harness unstyled />);
    const textarea = textareaOf(container);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("");
    expect(textarea.className).toBe("");
    type(textarea, "@j");
    await waitFor(() => expect(options()).toHaveLength(3));
    expect(options()[0].className).toBe("");
    fireEvent.click(options()[0]);
    expect(textarea.value).toBe("@john ");
  });

  it("cancels a pending search and removes its listeners on unmount", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    const { container, unmount } = render(<UMention onSearch={onSearch} delay={100} />);
    type(textareaOf(container), "@j");
    unmount();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(onSearch).not.toHaveBeenCalled();
    vi.useRealTimers();

    const view = render(<Harness />);
    await typeAndOpen(textareaOf(view.container), "@j");
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const removeWindow = vi.spyOn(window, "removeEventListener");
    view.unmount();
    expect(removeDocument.mock.calls.map(([eventType]) => eventType)).toContain("click");
    expect(removeWindow.mock.calls.map(([eventType]) => eventType)).toContain("resize");
  });
});
