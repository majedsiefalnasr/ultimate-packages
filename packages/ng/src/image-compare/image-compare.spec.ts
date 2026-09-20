import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UImageCompare } from "./image-compare";

describe("UImageCompare", () => {
  it("renders left and right projected content", () => {
    @Component({
      standalone: true,
      imports: [UImageCompare],
      template: `
        <u-image-compare>
          <img left src="left.png" alt="left" />
          <img right src="right.png" alt="right" />
        </u-image-compare>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const images = fixture.nativeElement.querySelectorAll("img");
    expect(images.length).toBe(2);
    expect(images[0].getAttribute("alt")).toBe("left");
    expect(images[1].getAttribute("alt")).toBe("right");
  });

  it("renders a range slider defaulting to 50", () => {
    @Component({
      standalone: true,
      imports: [UImageCompare],
      template: `<u-image-compare></u-image-compare>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const slider = fixture.nativeElement.querySelector(
      "input[type='range']"
    ) as HTMLInputElement;
    expect(slider).toBeTruthy();
    expect(slider.value).toBe("50");
  });

  it("updates the right wrapper's clip-path when the slider moves", () => {
    @Component({
      standalone: true,
      imports: [UImageCompare],
      template: `
        <u-image-compare>
          <img left src="left.png" />
          <img right src="right.png" />
        </u-image-compare>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const slider = fixture.nativeElement.querySelector(
      "input[type='range']"
    ) as HTMLInputElement;
    slider.value = "30";
    slider.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    const rightWrapper = fixture.nativeElement.querySelectorAll("span")[0] as HTMLElement;
    expect(rightWrapper.style.clipPath).toBe("polygon(0 0, 30% 0, 30% 100%, 0 100%)");
  });

  it("sets aria attributes from inputs", () => {
    @Component({
      standalone: true,
      imports: [UImageCompare],
      template: `<u-image-compare [ariaLabel]="'Compare'" [tabindex]="0"></u-image-compare>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-image-compare") as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Compare");
    expect(root.getAttribute("tabindex")).toBe("0");
  });
});
