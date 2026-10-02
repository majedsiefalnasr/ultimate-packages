import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UStyleClass } from "./style-class";

describe("UStyleClass", () => {
  it("toggles a class on the next sibling when toggleClass is set", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button uStyleClass="@next" toggleClass="active">Toggle</button>
        <div id="target"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");

    button.click();
    expect(target.classList.contains("active")).toBe(true);

    button.click();
    expect(target.classList.contains("active")).toBe(false);
  });

  it("adds enterToClass and removes enterFromClass immediately when no enterActiveClass is set", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button
          uStyleClass="@next"
          enterFromClass="hidden"
          enterToClass="visible"
          leaveFromClass="visible"
          leaveToClass="hidden"
        >
          Toggle
        </button>
        <div id="target" class="hidden" style="display:none"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");

    button.click();
    expect(target.classList.contains("visible")).toBe(true);
    expect(target.classList.contains("hidden")).toBe(false);
  });

  it("resolves @parent selector", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <div id="parent">
          <button uStyleClass="@parent" toggleClass="open">Toggle</button>
        </div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const parent: HTMLDivElement = fixture.nativeElement.querySelector("#parent");

    button.click();
    expect(parent.classList.contains("open")).toBe(true);
  });

  it("resolves a plain CSS selector target", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button uStyleClass=".target" toggleClass="open">Toggle</button>
        <div class="target"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector(".target");

    button.click();
    expect(target.classList.contains("open")).toBe(true);
  });

  it("hides on outside click when hideOnOutsideClick is set", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button
          uStyleClass="@next"
          enterToClass="visible"
          leaveFromClass="visible"
          [hideOnOutsideClick]="true"
        >
          Toggle
        </button>
        <div id="target" style="display:block"></div>
        <div id="outside"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");
    const outside: HTMLDivElement = fixture.nativeElement.querySelector("#outside");
    document.body.appendChild(fixture.nativeElement);
    // jsdom never computes real layout, so offsetParent is always null
    // regardless of `display`. Stubbed here as a getter keyed off the
    // target's own "visible" class — the same signal a real browser's own
    // layout engine would use (an element only has a real offsetParent once
    // it's actually displayed) — so both onClick()'s enter()-vs-leave()
    // branch decision AND the document click listener's isVisible() guard
    // (bound synchronously inside that same enter() call, and therefore
    // still reached by *this* click event's own bubble-to-document phase —
    // confirmed via direct instrumentation: event.target is the button on
    // that first invocation) each observe the correct value for the DOM
    // state at the instant they run, matching real upstream's own
    // isVisible()-first guard exactly (.vendor-extracted/ng/styleclass.ts's
    // bindDocumentClickListener). A static pre- or post-click stub cannot
    // satisfy both call sites at once, since they run at different points
    // within the same synchronous click dispatch.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });

    button.click();
    expect(target.classList.contains("visible")).toBe(true);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(target.classList.contains("visible")).toBe(false);

    fixture.nativeElement.remove();
  });

  it("hides on Escape when hideOnEscape is set", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button
          uStyleClass="@next"
          enterToClass="visible"
          leaveFromClass="visible"
          [hideOnEscape]="true"
        >
          Toggle
        </button>
        <div id="target" style="display:block"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");
    document.body.appendChild(fixture.nativeElement);

    button.click();
    expect(target.classList.contains("visible")).toBe(true);
    Object.defineProperty(target, "offsetParent", { value: document.body, configurable: true });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(target.classList.contains("visible")).toBe(false);

    fixture.nativeElement.remove();
  });

  it("runs the enter animation class sequence and removes enterActiveClass on animationend", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button uStyleClass="@next" enterActiveClass="animating" enterToClass="visible">
          Toggle
        </button>
        <div id="target" style="display:none"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");

    button.click();
    expect(target.classList.contains("animating")).toBe(true);

    target.dispatchEvent(new Event("animationend"));
    expect(target.classList.contains("animating")).toBe(false);
    expect(target.classList.contains("visible")).toBe(true);
  });

  it("cleans up document listeners on destroy", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button
          uStyleClass="@next"
          enterToClass="visible"
          leaveFromClass="visible"
          [hideOnOutsideClick]="true"
        >
          Toggle
        </button>
        <div id="target" style="display:block"></div>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    const target: HTMLDivElement = fixture.nativeElement.querySelector("#target");
    document.body.appendChild(fixture.nativeElement);
    // See the "hides on outside click" test above for why this stub must be
    // a getter keyed off the "visible" class, not a static value.
    Object.defineProperty(target, "offsetParent", {
      configurable: true,
      get: () => (target.classList.contains("visible") ? document.body : null),
    });

    button.click();
    const removeSpy = vi.spyOn(document, "removeEventListener");
    fixture.destroy();
    expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));

    fixture.nativeElement.remove();
    removeSpy.mockRestore();
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [UStyleClass],
      template: `
        <button uStyleClass="@next" toggleClass="active">Toggle</button>
        <div id="target"></div>
      `,
    })
    class SsrHostComponent {}

    it("reaches no browser globals on the server platform through mount, change detection and destroy", () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      // TestBed.createComponent itself calls document.querySelector("#rootN") to
      // locate the test host element, so only queries beyond that are the directive's.
      const docQuery = vi.spyOn(document, "querySelector");
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
      };
      try {
        const fixture = TestBed.createComponent(SsrHostComponent);
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.destroy();

        for (const [spyName, spy] of Object.entries(spies)) {
          expect(spy, spyName).not.toHaveBeenCalled();
        }
        const directiveQueries = docQuery.mock.calls.filter(
          ([selector]) => !/^#root\d+$/.test(selector)
        );
        expect(directiveQueries).toEqual([]);
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
