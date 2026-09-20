import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./avatar-group";

describe("UAvatarGroup", () => {
  it("renders its projected content", () => {
    @Component({
      standalone: true,
      imports: [UAvatarGroup, UAvatar],
      template: `
        <u-avatar-group>
          <u-avatar [label]="'A'"></u-avatar>
          <u-avatar [label]="'B'"></u-avatar>
          <u-avatar [label]="'C'"></u-avatar>
        </u-avatar-group>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-avatar").length).toBe(3);
  });

  it("applies the root class for overlap layout styling", () => {
    @Component({
      standalone: true,
      imports: [UAvatarGroup],
      template: `<u-avatar-group></u-avatar-group>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-avatar-group")).not.toBeNull();
  });
});
