import { Component, PLATFORM_ID } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("positioning after render (GAP-064 D-0)", () => {
    function setup(): { fixture: ComponentFixture<HostComponent>; button: HTMLButtonElement } {
      const fixture = TestBed.createComponent(HostComponent);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        top: 16,
        bottom: 52,
        left: 16,
        right: 92,
        width: 76,
        height: 36,
        x: 16,
        y: 16,
      } as DOMRect);
      return { fixture, button };
    }

    /** The confirmation arrives, queued microtasks drain, then the zoneless scheduler renders. */
    async function render(fixture: ComponentFixture<HostComponent>) {
      await Promise.resolve();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    afterEach(() => {
      vi.restoreAllMocks();
      document.querySelectorAll(".u-confirmpopup").forEach((el) => el.remove());
    });

    it("places the popup below confirmation.target once it has rendered, with a z-index", async () => {
      const { fixture, button } = setup();
      TestBed.inject(UConfirmationService).confirm({ message: "Delete?", target: button });
      await render(fixture);

      const root = document.querySelector<HTMLElement>(".u-confirmpopup");
      expect(root).not.toBeNull();
      expect(root!.style.top).toBe("52px");
      expect(root!.style.left).toBe("16px");
      expect(root!.style.zIndex).not.toBe("");

      fixture.nativeElement.remove();
    });

    it("closed before its callback runs: no exception, no reappearance", async () => {
      const { fixture, button } = setup();
      const service = TestBed.inject(UConfirmationService);
      service.confirm({ message: "Delete?", target: button });
      service.close();
      await render(fixture);
      expect(document.querySelector(".u-confirmpopup")).toBeNull();

      fixture.nativeElement.remove();
    });
  });

  describe("SSR safety (GAP-065)", () => {
    it("reaches no browser globals on the server platform through mount, change detection and destroy", () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
      };
      try {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.destroy();

        for (const [spyName, spy] of Object.entries(spies)) {
          expect(spy, spyName).not.toHaveBeenCalled();
        }
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
