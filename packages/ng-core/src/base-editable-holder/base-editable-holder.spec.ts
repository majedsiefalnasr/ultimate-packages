import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UBaseEditableHolder } from "./base-editable-holder";

@Component({
  standalone: true,
  selector: "u-test-editable",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestEditableComponent extends UBaseEditableHolder {
  protected override readonly componentName = "test-editable";
  protected override readonly styleModule = { css: "", classes: {} };
  value: unknown;
  override writeValue(value: unknown): void {
    this.value = value;
  }
}

describe("UBaseEditableHolder", () => {
  it("calls registerOnChange callback when onModelChange is invoked", () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    let received: unknown;
    instance.registerOnChange((v) => (received = v));
    (instance as unknown as { onModelChange: (v: unknown) => void }).onModelChange("new-value");
    expect(received).toBe("new-value");
  });

  it("setDisabledState writes to the internal _disabled signal, reflected via $disabled", () => {
    // disabled() itself is a read-only InputSignal (Angular's input() has no
    // .set()) — it only reflects a template [disabled] binding. CVA's
    // setDisabledState writes to the separate _disabled signal instead;
    // $disabled = computed(() => disabled() || _disabled()) is the value
    // components actually read. Matches PrimeNG's own confirmed
    // baseeditableholder.ts split-signal pattern exactly.
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    expect(instance.$disabled()).toBe(false);
    instance.setDisabledState(true);
    fixture.detectChanges();
    expect(instance.$disabled()).toBe(true);
  });

  it("$disabled is true when the disabled input is bound, even if setDisabledState was never called", () => {
    @Component({
      standalone: true,
      imports: [TestEditableComponent],
      template: `<u-test-editable [disabled]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const editable = fixture.debugElement.query(By.directive(TestEditableComponent))
      .componentInstance as TestEditableComponent;
    expect(editable.$disabled()).toBe(true);
  });

  it("integrates with a real FormControl via [formControl] binding", () => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule] });
    const control = new FormControl("initial");
    const fixture = TestBed.createComponent(TestEditableComponent);
    fixture.componentInstance.writeValue(control.value);
    expect(fixture.componentInstance.value).toBe("initial");
  });

  it("inherits modelValue/$filled/writeModelValue from UModelHolder", () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    expect(instance.$filled()).toBe(false);
    instance.writeModelValue("x");
    expect(instance.modelValue()).toBe("x");
    expect(instance.$filled()).toBe(true);
  });
});
