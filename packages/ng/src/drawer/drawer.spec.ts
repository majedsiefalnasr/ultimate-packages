import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UDrawer } from "./drawer";

describe("UDrawer", () => {
  it("renders nothing when visible is false", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="false">Content</u-drawer>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-drawer")).toBeNull();
  });

  it("renders with role=complementary and header when visible", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="true" header="Menu">Content</u-drawer>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = document.querySelector(".u-drawer");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("complementary");
    expect(document.querySelector(".u-drawer-title")?.textContent).toBe("Menu");
    fixture.destroy();
  });

  it("applies the position class", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="true" position="right">Content</u-drawer>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-drawer-position-right")).not.toBeNull();
    fixture.destroy();
  });

  it("emits visibleChange(false) when the close button is clicked", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="true" (visibleChange)="onChange($event)">Content</u-drawer>`,
    })
    class HostComponent {
      changed: boolean | null = null;
      onChange(value: boolean) {
        this.changed = value;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const closeButton: HTMLButtonElement = document.querySelector(".u-drawer-close-button button") ?? (document.querySelector(".u-drawer-close-button") as HTMLButtonElement);
    closeButton.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.changed).toBe(false);
    fixture.destroy();
  });

  it("closes on Escape when closeOnEscape is true", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="true" (visibleChange)="onChange($event)">Content</u-drawer>`,
    })
    class HostComponent {
      changed: boolean | null = null;
      onChange(value: boolean) {
        this.changed = value;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.changed).toBe(false);
    fixture.destroy();
  });

  it("closes on mask click when dismissible and modal", () => {
    @Component({
      standalone: true,
      imports: [UDrawer],
      template: `<u-drawer [visible]="true" (visibleChange)="onChange($event)">Content</u-drawer>`,
    })
    class HostComponent {
      changed: boolean | null = null;
      onChange(value: boolean) {
        this.changed = value;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const mask = document.querySelector(".u-drawer-mask") as HTMLElement;
    mask.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    mask.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.changed).toBe(false);
    fixture.destroy();
  });
});
