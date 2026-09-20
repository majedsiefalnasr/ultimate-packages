import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UFluid } from "../fluid/fluid";
import { UTextarea } from "./textarea";

describe("UTextarea", () => {
  it("applies to a native textarea via the [uTextarea] selector", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector("textarea");
    expect(textarea).not.toBeNull();
    expect(textarea.classList.contains("u-textarea")).toBe(true);
  });

  it("updates modelValue/$filled when the textarea's value changes", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea #ref="uTextarea"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    const directive = fixture.debugElement.children[0].injector.get(UTextarea);
    expect(directive.$filled()).toBe(false);

    textarea.value = "hello world";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(directive.modelValue()).toBe("hello world");
    expect(directive.$filled()).toBe(true);
  });

  it("does not implement ControlValueAccessor — no writeValue/registerOnChange/registerOnTouched/setDisabledState", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.children[0].injector.get(UTextarea);
    expect((directive as unknown as Record<string, unknown>)["writeValue"]).toBeUndefined();
    expect(
      (directive as unknown as Record<string, unknown>)["registerOnChange"],
    ).toBeUndefined();
    expect(
      (directive as unknown as Record<string, unknown>)["setDisabledState"],
    ).toBeUndefined();
  });

  it("reflects the invalid input as a p-invalid class", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [invalid]="true"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector("textarea");
    expect(textarea.classList.contains("p-invalid")).toBe(true);
  });

  it("reflects the fluid input as a u-textarea-fluid class and hasFluid getter", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [fluid]="true" #ref="uTextarea"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector("textarea");
    const directive = fixture.debugElement.children[0].injector.get(UTextarea);
    expect(textarea.classList.contains("u-textarea-fluid")).toBe(true);
    expect(directive.hasFluid).toBe(true);
  });

  it("detects an ancestor u-fluid wrapper and reflects hasFluid even without an explicit fluid input", () => {
    @Component({
      standalone: true,
      imports: [UTextarea, UFluid],
      template: `<u-fluid><textarea uTextarea #ref="uTextarea"></textarea></u-fluid>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query((de) => de.name === "textarea").injector.get(
      UTextarea,
    );
    expect(directive.hasFluid).toBe(true);
  });

  it("resizes the textarea height on input when autoResize is set", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [autoResize]="true"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    // Real `Textarea.resize()` compares the new height against a CSS
    // `max-height` (an author-controlled stylesheet concern) to decide
    // whether to cap the height and switch to a scrollbar — matching real
    // source's own branch exactly (see textarea.ts's own doc comment).
    // Without an author-set max-height (as here), scrollHeight always wins.
    textarea.style.maxHeight = "500px";
    Object.defineProperty(textarea, "scrollHeight", { value: 120, configurable: true });

    textarea.value = "line1\nline2\nline3";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(textarea.style.height).toBe("120px");
  });

  it("does not force a height style when autoResize is not set", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    expect(textarea.style.height).toBe("");
  });

  it("integrates with reactive forms (formControl) — DefaultValueAccessor drives the value, UTextarea syncs modelValue read-only", () => {
    @Component({
      standalone: true,
      imports: [UTextarea, ReactiveFormsModule],
      template: `<textarea uTextarea [formControl]="control" #ref="uTextarea"></textarea>`,
    })
    class HostComponent {
      control = new FormControl("initial");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    const directive = fixture.debugElement.children[0].injector.get(UTextarea);

    expect(textarea.value).toBe("initial");
    expect(directive.modelValue()).toBe("initial");

    fixture.componentInstance.control.setValue("updated");
    fixture.detectChanges();
    fixture.detectChanges();
    expect(textarea.value).toBe("updated");
    expect(directive.modelValue()).toBe("updated");
  });

  it("integrates with template-driven forms (ngModel) — DefaultValueAccessor drives the value, UTextarea syncs modelValue read-only", async () => {
    @Component({
      standalone: true,
      imports: [UTextarea, FormsModule],
      template: `<textarea uTextarea [(ngModel)]="value" #ref="uTextarea"></textarea>`,
    })
    class HostComponent {
      value = "start";
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    const directive = fixture.debugElement.children[0].injector.get(UTextarea);

    expect(textarea.value).toBe("start");
    expect(directive.modelValue()).toBe("start");

    textarea.value = "changed";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("changed");
    expect(directive.modelValue()).toBe("changed");
  });
});
