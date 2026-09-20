import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UInplace } from "./inplace";

describe("UInplace", () => {
  it("renders the display slot when inactive", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `<u-inplace><span displayContent>Click to edit</span></u-inplace>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-inplace-display")?.textContent).toContain(
      "Click to edit"
    );
    expect(fixture.nativeElement.querySelector(".u-inplace-content")).toBeFalsy();
  });

  it("activates and shows the content template on click", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `
        <u-inplace>
          <span displayContent>Click to edit</span>
          <ng-template #content let-closeCallback="closeCallback">
            <input class="editor" />
          </ng-template>
        </u-inplace>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const display = fixture.nativeElement.querySelector(".u-inplace-display") as HTMLElement;
    display.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".editor")).toBeTruthy();
    expect(fixture.nativeElement.querySelector(".u-inplace-display")).toBeFalsy();
  });

  it("activates on Enter keydown", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `
        <u-inplace>
          <span displayContent>Click to edit</span>
          <ng-template #content>
            <input class="editor" />
          </ng-template>
        </u-inplace>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const display = fixture.nativeElement.querySelector(".u-inplace-display") as HTMLElement;
    display.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".editor")).toBeTruthy();
  });

  it("invokes closeCallback from the content template to deactivate", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `
        <u-inplace [active]="true">
          <span displayContent>Click to edit</span>
          <ng-template #content let-closeCallback="closeCallback">
            <button class="close" (click)="closeCallback($event)">Close</button>
          </ng-template>
        </u-inplace>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".close")).toBeTruthy();
    (fixture.nativeElement.querySelector(".close") as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-inplace-display")).toBeTruthy();
  });

  it("does not activate when disabled", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `
        <u-inplace [disabled]="true">
          <span displayContent>Click to edit</span>
          <ng-template #content>
            <input class="editor" />
          </ng-template>
        </u-inplace>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const display = fixture.nativeElement.querySelector(".u-inplace-display") as HTMLElement;
    display.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".editor")).toBeFalsy();
  });

  it("emits onActivate and onDeactivate", () => {
    @Component({
      standalone: true,
      imports: [UInplace],
      template: `
        <u-inplace (onActivate)="activated = true" (onDeactivate)="deactivated = true">
          <span displayContent>Click to edit</span>
          <ng-template #content let-closeCallback="closeCallback">
            <button class="close" (click)="closeCallback($event)">Close</button>
          </ng-template>
        </u-inplace>
      `,
    })
    class HostComponent {
      activated = false;
      deactivated = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".u-inplace-display") as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activated).toBe(true);
    (fixture.nativeElement.querySelector(".close") as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.deactivated).toBe(true);
  });
});
