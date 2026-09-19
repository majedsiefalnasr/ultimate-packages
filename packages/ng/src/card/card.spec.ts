import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UCard } from "./card";

describe("UCard", () => {
  it("renders default-slot content", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `<u-card><div class="card-content">Custom Card Content</div></u-card>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".card-content")?.textContent).toBe(
      "Custom Card Content"
    );
  });

  it("renders header and subheader text when provided", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `<u-card [header]="'Title'" [subheader]="'Subtitle'"></u-card>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-card-title")?.textContent).toBe("Title");
    expect(fixture.nativeElement.querySelector(".u-card-subtitle")?.textContent).toBe("Subtitle");
  });

  it("does not render title/subtitle divs when header/subheader are unset", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `<u-card></u-card>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-card-title")).toBeNull();
    expect(fixture.nativeElement.querySelector(".u-card-subtitle")).toBeNull();
  });

  it("projects named header/footer slot content", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `
        <u-card>
          <div card-header class="custom-header">Custom Header</div>
          <div card-footer class="custom-footer">Custom Footer</div>
        </u-card>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".custom-header")?.textContent).toBe(
      "Custom Header"
    );
    expect(fixture.nativeElement.querySelector(".custom-footer")?.textContent).toBe(
      "Custom Footer"
    );
  });

  it("applies the root card class to the host", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `<u-card></u-card>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("u-card");
    expect(host.classList.contains("u-card")).toBe(true);
  });
});
