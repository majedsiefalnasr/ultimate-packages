import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, expect, it, vi } from "vitest";
import { UOrderList } from "./order-list";

function setup(dragdrop = false) {
  const fixture = TestBed.createComponent(UOrderList);
  fixture.componentRef.setInput("value", ["A", "B", "C", "D"]);
  fixture.componentRef.setInput("dragdrop", dragdrop);
  const change = vi.fn();
  fixture.componentInstance.valueChange.subscribe(change);

  fixture.detectChanges();
  return { fixture, change };
}

describe("UOrderList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves selection %s", (direction, expected) => {
    const { fixture, change } = setup();
    const root = fixture.nativeElement;
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-pc-section="move' + direction + 'button"]').click();
    expect(change).toHaveBeenLastCalledWith(expected);
    expect(fixture.componentInstance.value()).toEqual(["A", "B", "C", "D"]);
  });

  it("does not enable CDK or filtering by default", () => {
    const { fixture } = setup();
    expect(fixture.debugElement.queryAll(By.directive(CdkDrag))).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('[role="searchbox"]')).toBeNull();
  });

  it("reorders through the bound CDK dropped event", () => {
    const { fixture, change } = setup(true);
    const listElement = fixture.debugElement.queryAll(By.directive(CdkDropList))[0];
    const container = listElement.injector.get(CdkDropList);
    const item = fixture.debugElement.queryAll(By.directive(CdkDrag))[1].injector.get(CdkDrag);
    listElement.triggerEventHandler("cdkDropListDropped", {
      previousIndex: 1,
      currentIndex: 0,
      item,
      container,
      previousContainer: container,
      isPointerOverContainer: true,
      distance: { x: 0, y: -20 },
      dropPoint: { x: 0, y: 0 },
      event: new MouseEvent("mouseup"),
    });
    expect(change).toHaveBeenLastCalledWith(["B", "A", "C", "D"]);
  });

  it("removes disabled drag-mode options from tab order and selection", () => {
    const { fixture } = setup(true);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    for (const option of options) {
      expect(option.tabIndex).toBe(-1);
      expect(option.getAttribute("aria-disabled")).toBe("true");
    }
    options[0].click();
    fixture.detectChanges();
    expect(options[0].getAttribute("aria-selected")).toBe("false");
  });

  it("filters by configured fields and mode with accessible selection", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("value", [
      { name: "Apple", kind: "fruit" },
      { name: "Banana", kind: "fruit" },
    ]);
    fixture.componentRef.setInput("dataKey", "name");
    fixture.componentRef.setInput("filterBy", "name,kind");
    fixture.componentRef.setInput("filterMatchMode", "startsWith");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[role="searchbox"]') as HTMLInputElement;
    input.value = "App";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    const root = fixture.nativeElement;
    expect(root.textContent).toContain("Apple");
    expect(root.textContent).not.toContain("Banana");
    expect(root.querySelector('[role="listbox"]').getAttribute("aria-multiselectable")).toBe(
      "true"
    );
  });

  it("applies breakpoint, scroll, tabindex, stripe, and button customization inputs", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("breakpoint", "640px");
    fixture.componentRef.setInput("scrollHeight", "9rem");
    fixture.componentRef.setInput("tabindex", 7);
    fixture.componentRef.setInput("stripedRows", true);
    fixture.componentRef.setInput("buttonProps", {
      class: "shared",
      id: "shared-up",
      title: "Shared move",
      name: "order-action",
      value: "shared-value",
      tabindex: 3,
    });
    fixture.componentRef.setInput("moveUpButtonProps", {
      class: "specific",
      id: "specific-up",
      title: "Move this item up",
      value: "up-value",
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-order-list") as HTMLElement;
    const viewport = fixture.nativeElement.querySelector(
      '[data-pc-section="listcontainer"]'
    ) as HTMLElement;
    const up = fixture.nativeElement.querySelector(
      '[data-pc-section="moveupbutton"]'
    ) as HTMLElement;
    const responsiveCss = fixture.nativeElement.querySelector("style").textContent;
    expect(responsiveCss).toContain("@media (max-width: 640px)");
    expect(responsiveCss).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(viewport.style.maxHeight).toBe("9rem");
    expect(viewport.tabIndex).toBe(7);
    expect(root.classList.contains("u-striped")).toBe(true);
    expect(up.classList.contains("shared")).toBe(true);
    expect(up.classList.contains("specific")).toBe(true);
    expect(up.id).toBe("specific-up");
    expect(up.title).toBe("Move this item up");
    expect(up.getAttribute("name")).toBe("order-action");
    expect(up.getAttribute("value")).toBe("up-value");
    expect(up.tabIndex).toBe(3);
  });

  it("keeps a dataKey selection after an equivalent-object refresh", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("value", [
      { id: "a", label: "Apple" },
      { id: "b", label: "Banana" },
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    fixture.componentRef.setInput("value", [
      { id: "a", label: "Apple refreshed" },
      { id: "b", label: "Banana refreshed" },
    ]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")
    ).toBe("true");
    fixture.nativeElement.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")
    ).toBe("false");
  });

  it("implements metaKeySelection for plain and Ctrl/Cmd clicks", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("metaKeySelection", true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('[role="option"]');
    options[0].click();
    options[1].click();
    fixture.detectChanges();
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].click();
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("false");
  });
});
