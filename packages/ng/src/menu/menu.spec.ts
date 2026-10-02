import { Component, PLATFORM_ID, ViewChild } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UMenu } from "./menu";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UMenu", () => {
  const items: UMenuItem[] = [
    { label: "Home", icon: "home" },
    { separator: true },
    { label: "Settings", routerLink: "/settings" },
  ];

  it('renders role="menu" on the root list and role="menuitem" per item', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });

  it('renders role="separator" for separator items', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("moves focus to the next menuitem on ArrowDown (roving tabindex)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    menuItems[0].focus();
    menuItems[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(menuItems[1]);
  });

  it("skips disabled items when navigating with ArrowDown (roving tabindex)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Home" },
      { label: "Disabled", disabled: true },
      { label: "Settings" },
    ]);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    menuItems[0].focus();
    menuItems[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    // The disabled "Disabled" item (index 1) must be skipped — focus should
    // land on "Settings" (index 2), not on the disabled item in between.
    expect(document.activeElement).toBe(menuItems[2]);
  });

  it("seeds tabindex=0 on the first non-separator item, not model index 0", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { separator: true },
      { label: "Home" },
      { label: "Settings" },
    ]);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    // With a leading separator, the first rendered anchor ("Home") must be
    // the one reachable by Tab — not the model's index-0 entry, which is
    // the separator and renders no anchor at all.
    expect(menuItems[0].getAttribute("tabindex")).toBe("0");
    expect(menuItems[1].getAttribute("tabindex")).toBe("-1");
  });

  it("does not apply routerLink to a disabled item, even if routerLink is set", () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: "settings", children: [] }])],
    });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Settings", routerLink: "/settings", disabled: true },
    ]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLAnchorElement;
    // A disabled item must not be a real navigable link — routerLink being
    // bound regardless of item.disabled would leave a real href in place,
    // reachable via middle-click/ctrl-click/screen-reader link lists even
    // though onItemClick's preventDefault blocks plain mouse clicks.
    expect(link.getAttribute("href")).toBeNull();
  });

  it("applies the p-disabled modifier class to a disabled item (matches uix-styles' real selector)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "Off", disabled: true }]);
    fixture.detectChanges();
    const li = fixture.nativeElement.querySelector('[role="none"]') as HTMLElement;
    // @ultimate/uix-styles/menu's CSS selects .p-disabled (a PrimeNG-wide
    // shared modifier, kept unrenamed like checkbox-style.ts's p-highlight/
    // p-disabled) — a u-disabled class here would match no selector at all.
    expect(li.classList.contains("p-disabled")).toBe(true);
  });

  it("applies routerLink navigation to items with a routerLink field", () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: "settings", children: [] }])],
    });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    const settingsLink = Array.from(fixture.nativeElement.querySelectorAll("a")).find((a) =>
      (a as HTMLElement).textContent?.includes("Settings")
    ) as HTMLAnchorElement;
    expect(settingsLink.getAttribute("href")).toContain("/settings");
  });

  it("shows a tooltip on hover when an item opts in via item.tooltip", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Long label", tooltip: "A very long menu item label that truncates" },
    ]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });

  it("shows no tooltip when item.tooltip is unset, even on hover", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "Plain item" }]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    // Regression guard: [uTooltip]="item.label" previously showed a
    // redundant tooltip duplicating the visible label on every item.
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  describe("popup-overlay mechanism (Spec §5.2, GAP-067)", () => {
    // In popup mode UOverlay moves the panel out of the fixture's host
    // element (to document.body or appendTo), so popup assertions locate the
    // menu through the logical view tree (debugElement), not nativeElement.
    function menuList(fixture: ComponentFixture<unknown>): HTMLElement | null {
      return fixture.debugElement.query(By.css('[role="menu"]'))?.nativeElement ?? null;
    }

    function panel(fixture: ComponentFixture<unknown>): HTMLElement | null {
      return fixture.debugElement.query(By.css(".u-menu"))?.nativeElement ?? null;
    }

    function createPopup(inputs: Record<string, unknown> = {}): ComponentFixture<UMenu> {
      const fixture = TestBed.createComponent(UMenu);
      fixture.componentRef.setInput("model", [{ label: "A" }]);
      fixture.componentRef.setInput("popup", true);
      for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
      }
      fixture.detectChanges();
      return fixture;
    }

    function createInline(model: UMenuItem[]): ComponentFixture<UMenu> {
      const fixture = TestBed.createComponent(UMenu);
      fixture.componentRef.setInput("model", model);
      fixture.detectChanges();
      return fixture;
    }

    const escape = () => document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

    @Component({
      standalone: true,
      imports: [UMenu],
      template: `
        <button (click)="menu.toggle($event)">Open</button>
        <u-menu #menu [popup]="true" [model]="model"></u-menu>
      `,
    })
    class TriggerHost {
      @ViewChild("menu") menu!: UMenu;
      command = vi.fn();
      model: UMenuItem[] = [{ label: "Run", command: this.command }];
    }

    function createTriggerHost(): ComponentFixture<TriggerHost> {
      const fixture = TestBed.createComponent(TriggerHost);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      return fixture;
    }

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
    });

    it("popup mode renders no menu until toggled open", () => {
      const fixture = createPopup();
      expect(menuList(fixture)).toBeNull();
    });

    it("show(event) opens the popup and emits onShow", () => {
      const fixture = createPopup();
      const shown = vi.fn();
      fixture.componentInstance.onShow.subscribe(shown);
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      expect(menuList(fixture)).not.toBeNull();
      expect(shown).toHaveBeenCalledTimes(1);
    });

    it("hide() closes the popup and emits onHide", () => {
      const fixture = createPopup();
      const hidden = vi.fn();
      fixture.componentInstance.onHide.subscribe(hidden);
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      fixture.componentInstance.hide();
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
      expect(hidden).toHaveBeenCalledTimes(1);
    });

    it("toggle(event) opens when closed and closes when open", () => {
      const fixture = createPopup();
      fixture.componentInstance.toggle(new MouseEvent("click"));
      fixture.detectChanges();
      expect(menuList(fixture)).not.toBeNull();
      fixture.componentInstance.toggle(new MouseEvent("click"));
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
    });

    it("toggle(event) is a no-op in inline mode", () => {
      const fixture = createInline([{ label: "A" }]);
      const shown = vi.fn();
      fixture.componentInstance.onShow.subscribe(shown);
      fixture.componentInstance.toggle(new MouseEvent("click"));
      fixture.componentInstance.toggle(new MouseEvent("click"));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
      expect(shown).not.toHaveBeenCalled();
    });

    it("Escape closes the popup when closeOnEscape is true (default)", () => {
      const fixture = createPopup();
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      escape();
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
    });

    it("Escape does not close the popup when closeOnEscape is false", () => {
      const fixture = createPopup({ closeOnEscape: false });
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      escape();
      fixture.detectChanges();
      expect(menuList(fixture)).not.toBeNull();
    });

    it("closeOnEscape has no effect when popup is false (inline mode)", () => {
      const fixture = createInline([{ label: "A" }]);
      escape();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    });

    it("Escape closes only the most recently opened popup (A created first, opened last)", () => {
      const a = createPopup();
      const b = createPopup();
      b.componentInstance.show(new MouseEvent("click"));
      a.componentInstance.show(new MouseEvent("click"));
      a.detectChanges();
      b.detectChanges();

      escape();
      a.detectChanges();
      b.detectChanges();
      expect(menuList(a)).toBeNull();
      expect(menuList(b)).not.toBeNull();

      escape();
      b.detectChanges();
      expect(menuList(b)).toBeNull();
    });

    it("Escape closes only the most recently opened popup (B created last, opened last)", () => {
      const a = createPopup();
      const b = createPopup();
      a.componentInstance.show(new MouseEvent("click"));
      b.componentInstance.show(new MouseEvent("click"));
      a.detectChanges();
      b.detectChanges();

      escape();
      a.detectChanges();
      b.detectChanges();
      expect(menuList(b)).toBeNull();
      expect(menuList(a)).not.toBeNull();

      escape();
      a.detectChanges();
      expect(menuList(a)).toBeNull();
    });

    it("applies baseZIndex to the panel's z-index", async () => {
      const fixture = createPopup({ baseZIndex: 5000 });
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      await flushMicrotasks();
      expect(Number(panel(fixture)?.style.zIndex)).toBeGreaterThan(5000);
    });

    it("appends the overlay to document.body by default", async () => {
      const fixture = createPopup();
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      await fixture.whenStable();
      const el = panel(fixture);
      expect(el && document.body.contains(el)).toBe(true);
      expect(fixture.nativeElement.contains(el)).toBe(false);
    });

    it("forwards a resolved appendTo (element or function form) to the overlay", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      try {
        for (const appendTo of [container, () => container]) {
          const fixture = createPopup({ appendTo });
          fixture.componentInstance.show(new MouseEvent("click"));
          fixture.detectChanges();
          await fixture.whenStable();
          expect(container.contains(panel(fixture))).toBe(true);
          fixture.destroy();
        }
      } finally {
        container.remove();
      }
    });

    it("anchors the panel below the triggering element", async () => {
      const fixture = createTriggerHost();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        top: 80,
        bottom: 100,
        left: 50,
        right: 150,
        width: 100,
        height: 20,
        x: 50,
        y: 80,
        toJSON: () => ({}),
      } as DOMRect);
      button.click();
      fixture.detectChanges();
      await flushMicrotasks();
      const el = panel(fixture)!;
      expect(el.style.position).toBe("absolute");
      expect(el.style.top).toBe(`${100 + window.scrollY}px`);
      expect(el.style.left).toBe(`${50 + window.scrollX}px`);
      fixture.nativeElement.remove();
    });

    it("hides on outside click but not on a click inside the panel", () => {
      const fixture = createTriggerHost();
      fixture.nativeElement.querySelector("button").click();
      fixture.detectChanges();
      expect(menuList(fixture)).not.toBeNull();

      panel(fixture)!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      fixture.detectChanges();
      expect(menuList(fixture)).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
      fixture.nativeElement.remove();
    });

    it("toggles closed when the trigger is clicked again", () => {
      const fixture = createTriggerHost();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
      button.click();
      fixture.detectChanges();
      button.click();
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
      fixture.nativeElement.remove();
    });

    it("does not stop the opening click: a second popup's opening click closes the first, and document listeners still see it", () => {
      @Component({
        standalone: true,
        imports: [UMenu],
        template: `
          <button id="a" (click)="a.toggle($event)">A</button>
          <u-menu #a [popup]="true" [model]="model"></u-menu>
          <button id="b" (click)="b.toggle($event)">B</button>
          <u-menu #b [popup]="true" [model]="model"></u-menu>
        `,
      })
      class TwoMenusHost {
        @ViewChild("a") a!: UMenu;
        @ViewChild("b") b!: UMenu;
        model: UMenuItem[] = [{ label: "Run" }];
      }
      const fixture = TestBed.createComponent(TwoMenusHost);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      const appListener = vi.fn();
      document.addEventListener("click", appListener);
      try {
        const isOpen = (menu: UMenu) =>
          fixture.debugElement
            .queryAll(By.directive(UMenu))
            .find((de) => de.componentInstance === menu)!
            .query(By.css('[role="menu"]')) !== null;

        fixture.nativeElement.querySelector("#a").click();
        fixture.detectChanges();
        expect(isOpen(fixture.componentInstance.a)).toBe(true);
        expect(appListener).toHaveBeenCalledTimes(1);

        fixture.nativeElement.querySelector("#b").click();
        fixture.detectChanges();
        expect(isOpen(fixture.componentInstance.b)).toBe(true);
        expect(isOpen(fixture.componentInstance.a)).toBe(false);
        expect(appListener).toHaveBeenCalledTimes(2);
      } finally {
        document.removeEventListener("click", appListener);
        fixture.nativeElement.remove();
      }
    });

    it("resolves a function-form appendTo on each open", async () => {
      const first = document.createElement("div");
      const second = document.createElement("div");
      document.body.append(first, second);
      try {
        let target = first;
        const fixture = createPopup({ appendTo: () => target });
        fixture.componentInstance.show(new MouseEvent("click"));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(first.contains(panel(fixture))).toBe(true);

        fixture.componentInstance.hide();
        fixture.detectChanges();
        target = second;
        fixture.componentInstance.show(new MouseEvent("click"));
        fixture.detectChanges();
        await fixture.whenStable();
        expect(second.contains(panel(fixture))).toBe(true);
        fixture.destroy();
      } finally {
        first.remove();
        second.remove();
      }
    });

    it("hides on window resize", () => {
      const fixture = createPopup();
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      window.dispatchEvent(new Event("resize"));
      fixture.detectChanges();
      expect(menuList(fixture)).toBeNull();
    });

    it("runs the item command and then hides the popup on item click", () => {
      const fixture = createTriggerHost();
      fixture.nativeElement.querySelector("button").click();
      fixture.detectChanges();
      (
        fixture.debugElement.query(By.css('[role="menuitem"]')).nativeElement as HTMLElement
      ).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.command).toHaveBeenCalledTimes(1);
      expect(menuList(fixture)).toBeNull();
      fixture.nativeElement.remove();
    });

    it("keeps an inline menu rendered after an item click", () => {
      const command = vi.fn();
      const fixture = createInline([{ label: "Run", command }]);
      fixture.nativeElement.querySelector('[role="menuitem"]').click();
      fixture.detectChanges();
      expect(command).toHaveBeenCalledTimes(1);
      expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    });

    it("releases Escape and document listeners when destroyed while open", () => {
      const fixture = createPopup();
      const hidden = vi.fn();
      fixture.componentInstance.onHide.subscribe(hidden);
      fixture.componentInstance.show(new MouseEvent("click"));
      fixture.detectChanges();
      const docRemove = vi.spyOn(document, "removeEventListener");
      try {
        fixture.destroy();
        expect(docRemove).toHaveBeenCalledWith("click", expect.any(Function));
        escape();
        expect(hidden).not.toHaveBeenCalled();
      } finally {
        docRemove.mockRestore();
      }
    });

    it("reaches no browser globals on the server platform through show, hide and destroy", () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
        scrollX: vi.spyOn(window, "scrollX", "get"),
        scrollY: vi.spyOn(window, "scrollY", "get"),
      };
      try {
        const fixture = createPopup();
        fixture.componentInstance.show(new MouseEvent("click"));
        fixture.detectChanges();
        fixture.componentInstance.hide();
        fixture.detectChanges();
        fixture.componentInstance.show(new MouseEvent("click"));
        fixture.detectChanges();
        fixture.destroy();
        // UMenu's [routerLink] needs provideRouter (beforeEach), and the
        // router itself subscribes to popstate/hashchange on window — those
        // are the test harness's, not UMenu's, so they are excluded here.
        const routerEvents = new Set(["popstate", "hashchange"]);
        for (const [spyName, spy] of Object.entries(spies)) {
          const calls = spy.mock.calls.filter(
            (args: unknown[]) => !routerEvents.has(args[0] as string)
          );
          expect(calls, spyName).toEqual([]);
        }
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
