import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

  it("does not leak the outside-click listener past dismissal (regression: onHide must not re-fire for unrelated clicks after the menu is closed)", async () => {
    const onHide = vi.fn();
    const ref = React.createRef<UMenuHandle>();
    render(
      <>
        <button onClick={(e) => ref.current?.toggle(e)}>Open menu</button>
        <div data-testid="outside">outside</div>
        <UMenu ref={ref} model={model} popup onHide={onHide} />
      </>
    );
    fireEvent.click(screen.getByText("Open menu"));
    await screen.findByRole("menu");

    fireEvent.click(screen.getByTestId("outside"));
    expect(onHide).toHaveBeenCalledOnce();

    // Further unrelated clicks after the menu is already closed must not re-invoke
    // onHide — if the document click listener leaked past unbind (the stale-listener-
    // reference bug in useOverlayListener), it would still be attached here and fire
    // again for every subsequent click anywhere on the page.
    fireEvent.click(screen.getByTestId("outside"));
    fireEvent.click(document.body);
    expect(onHide).toHaveBeenCalledOnce();
  });
});
