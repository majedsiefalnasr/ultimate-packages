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

  describe("pt", () => {
    @Component({
      standalone: true,
      imports: [UCard],
      template: `
        <u-card [pt]="pt" header="Title" subheader="Sub">
          <span class="body-text">Body</span>
        </u-card>
      `,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = {
        root: { id: "card-root", class: "extra-root" },
        header: { "data-test": "header" },
        body: "extra-body",
        title: { "data-test": "title" },
        subtitle: { "data-test": "subtitle" },
        content: { "data-test": "content" },
        footer: { "data-test": "footer" },
      };
    }

    function render(pt?: Record<string, unknown>) {
      const fixture = TestBed.createComponent(PtHostComponent);
      if (pt) fixture.componentInstance.pt = pt;
      fixture.detectChanges();
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    }

    it("applies root pt attributes and keeps the root class", () => {
      const host = render().querySelector("u-card") as HTMLElement;
      expect(host.id).toBe("card-root");
      expect(host.classList.contains("u-card")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("card");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("applies pt attributes and section datasets to each part", () => {
      const root = render();
      for (const part of ["header", "title", "subtitle", "content", "footer"]) {
        const element = root.querySelector(`.u-card-${part}`) as HTMLElement;
        expect(element.getAttribute("data-test")).toBe(part);
        expect(element.getAttribute("data-pc-section")).toBe(part);
      }
      const body = root.querySelector(".u-card-body") as HTMLElement;
      expect(body.classList.contains("extra-body")).toBe(true);
      expect(body.getAttribute("data-pc-section")).toBe("body");
    });

    it("accepts a pt function that receives the instance", () => {
      const root = render({
        root: ({ instance }: { instance: UCard }) => ({ "data-header": instance.header() }),
      });
      expect((root.querySelector("u-card") as HTMLElement).getAttribute("data-header")).toBe(
        "Title"
      );
    });
  });
});
