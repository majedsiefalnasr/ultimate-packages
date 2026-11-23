import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./avatar-group";
import { avatarGroupStyleModule } from "./avatar-group-style";

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

  it("overlaps with logical, tokenized, size-specific offsets", () => {
    const { css } = avatarGroupStyleModule;
    expect(css).toContain("margin-inline-start: dt('avatar.group.offset')");
    expect(css).toContain("margin-inline-start: dt('avatar.lg.group.offset')");
    expect(css).toContain("margin-inline-start: dt('avatar.xl.group.offset')");
    expect(css).not.toContain("margin-left");
  });

  describe("pass-through and unstyled", () => {
    @Component({
      standalone: true,
      imports: [UAvatarGroup, UAvatar],
      template: `<u-avatar-group [pt]="pt" [unstyled]="unstyled()">
        <u-avatar label="A" />
      </u-avatar-group>`,
    })
    class PtHostComponent {
      unstyled = signal(false);
      pt = { host: { "data-host": "h" }, root: { id: "group-root", class: "extra-root" } };
    }

    function render() {
      const fixture = TestBed.createComponent(PtHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();
      return fixture;
    }

    it("applies host and root pt attributes and keeps the root class", () => {
      const host = render().nativeElement.querySelector("u-avatar-group") as HTMLElement;
      expect(host.getAttribute("data-host")).toBe("h");
      expect(host.id).toBe("group-root");
      expect(host.classList.contains("u-avatar-group")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("avatargroup");
    });

    it("unstyled drops the Ultimate classes", () => {
      const fixture = render();
      fixture.componentInstance.unstyled.set(true);
      fixture.detectChanges();
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector("u-avatar-group") as HTMLElement;
      expect(host.classList.contains("u-avatar-group")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });
  });
});
