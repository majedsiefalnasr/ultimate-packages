import { Component, inject } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UIconField, UInputIcon } from "./icon-field";

@Component({
  standalone: true,
  imports: [UIconField, UInputIcon],
  template: `
    <u-icon-field [iconPosition]="iconPosition">
      <u-input-icon>search</u-input-icon>
      <input type="text" />
    </u-icon-field>
  `,
})
class TestHostComponent {
  iconPosition: "left" | "right" = "left";
}

@Component({
  standalone: true,
  imports: [UIconField, UInputIcon],
  template: `
    <u-icon-field>
      <u-input-icon>search</u-input-icon>
      <input type="text" />
    </u-icon-field>
  `,
})
class DefaultPositionHostComponent {}

describe("UIconField", () => {
  it("projects its content (icon + input) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("u-input-icon")).toBeTruthy();
    expect(host.querySelector("input")).toBeTruthy();
  });

  it("applies the u-icon-field root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-icon-field");
    expect(root.classList.contains("u-icon-field")).toBe(true);
  });

  it("defaults iconPosition to left and adds the left root class", () => {
    const fixture = TestBed.createComponent(DefaultPositionHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-icon-field") as HTMLElement;
    expect(root.classList.contains("u-icon-field-left")).toBe(true);
    expect(root.classList.contains("u-icon-field-right")).toBe(false);
  });

  it("adds the right root class for iconPosition right", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.iconPosition = "right";
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-icon-field") as HTMLElement;
    expect(root.classList.contains("u-icon-field-right")).toBe(true);
    expect(root.classList.contains("u-icon-field-left")).toBe(false);
  });

  it("places the icon by DOM order, as the position classes are only styling hooks", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector("u-input-icon");
    expect(icon).toBe(fixture.nativeElement.querySelector("u-icon-field").firstElementChild);
  });

  describe("pass-through, unstyled, dt and parent instance", () => {
    @Component({
      standalone: true,
      imports: [UIconField, UInputIcon],
      template: `
        <u-icon-field [pt]="pt" [unstyled]="unstyled" [dt]="dt">
          <u-input-icon>search</u-input-icon>
          <input type="text" />
        </u-icon-field>
      `,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = { root: { id: "icon-field-root", class: "extra-root" } };
      unstyled = false;
      dt: Record<string, unknown> = {};
    }

    function render(configure?: (host: PtHostComponent) => void) {
      const fixture = TestBed.createComponent(PtHostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      fixture.detectChanges();
      return fixture;
    }

    it("applies root pt attributes and keeps the root class", () => {
      const host = render().nativeElement.querySelector("u-icon-field") as HTMLElement;
      expect(host.id).toBe("icon-field-root");
      expect(host.classList.contains("u-icon-field")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("iconfield");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("unstyled drops the Ultimate classes", () => {
      const host = render((component) => (component.unstyled = true)).nativeElement.querySelector(
        "u-icon-field"
      ) as HTMLElement;
      expect(host.classList.contains("u-icon-field")).toBe(false);
      expect(host.classList.contains("u-icon-field-left")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { iconfield: { icon: { color: "red" } } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      const fixture = render((component) => (component.dt = { icon: { color: "blue" } }));
      const host = fixture.nativeElement.querySelector("u-icon-field") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-iconfield"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-iconfield-icon-color:blue;}`);
    });

    it("provides itself as the parent instance of projected content", () => {
      let parent: unknown;
      @Component({ standalone: true, selector: "u-probe", template: "" })
      class ProbeComponent {
        constructor() {
          parent = inject(U_PARENT_INSTANCE, { optional: true });
        }
      }
      @Component({
        standalone: true,
        imports: [UIconField, ProbeComponent],
        template: `<u-icon-field><u-probe /></u-icon-field>`,
      })
      class ProbeHostComponent {}
      const fixture = TestBed.createComponent(ProbeHostComponent);
      fixture.detectChanges();
      const iconField = fixture.debugElement.query(By.directive(UIconField)).componentInstance;
      expect(parent).toBe(iconField);
    });
  });
});

describe("UInputIcon", () => {
  it("projects its content and applies the u-input-icon root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector("u-input-icon");
    expect(icon.classList.contains("u-input-icon")).toBe(true);
    expect(icon.textContent.trim()).toBe("search");
  });

  it("is aria-hidden by default", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-input-icon").getAttribute("aria-hidden")).toBe(
      "true"
    );
  });

  it("lets an aria-hidden attribute on the element replace the default", () => {
    @Component({
      standalone: true,
      imports: [UInputIcon],
      template: `<u-input-icon aria-hidden="false">clear</u-input-icon>`,
    })
    class OverrideHostComponent {}
    const fixture = TestBed.createComponent(OverrideHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-input-icon").getAttribute("aria-hidden")).toBe(
      "false"
    );
  });

  describe("pass-through and unstyled", () => {
    @Component({
      standalone: true,
      imports: [UInputIcon],
      template: `<u-input-icon [pt]="pt" [unstyled]="unstyled">search</u-input-icon>`,
    })
    class IconPtHostComponent {
      pt: Record<string, unknown> = {
        root: { id: "icon-root", class: "extra-icon", "aria-hidden": "false" },
      };
      unstyled = false;
    }

    function render(configure?: (host: IconPtHostComponent) => void) {
      const fixture = TestBed.createComponent(IconPtHostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      fixture.detectChanges();
      return fixture.nativeElement.querySelector("u-input-icon") as HTMLElement;
    }

    it("applies root pt attributes, keeps the root class and lets pt replace aria-hidden", () => {
      const icon = render();
      expect(icon.id).toBe("icon-root");
      expect(icon.classList.contains("u-input-icon")).toBe(true);
      expect(icon.classList.contains("extra-icon")).toBe(true);
      expect(icon.getAttribute("aria-hidden")).toBe("false");
      expect(icon.getAttribute("data-pc-name")).toBe("inputicon");
      expect(icon.getAttribute("data-pc-section")).toBe("root");
    });

    it("unstyled drops the Ultimate class", () => {
      const icon = render((component) => (component.unstyled = true));
      expect(icon.classList.contains("u-input-icon")).toBe(false);
      expect(icon.classList.contains("extra-icon")).toBe(true);
    });
  });
});
