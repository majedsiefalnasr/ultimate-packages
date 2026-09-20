import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, expect, it, vi } from "vitest";
import { UGalleria } from "./galleria";

@Component({
  standalone: true,
  imports: [UGalleria],
  template: `
    <u-galleria
      [value]="items"
      [circular]="circular"
      [autoplayInterval]="autoplayInterval"
      [fullScreen]="fullScreen"
      (activeIndexChange)="last = $event"
    >
      <ng-template #item let-item>
        <img class="active-item" [src]="item" />
      </ng-template>
    </u-galleria>
  `,
})
class HostComponent {
  items = ["a.png", "b.png", "c.png"];
  circular = false;
  autoplayInterval = 0;
  fullScreen = false;
  last: number | undefined;
}

function createHost() {
  return TestBed.createComponent(HostComponent);
}

describe("UGalleria", () => {
  it("renders the active item via the item template", () => {
    const fixture = createHost();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector(".active-item") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("a.png");
  });

  it("renders a thumbnail per item", () => {
    const fixture = createHost();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-galleria-thumbnail-item").length).toBe(3);
  });

  it("navigates forward and backward via the nav buttons", () => {
    const fixture = createHost();
    fixture.detectChanges();
    const nextBtn = fixture.nativeElement.querySelector(".u-galleria-next-button") as HTMLElement;
    nextBtn.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("b.png");

    const prevBtn = fixture.nativeElement.querySelector(".u-galleria-prev-button") as HTMLElement;
    prevBtn.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("a.png");
  });

  it("disables prev at the first item and next at the last item when not circular", () => {
    const fixture = createHost();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".u-galleria-prev-button") as HTMLButtonElement).disabled
    ).toBe(true);

    const nextBtn = fixture.nativeElement.querySelector(".u-galleria-next-button") as HTMLElement;
    nextBtn.click();
    nextBtn.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".u-galleria-next-button") as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it("wraps around when circular", () => {
    const fixture = createHost();
    fixture.componentInstance.circular = true;
    fixture.detectChanges();
    const prevBtn = fixture.nativeElement.querySelector(".u-galleria-prev-button") as HTMLElement;
    prevBtn.click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("c.png");
  });

  it("jumps to an item when its thumbnail is clicked", () => {
    const fixture = createHost();
    fixture.detectChanges();
    const thumbnails = fixture.nativeElement.querySelectorAll(".u-galleria-thumbnail-item");
    (thumbnails[2] as HTMLElement).click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("c.png");
  });

  it("emits activeIndexChange when navigating", () => {
    const fixture = createHost();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector(".u-galleria-next-button") as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.last).toBe(1);
  });

  it("autoplays through items on an interval", () => {
    vi.useFakeTimers();
    try {
      const fixture = createHost();
      fixture.componentInstance.autoplayInterval = 1000;
      fixture.detectChanges();
      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(
        (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute(
          "src"
        )
      ).toBe("b.png");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not render a fullscreen mask by default", () => {
    const fixture = createHost();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-galleria-mask")).toBeFalsy();
  });

  it("opens and closes the fullscreen overlay when fullScreen is enabled", async () => {
    const fixture = createHost();
    fixture.componentInstance.fullScreen = true;
    fixture.detectChanges();
    const galleria = fixture.debugElement.query(By.directive(UGalleria))
      .componentInstance as UGalleria;
    galleria.openFullScreen();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector(".u-galleria-mask")).toBeTruthy();

    const closeBtn = document.querySelector(".u-galleria-close-button") as HTMLElement;
    closeBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();
  });
});
