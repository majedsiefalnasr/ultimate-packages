import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { USkeleton } from "./skeleton";

describe("USkeleton", () => {
  it("renders with default rectangle shape and wave animation classes", () => {
    @Component({ standalone: true, imports: [USkeleton], template: `<u-skeleton></u-skeleton>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton");
    expect(root).toBeTruthy();
    expect(root.classList.contains("u-skeleton-circle")).toBe(false);
    expect(root.classList.contains("u-skeleton-wave")).toBe(true);
  });

  it("applies circle shape class", () => {
    @Component({
      standalone: true,
      imports: [USkeleton],
      template: `<u-skeleton shape="circle"></u-skeleton>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton");
    expect(root.classList.contains("u-skeleton-circle")).toBe(true);
  });

  it("defaults to 100% width and 1rem height", () => {
    @Component({ standalone: true, imports: [USkeleton], template: `<u-skeleton></u-skeleton>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("1rem");
  });

  it("applies custom width/height", () => {
    @Component({
      standalone: true,
      imports: [USkeleton],
      template: `<u-skeleton width="10rem" height="2rem"></u-skeleton>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("10rem");
    expect(root.style.height).toBe("2rem");
  });

  it("size overrides width/height for a square/circle skeleton", () => {
    @Component({
      standalone: true,
      imports: [USkeleton],
      template: `<u-skeleton shape="circle" size="4rem"></u-skeleton>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton") as HTMLElement;
    expect(root.style.width).toBe("4rem");
    expect(root.style.height).toBe("4rem");
  });

  it("has no animation class when animation is none", () => {
    @Component({
      standalone: true,
      imports: [USkeleton],
      template: `<u-skeleton animation="none"></u-skeleton>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton");
    expect(root.classList.contains("u-skeleton-wave")).toBe(false);
  });

  it("is aria-hidden", () => {
    @Component({ standalone: true, imports: [USkeleton], template: `<u-skeleton></u-skeleton>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-skeleton");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });
});
