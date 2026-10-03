import { Component, ChangeDetectionStrategy, PLATFORM_ID } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UBaseComponent } from "./base-component";
import { ngCoreStyleSheet } from "./style-sheet";
import { Theme } from "@ultimate/uix-styled";

@Component({
  standalone: true,
  selector: "u-test-component",
  template: "<div [class]=\"cx('root')\"></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent extends UBaseComponent {
  protected override readonly componentName = "test-component";
  protected override readonly styleModule = {
    css: ".u-test-component-root { color: red; }",
    classes: { root: () => "u-test-component-root" },
  };
}

describe("UBaseComponent", () => {
  it("resolves a class-name slot via cx()", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector("div");
    expect(div.className).toBe("u-test-component-root");
  });

  it("registers its style module on init (registration call happens exactly once per componentName)", () => {
    // A prior test may have already registered "test-component" against the
    // shared singleton — clear it so this test observes a clean first
    // registration regardless of suite execution order.
    ngCoreStyleSheet.delete("test-component");
    const addSpy = vi.spyOn(ngCoreStyleSheet, "add");

    const fixtureA = TestBed.createComponent(TestHostComponent);
    fixtureA.detectChanges();
    const fixtureB = TestBed.createComponent(TestHostComponent);
    fixtureB.detectChanges();

    // Both instances share componentName "test-component". uix-styled's
    // StyleSheet.add() is the real registration call (see
    // packages/uix-styled/src/stylesheet/index.ts) — asserting the
    // structural registration for THIS componentName happened exactly once,
    // even though two component instances ran ngOnInit, proves ngOnInit
    // checks has() before calling add() rather than unconditionally
    // re-registering. Filtered by key because ngOnInit also registers theme
    // variable definitions under their own keys (registerThemeVariables).
    const structuralCalls = addSpy.mock.calls.filter(([key]) => key === "test-component");
    expect(structuralCalls).toHaveLength(1);
    expect(addSpy).toHaveBeenCalledWith("test-component", ".u-test-component-root { color: red; }");
    expect(ngCoreStyleSheet.has("test-component")).toBe(true);

    addSpy.mockRestore();
  });

  it("registers the shared u-hidden-accessible rule into the component's document (GAP-074)", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(
      Array.from(document.head.querySelectorAll("style")).filter(
        (s) => s.getAttribute("data-u-ng-style") === "u-hidden-accessible"
      )
    ).toHaveLength(1);
  });

  it("resolves dt() calls in registered CSS into var(--u-*, ...) references", () => {
    // Define a test component that uses dt() calls in its CSS
    @Component({
      standalone: true,
      selector: "u-test-dt-component",
      template: "<div></div>",
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestDtComponent extends UBaseComponent {
      protected override readonly componentName = "test-dt-component";
      protected override readonly styleModule = {
        css: ".u-test { color: dt('test.token.value'); }",
        classes: {},
      };
    }

    // Ensure theme is configured with "u" prefix (Ultimate's branding)
    Theme.setOptions({ prefix: "u" });

    // Clear any prior registration
    ngCoreStyleSheet.delete("test-dt-component");
    const addSpy = vi.spyOn(ngCoreStyleSheet, "add");

    const fixture = TestBed.createComponent(TestDtComponent);
    fixture.detectChanges();

    // ngOnInit now makes several add() calls: the shared theme variable
    // DEFINITIONS (common + this component's own `<name>-variables` block,
    // via registerThemeVariables) alongside this component's structural CSS.
    // Assert on the structural registration specifically — keyed by
    // componentName — rather than on a bare call count, which only ever
    // worked as a proxy while add() had a single caller.
    const structuralCalls = addSpy.mock.calls.filter(([key]) => key === "test-dt-component");
    expect(structuralCalls).toHaveLength(1);
    const registeredCss = structuralCalls[0][1];
    expect(registeredCss).toContain("var(--u-test-token-value");
    expect(registeredCss).not.toContain("dt(");

    addSpy.mockRestore();
  });

  it("registers its style module into the injected DOCUMENT, not the global document (GAP-078)", () => {
    const doc = document.implementation.createHTMLDocument("server");
    const docSpy = vi.spyOn(document.head, "appendChild");
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: "server" },
      ],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(
      Array.from(doc.head.querySelectorAll("style")).some(
        (s) => s.getAttribute("data-u-ng-style") === "test-component"
      )
    ).toBe(true);
    expect(docSpy).not.toHaveBeenCalled();
    docSpy.mockRestore();
  });
});
