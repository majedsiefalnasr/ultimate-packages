import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTimeline } from "./timeline";

describe("UTimeline", () => {
  it("renders one event row per value entry", () => {
    @Component({
      standalone: true,
      imports: [UTimeline],
      template: `<u-timeline [value]="events">
        <ng-template #content let-event>{{ event }}</ng-template>
      </u-timeline>`,
    })
    class HostComponent {
      events = ["Ordered", "Shipped", "Delivered"];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll(".u-timeline-event");
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain("Ordered");
    expect(rows[2].textContent).toContain("Delivered");
  });

  it("renders a connector between events but not after the last one", () => {
    @Component({
      standalone: true,
      imports: [UTimeline],
      template: `<u-timeline [value]="events"></u-timeline>`,
    })
    class HostComponent {
      events = ["A", "B"];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const connectors = fixture.nativeElement.querySelectorAll(".u-timeline-event-connector");
    expect(connectors.length).toBe(1);
  });

  it("applies horizontal layout class", () => {
    @Component({
      standalone: true,
      imports: [UTimeline],
      template: `<u-timeline [value]="events" layout="horizontal"></u-timeline>`,
    })
    class HostComponent {
      events = ["A"];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".u-timeline")?.classList.contains("u-timeline-horizontal")
    ).toBe(true);
  });

  it("renders a default marker when no marker template is provided", () => {
    @Component({
      standalone: true,
      imports: [UTimeline],
      template: `<u-timeline [value]="events"></u-timeline>`,
    })
    class HostComponent {
      events = ["A"];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-timeline-event-marker")).toBeTruthy();
  });

  it("renders a custom marker template when provided", () => {
    @Component({
      standalone: true,
      imports: [UTimeline],
      template: `<u-timeline [value]="events">
        <ng-template #marker let-event><span class="custom-marker">{{ event }}</span></ng-template>
      </u-timeline>`,
    })
    class HostComponent {
      events = ["A"];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".custom-marker")?.textContent).toBe("A");
    expect(fixture.nativeElement.querySelector(".u-timeline-event-marker")).toBeFalsy();
  });
});
