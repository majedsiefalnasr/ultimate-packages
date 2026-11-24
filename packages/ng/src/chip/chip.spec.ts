import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UChip } from "./chip";

describe("UChip", () => {
  it("renders the label text", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-chip-label")?.textContent).toBe("Apple");
  });

  it("renders an icon class when icon is provided and no image", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [icon]="'pi pi-apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-apple")).toBeTruthy();
  });

  it("renders an image and prefers it over icon", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [image]="'a.png'" [icon]="'pi pi-apple'" [alt]="'fruit'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img.u-chip-image") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe("fruit");
    expect(fixture.nativeElement.querySelector(".pi-apple")).toBeFalsy();
  });

  it("does not render a remove control by default", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-chip-remove-icon")).toBeFalsy();
  });

  it("removes the chip and emits onRemove when the remove control is clicked", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip
        [label]="'Apple'"
        [removable]="true"
        (onRemove)="removed = true"
      ></u-chip>`,
    })
    class HostComponent {
      removed = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl).toBeTruthy();
    removeEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(true);
    expect(fixture.nativeElement.querySelector(".u-chip-label")).toBeFalsy();
  });

  it("removes the chip on Enter and Backspace keydown on the remove control", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip
        [label]="'Apple'"
        [removable]="true"
        (onRemove)="removed = removed + 1"
      ></u-chip>`,
    })
    class HostComponent {
      removed = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    removeEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(1);
  });

  it("does not remove when disabled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip
        [label]="'Apple'"
        [removable]="true"
        [disabled]="true"
        (onRemove)="removed = true"
      ></u-chip>`,
    })
    class HostComponent {
      removed = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    removeEl.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.removed).toBe(false);
    expect(fixture.nativeElement.querySelector(".u-chip")).toBeTruthy();
  });

  it("sets tabindex -1 on the remove control when disabled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" [disabled]="true"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.getAttribute("tabindex")).toBe("-1");
  });

  it("emits onImageError when the image fails to load", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [image]="'bad.png'" (onImageError)="errored = true"></u-chip>`,
    })
    class HostComponent {
      errored = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector("img.u-chip-image") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    fixture.detectChanges();
    expect(fixture.componentInstance.errored).toBe(true);
  });

  it("hides the host after removal so no empty pill stays on screen", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("u-chip") as HTMLElement;
    expect(host.style.display).toBe("");
    (fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement).click();
    fixture.detectChanges();
    expect(host.style.display).toBe("none");
  });

  it("gives the remove control an English default accessible label that can be replaced", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `
        <u-chip id="a" [label]="'Apple'" [removable]="true"></u-chip>
        <u-chip id="b" [label]="'Pear'" [removable]="true" [removeAriaLabel]="'Delete'"></u-chip>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const label = (id: string) =>
      fixture.nativeElement.querySelector(`#${id} .u-chip-remove-icon`).getAttribute("aria-label");
    expect(label("a")).toBe("Remove");
    expect(label("b")).toBe("Delete");
  });

  it("replaces the remove glyph with a font class", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip
        [label]="'Apple'"
        [removable]="true"
        [removeIcon]="'pi pi-times-circle'"
      ></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.classList.contains("pi-times-circle")).toBe(true);
    expect(removeEl.querySelector("svg")).toBeNull();
  });

  it("replaces the remove glyph with a removeicon template", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true">
        <ng-template #removeicon><b class="glyph">x</b></ng-template>
      </u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const removeEl = fixture.nativeElement.querySelector(".u-chip-remove-icon") as HTMLElement;
    expect(removeEl.querySelector(".glyph")).toBeTruthy();
    expect(removeEl.querySelector("svg")).toBeNull();
  });

  it("sets data-p to removable only when removable", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `
        <u-chip id="a" [label]="'Apple'"></u-chip>
        <u-chip id="b" [label]="'Pear'" [removable]="true"></u-chip>
      `,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("#a").hasAttribute("data-p")).toBe(false);
    expect(fixture.nativeElement.querySelector("#b").getAttribute("data-p")).toBe("removable");
  });

  it("adds p-disabled to the host when disabled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [disabled]="true"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-chip").classList.contains("p-disabled")).toBe(
      true
    );
  });

  it("applies pt sections to the host and each part", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip
        [label]="'Apple'"
        [icon]="'pi pi-apple'"
        [removable]="true"
        [pt]="pt"
      ></u-chip>`,
    })
    class HostComponent {
      pt = {
        root: { "data-pt": "root" },
        icon: { "data-pt": "icon" },
        label: { "data-pt": "label" },
        removeIcon: { "data-pt": "remove" },
      };
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector("u-chip")?.getAttribute("data-pt")).toBe("root");
    expect(root.querySelector(".u-chip-icon")?.getAttribute("data-pt")).toBe("icon");
    expect(root.querySelector(".u-chip-label")?.getAttribute("data-pt")).toBe("label");
    expect(root.querySelector(".u-chip-remove-icon")?.getAttribute("data-pt")).toBe("remove");
  });

  it("emits no Ultimate classes when unstyled", () => {
    @Component({
      standalone: true,
      imports: [UChip],
      template: `<u-chip [label]="'Apple'" [removable]="true" [unstyled]="true"></u-chip>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-chip")).toBeNull();
    expect(fixture.nativeElement.querySelector(".u-chip-label")).toBeNull();
  });
});
