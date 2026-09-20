import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UPanel } from "./panel";

describe("UPanel", () => {
  it("renders the header text and projected content", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `<u-panel header="Info"><p class="body">Content</p></u-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-panel-title")?.textContent).toBe("Info");
    expect(fixture.nativeElement.querySelector(".body")?.textContent).toBe("Content");
  });

  it("does not render a toggle button when toggleable is false", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `<u-panel header="Info"></u-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-button")).toBeFalsy();
  });

  it("toggles content visibility when the toggle button is clicked", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `
        <u-panel header="Info" [toggleable]="true">
          <p class="body">Content</p>
        </u-panel>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeTruthy();

    const button = fixture.nativeElement.querySelector("u-button button") as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeFalsy();
  });

  it("starts collapsed when collapsed input is true, and expands on toggle", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `
        <u-panel header="Info" [toggleable]="true" [collapsed]="true">
          <p class="body">Content</p>
        </u-panel>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeFalsy();

    const button = fixture.nativeElement.querySelector("u-button button") as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeTruthy();
  });

  it("emits collapsedChange, onBeforeToggle, and onAfterToggle when toggled", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `
        <u-panel
          header="Info"
          [toggleable]="true"
          (collapsedChange)="collapsedChangeValue = $event"
          (onBeforeToggle)="beforeCount = beforeCount + 1"
          (onAfterToggle)="afterCount = afterCount + 1"
        ></u-panel>
      `,
    })
    class HostComponent {
      collapsedChangeValue: boolean | undefined;
      beforeCount = 0;
      afterCount = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("u-button button") as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.collapsedChangeValue).toBe(true);
    expect(fixture.componentInstance.beforeCount).toBe(1);
    expect(fixture.componentInstance.afterCount).toBe(1);
  });

  it("hides the header entirely when showHeader is false", () => {
    @Component({
      standalone: true,
      imports: [UPanel],
      template: `<u-panel header="Info" [showHeader]="false"></u-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-panel-header")).toBeFalsy();
  });
});
