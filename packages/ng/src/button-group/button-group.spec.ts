import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UButton } from "../button";
import { UButtonGroup } from "./button-group";

describe("UButtonGroup", () => {
  it("renders its projected buttons", () => {
    @Component({
      standalone: true,
      imports: [UButtonGroup, UButton],
      template: `
        <u-button-group>
          <u-button label="One"></u-button>
          <u-button label="Two"></u-button>
          <u-button label="Three"></u-button>
        </u-button-group>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-button").length).toBe(3);
  });

  it("renders as a group role element with the root class", () => {
    @Component({
      standalone: true,
      imports: [UButtonGroup],
      template: `<u-button-group></u-button-group>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[role="group"]');
    expect(group).not.toBeNull();
    expect(group.classList.contains("u-button-group")).toBe(true);
  });
});
