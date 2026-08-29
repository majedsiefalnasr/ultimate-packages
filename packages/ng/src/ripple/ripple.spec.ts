import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { URipple } from "./ripple";

@Component({
  standalone: true,
  imports: [URipple],
  template: `<button uRipple>Click</button>`,
})
class TestHostComponent {}

describe("URipple", () => {
  it("adds a ripple span element on mousedown", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.dispatchEvent(new MouseEvent("mousedown", { clientX: 5, clientY: 5, bubbles: true }));
    fixture.detectChanges();
    expect(button.querySelector(".u-ink")).not.toBeNull();
  });
});
