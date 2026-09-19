import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UConfirmationService } from "@ultimate/ng-core";
import { UConfirmPopup } from "./confirm-popup";

@Component({
  standalone: true,
  imports: [UConfirmPopup],
  template: `<button #btn>Delete</button><u-confirm-popup></u-confirm-popup>`,
})
class HostComponent {}

describe("UConfirmPopup", () => {
  it("renders nothing until a matching confirmation is requested", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(document.querySelector(".u-confirmpopup")).toBeNull();
  });

  it("shows the popup positioned against confirmation.target", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    service.confirm({ message: "Delete?", target: button });
    fixture.detectChanges();

    expect(document.querySelector(".u-confirmpopup")).not.toBeNull();
    expect(document.querySelector(".u-confirmpopup-message")?.textContent).toBe("Delete?");

    fixture.nativeElement.remove();
  });

  it("invokes accept() and hides when the accept button is clicked", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    let accepted = false;
    service.confirm({ message: "Delete?", target: button, accept: () => (accepted = true) });
    fixture.detectChanges();

    const buttons = document.querySelectorAll(".u-confirmpopup-footer button");
    (buttons[buttons.length - 1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(accepted).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("invokes reject() and hides when the reject button is clicked", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    let rejected = false;
    service.confirm({ message: "Delete?", target: button, reject: () => (rejected = true) });
    fixture.detectChanges();

    const rejectButton = document.querySelector(".u-confirmpopup-footer button") as HTMLButtonElement;
    rejectButton.click();
    fixture.detectChanges();

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("hides when clicking outside the popup and target", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    service.confirm({ message: "Delete?", target: button });
    fixture.detectChanges();
    expect(document.querySelector(".u-confirmpopup")).not.toBeNull();

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("rejects and hides on Escape", () => {
    const fixture = TestBed.createComponent(HostComponent);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    let rejected = false;
    service.confirm({ message: "Delete?", target: button, reject: () => (rejected = true) });
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();

    expect(rejected).toBe(true);
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    fixture.nativeElement.remove();
  });

  it("only responds to confirmations matching its own key", () => {
    @Component({
      standalone: true,
      imports: [UConfirmPopup],
      template: `<button #btn>Delete</button><u-confirm-popup key="secondary"></u-confirm-popup>`,
    })
    class KeyedHost {}
    const fixture = TestBed.createComponent(KeyedHost);
    const service = TestBed.inject(UConfirmationService);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");

    service.confirm({ message: "Wrong key", target: button, key: "other" });
    fixture.detectChanges();
    expect(document.querySelector(".u-confirmpopup")).toBeNull();

    fixture.nativeElement.remove();
  });
});
