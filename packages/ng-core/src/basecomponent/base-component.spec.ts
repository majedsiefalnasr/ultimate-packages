import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { UBaseComponent } from "./base-component";
import { ngCoreStyleSheet } from "./style-sheet";

@Component({
  standalone: true,
  selector: "u-test-component",
  template: '<div [class]="cx(\'root\')"></div>',
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
    // packages/uix-styled/src/stylesheet/index.ts) — asserting it was
    // invoked exactly once, even though two component instances ran
    // ngOnInit, proves ngOnInit checks has() before calling add() rather
    // than unconditionally re-registering.
    expect(addSpy).toHaveBeenCalledTimes(1);
    expect(addSpy).toHaveBeenCalledWith(
      "test-component",
      ".u-test-component-root { color: red; }",
    );
    expect(ngCoreStyleSheet.has("test-component")).toBe(true);
    expect(ngCoreStyleSheet.getStyles().size).toBe(1);

    addSpy.mockRestore();
  });
});
