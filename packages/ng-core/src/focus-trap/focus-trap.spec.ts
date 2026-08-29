import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UFocusTrap } from "./focus-trap";

@Component({
  standalone: true,
  imports: [UFocusTrap],
  template: `
    <div uFocusTrap>
      <button id="first">First</button>
      <button id="last">Last</button>
    </div>
  `,
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [UFocusTrap],
  template: `
    <div uFocusTrap [uFocusTrapDisabled]="disabled">
      <button id="first">First</button>
      <button id="last">Last</button>
    </div>
  `,
})
class DisabledHostComponent {
  disabled = false;
}

describe("UFocusTrap", () => {
  it("wraps focus from the last focusable element back to the first on Tab", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const last = fixture.nativeElement.querySelector("#last") as HTMLElement;
    const first = fixture.nativeElement.querySelector("#first") as HTMLElement;
    last.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    last.dispatchEvent(event);
    expect(document.activeElement).toBe(first);
  });

  it("does nothing when uFocusTrapDisabled is true", () => {
    // Note: `uFocusTrapDisabled` is UFocusTrap's own input (declared on the
    // directive, not on the host component), so it cannot be set via
    // `fixture.componentRef.setInput()` on TestHostComponent — that API
    // only sets inputs declared on the component type the fixture was
    // created for. A dedicated host with a template `[uFocusTrapDisabled]`
    // binding is the correct way to drive a directive input, matching the
    // `By.directive` / template-binding pattern already established in
    // base-editable-holder.spec.ts.
    const fixture = TestBed.createComponent(DisabledHostComponent);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    const last = fixture.nativeElement.querySelector("#last") as HTMLElement;
    last.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    last.dispatchEvent(event);
    expect(document.activeElement).toBe(last);
  });
});
