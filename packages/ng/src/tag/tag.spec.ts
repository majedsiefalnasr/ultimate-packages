import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTag } from "./tag";

describe("UTag", () => {
  it("renders projected content", () => {
    @Component({ standalone: true, imports: [UTag], template: `<u-tag>New</u-tag>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag-label")?.textContent?.trim()).toBe("New");
  });

  it("falls back to the value input when no content is projected", () => {
    @Component({ standalone: true, imports: [UTag], template: `<u-tag [value]="'Hot'"></u-tag>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag-label")?.textContent?.trim()).toBe("Hot");
  });

  it("applies severity class", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag severity="danger">Alert</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag")?.classList.contains("u-tag-danger")).toBe(
      true
    );
  });

  it("applies rounded class", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag [rounded]="true">Round</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".u-tag")?.classList.contains("u-tag-rounded")
    ).toBe(true);
  });

  it("renders an icon when provided", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag icon="pi pi-check">Done</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-check")).toBeTruthy();
  });
});
