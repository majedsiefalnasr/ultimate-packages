import { Component, PLATFORM_ID, ViewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
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

  describe("positioning after render (GAP-064 D-0)", () => {
    /**
     * Mirrors the browser order: the click handler runs, queued microtasks
     * drain, and only then does the zoneless scheduler render.
     */
    async function clickAndRender(fixture: ComponentFixture<HostComponent>) {
      fixture.nativeElement.querySelector("button").click();
      await Promise.resolve();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function setup(): ComponentFixture<HostComponent> {
      const fixture = TestBed.createComponent(HostComponent);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
      vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
        top: 16,
        bottom: 40,
        left: 16,
        right: 124,
        width: 108,
        height: 24,
        x: 16,
        y: 16,
      } as DOMRect);
      return fixture;
    }

    afterEach(() => {
      vi.restoreAllMocks();
      document.querySelectorAll(".u-popover").forEach((el) => el.remove());
    });

    it("places the overlay container below the target once it has rendered, with a z-index", async () => {
      const fixture = setup();
      await clickAndRender(fixture);

      const root = document.querySelector<HTMLElement>(".u-popover");
      expect(root).not.toBeNull();
      expect(root!.style.top).toBe("40px");
      expect(root!.style.left).toBe("16px");
      expect(root!.style.zIndex).not.toBe("");
      expect(document.querySelector<HTMLElement>(".u-popover-content")!.style.top).toBe("");

      fixture.nativeElement.remove();
    });

    it("hidden before its callback runs: no exception, no reappearance", async () => {
      const fixture = setup();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
      button.click();
      button.click();
      await Promise.resolve();
      fixture.detectChanges();
      await expect(fixture.whenStable()).resolves.not.toThrow();
      expect(document.querySelector(".u-popover")).toBeNull();

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
        scrollX: vi.spyOn(window, "scrollX", "get"),
        scrollY: vi.spyOn(window, "scrollY", "get"),
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
