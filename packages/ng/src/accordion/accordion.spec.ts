import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UAccordion, type UAccordionPanel } from "./accordion";

describe("UAccordion", () => {
  const panels: UAccordionPanel[] = [
    { value: "a", header: "Tab 1" },
    { value: "b", header: "Tab 2" },
    { value: "c", header: "Tab 3", disabled: true },
  ];

  it("renders a header per panel and no content until expanded", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `
        <u-accordion [panels]="panels">
          <ng-template #panelContent let-panel>{{ panel.value }} content</ng-template>
        </u-accordion>
      `,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[role="button"]').length).toBe(3);
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
  });

  it("expands a panel on header click and renders its content template", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `
        <u-accordion [panels]="panels">
          <ng-template #panelContent let-panel>{{ panel.value }} content</ng-template>
        </u-accordion>
      `,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="region"]')?.textContent).toContain(
      "a content"
    );
    expect(headers[0].getAttribute("aria-expanded")).toBe("true");
  });

  it("collapses an expanded panel when clicked again (single mode)", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="region"]')).not.toBeNull();
    headers[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="region"]')).toBeNull();
  });

  it("single mode: expanding a second panel closes the first", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[0].click();
    fixture.detectChanges();
    headers[1].click();
    fixture.detectChanges();
    expect(headers[0].getAttribute("aria-expanded")).toBe("false");
    expect(headers[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("multiple mode: allows more than one panel expanded simultaneously", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels" [multiple]="true"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[0].click();
    fixture.detectChanges();
    headers[1].click();
    fixture.detectChanges();
    expect(headers[0].getAttribute("aria-expanded")).toBe("true");
    expect(headers[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("does not expand a disabled panel", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[2].click();
    fixture.detectChanges();
    expect(headers[2].getAttribute("aria-expanded")).toBe("false");
  });

  it("emits onOpen and onClose", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels" (onOpen)="onOpen($event)" (onClose)="onClose($event)"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
      opened: unknown;
      closed: unknown;
      onOpen(e: unknown) {
        this.opened = e;
      }
      onClose(e: unknown) {
        this.closed = e;
      }
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    headers[0].click();
    fixture.detectChanges();
    expect((fixture.componentInstance.opened as { index: string }).index).toBe("a");

    headers[0].click();
    fixture.detectChanges();
    expect((fixture.componentInstance.closed as { index: string }).index).toBe("a");
  });

  it("respects an externally-controlled value input", () => {
    @Component({
      standalone: true,
      imports: [UAccordion],
      template: `<u-accordion [panels]="panels" [value]="'b'"></u-accordion>`,
    })
    class HostComponent {
      panels = panels;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const headers: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll(
      '[role="button"]'
    );
    expect(headers[1].getAttribute("aria-expanded")).toBe("true");
  });
});
