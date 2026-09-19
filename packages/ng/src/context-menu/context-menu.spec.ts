import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
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
});
