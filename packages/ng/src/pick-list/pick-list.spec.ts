import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, expect, it, vi } from "vitest";
import { UListbox } from "../listbox/listbox";
import { UPickList } from "./pick-list";

function setup(dragdrop = false) {
  const fixture = TestBed.createComponent(UPickList);
  fixture.componentRef.setInput("source", ["A", "B", "C", "D"]);
  fixture.componentRef.setInput("target", ["X", "Y", "Z", "W"]);
  fixture.componentRef.setInput("dragdrop", dragdrop);
  const change = vi.fn();
  const targetChange = vi.fn();
  fixture.componentInstance.sourceChange.subscribe(change);
  fixture.componentInstance.targetChange.subscribe(targetChange);
  fixture.detectChanges();
  return { fixture, change, targetChange };
}

describe("UPickList", () => {
  it.each([
    ["up", ["B", "A", "C", "D"]],
    ["top", ["B", "A", "C", "D"]],
    ["down", ["A", "C", "B", "D"]],
    ["bottom", ["A", "C", "D", "B"]],
  ])("moves source selection %s", (direction, expected) => {
    const { fixture, change } = setup();
    const root = fixture.nativeElement.querySelector('[data-pc-section="sourcelist"]');
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-move="' + direction + '"]').click();
    expect(change).toHaveBeenLastCalledWith(expected);
    expect(fixture.componentInstance.source()).toEqual(["A", "B", "C", "D"]);
  });

  it.each(["up", "top", "down", "bottom"])("moves target selection %s", (direction) => {
    const { fixture, targetChange } = setup();
    const root = fixture.nativeElement.querySelector('[data-pc-section="targetlist"]');
    root.querySelectorAll('[role="option"]')[1].click();
    fixture.detectChanges();
    root.querySelector('[data-move="' + direction + '"]').click();
    const expected: Record<string, string[]> = {
      up: ["Y", "X", "Z", "W"],
      top: ["Y", "X", "Z", "W"],
      down: ["X", "Z", "Y", "W"],
      bottom: ["X", "Z", "W", "Y"],
    };
    expect(targetChange).toHaveBeenLastCalledWith(expected[direction]);
  });

  it.each([0, 1])("transfers selected items from side %s", (side) => {
    const { fixture, change, targetChange } = setup();
    const section = side === 0 ? "sourcelist" : "targetlist";
    fixture.nativeElement
      .querySelector('[data-pc-section="' + section + '"] [role="option"]')
      .click();
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector(
        '[data-pc-section="' + (side === 0 ? "movetotargetbutton" : "movetosourcebutton") + '"]'
      )
      .click();
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["A", "B", "C", "D", "X"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["X", "Y", "Z", "W", "A"] : ["Y", "Z", "W"]
    );
  });

  it.each([0, 1])("transfers all items from side %s", (side) => {
    const { fixture, change, targetChange } = setup();
    fixture.nativeElement
      .querySelector(
        '[data-pc-section="' +
          (side === 0 ? "movealltotargetbutton" : "movealltosourcebutton") +
          '"]'
      )
      .click();
    expect(side === 0 ? change : targetChange).toHaveBeenLastCalledWith([]);
    expect(side === 0 ? targetChange : change).toHaveBeenLastCalledWith(
      side === 0
        ? ["X", "Y", "Z", "W", "A", "B", "C", "D"]
        : ["A", "B", "C", "D", "X", "Y", "Z", "W"]
    );
  });

  it("uses two Listboxes and leaves filtering and CDK off by default", () => {
    const { fixture } = setup();
    expect(fixture.debugElement.queryAll(By.directive(UListbox))).toHaveLength(2);
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

  it.each([0, 1])("transfers by connected CDK lists from side %s", (side) => {
    const { fixture, change, targetChange } = setup(true);
    const elements = fixture.debugElement.queryAll(By.directive(CdkDropList));
    const previousContainer = elements[side].injector.get(CdkDropList);
    const container = elements[1 - side].injector.get(CdkDropList);
    const item = elements[side].query(By.directive(CdkDrag)).injector.get(CdkDrag);
    elements[1 - side].triggerEventHandler("cdkDropListDropped", {
      previousIndex: 0,
      currentIndex: 0,
      item,
      previousContainer,
      container,
      isPointerOverContainer: true,
      distance: { x: 50, y: 0 },
      dropPoint: { x: 50, y: 0 },
      event: new MouseEvent("mouseup"),
    });
    expect(change).toHaveBeenLastCalledWith(
      side === 0 ? ["B", "C", "D"] : ["X", "A", "B", "C", "D"]
    );
    expect(targetChange).toHaveBeenLastCalledWith(
      side === 0 ? ["A", "X", "Y", "Z", "W"] : ["Y", "Z", "W"]
    );
  });

  it("filters by configured fields and mode with accessible selection", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("source", [
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
    const root = fixture.nativeElement.querySelector('[data-pc-section="sourcelist"]');
    expect(root.textContent).toContain("Apple");
    expect(root.textContent).not.toContain("Banana");
    expect(root.querySelector('[role="listbox"]').getAttribute("aria-multiselectable")).toBe(
      "true"
    );
  });

  it("gates filters and controls independently per side", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("filterBy", "name");
    fixture.componentRef.setInput("showSourceFilter", false);
    fixture.componentRef.setInput("showTargetControls", false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="searchbox"]')).toHaveLength(1);
    expect(
      fixture.nativeElement.querySelector('[data-pc-section="targetlist"] [data-move]')
    ).toBeNull();
  });

  it("forwards each trackBy to its own Listbox and applies styles", () => {
    const { fixture } = setup();
    const sourceTrackBy = vi.fn((index: number, item: unknown) => index + String(item));
    const targetTrackBy = vi.fn((index: number, item: unknown) => index + String(item));
    fixture.componentRef.setInput("sourceTrackBy", sourceTrackBy);
    fixture.componentRef.setInput("targetTrackBy", targetTrackBy);
    fixture.componentRef.setInput("sourceStyle", { maxHeight: "10rem" });
    fixture.componentRef.setInput("targetStyle", { maxHeight: "12rem" });
    fixture.componentRef.setInput("breakpoint", "700px");
    fixture.detectChanges();
    const listboxes = fixture.debugElement.queryAll(By.directive(UListbox));
    expect(listboxes[0].componentInstance.trackBy()).toBe(sourceTrackBy);
    expect(listboxes[1].componentInstance.trackBy()).toBe(targetTrackBy);
    fixture.componentRef.setInput("dragdrop", true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector('[data-pc-section="sourcelist"]') as HTMLElement).style
        .maxHeight
    ).toBe("10rem");
    expect(
      (fixture.nativeElement.querySelector('[data-pc-section="targetlist"]') as HTMLElement).style
        .maxHeight
    ).toBe("12rem");
    expect(sourceTrackBy).toHaveBeenCalled();
    expect(targetTrackBy).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector("style").textContent).toContain(
      "@media (max-width: 700px)"
    );
  });

  it("keeps dataKey selection and permits deselection after equivalent arrays refresh", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("dataKey", "id");
    fixture.componentRef.setInput("source", [
      { id: "a", name: "Apple" },
      { id: "b", name: "Banana" },
    ]);
    fixture.componentRef.setInput("target", [{ id: "x", name: "Xylophone" }]);
    fixture.detectChanges();
    const option = () =>
      fixture.nativeElement.querySelector('[data-pc-section="sourcelist"] [role="option"]');
    option().click();
    fixture.componentRef.setInput("source", [
      { id: "a", name: "Apple refreshed" },
      { id: "b", name: "Banana refreshed" },
    ]);
    fixture.componentRef.setInput("target", [{ id: "x", name: "Xylophone refreshed" }]);
    fixture.detectChanges();
    expect(option().getAttribute("aria-selected")).toBe("true");
    option().click();
    fixture.detectChanges();
    expect(option().getAttribute("aria-selected")).toBe("false");
  });

  it("implements metaKeySelection in the composed source Listbox", () => {
    const { fixture } = setup();
    fixture.componentRef.setInput("metaKeySelection", true);
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll(
      '[data-pc-section="sourcelist"] [role="option"]'
    );
    options[0].click();
    options[1].click();
    fixture.detectChanges();
    expect(options[0].getAttribute("aria-selected")).toBe("false");
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].click();
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    options[1].dispatchEvent(new MouseEvent("click", { bubbles: true, metaKey: true }));
    fixture.detectChanges();
    expect(options[1].getAttribute("aria-selected")).toBe("false");
  });

  it.each([false, true])(
    "disables selection, moves, and transfers with dragdrop=%s",
    (dragdrop) => {
      const { fixture, change, targetChange } = setup(dragdrop);
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      const options = fixture.nativeElement.querySelectorAll('[role="option"]');
      options[0].click();
      fixture.detectChanges();
      expect(options[0].getAttribute("aria-selected")).toBe("false");
      for (const button of fixture.nativeElement.querySelectorAll("button"))
        expect(button.disabled).toBe(true);
      expect(change).not.toHaveBeenCalled();
      expect(targetChange).not.toHaveBeenCalled();
    }
  );

  it.each([0, 1])(
    "disables side %s reorder controls when its selected item becomes disabled",
    (side) => {
      const { fixture, change, targetChange } = setup();
      const section = side === 0 ? "sourcelist" : "targetlist";
      const blocked = side === 0 ? "B" : "Y";
      const list = fixture.nativeElement.querySelector('[data-pc-section="' + section + '"]');
      list.querySelectorAll('[role="option"]')[1].click();
      fixture.detectChanges();
      fixture.componentRef.setInput(
        side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled",
        (item: unknown) => item === blocked
      );
      fixture.detectChanges();
      expect(list.querySelectorAll('[role="option"]')[1].getAttribute("aria-selected")).toBe(
        "true"
      );
      for (const control of list.querySelectorAll("[data-move]")) {
        expect(control.disabled).toBe(true);
        control.click();
      }
      expect(change).not.toHaveBeenCalled();
      expect(targetChange).not.toHaveBeenCalled();
    }
  );

  it.each([0, 1])(
    "keeps a newly disabled selected item fixed while moving another on side %s",
    (side) => {
      const { fixture, change, targetChange } = setup();
      const section = side === 0 ? "sourcelist" : "targetlist";
      const blocked = side === 0 ? "C" : "Z";
      const list = fixture.nativeElement.querySelector('[data-pc-section="' + section + '"]');
      const options = list.querySelectorAll('[role="option"]');
      options[1].click();
      options[2].click();
      fixture.detectChanges();
      fixture.componentRef.setInput(
        side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled",
        (item: unknown) => item === blocked
      );
      fixture.detectChanges();
      const bottom = list.querySelector('[data-move="bottom"]');
      expect(bottom.disabled).toBe(false);
      bottom.click();
      expect(side === 0 ? change : targetChange).toHaveBeenLastCalledWith(
        side === 0 ? ["A", "D", "C", "B"] : ["X", "W", "Z", "Y"]
      );
    }
  );

  it.each([0, 1])(
    "disables selected transfer and preserves selection when its only candidate becomes disabled on side %s",
    (side) => {
      const blocked = side === 0 ? "B" : "Y";
      const optionDisabled = side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled";
      const baseline = setup();
      baseline.fixture.nativeElement
        .querySelectorAll(
          '[data-pc-section="' + (side === 0 ? "sourcelist" : "targetlist") + '"] [role="option"]'
        )[1]
        .click();
      baseline.fixture.detectChanges();
      baseline.fixture.componentRef.setInput(optionDisabled, (item: unknown) => item === blocked);
      baseline.fixture.detectChanges();
      const transferButton = baseline.fixture.nativeElement.querySelector(
        '[data-pc-section="' + (side === 0 ? "movetotargetbutton" : "movetosourcebutton") + '"]'
      ) as HTMLButtonElement;
      (
        baseline.fixture.componentInstance as unknown as {
          transfer: (side: number, all: boolean) => void;
        }
      ).transfer(side, false);
      expect(baseline.change).not.toHaveBeenCalled();
      expect(baseline.targetChange).not.toHaveBeenCalled();
      expect(transferButton.disabled).toBe(true);
      baseline.fixture.componentRef.setInput(optionDisabled, () => false);
      baseline.fixture.detectChanges();
      expect(transferButton.disabled).toBe(false);
      transferButton.click();
      expect(side === 0 ? baseline.change : baseline.targetChange).toHaveBeenCalledTimes(1);
    }
  );

  it.each([0, 1])("disables all transfer when every item on side %s is disabled", (side) => {
    const { fixture, change, targetChange } = setup();
    const optionDisabled = side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled";
    fixture.componentRef.setInput(optionDisabled, () => true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      '[data-pc-section="' + (side === 0 ? "movealltotargetbutton" : "movealltosourcebutton") + '"]'
    ) as HTMLButtonElement;
    (
      fixture.componentInstance as unknown as { transfer: (side: number, all: boolean) => void }
    ).transfer(side, true);
    expect(change).not.toHaveBeenCalled();
    expect(targetChange).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
  });

  it.each([
    [0, false],
    [0, true],
    [1, false],
    [1, true],
  ])("transfers eligible items from mixed side %s with all=%s", (side, all) => {
    const { fixture, change, targetChange } = setup();
    const section = side === 0 ? "sourcelist" : "targetlist";
    const optionDisabled = side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled";
    const blocked = side === 0 ? "B" : "Y";
    const options = fixture.nativeElement.querySelectorAll(
      '[data-pc-section="' + section + '"] [role="option"]'
    );
    options[1].click();
    options[2].click();
    fixture.detectChanges();
    fixture.componentRef.setInput(optionDisabled, (item: unknown) => item === blocked);
    fixture.detectChanges();
    const selectedButton = fixture.nativeElement.querySelector(
      '[data-pc-section="' + (side === 0 ? "movetotargetbutton" : "movetosourcebutton") + '"]'
    ) as HTMLButtonElement;
    const allButton = fixture.nativeElement.querySelector(
      '[data-pc-section="' + (side === 0 ? "movealltotargetbutton" : "movealltosourcebutton") + '"]'
    ) as HTMLButtonElement;
    expect(selectedButton.disabled).toBe(false);
    expect(allButton.disabled).toBe(false);
    (all ? allButton : selectedButton).click();
    expect(side === 0 ? change : targetChange).toHaveBeenLastCalledWith(
      side === 0 ? (all ? ["B"] : ["A", "B", "D"]) : all ? ["Y"] : ["X", "Y", "W"]
    );
    expect(side === 0 ? targetChange : change).toHaveBeenLastCalledWith(
      side === 0
        ? all
          ? ["X", "Y", "Z", "W", "A", "C", "D"]
          : ["X", "Y", "Z", "W", "C"]
        : all
          ? ["A", "B", "C", "D", "X", "Z", "W"]
          : ["A", "B", "C", "D", "Z"]
    );
  });

  it.each([0, 1])("keeps newly disabled option on side %s out of CDK reorder", (side) => {
    const blocked = side === 0 ? "B" : "Y";
    const optionDisabled = side === 0 ? "sourceOptionDisabled" : "targetOptionDisabled";

    const drag = setup(true);
    drag.fixture.nativeElement
      .querySelectorAll(
        '[data-pc-section="' + (side === 0 ? "sourcelist" : "targetlist") + '"] [role="option"]'
      )[1]
      .click();
    drag.fixture.detectChanges();
    drag.fixture.componentRef.setInput(optionDisabled, (item: unknown) => item === blocked);
    drag.fixture.detectChanges();
    const listElement = drag.fixture.debugElement.queryAll(By.directive(CdkDropList))[side];
    const container = listElement.injector.get(CdkDropList);
    const item = listElement.queryAll(By.directive(CdkDrag))[1].injector.get(CdkDrag);
    expect(item.disabled).toBe(true);
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
    expect(drag.change).not.toHaveBeenCalled();
    expect(drag.targetChange).not.toHaveBeenCalled();
  });
});
