import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UMeterGroup, type UMeterItem } from "./meter-group";

describe("UMeterGroup", () => {
  it("renders one meter segment per non-zero value item", () => {
    @Component({
      standalone: true,
      imports: [UMeterGroup],
      template: `<u-meter-group [value]="value"></u-meter-group>`,
    })
    class HostComponent {
      value: UMeterItem[] = [
        { label: "A", value: 30, color: "red" },
        { label: "B", value: 20, color: "blue" },
        { label: "C", value: 0, color: "green" },
      ];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const meters = fixture.nativeElement.querySelectorAll(".u-meter-group-meter");
    expect(meters.length).toBe(2);
  });

  it("computes segment widths proportional to min/max range", () => {
    @Component({
      standalone: true,
      imports: [UMeterGroup],
      template: `<u-meter-group [value]="value" [min]="0" [max]="200"></u-meter-group>`,
    })
    class HostComponent {
      value: UMeterItem[] = [{ label: "A", value: 100, color: "red" }];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const meter = fixture.nativeElement.querySelector(".u-meter-group-meter") as HTMLElement;
    expect(meter.style.width).toBe("50%");
  });

  it("renders a legend list with label and percentage text", () => {
    @Component({
      standalone: true,
      imports: [UMeterGroup],
      template: `<u-meter-group [value]="value"></u-meter-group>`,
    })
    class HostComponent {
      value: UMeterItem[] = [{ label: "Storage", value: 25, color: "red" }];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector(".u-meter-group-label-text");
    expect(label?.textContent?.trim()).toBe("Storage (25%)");
  });

  it("switches to vertical orientation classes", () => {
    @Component({
      standalone: true,
      imports: [UMeterGroup],
      template: `<u-meter-group [value]="value" orientation="vertical"></u-meter-group>`,
    })
    class HostComponent {
      value: UMeterItem[] = [{ value: 10 }];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-meter-group");
    expect(root?.classList.contains("u-meter-group-vertical")).toBe(true);
  });

  it("sets aria-valuenow to the total percentage across all items", () => {
    @Component({
      standalone: true,
      imports: [UMeterGroup],
      template: `<u-meter-group [value]="value"></u-meter-group>`,
    })
    class HostComponent {
      value: UMeterItem[] = [
        { value: 20 },
        { value: 30 },
      ];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-meter-group");
    expect(root?.getAttribute("aria-valuenow")).toBe("50");
  });
});
