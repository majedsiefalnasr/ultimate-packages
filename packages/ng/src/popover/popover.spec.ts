import { Component, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UPopover } from "./popover";

@Component({
  standalone: true,
  imports: [UPopover],
  template: `
    <button #btn (click)="op.toggle($event)">Toggle</button>
    <u-popover #op>
      <div class="panel-content">Popover content</div>
    </u-popover>
  `,
})
class HostComponent {
  @ViewChild("op") op!: UPopover;
}

describe("UPopover", () => {
  it("is hidden until toggled", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).toBeNull();
  });

  it("shows the overlay on toggle and hides on second toggle", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    button.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).not.toBeNull();
    expect(document.querySelector(".panel-content")?.textContent).toBe("Popover content");

    button.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).toBeNull();
  });

  it("emits onShow/onHide when shown and hidden", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    let shown = false;
    let hidden = false;
    fixture.componentInstance.op.onShow.subscribe(() => (shown = true));
    fixture.componentInstance.op.onHide.subscribe(() => (hidden = true));

    fixture.componentInstance.op.show(new MouseEvent("click"), fixture.nativeElement.querySelector("button"));
    fixture.detectChanges();
    expect(shown).toBe(true);

    fixture.componentInstance.op.hide();
    fixture.detectChanges();
    expect(hidden).toBe(true);
  });

  it("hides when clicking outside", () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    button.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("hides on Escape", () => {
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    button.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("does not hide on outside click when dismissable is false", () => {
    @Component({
      standalone: true,
      imports: [UPopover],
      template: `
        <button (click)="op.toggle($event)">Toggle</button>
        <u-popover #op [dismissable]="false">content</u-popover>
      `,
    })
    class NonDismissableHost {
      @ViewChild("op") op!: UPopover;
    }
    const fixture = TestBed.createComponent(NonDismissableHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    button.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-popover")).not.toBeNull();

    fixture.nativeElement.remove();
  });
});
