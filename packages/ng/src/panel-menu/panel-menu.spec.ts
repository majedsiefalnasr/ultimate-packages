import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UPanelMenu } from "./panel-menu";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UPanelMenu", () => {
  const items: UMenuItem[] = [
    { label: "Files", items: [{ label: "Documents", items: [{ label: "Work" }] }, { label: "Photos" }] },
    { label: "Settings" },
  ];

  function setup(model: UMenuItem[] = items, multiple = false) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UPanelMenu);
    fixture.componentRef.setInput("model", model);
    fixture.componentRef.setInput("multiple", multiple);
    fixture.detectChanges();
    return fixture;
  }

  it("renders a tree of root items, collapsed by default", () => {
    const fixture = setup();
    const rootItems = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"]');
    expect(rootItems.length).toBe(2);
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("false");
  });

  it("expands a group item in-place on header click", () => {
    const fixture = setup();
    const firstHeader = fixture.nativeElement.querySelector('[role="treeitem"] a');
    firstHeader.click();
    fixture.detectChanges();
    const firstItem = fixture.nativeElement.querySelector('[role="treeitem"]');
    expect(firstItem.getAttribute("data-u-expanded")).toBe("true");
    expect(firstItem.getAttribute("aria-expanded")).toBe("true");
    // nested list now rendered
    expect(firstItem.querySelector('[role="tree"]')).not.toBeNull();
  });

  it("collapses an expanded group on a second header click", () => {
    const fixture = setup();
    const firstHeader = fixture.nativeElement.querySelector('[role="treeitem"] a');
    firstHeader.click();
    fixture.detectChanges();
    firstHeader.click();
    fixture.detectChanges();
    const firstItem = fixture.nativeElement.querySelector('[role="treeitem"]');
    expect(firstItem.getAttribute("data-u-expanded")).toBe("false");
  });

  it("collapses sibling panels when multiple is false (accordion behavior)", () => {
    const fixture = setup([
      { label: "A", items: [{ label: "A1" }] },
      { label: "B", items: [{ label: "B1" }] },
    ]);
    const rootItems = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"]');
    rootItems[0].querySelector("a").click();
    fixture.detectChanges();
    rootItems[1].querySelector("a").click();
    fixture.detectChanges();
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("false");
    expect(rootItems[1].getAttribute("data-u-expanded")).toBe("true");
    expect(rootItems.length).toBe(2);
  });

  it("allows multiple concurrently-expanded panels when multiple is true", () => {
    const fixture = setup(
      [
        { label: "A", items: [{ label: "A1" }] },
        { label: "B", items: [{ label: "B1" }] },
      ],
      true
    );
    const rootItems = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"]');
    rootItems[0].querySelector("a").click();
    fixture.detectChanges();
    rootItems[1].querySelector("a").click();
    fixture.detectChanges();
    expect(rootItems[0].getAttribute("data-u-expanded")).toBe("true");
    expect(rootItems[1].getAttribute("data-u-expanded")).toBe("true");
  });

  it("supports drill-down to a doubly-nested group", () => {
    const fixture = setup();
    const firstHeader = fixture.nativeElement.querySelector('[role="treeitem"] a');
    firstHeader.click();
    fixture.detectChanges();
    const nestedHeader = fixture.nativeElement.querySelector('[role="tree"] [role="tree"] [role="treeitem"] a');
    expect(nestedHeader).not.toBeNull();
    nestedHeader.click();
    fixture.detectChanges();
    const deepList = fixture.nativeElement.querySelector('[role="tree"] [role="tree"] [role="tree"]');
    expect(deepList).not.toBeNull();
  });

  it("emits onItemSelect and calls item.command for a leaf item", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Leaf", command: () => (called = true) }];
    const fixture = setup(model);
    let emitted: unknown;
    fixture.componentInstance.onItemSelect.subscribe((e: unknown) => (emitted = e));
    fixture.nativeElement.querySelector("a").click();
    expect(called).toBe(true);
    expect(emitted).toBeDefined();
  });

  it("does not expand or invoke command for a disabled group item", () => {
    let called = false;
    const model: UMenuItem[] = [
      { label: "Disabled", disabled: true, items: [{ label: "Hidden" }], command: () => (called = true) },
    ];
    const fixture = setup(model);
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    link.click();
    expect(called).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="treeitem"]').getAttribute("data-u-expanded")).toBe("false");
  });
});
