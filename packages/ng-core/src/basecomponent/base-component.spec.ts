import { Component, ChangeDetectionStrategy, PLATFORM_ID } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("registers the shared u-icon-spin rule into the component's document, once (GAP-124)", () => {
    TestBed.createComponent(TestHostComponent).detectChanges();
    TestBed.createComponent(TestHostComponent).detectChanges();
    const spin = Array.from(document.head.querySelectorAll("style")).filter(
      (s) => s.getAttribute("data-u-ng-style") === "u-icon-spin"
    );
    expect(spin).toHaveLength(1);
    expect(spin[0].textContent).toContain("@keyframes u-icon-spin");
  });

  it("registers its scoped box-model rule once, immediately before its CSS (GAP-098)", () => {
    TestBed.createComponent(TestHostComponent).detectChanges();
    TestBed.createComponent(TestHostComponent).detectChanges();
    const keys = Array.from(document.head.querySelectorAll("style")).map((s) =>
      s.getAttribute("data-u-ng-style")
    );
    expect(keys.filter((key) => key === "u-box-model:test-component")).toHaveLength(1);
    const rule = document.head.querySelector('style[data-u-ng-style="u-box-model:test-component"]');
    expect(rule?.textContent).toContain(":where(.u-test-component-root, .u-test-component-root *)");
    expect(rule?.textContent).toContain("box-sizing: border-box;");
  });

  it("adds the box-model rule before the component CSS (GAP-098)", () => {
    ngCoreStyleSheet.delete("test-component");
    ngCoreStyleSheet.delete("u-box-model:test-component");
    const addSpy = vi.spyOn(ngCoreStyleSheet, "add");
    TestBed.createComponent(TestHostComponent).detectChanges();
    const order = addSpy.mock.calls.map(([key]) => key);
    expect(order).toContain("u-box-model:test-component");
    expect(order).toContain("test-component");
    expect(order.indexOf("u-box-model:test-component")).toBe(order.indexOf("test-component") - 1);
    addSpy.mockRestore();
  });

  it("registers no box-model rule for a style module without scope roots (GAP-098 Amendment A1)", () => {
    @Component({
      standalone: true,
      selector: "u-test-rootless-component",
      template: "<div></div>",
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestRootlessComponent extends UBaseComponent {
      protected override readonly componentName = "test-rootless-component";
      protected override readonly styleModule = { css: ".u-x {}", classes: {} };
    }
    TestBed.createComponent(TestRootlessComponent).detectChanges();
    expect(ngCoreStyleSheet.has("u-box-model:test-rootless-component")).toBe(false);
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
    // GAP-098: the box-model rule follows the same per-document (SSR) path.
    expect(
      Array.from(doc.head.querySelectorAll("style")).some(
        (s) => s.getAttribute("data-u-ng-style") === "u-box-model:test-component"
      )
    ).toBe(true);
    expect(docSpy).not.toHaveBeenCalled();
    docSpy.mockRestore();
  });
});

@Component({
  standalone: true,
  selector: "u-test-component-tokens",
  template: "<div></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestTokensComponent extends UBaseComponent {
  protected override readonly componentName = "test-component";
  protected override readonly styleModule = {
    css: ".u-test-component-root { border-radius: dt('testcomponent.border.radius'); }",
    classes: {},
  };
}

describe("UBaseComponent theme changes (A1)", () => {
  const options = { prefix: "u", darkModeSelector: "system", cssLayer: false };
  const presetOf = (color: string, radius: string) => ({
    primitive: { blue: { 500: color } },
    semantic: { primary: { color: "{blue.500}" } },
    components: { testcomponent: { borderRadius: radius } },
  });

  beforeEach(() => {
    ngCoreStyleSheet.clear();
    document.head.querySelectorAll("style[data-u-ng-style]").forEach((el) => el.remove());
    Theme.setTheme({ preset: presetOf("#3b82f6", "6px"), options });
  });

  const injectedCss = () =>
    Array.from(document.head.querySelectorAll("style[data-u-ng-style]"))
      .map((el) => el.textContent ?? "")
      .join("\n");

  it("updates the variables of a mounted component after Theme.setTheme, without a second <style>", () => {
    TestBed.createComponent(TestHostComponent).detectChanges();
    expect(injectedCss()).toContain("--u-testcomponent-border-radius:6px");
    const count = document.head.querySelectorAll("style[data-u-ng-style]").length;

    Theme.setTheme({ preset: presetOf("#ef4444", "12px"), options });

    expect(injectedCss()).toContain("--u-blue-500:#ef4444");
    expect(injectedCss()).toContain("--u-testcomponent-border-radius:12px");
    expect(injectedCss()).not.toContain("#3b82f6");
    expect(document.head.querySelectorAll("style[data-u-ng-style]").length).toBe(count);
  });

  it("updates the variables of a mounted component after Theme.setPreset", () => {
    TestBed.createComponent(TestHostComponent).detectChanges();

    Theme.setPreset(presetOf("#22c55e", "2px"));

    expect(injectedCss()).toContain("--u-blue-500:#22c55e");
    expect(injectedCss()).toContain("--u-testcomponent-border-radius:2px");
    expect(injectedCss()).not.toContain("#3b82f6");
  });

  it("updates the variable names of a mounted component after Theme.setOptions", () => {
    TestBed.createComponent(TestTokensComponent).detectChanges();

    Theme.setOptions({ ...options, prefix: "x" });

    expect(injectedCss()).toContain("--x-testcomponent-border-radius:6px");
    expect(injectedCss()).not.toContain("--u-testcomponent-border-radius");
    expect(injectedCss()).toContain("var(--x-testcomponent-border-radius");
  });

  it("updates the variables written into an injected DOCUMENT", () => {
    const doc = document.implementation.createHTMLDocument("server");
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: doc },
        { provide: PLATFORM_ID, useValue: "server" },
      ],
    });
    TestBed.createComponent(TestHostComponent).detectChanges();

    Theme.setPreset(presetOf("#22c55e", "2px"));

    const css = Array.from(doc.head.querySelectorAll("style[data-u-ng-style]"))
      .map((el) => el.textContent ?? "")
      .join("\n");
    expect(css).toContain("--u-testcomponent-border-radius:2px");
  });
});
