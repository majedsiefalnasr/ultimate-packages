import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UToolbar } from "./toolbar";

describe("UToolbar", () => {
  it("has role=toolbar", () => {
    @Component({ standalone: true, imports: [UToolbar], template: `<u-toolbar></u-toolbar>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="toolbar"]')).toBeTruthy();
  });

  it("renders projected default content", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar>Plain content</u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Plain content");
  });

  it("renders start/center/end template slots", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar>
        <ng-template #start>Start</ng-template>
        <ng-template #center>Center</ng-template>
        <ng-template #end>End</ng-template>
      </u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toolbar-start")?.textContent).toBe("Start");
    expect(fixture.nativeElement.querySelector(".u-toolbar-center")?.textContent).toBe("Center");
    expect(fixture.nativeElement.querySelector(".u-toolbar-end")?.textContent).toBe("End");
  });

  it("does not render an end wrapper when no end template is provided", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar><ng-template #start>Start</ng-template></u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toolbar-end")).toBeFalsy();
  });

  it("sets aria-labelledby when provided", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar [ariaLabelledBy]="'actions-heading'"></u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="toolbar"]')?.getAttribute("aria-labelledby")
    ).toBe("actions-heading");
  });
});
