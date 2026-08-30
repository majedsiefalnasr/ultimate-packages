import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { UMenu, type UMenuItem, type UMenuHandle } from "./menu";

const model: UMenuItem[] = [
  { label: "New", command: vi.fn() },
  { label: "Open", command: vi.fn() },
  { separator: true },
  { label: "Disabled", disabled: true, command: vi.fn() },
];

describe("UMenu (inline mode)", () => {
  it("renders role='menu' with a menuitem per model entry (excluding separators)", () => {
    render(<UMenu model={model} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("uses aria-activedescendant on the list, not literal focus, for keyboard navigation", () => {
    render(<UMenu model={model} />);
    const list = screen.getByRole("menu");
    // Real .focus() call (not fireEvent.focus, which in jsdom/RTL dispatches only the
    // synthetic event without moving document.activeElement) establishes a real focus
    // baseline on the <ul> so the assertion below can prove focus stays there. Wrapped in
    // act() since the resulting onFocus handler triggers a React state update outside RTL's
    // own event-dispatch wrapping.
    act(() => list.focus());
    fireEvent.keyDown(list, { code: "ArrowDown" });
    const activeId = list.getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    // Real DOM focus must remain on the <ul>, not move to an <li>:
    expect(document.activeElement).toBe(list);
  });

  it("ArrowDown/ArrowUp/Home/End navigate, skipping disabled items", () => {
    render(<UMenu model={model} />);
    const list = screen.getByRole("menu");
    fireEvent.focus(list);
    fireEvent.keyDown(list, { code: "End" });
    const items = screen.getAllByRole("menuitem");
    const activeId = list.getAttribute("aria-activedescendant");
    // Last non-disabled item is "Open" (index 1 of the 3 rendered menuitems, since
    // "Disabled" is filtered out of keyboard navigation):
    expect(items.find((el) => el.id === activeId)?.textContent).toContain("Open");
  });

  it("Enter invokes the focused item's command callback", () => {
    const onCommand = vi.fn();
    render(<UMenu model={[{ label: "Action", command: onCommand }]} />);
    const list = screen.getByRole("menu");
    fireEvent.focus(list);
    fireEvent.keyDown(list, { code: "Home" });
    fireEvent.keyDown(list, { code: "Enter" });
    expect(onCommand).toHaveBeenCalledOnce();
  });

  it("does not import or render Tooltip anywhere", () => {
    const { container } = render(<UMenu model={model} />);
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });
});

describe("UMenu (popup mode)", () => {
  it("is not rendered until toggled via the imperative ref, then dismisses on outside click", async () => {
    const onHide = vi.fn();
    const ref = React.createRef<UMenuHandle>();
    render(
      <>
        <button onClick={(e) => ref.current?.toggle(e)}>Open menu</button>
        <div data-testid="outside">outside</div>
        <UMenu ref={ref} model={model} popup onHide={onHide} />
      </>
    );
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(screen.getByText("Open menu"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();

    // Actually dismiss via a genuine outside click, and prove the menu is gone —
    // the previous version of this test never exercised this despite its name.
    fireEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onHide).toHaveBeenCalledOnce();
  });

  it("does not leak the document click listener past dismissal (regression: removeEventListener must remove the exact function addEventListener attached, verified via direct DOM-level instrumentation, not via onHide's call count)", async () => {
    // onHide's call count is NOT used as the observable here: onHide is fired from
    // useMotion's onAfterLeave, and hide() itself is guarded by `if (!visible) return`
    // — so even a genuinely leaked click listener that still invokes hide() internally
    // would hit that guard and silently no-op without ever incrementing onHide's count.
    // Instead, spy directly on document.addEventListener/removeEventListener (the real
    // browser-level contract the bug violates) and assert removeEventListener was
    // called with the exact same function reference addEventListener received.
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");

    const ref = React.createRef<UMenuHandle>();
    render(
      <>
        <button onClick={(e) => ref.current?.toggle(e)}>Open menu</button>
        <div data-testid="outside">outside</div>
        <UMenu ref={ref} model={model} popup />
      </>
    );
    fireEvent.click(screen.getByText("Open menu"));
    await screen.findByRole("menu");

    const clickAddCall = addSpy.mock.calls.find(([type]) => type === "click");
    expect(clickAddCall).toBeDefined();
    const attachedListener = clickAddCall?.[1];

    fireEvent.click(screen.getByTestId("outside"));

    // The exact function object passed to addEventListener("click", ...) must be the
    // one passed to removeEventListener("click", ...) — a mismatched reference is
    // exactly what the pre-fix bug produced (removeEventListener called, but silently
    // no-opping because the reference didn't match), leaking the listener forever.
    // waitFor since unbindOverlay() fires from useMotion's onAfterLeave, which resolves
    // via a Promise chain rather than synchronously within the click's event handler.
    await waitFor(() => {
      const clickRemoveCall = removeSpy.mock.calls.find(
        ([type, fn]) => type === "click" && fn === attachedListener
      );
      expect(clickRemoveCall).toBeDefined();
    });

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("stops repeated dismissal side effects after the listener is genuinely removed, across multiple open/close cycles (black-box confirmation of the instrumented test above)", async () => {
    const onHide = vi.fn();
    const ref = React.createRef<UMenuHandle>();
    render(
      <>
        <button onClick={(e) => ref.current?.toggle(e)}>Open menu</button>
        <div data-testid="outside">outside</div>
        <UMenu ref={ref} model={model} popup onHide={onHide} />
      </>
    );

    for (let cycle = 0; cycle < 3; cycle++) {
      fireEvent.click(screen.getByText("Open menu"));
      await screen.findByRole("menu");
      fireEvent.click(screen.getByTestId("outside"));
      expect(screen.queryByRole("menu")).toBeNull();
    }

    // onHide must have fired exactly once per cycle (3 total) — if a listener from an
    // earlier cycle had leaked, later cycles would accumulate extra live listeners and
    // this count would exceed 3 (each stray click firing every leaked listener).
    expect(onHide).toHaveBeenCalledTimes(3);
  });
});
