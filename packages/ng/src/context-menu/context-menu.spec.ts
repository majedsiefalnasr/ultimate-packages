import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed, type ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { describe, expect, it, vi } from "vitest";
import { UMenu } from "../menu";
import { UContextMenu } from "./context-menu";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UContextMenu", () => {
  const items: UMenuItem[] = [{ label: "Copy" }, { label: "Paste" }, { separator: true }, { label: "Delete", disabled: true }];

  it("renders nothing until right-clicked", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<div id="target"><u-context-menu [model]="items"></u-context-menu></div>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-contextmenu")).toBeNull();
  });

  it("shows the menu on the host's contextmenu (right-click) event and suppresses the native menu", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<u-context-menu [model]="items"></u-context-menu>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu") ?? fixture.nativeElement;

    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 50, clientY: 60 });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    host.dispatchEvent(event);
    fixture.detectChanges();

    expect(document.querySelector(".u-contextmenu")).not.toBeNull();
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(document.querySelectorAll(".u-contextmenu-item").length).toBe(3);

    fixture.destroy();
  });

  it("emits onItemSelect and hides when an enabled item is clicked", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<u-context-menu [model]="items" (onItemSelect)="onSelect($event)"></u-context-menu>`,
    })
    class HostComponent {
      items = items;
      selected: UMenuItem | null = null;
      onSelect(event: { item: UMenuItem }) {
        this.selected = event.item;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const firstLink = document.querySelector(".u-contextmenu-item-link") as HTMLAnchorElement;
    firstLink.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected?.label).toBe("Copy");
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    fixture.destroy();
  });

  it("does not select a disabled item", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<u-context-menu [model]="items" (onItemSelect)="onSelect($event)"></u-context-menu>`,
    })
    class HostComponent {
      items = items;
      selected: UMenuItem | null = null;
      onSelect(event: { item: UMenuItem }) {
        this.selected = event.item;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const links = document.querySelectorAll(".u-contextmenu-item-link");
    const deleteLink = links[links.length - 1] as HTMLAnchorElement;
    deleteLink.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selected).toBeNull();
    fixture.destroy();
  });

  it("hides on outside click", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<div><u-context-menu [model]="items"></u-context-menu><div id="outside">Outside</div></div>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();

    const outside = fixture.nativeElement.querySelector("#outside") as HTMLElement;
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("hides on Escape", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<u-context-menu [model]="items"></u-context-menu>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-context-menu");
    host.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-contextmenu")).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(document.querySelector(".u-contextmenu")).toBeNull();

    fixture.nativeElement.remove();
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [UContextMenu],
      template: `<u-context-menu [model]="items" [global]="true"></u-context-menu>`,
    })
    class GlobalHostComponent {
      items = items;
    }

    it("reaches no browser globals on the server platform with global=true", () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        computed: vi.spyOn(window, "getComputedStyle"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
      };
      try {
        const fixture = TestBed.createComponent(GlobalHostComponent);
        fixture.detectChanges();
        fixture.destroy();

        for (const [name, spy] of Object.entries(spies)) {
          expect(spy, name).not.toHaveBeenCalled();
        }
      } finally {
        vi.restoreAllMocks();
      }
    });

    it("still registers the global contextmenu listener and shows the menu in the browser", () => {
      const docAdd = vi.spyOn(document, "addEventListener");
      const docRemove = vi.spyOn(document, "removeEventListener");
      try {
        const fixture = TestBed.createComponent(GlobalHostComponent);
        fixture.detectChanges();
        expect(docAdd).toHaveBeenCalledWith("contextmenu", expect.any(Function));

        const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        fixture.detectChanges();
        expect(event.defaultPrevented).toBe(true);
        expect(document.querySelector(".u-contextmenu")).not.toBeNull();

        fixture.destroy();
        expect(docRemove).toHaveBeenCalledWith("contextmenu", expect.any(Function));
      } finally {
        vi.restoreAllMocks();
      }
    });
  });

  describe("Escape arbitration shared with UMenu popups (GAP-067)", () => {
    const escape = () => document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));

    function setup(): { cm: ComponentFixture<UContextMenu>; menu: ComponentFixture<UMenu> } {
      TestBed.configureTestingModule({ providers: [provideRouter([])] });
      const cm = TestBed.createComponent(UContextMenu);
      cm.componentRef.setInput("model", items);
      cm.detectChanges();
      const menu = TestBed.createComponent(UMenu);
      menu.componentRef.setInput("model", [{ label: "A" }]);
      menu.componentRef.setInput("popup", true);
      menu.detectChanges();
      return { cm, menu };
    }

    const openContextMenu = (cm: ComponentFixture<UContextMenu>) =>
      cm.componentInstance.show(new MouseEvent("contextmenu", { clientX: 10, clientY: 10 }));
    const openMenu = (menu: ComponentFixture<UMenu>) => menu.componentInstance.show(new MouseEvent("click"));
    // Both components portal their panel to document.body via UOverlay, so
    // each is located through its own logical view tree (debugElement).
    const isOpen = (fixture: ComponentFixture<unknown>, selector: string) => {
      fixture.detectChanges();
      return fixture.debugElement.query(By.css(selector)) !== null;
    };

    it("context menu opened first, UMenu popup second: Escape closes the UMenu, then the context menu", () => {
      const { cm, menu } = setup();
      openContextMenu(cm);
      openMenu(menu);

      escape();
      expect(isOpen(menu, '[role="menu"]')).toBe(false);
      expect(isOpen(cm, ".u-contextmenu")).toBe(true);

      escape();
      expect(isOpen(cm, ".u-contextmenu")).toBe(false);
    });

    it("UMenu popup opened first, context menu second: Escape closes the context menu, then the UMenu", () => {
      const { cm, menu } = setup();
      openMenu(menu);
      openContextMenu(cm);

      escape();
      expect(isOpen(cm, ".u-contextmenu")).toBe(false);
      expect(isOpen(menu, '[role="menu"]')).toBe(true);

      escape();
      expect(isOpen(menu, '[role="menu"]')).toBe(false);
    });

    it("keeps both Escape handlers when both components have instance uid 1", () => {
      // Force the colliding case: each class's own instance counter yields 1.
      (UContextMenu as unknown as { instanceCount: number }).instanceCount = 0;
      (UMenu as unknown as { instanceCount: number }).instanceCount = 0;
      const { cm, menu } = setup();
      openContextMenu(cm);
      openMenu(menu);

      escape();
      escape();
      expect(isOpen(menu, '[role="menu"]')).toBe(false);
      expect(isOpen(cm, ".u-contextmenu")).toBe(false);
    });
  });
});
