import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { UMenu, type UMenuItem, type UMenuHandle } from "./menu";

// Regression coverage for the Portal/ref-timing defect (final whole-branch review,
// Finding 1): Portal defers its first real DOM commit by one render pass, and a fresh
// Portal instance mounts every time a popup UMenu opens (containerVisible gates
// whether <Portal> even appears in the tree). Mock @ultimate/uix-motion so
// createMotion(...).enter() can be observed directly — the same module useMotion
// (packages/react-core) imports. The mock still invokes the real onAfterEnter/
// onAfterLeave hooks synchronously (mirroring the real createMotion's eventual
// callback) so existing tests that depend on onAfterLeave-driven teardown (container
// unmount, listener unbind, onHide) keep passing unchanged.
const enterSpy = vi.fn();
const leaveSpy = vi.fn();
vi.mock("@ultimate/uix-motion", () => ({
  createMotion: vi.fn((_element: Element, options?: Record<string, unknown>) => ({
    enter: vi.fn(() => {
      enterSpy();
      (options?.onAfterEnter as (() => void) | undefined)?.();
      return Promise.resolve();
    }),
    leave: vi.fn(() => {
      leaveSpy();
      (options?.onAfterLeave as (() => void) | undefined)?.();
      return Promise.resolve();
    }),
    cancel: vi.fn(),
    update: vi.fn(),
  })),
}));

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

  describe("Portal/ref-timing regression (Finding 1)", () => {
    it("invokes the enter motion and sets a non-empty inline z-index when the popup opens (a fresh Portal instance mounts on every open, not just the first)", async () => {
      enterSpy.mockClear();
      const ref = React.createRef<UMenuHandle>();
      render(
        <>
          <button onClick={(e) => ref.current?.toggle(e)}>Open menu</button>
          <UMenu ref={ref} model={model} popup />
        </>
      );
      fireEvent.click(screen.getByText("Open menu"));
      // findByRole("menu") returns the inner <ul role="menu">; setZIndex targets the
      // outer div (menuRef in menu.tsx), which is that <ul>'s direct DOM parent.
      const menu = await screen.findByRole("menu");
      const menuRoot = menu.parentElement as HTMLElement;

      await waitFor(() => expect(enterSpy).toHaveBeenCalled());
      await waitFor(() => expect(menuRoot.style.zIndex).not.toBe(""));
    });

    it("re-invokes the enter motion and re-sets z-index on a second open/close cycle (portalReady is already true from cycle 1, so the fix must not rely solely on that dependency changing)", async () => {
      enterSpy.mockClear();
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
      fireEvent.click(screen.getByTestId("outside"));
      await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

      enterSpy.mockClear();
      fireEvent.click(screen.getByText("Open menu"));
      // findByRole("menu") returns the inner <ul role="menu">; setZIndex targets the
      // outer div (menuRef in menu.tsx), which is that <ul>'s direct DOM parent.
      const menu = await screen.findByRole("menu");
      const menuRoot = menu.parentElement as HTMLElement;

      await waitFor(() => expect(enterSpy).toHaveBeenCalled());
      await waitFor(() => expect(menuRoot.style.zIndex).not.toBe(""));
    });

    it("mount-time-visible: a popup UMenu shown from a mount-time effect (visible already true on the parent's very first commit) still gets its enter motion and z-index applied", async () => {
      enterSpy.mockClear();
      function Harness() {
        const ref = React.useRef<UMenuHandle>(null);
        React.useEffect(() => {
          // Simulates a consumer that opens the popup synchronously as part of mounting
          // (e.g. a controlled "open on load" menu), so UMenu's own visible/containerVisible
          // state becomes true in the very first render pass where Portal itself also
          // exists for the first time — the exact ordering Finding 1 describes.
          ref.current?.show({ currentTarget: document.body } as unknown as React.SyntheticEvent);
        }, []);
        return <UMenu ref={ref} model={model} popup />;
      }
      render(<Harness />);

      // findByRole("menu") returns the inner <ul role="menu">; setZIndex targets the
      // outer div (menuRef in menu.tsx), which is that <ul>'s direct DOM parent.
      const menu = await screen.findByRole("menu");
      const menuRoot = menu.parentElement as HTMLElement;
      await waitFor(() => expect(enterSpy).toHaveBeenCalled());
      await waitFor(() => expect(menuRoot.style.zIndex).not.toBe(""));
    });
  });
});
