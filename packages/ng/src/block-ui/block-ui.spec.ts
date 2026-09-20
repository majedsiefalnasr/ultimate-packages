import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBlockUI } from "./block-ui";

describe("UBlockUI", () => {
  it("renders its projected content and no mask when not blocked", () => {
    @Component({
      standalone: true,
      imports: [UBlockUI],
      template: `<u-block-ui><p>content</p></u-block-ui>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("content");
    expect(fixture.nativeElement.querySelector(".u-blockui-mask")).toBeNull();
  });

  it("renders a mask when blocked is true", () => {
    @Component({
      standalone: true,
      imports: [UBlockUI],
      template: `<u-block-ui [blocked]="true"><p>content</p></u-block-ui>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-blockui-mask")).not.toBeNull();
  });

  it("toggles the mask visibility when blocked changes", () => {
    const fixture = TestBed.createComponent(UBlockUI);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-blockui-mask")).toBeNull();

    fixture.componentRef.setInput("blocked", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-blockui-mask")).not.toBeNull();

    fixture.componentRef.setInput("blocked", false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-blockui-mask")).toBeNull();
  });

  it("sets aria-busy reflecting blocked", () => {
    @Component({
      standalone: true,
      imports: [UBlockUI],
      template: `<u-block-ui [blocked]="true"></u-block-ui>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("u-block-ui");
    expect(host.getAttribute("aria-busy")).toBe("true");
  });

  it("applies the fullScreen document mask class", () => {
    @Component({
      standalone: true,
      imports: [UBlockUI],
      template: `<u-block-ui [blocked]="true" [fullScreen]="true"></u-block-ui>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-blockui-mask-document")).not.toBeNull();
  });

  it("emits onBlocked and onUnblocked as blocked toggles", () => {
    const fixture = TestBed.createComponent(UBlockUI);
    let blockedCalls = 0;
    let unblockedCalls = 0;
    fixture.componentInstance.onBlocked.subscribe(() => blockedCalls++);
    fixture.componentInstance.onUnblocked.subscribe(() => unblockedCalls++);
    fixture.detectChanges();

    fixture.componentRef.setInput("blocked", true);
    fixture.detectChanges();
    expect(blockedCalls).toBe(1);

    fixture.componentRef.setInput("blocked", false);
    fixture.detectChanges();
    expect(unblockedCalls).toBe(1);
  });
});
