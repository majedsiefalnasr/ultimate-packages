import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UAutoFocus } from "./auto-focus";

@Component({
  standalone: true,
  imports: [UAutoFocus],
  template: `<input type="text" [uAutoFocus]="true" />`,
})
class TestHostComponent {}

describe("UAutoFocus", () => {
  it("gives DOM focus to an element with [uAutoFocus]=true after detectChanges", async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    // UAutoFocus defers its focus() call via a raw setTimeout (matching
    // upstream's own AfterContentChecked/AfterViewChecked timing) — in this
    // project's zoneless setup, `whenStable()` does not track macrotasks, so
    // a real setTimeout(0) flush is required instead.
    await new Promise((resolve) => setTimeout(resolve, 0));
    const input = fixture.nativeElement.querySelector("input");
    expect(document.activeElement).toBe(input);
  });
});
