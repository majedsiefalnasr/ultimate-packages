import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UModelHolder } from "./model-holder";

@Component({
  standalone: true,
  selector: "u-test-model-holder",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestModelHolderComponent extends UModelHolder {
  protected override readonly componentName = "test-model-holder";
  protected override readonly styleModule = { css: "", classes: {} };
}

describe("UModelHolder", () => {
  it("writeModelValue sets modelValue, readable via the signal", () => {
    const fixture = TestBed.createComponent(TestModelHolderComponent);
    const instance = fixture.componentInstance;
    expect(instance.modelValue()).toBeUndefined();
    instance.writeModelValue("hello");
    expect(instance.modelValue()).toBe("hello");
  });

  it("$filled is false when modelValue is undefined, empty string, or empty array; true otherwise", () => {
    const fixture = TestBed.createComponent(TestModelHolderComponent);
    const instance = fixture.componentInstance;
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue("");
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue([]);
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue("hello");
    expect(instance.$filled()).toBe(true);

    instance.writeModelValue(0);
    expect(instance.$filled()).toBe(true);
  });
});
