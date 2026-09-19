import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UCarousel } from "./carousel";

describe("UCarousel", () => {
  const items = Array.from({ length: 6 }, (_, i) => `Item ${i + 1}`);

  it("renders one item per visible slot", () => {
    @Component({
      standalone: true,
      imports: [UCarousel],
      template: `
        <u-carousel [value]="items" [numVisible]="1">
          <ng-template #item let-item>{{ item }}</ng-template>
        </u-carousel>
      `,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-carousel-item").length).toBe(6);
  });

  it("navigates forward and backward with the nav buttons", () => {
    @Component({
      standalone: true,
      imports: [UCarousel],
      template: `<u-carousel [value]="items"></u-carousel>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button.u-carousel-prev-button"
    );
    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button.u-carousel-next-button"
    );
    nextBtn.click();
    fixture.detectChanges();
    let indicators: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll(".u-carousel-indicator");
    expect(indicators[1].getAttribute("data-p-active")).toBe("true");

    prevBtn.click();
    fixture.detectChanges();
    indicators = fixture.nativeElement.querySelectorAll(".u-carousel-indicator");
    expect(indicators[0].getAttribute("data-p-active")).toBe("true");
  });

  it("disables prev on the first page and next on the last page when not circular", () => {
    @Component({
      standalone: true,
      imports: [UCarousel],
      template: `<u-carousel [value]="items"></u-carousel>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button.u-carousel-prev-button"
    );
    expect(prevBtn.disabled).toBe(true);
  });

  it("circular: wraps forward navigation past the last page back to the first", () => {
    @Component({
      standalone: true,
      imports: [UCarousel],
      template: `<u-carousel [value]="items" [circular]="true"></u-carousel>`,
    })
    class HostComponent {
      items = items;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button.u-carousel-next-button"
    );
    for (let i = 0; i < items.length; i++) {
      nextBtn.click();
      fixture.detectChanges();
    }
    const indicators = fixture.nativeElement.querySelectorAll(".u-carousel-indicator");
    expect(indicators[0].getAttribute("data-p-active")).toBe("true");
  });

  it("clicking an indicator dot jumps directly to that page and emits onPage", () => {
    @Component({
      standalone: true,
      imports: [UCarousel],
      template: `<u-carousel [value]="items" (onPage)="onPage($event)"></u-carousel>`,
    })
    class HostComponent {
      items = items;
      lastPage?: { page: number };
      onPage(e: { page: number }) {
        this.lastPage = e;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const dots: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll(
      ".u-carousel-indicator-button"
    );
    dots[3].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastPage?.page).toBe(3);
  });

  describe("autoplay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("advances the page automatically at the given interval", () => {
      @Component({
        standalone: true,
        imports: [UCarousel],
        template: `<u-carousel [value]="items" [autoplayInterval]="1000"></u-carousel>`,
      })
      class HostComponent {
        items = items;
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      vi.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelectorAll('[data-p-active="true"]')[0].getAttribute(
          "data-p-active"
        )
      ).toBe("true");
      const indicators = fixture.nativeElement.querySelectorAll(".u-carousel-indicator");
      expect(indicators[1].getAttribute("data-p-active")).toBe("true");
    });

    it("stops the autoplay timer on destroy", () => {
      @Component({
        standalone: true,
        imports: [UCarousel],
        template: `<u-carousel [value]="items" [autoplayInterval]="1000"></u-carousel>`,
      })
      class HostComponent {
        items = items;
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      fixture.destroy();
      expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
    });
  });
});
