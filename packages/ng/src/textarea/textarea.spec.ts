import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UFluid } from "../fluid/fluid";
import { UTextarea } from "./textarea";
import { textareaStyleModule } from "./textarea-style";

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
    expect((directive as unknown as Record<string, unknown>)["registerOnChange"]).toBeUndefined();
    expect((directive as unknown as Record<string, unknown>)["setDisabledState"]).toBeUndefined();
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
    const directive = fixture.debugElement
      .query((de) => de.name === "textarea")
      .injector.get(UTextarea);
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

  it("grows to scrollHeight when no max-height is set (the Prime NaN-comparison case)", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [autoResize]="true"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    Object.defineProperty(textarea, "scrollHeight", { value: 120, configurable: true });

    textarea.value = "line1\nline2\nline3";
    textarea.dispatchEvent(new Event("input"));

    expect(textarea.style.height).toBe("120px");
    expect(textarea.style.overflow).toBe("hidden");
  });

  it("caps the height at max-height and scrolls once the content is taller", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [autoResize]="true" style="max-height: 100px"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    Object.defineProperty(textarea, "scrollHeight", { value: 300, configurable: true });

    textarea.dispatchEvent(new Event("input"));

    expect(textarea.style.height).toBe("100px");
    expect(textarea.style.overflowY).toBe("scroll");
  });

  it("resizes when the form control value changes programmatically", () => {
    @Component({
      standalone: true,
      imports: [UTextarea, ReactiveFormsModule],
      template: `<textarea uTextarea [autoResize]="true" [formControl]="control"></textarea>`,
    })
    class HostComponent {
      control = new FormControl("one");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    Object.defineProperty(textarea, "scrollHeight", { value: 200, configurable: true });

    fixture.componentInstance.control.setValue("one\ntwo\nthree\nfour");

    expect(textarea.style.height).toBe("200px");
  });

  it("emits onResize with the triggering event", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea
        uTextarea
        [autoResize]="true"
        (onResize)="count = count + 1"
      ></textarea>`,
    })
    class HostComponent {
      count = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    const before = fixture.componentInstance.count;

    textarea.dispatchEvent(new Event("input"));

    expect(fixture.componentInstance.count).toBe(before + 1);
  });

  it("adds p-filled from the value, not from the variant", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector("textarea");
    expect(textarea.classList.contains("p-filled")).toBe(false);

    textarea.value = "hello";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(textarea.classList.contains("p-filled")).toBe(true);
    expect(textarea.classList.contains("p-variant-filled")).toBe(false);
  });

  it("uSize emits the shared sm/lg classes and the data-p size token", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea uSize="small"></textarea
        ><textarea uTextarea uSize="large"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const [small, large] = Array.from(
      fixture.nativeElement.querySelectorAll("textarea")
    ) as HTMLTextAreaElement[];
    expect(small.classList.contains("u-textarea-sm")).toBe(true);
    expect(small.getAttribute("data-p")).toContain("small");
    expect(large.classList.contains("u-textarea-lg")).toBe(true);
  });

  it("keeps the Angular-only .ng-invalid.ng-dirty rules in the style module", () => {
    expect(textareaStyleModule.css).toContain(".u-textarea.ng-invalid.ng-dirty {");
    expect(textareaStyleModule.css).toContain(".u-textarea.ng-invalid.ng-dirty::placeholder {");
  });

  it("pt root attributes reach the textarea", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [pt]="{ root: { 'data-test': 'x' } }"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("textarea").getAttribute("data-test")).toBe("x");
  });

  it("unstyled drops the Ultimate classes", () => {
    @Component({
      standalone: true,
      imports: [UTextarea],
      template: `<textarea uTextarea [unstyled]="true"></textarea>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("textarea").classList.contains("u-textarea")).toBe(
      false
    );
  });
});
