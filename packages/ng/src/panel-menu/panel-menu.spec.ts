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

  describe("keyboard navigation (Spec §5.3, GAP-054)", () => {
    function keydown(el: Element, code: string): void {
      el.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));
    }

    it("ArrowDown/ArrowUp move focus among root-level visible items", () => {
      const fixture = setup([{ label: "Files" }, { label: "Settings" }, { label: "Help" }]);
      const links = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"] a');
      links[0].focus();
      keydown(links[0], "ArrowDown");
      expect(document.activeElement).toBe(links[1]);
      keydown(links[1], "ArrowDown");
      expect(document.activeElement).toBe(links[2]);
      keydown(links[2], "ArrowUp");
      expect(document.activeElement).toBe(links[1]);
    });

    it("ArrowDown skips a disabled root item", () => {
      const fixture = setup([{ label: "Files" }, { label: "Settings", disabled: true }, { label: "Help" }]);
      const links = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"] a');
      links[0].focus();
      keydown(links[0], "ArrowDown");
      expect(document.activeElement).toBe(links[2]);
    });

    it("Enter toggles expand/collapse on a group item, keeping the sibling-exclusivity mechanism intact", () => {
      const fixture = setup();
      const firstHeader = fixture.nativeElement.querySelector('[role="treeitem"] a');
      firstHeader.focus();
      keydown(firstHeader, "Enter");
      fixture.detectChanges();
      const firstItem = fixture.nativeElement.querySelector('[role="treeitem"]');
      expect(firstItem.getAttribute("data-u-expanded")).toBe("true");
      keydown(firstHeader, "Space");
      fixture.detectChanges();
      expect(firstItem.getAttribute("data-u-expanded")).toBe("false");
    });

    it("does not toggle a disabled group item via Enter/Space", () => {
      const model: UMenuItem[] = [{ label: "Disabled", disabled: true, items: [{ label: "Hidden" }] }];
      const fixture = setup(model);
      const link = fixture.nativeElement.querySelector("a");
      link.focus();
      keydown(link, "Enter");
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="treeitem"]').getAttribute("data-u-expanded")).toBe("false");
    });

    it("ArrowDown/ArrowUp move focus among a nested (genuinely focused, non-root) level's own visible items, not bubbling into the root level's navigation", () => {
      const fixture = setup([
        {
          label: "Files",
          items: [{ label: "Documents" }, { label: "Photos" }, { label: "Videos" }],
        },
        { label: "Settings" },
      ]);
      const rootHeader = fixture.nativeElement.querySelector('[role="tree"] > [role="treeitem"] a');
      rootHeader.click();
      fixture.detectChanges();
      const nestedLinks = fixture.nativeElement.querySelectorAll(
        '[role="tree"] > [role="treeitem"] [role="tree"] > [role="treeitem"] a',
      );
      expect(nestedLinks.length).toBe(3);
      nestedLinks[0].focus();
      keydown(nestedLinks[0], "ArrowDown");
      expect(document.activeElement).toBe(nestedLinks[1]);
      keydown(nestedLinks[1], "ArrowDown");
      expect(document.activeElement).toBe(nestedLinks[2]);
      // Wrapping within the nested level only — must not jump out to "Settings" at root level.
      keydown(nestedLinks[2], "ArrowDown");
      expect(document.activeElement).toBe(nestedLinks[0]);
    });

    it("ArrowDown skips a disabled item within a nested level", () => {
      const fixture = setup([
        {
          label: "Files",
          items: [{ label: "Documents" }, { label: "Photos", disabled: true }, { label: "Videos" }],
        },
      ]);
      const rootHeader = fixture.nativeElement.querySelector('[role="tree"] > [role="treeitem"] a');
      rootHeader.click();
      fixture.detectChanges();
      const nestedLinks = fixture.nativeElement.querySelectorAll(
        '[role="tree"] > [role="treeitem"] [role="tree"] > [role="treeitem"] a',
      );
      nestedLinks[0].focus();
      keydown(nestedLinks[0], "ArrowDown");
      expect(document.activeElement).toBe(nestedLinks[2]);
    });

    it("Enter on a nested group item toggles its own expand/collapse without affecting the root level", () => {
      const fixture = setup();
      const rootHeader = fixture.nativeElement.querySelector('[role="tree"] > [role="treeitem"] a');
      rootHeader.click();
      fixture.detectChanges();
      const nestedHeader = fixture.nativeElement.querySelector(
        '[role="tree"] > [role="treeitem"] [role="tree"] > [role="treeitem"] a',
      );
      nestedHeader.focus();
      keydown(nestedHeader, "Enter");
      fixture.detectChanges();
      const nestedItem = fixture.nativeElement.querySelector(
        '[role="tree"] > [role="treeitem"] [role="tree"] > [role="treeitem"]',
      );
      expect(nestedItem.getAttribute("data-u-expanded")).toBe("true");
      const rootItem = fixture.nativeElement.querySelector('[role="tree"] > [role="treeitem"]');
      expect(rootItem.getAttribute("data-u-expanded")).toBe("true");
    });

    describe("index mapping with a hidden item before the target (GAP-054 fix-loop)", () => {
      it("toggles expand/collapse on Enter for a group item positioned after a hidden item", () => {
        const model: UMenuItem[] = [
          { label: "A" },
          { label: "Hidden", visible: false },
          { label: "Files", items: [{ label: "Doc" }] },
        ];
        const fixture = setup(model);
        // "Files" is rendered link index 1 (Hidden renders no <li>/<a>), but model index 2.
        const links = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
        const filesLink = links[1];
        filesLink.focus();
        keydown(filesLink, "Enter");
        fixture.detectChanges();

        const filesItem = filesLink.closest('[role="treeitem"]');
        expect(filesItem.getAttribute("data-u-expanded")).toBe("true");
      });

      it("ArrowDown from an item after a hidden item does not get stuck", () => {
        const model: UMenuItem[] = [
          { label: "A" },
          { label: "Hidden", visible: false },
          { label: "B" },
          { label: "C" },
        ];
        const fixture = setup(model);
        const links = fixture.nativeElement.querySelectorAll('[role="tree"] > [role="treeitem"] > .u-panelmenu-header-content > a');
        // Rendered links are [A, B, C] (Hidden renders no <li>/<a>).
        const [a, b, c] = links;
        b.focus();
        keydown(b, "ArrowDown");
        expect(document.activeElement).toBe(c);

        keydown(c, "ArrowUp");
        expect(document.activeElement).toBe(b);

        keydown(b, "ArrowUp");
        expect(document.activeElement).toBe(a);
      });
    });
  });
});
