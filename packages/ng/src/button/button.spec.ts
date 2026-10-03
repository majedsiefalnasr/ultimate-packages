import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { UButton } from "./button";

describe("UButton", () => {
  beforeAll(() => {
    // Matches packages/themes/test/cross-framework-consistency.test.ts's own
    // beforeAll — applyUltimateTheme() must run before any UButton renders
    // so its registration observes a configured Theme, not the module's
    // untouched default. See the note in the last test below: with today's
    // defaults this call happens to be a no-op (prefix "u" is already the
    // uix-styled default), but calling it here keeps the test's intent
    // structurally true rather than incidentally true.
    applyUltimateTheme();
  });

  it("renders the label input as visible text", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Save");
  });

  it("emits onClick when clicked and not disabled", () => {
    const fixture = TestBed.createComponent(UButton);
    let emitted: MouseEvent | undefined;
    fixture.componentInstance.onClick.subscribe((e: MouseEvent) => (emitted = e));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    expect(emitted).toBeDefined();
  });

  it("does not emit onClick when disabled", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("disabled", true);
    let emitted = false;
    fixture.componentInstance.onClick.subscribe(() => (emitted = true));
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    expect(emitted).toBe(false);
  });

  it("renders u-button-loading class and a spinner icon when loading is true", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("button").classList.contains("u-button-loading")
    ).toBe(true);
    expect(fixture.nativeElement.querySelector("u-spinner-icon")).not.toBeNull();
  });

  it("applies the disabled attribute to the native <button> when disabled input is true", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button").disabled).toBe(true);
  });

  it("renders the icon input's value as a class on the icon span", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("icon", "pi pi-check");
    fixture.detectChanges();
    const iconSpan = fixture.nativeElement.querySelector("span.u-button-icon");
    expect(iconSpan).not.toBeNull();
    expect(iconSpan.classList.contains("pi")).toBe(true);
    expect(iconSpan.classList.contains("pi-check")).toBe(true);
    expect(iconSpan.classList.contains("u-button-icon")).toBe(true);
  });

  it("does not render an icon span when icon is unset", () => {
    // uRipple (applied to the native <button>) creates its own <span> for
    // the ink effect, so this asserts no *icon-classed* span exists, not
    // "no span at all" — a bare span-count check would be a false positive
    // against Ripple's unrelated internal DOM.
    const fixture = TestBed.createComponent(UButton);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("span.u-button-icon")).toBeNull();
  });

  it("has aria-label reflecting the label input when no explicit ariaLabel is set", () => {
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    expect(button.getAttribute("aria-label") ?? fixture.nativeElement.textContent).toContain(
      "Save"
    );
  });

  it("resolves the same button.primary.background token as the React/Vue cross-framework consistency test (packages/themes/test/cross-framework-consistency.test.ts)", () => {
    // Part of the Blueprint Phase 5 exit criterion (spec §10, "validate
    // cross-framework theme consistency"). React's and Vue's halves of this
    // guarantee are asserted together in packages/themes/test/
    // cross-framework-consistency.test.ts (Angular's UButton can't run in
    // that file — it requires TestBed/ng test's own environment, a
    // different vitest major version and CLI entry point than the plain
    // `vitest run` the other two frameworks and @ultimate/themes use). This
    // test proves the Angular third: applyUltimateTheme() (called once in
    // this file's beforeAll, above) configures the same uix-styled Theme
    // singleton every *-core package's StyleSheet reads from, so ng-core's
    // registered CSS for the real UButton must resolve
    // button.primary.background to the identical var(...) text.
    const fixture = TestBed.createComponent(UButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.detectChanges();

    // ngCoreStyleSheet's <style> elements carry the Angular-only
    // `data-u-ng-style` key attribute, but the registered element is
    // located by its known, unique `.u-button`
    // selector — matching the DOM-lookup approach used on the React/Vue
    // side of this same assertion.
    const styleEl = Array.from(document.head.querySelectorAll("style")).find((el) =>
      (el.textContent ?? "").includes(".u-button {")
    );
    expect(styleEl).not.toBeUndefined();
    const ngCss = styleEl!.textContent ?? "";

    expect(ngCss).toContain("var(--u-button-primary-background");
    expect(ngCss).not.toContain("dt(");
  });
});
