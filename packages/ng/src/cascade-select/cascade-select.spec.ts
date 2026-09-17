import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { afterEach, describe, expect, it } from "vitest";
import { UCascadeSelect } from "./cascade-select";

const COUNTRIES = [
  {
    name: "Germany",
    items: [
      { name: "Berlin", items: [{ cname: "Mitte", code: "MT" }] },
      { name: "Hamburg", items: [{ cname: "Altstadt", code: "AS" }] },
    ],
  },
  {
    name: "USA",
    items: [{ name: "New York", items: [{ cname: "Manhattan", code: "MN" }] }],
  },
];

describe("UCascadeSelect", () => {
  afterEach(() => {
    document.querySelectorAll(".u-cascade-select-overlay").forEach((el) => el.remove());
  });

  it("renders a combobox trigger showing the placeholder when nothing is selected", () => {
    @Component({
      standalone: true,
      imports: [UCascadeSelect],
      template: `<u-cascade-select [options]="options" [optionLabel]="'name'" [placeholder]="'Select a city'" />`,
    })
    class HostComponent {
      options = COUNTRIES;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.textContent?.trim()).toBe("Select a city");
  });

  it("opens the overlay showing only the top-level (root) options", () => {
    @Component({
      standalone: true,
      imports: [UCascadeSelect],
      template: `<u-cascade-select [options]="options" [optionLabel]="'name'" />`,
    })
    class HostComponent {
      options = COUNTRIES;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    const items = document.querySelectorAll('[role="treeitem"]');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain("Germany");
    expect(items[1].textContent).toContain("USA");
  });

  it("drills down through nested groups on click, revealing the next level", () => {
    @Component({
      standalone: true,
      imports: [UCascadeSelect],
      template: `<u-cascade-select [options]="options" [optionLabel]="'name'" />`,
    })
    class HostComponent {
      options = COUNTRIES;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    // Click "Germany" (a group) — drills in, revealing Berlin/Hamburg as a nested sublist.
    const germanyContent = document.querySelectorAll(".u-cascade-select-option-content")[0] as HTMLElement;
    germanyContent.click();
    fixture.detectChanges();

    const items = document.querySelectorAll('[role="treeitem"]');
    // Germany + USA (root) + Berlin + Hamburg (nested one level under Germany)
    expect(items.length).toBe(4);
    const labels = Array.from(items).map((el) => el.textContent?.trim());
    expect(labels.some((l) => l?.includes("Berlin"))).toBe(true);
    expect(labels.some((l) => l?.includes("Hamburg"))).toBe(true);
  });

  it("drills down through a group and selects a leaf, closing the overlay and updating the label", () => {
    const flatCountries = [
      { name: "Germany", items: [{ name: "Berlin" }, { name: "Hamburg" }] },
      { name: "USA", items: [{ name: "New York" }] },
    ];
    @Component({
      standalone: true,
      imports: [UCascadeSelect, FormsModule],
      template: `<u-cascade-select [options]="options" [optionLabel]="'name'" [optionValue]="'name'" [(ngModel)]="value" />`,
    })
    class HostComponent {
      options = flatCountries;
      value: unknown = null;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    // Click "Germany" (a group, has items) — drills in, revealing its leaf children.
    let contents = document.querySelectorAll(".u-cascade-select-option-content");
    (contents[0] as HTMLElement).click();
    fixture.detectChanges();

    // Select the "Berlin" leaf (no items — a plain leaf, selecting it closes the overlay).
    contents = document.querySelectorAll(".u-cascade-select-option-content");
    const berlin = Array.from(contents).find((el) => el.textContent?.trim() === "Berlin") as HTMLElement;
    expect(berlin).toBeDefined();
    berlin.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toBe("Berlin");
    expect(trigger.textContent?.trim()).toBe("Berlin");
    expect(document.querySelector(".u-cascade-select-overlay")).toBeNull();
  });

  it("closes the overlay on Escape", () => {
    @Component({
      standalone: true,
      imports: [UCascadeSelect],
      template: `<u-cascade-select [options]="options" [optionLabel]="'name'" />`,
    })
    class HostComponent {
      options = COUNTRIES;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();
    expect(document.querySelector(".u-cascade-select-overlay")).not.toBeNull();

    trigger.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector(".u-cascade-select-overlay")).toBeNull();
  });

  it("integrates with reactive forms — FormControl value flows in and populates the label", () => {
    @Component({
      standalone: true,
      imports: [UCascadeSelect, ReactiveFormsModule],
      template: `<u-cascade-select [options]="options" [optionLabel]="'cname'" [optionValue]="'code'" [formControl]="control" />`,
    })
    class HostComponent {
      options = [{ cname: "Mitte", code: "MT" }, { cname: "Altstadt", code: "AS" }];
      control = new FormControl<string | null>("AS");
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const cascadeSelect = fixture.debugElement.query((de) => de.name === "u-cascade-select")
      .componentInstance as UCascadeSelect;
    expect(cascadeSelect.modelValue()).toBe("AS");
    const trigger: HTMLElement = fixture.nativeElement.querySelector('[role="combobox"]');
    expect(trigger.textContent?.trim()).toBe("Altstadt");
  });
});
