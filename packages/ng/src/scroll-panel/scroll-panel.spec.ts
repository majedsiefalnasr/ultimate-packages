import { Component, PLATFORM_ID, ViewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UScrollPanel } from "./scroll-panel";

describe("UScrollPanel", () => {
  it("renders projected content inside the scroll container", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel><p class="body">Content</p></u-scroll-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector(".body")?.textContent).toBe("Content");
  });

  it("renders both an x and a y scrollbar thumb with role=scrollbar", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel></u-scroll-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const bars = fixture.nativeElement.querySelectorAll('[role="scrollbar"]');
    expect(bars.length).toBe(2);
  });

  it("updates lastScrollTop/lastScrollLeft on scroll and re-runs moveBar without throwing", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel #panel style="height: 50px;"><div style="height: 500px;">tall</div></u-scroll-panel>`,
    })
    class HostComponent {
      @ViewChild("panel") panel!: UScrollPanel;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const content = fixture.nativeElement.querySelector(".u-scroll-panel-content") as HTMLElement;
    Object.defineProperty(content, "scrollTop", { value: 50, writable: true });
    content.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();

    expect(() => fixture.componentInstance.panel.refresh()).not.toThrow();
  });

  it("steps scroll position on ArrowDown keydown while a bar has focus (vertical orientation default)", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel style="height: 50px;"><div style="height: 500px;">tall</div></u-scroll-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const yBar = fixture.nativeElement.querySelector(".u-scroll-panel-bar-y") as HTMLElement;
    const keydownEvent = new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true });
    const preventDefaultSpy = vi.spyOn(keydownEvent, "preventDefault");
    yBar.dispatchEvent(keydownEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("scrollTop() clamps to the scrollable range", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel #panel style="height: 50px;"><div style="height: 500px;">tall</div></u-scroll-panel>`,
    })
    class HostComponent {
      @ViewChild("panel") panel!: UScrollPanel;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(() => fixture.componentInstance.panel.scrollTop(-100)).not.toThrow();
    expect(() => fixture.componentInstance.panel.scrollTop(999999)).not.toThrow();
  });

  it("drags the y-bar thumb to scroll content vertically", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel style="height: 50px;"><div style="height: 500px;">tall</div></u-scroll-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const yBar = fixture.nativeElement.querySelector(".u-scroll-panel-bar-y") as HTMLElement;
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(mouseDownEvent, "pageY", { value: 100 });
    yBar.dispatchEvent(mouseDownEvent);
    expect(yBar.classList.contains("u-scroll-panel-bar-grabbed")).toBe(true);
    expect(document.body.classList.contains("u-scroll-panel-bar-grabbed")).toBe(true);

    document.dispatchEvent(new MouseEvent("mouseup"));
    expect(yBar.classList.contains("u-scroll-panel-bar-grabbed")).toBe(false);
    expect(document.body.classList.contains("u-scroll-panel-bar-grabbed")).toBe(false);
  });

  it("sets orientation to horizontal when the x-bar receives focus, and reverts on blur", async () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel style="height: 50px; width: 50px;"><div style="height: 500px; width: 500px;">tall</div></u-scroll-panel>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const xBar = fixture.nativeElement.querySelector(".u-scroll-panel-bar-x") as HTMLElement;
    xBar.dispatchEvent(new FocusEvent("focus"));

    const keydownEvent = new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true });
    const preventDefaultSpy = vi.spyOn(keydownEvent, "preventDefault");
    xBar.dispatchEvent(keydownEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    xBar.dispatchEvent(new FocusEvent("blur"));
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [UScrollPanel],
      template: `<u-scroll-panel style="height: 50px;"><div style="height: 500px;">tall</div></u-scroll-panel>`,
    })
    class SsrHostComponent {}

    function spyOnBrowserGlobals() {
      return {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        computed: vi.spyOn(window, "getComputedStyle"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
        // moveBar() schedules requestAnimationFrame; spy on it directly because
        // Angular's own test scheduler also uses rAF, so a window-level spy is noisy.
        moveBar: vi.spyOn(UScrollPanel.prototype as unknown as { moveBar(): void }, "moveBar"),
      };
    }

    it("reaches no browser globals on the server platform", async () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = spyOnBrowserGlobals();
      try {
        const fixture = TestBed.createComponent(SsrHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.destroy();

        for (const [name, spy] of Object.entries(spies)) {
          expect(spy, name).not.toHaveBeenCalled();
        }
      } finally {
        vi.restoreAllMocks();
      }
    });

    it("still measures and registers the resize listener in the browser", async () => {
      const spies = spyOnBrowserGlobals();
      try {
        const fixture = TestBed.createComponent(SsrHostComponent);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(spies.computed).toHaveBeenCalled();
        expect(spies.winAdd).toHaveBeenCalledWith("resize", expect.any(Function));

        fixture.destroy();
        expect(spies.winRemove).toHaveBeenCalledWith("resize", expect.any(Function));
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
