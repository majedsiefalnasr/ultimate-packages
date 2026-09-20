import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UFieldset } from "./fieldset";

describe("UFieldset", () => {
  it("renders the legend text and projected content", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `<u-fieldset [legend]="'Info'"><p class="body">Content</p></u-fieldset>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-fieldset-legend-label")?.textContent).toBe(
      "Info"
    );
    expect(fixture.nativeElement.querySelector(".body")?.textContent).toBe("Content");
  });

  it("does not render a toggle button when toggleable is false", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `<u-fieldset [legend]="'Info'"></u-fieldset>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-fieldset-toggle-button")).toBeFalsy();
  });

  it("renders content by default when toggleable, and hides it once toggled", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `
        <u-fieldset [legend]="'Info'" [toggleable]="true">
          <p class="body">Content</p>
        </u-fieldset>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeTruthy();

    const button = fixture.nativeElement.querySelector(
      ".u-fieldset-toggle-button"
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeFalsy();
  });

  it("starts collapsed when collapsed input is true, and expands on toggle", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `
        <u-fieldset [legend]="'Info'" [toggleable]="true" [collapsed]="true">
          <p class="body">Content</p>
        </u-fieldset>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeFalsy();

    const button = fixture.nativeElement.querySelector(
      ".u-fieldset-toggle-button"
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeTruthy();
  });

  it("emits collapsedChange when toggled", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `<u-fieldset [legend]="'Info'" [toggleable]="true" (collapsedChange)="last = $event"></u-fieldset>`,
    })
    class HostComponent {
      last: boolean | undefined;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      ".u-fieldset-toggle-button"
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.last).toBe(true);
  });

  it("toggles on Enter and Space keydown on the toggle button", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `
        <u-fieldset [legend]="'Info'" [toggleable]="true">
          <p class="body">Content</p>
        </u-fieldset>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      ".u-fieldset-toggle-button"
    ) as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".body")).toBeFalsy();
  });

  it("sets aria-expanded and aria-controls on the toggle button", () => {
    @Component({
      standalone: true,
      imports: [UFieldset],
      template: `<u-fieldset [legend]="'Info'" [toggleable]="true"></u-fieldset>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      ".u-fieldset-toggle-button"
    ) as HTMLButtonElement;
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.getAttribute("aria-controls")).toBeTruthy();
  });
});
