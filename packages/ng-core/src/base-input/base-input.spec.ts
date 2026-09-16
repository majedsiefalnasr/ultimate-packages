import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBaseInput } from "./base-input";

@Component({
  standalone: true,
  selector: "u-test-base-input",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestBaseInputComponent extends UBaseInput {
  protected override readonly componentName = "test-base-input";
  protected override readonly styleModule = { css: "", classes: {} };
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}

describe("UBaseInput", () => {
  it("exposes fluid/variant/size/pattern/min/max/step/minlength/maxlength as inputs, all undefined by default", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    const instance = fixture.componentInstance;
    expect(instance.fluid()).toBeUndefined();
    expect(instance.variant()).toBeUndefined();
    expect(instance.size()).toBeUndefined();
    expect(instance.inputSize()).toBeUndefined();
    expect(instance.pattern()).toBeUndefined();
    expect(instance.min()).toBeUndefined();
    expect(instance.max()).toBeUndefined();
    expect(instance.step()).toBeUndefined();
    expect(instance.minlength()).toBeUndefined();
    expect(instance.maxlength()).toBeUndefined();
  });

  it("$variant reflects the variant input directly (config fallback deliberately omitted, per UInputText's own precedent)", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    fixture.componentRef.setInput("variant", "filled");
    fixture.detectChanges();
    expect(fixture.componentInstance.$variant()).toBe("filled");
  });

  it("hasFluid is false with no ancestor UFluid and no fluid input", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasFluid).toBe(false);
  });
});
