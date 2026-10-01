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

describe("keyboard navigation, Escape, role=region (Spec §5.1, GAP-050)", () => {
  interface Item {
    src: string;
  }

  it("has role=region on the root element", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role=region]")).toBeTruthy();
  });

  it("ArrowRight advances to the next item", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }]);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("[data-u-galleria-content]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);
  });

  it("ArrowLeft goes to the previous item", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }]);
    fixture.componentRef.setInput("activeIndex", 1);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector("[data-u-galleria-content]")
      .dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it("Home jumps to the first item, End jumps to the last", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }, { src: "b.png" }, { src: "c.png" }]);
    fixture.componentRef.setInput("activeIndex", 1);
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector("[data-u-galleria-content]");
    content.dispatchEvent(new KeyboardEvent("keydown", { code: "End" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    content.dispatchEvent(new KeyboardEvent("keydown", { code: "Home" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });

  it("Escape closes fullscreen mode when active", async () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.componentRef.setInput("fullScreen", true);
    fixture.detectChanges();
    fixture.componentInstance.openFullScreen();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.fullScreenActive()).toBe(true);
    document
      .querySelector("[data-u-galleria-content]")!
      .dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.fullScreenActive()).toBe(false);
  });

  it("Escape does nothing when fullscreen mode is not active", () => {
    const fixture = TestBed.createComponent(UGalleria<Item>);
    fixture.componentRef.setInput("value", [{ src: "a.png" }]);
    fixture.detectChanges();
    expect(() =>
      fixture.nativeElement
        .querySelector("[data-u-galleria-content]")
        .dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }))
    ).not.toThrow();
    expect(fixture.componentInstance.fullScreenActive()).toBe(false);
  });

  it("does not navigate when ArrowLeft/ArrowRight are pressed while a focused input inside a custom item template has focus", () => {
    @Component({
      standalone: true,
      imports: [UGalleria],
      template: `
        <u-galleria [value]="items">
          <ng-template #item let-item>
            <input class="item-input" [value]="item.src" />
          </ng-template>
        </u-galleria>
      `,
    })
    class InputHostComponent {
      items = [{ src: "a.png" }, { src: "b.png" }];
    }

    const fixture = TestBed.createComponent(InputHostComponent);
    fixture.detectChanges();
    const galleria = fixture.debugElement.query(By.directive(UGalleria))
      .componentInstance as UGalleria<Item>;
    const input = fixture.nativeElement.querySelector(".item-input") as HTMLInputElement;
    input.focus();
    input.value = "typed";
    input.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(galleria.activeIndex()).toBe(0);
    expect(input.value).toBe("typed");
  });
});

describe("thumbnail keyboard activation (Spec §5.1, GAP-050 Task 7)", () => {
  function createFixture() {
    const fixture = createHost();
    fixture.detectChanges();
    return fixture;
  }

  it("makes the thumbnail focusable", () => {
    const fixture = createFixture();
    const thumbnail = fixture.nativeElement.querySelector(
      ".u-galleria-thumbnail-item"
    ) as HTMLElement;
    expect(thumbnail.tabIndex).toBe(0);
  });

  it("Enter on a focused thumbnail activates it the same as a click", () => {
    const fixture = createFixture();
    const thumbnails = fixture.nativeElement.querySelectorAll(".u-galleria-thumbnail-item");
    (thumbnails[2] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { code: "Enter", bubbles: true })
    );
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("c.png");
  });

  it("Space on a focused thumbnail activates it the same as a click", () => {
    const fixture = createFixture();
    const thumbnails = fixture.nativeElement.querySelectorAll(".u-galleria-thumbnail-item");
    (thumbnails[1] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { code: "Space", bubbles: true })
    );
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("b.png");
  });

  it("existing click behavior on the thumbnail is unchanged", () => {
    const fixture = createFixture();
    const thumbnails = fixture.nativeElement.querySelectorAll(".u-galleria-thumbnail-item");
    (thumbnails[2] as HTMLElement).click();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement.querySelector(".active-item") as HTMLImageElement).getAttribute("src")
    ).toBe("c.png");
  });
});
