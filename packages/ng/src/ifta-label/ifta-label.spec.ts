import { Component, inject } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UIftaLabel } from "./ifta-label";

@Component({
  standalone: true,
  imports: [UIftaLabel],
  template: `
    <u-ifta-label>
      <input type="text" [class.p-filled]="filled" />
      <label>Username</label>
    </u-ifta-label>
  `,
})
class TestHostComponent {
  filled = false;
}

describe("UIftaLabel", () => {
  it("projects its content (input + label) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("input")).toBeTruthy();
    expect(host.querySelector("label")).toBeTruthy();
  });

  it("applies the u-ifta-label root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-ifta-label");
    expect(root.classList.contains("u-ifta-label")).toBe(true);
  });

  it("label-position trigger is pure CSS (:has()), no JS-side focus/content tracking of its own", () => {
    // Two independent fixtures (unfilled vs. pre-filled), avoiding a
    // mid-test bound-property mutation that would trip Angular's dev-mode
    // ExpressionChangedAfterItHasBeenChecked check.
    const unfilled = TestBed.createComponent(TestHostComponent);
    unfilled.detectChanges();
    const rootBefore = unfilled.nativeElement.querySelector("u-ifta-label").className;

    const filledFixture = TestBed.createComponent(TestHostComponent);
    filledFixture.componentInstance.filled = true;
    filledFixture.detectChanges();
    const rootAfter = filledFixture.nativeElement.querySelector("u-ifta-label").className;

    expect(rootAfter).toBe(rootBefore);
    expect(filledFixture.nativeElement.querySelector("input.p-filled")).toBeTruthy();
  });

  describe("pass-through, unstyled, dt and parent instance", () => {
    @Component({
      standalone: true,
      imports: [UIftaLabel],
      template: `
        <u-ifta-label [pt]="pt" [unstyled]="unstyled" [dt]="dt">
          <input type="text" />
          <label>Username</label>
        </u-ifta-label>
      `,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = { root: { id: "ifta-root", class: "extra-root" } };
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
      const host = render().nativeElement.querySelector("u-ifta-label") as HTMLElement;
      expect(host.id).toBe("ifta-root");
      expect(host.classList.contains("u-ifta-label")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("iftalabel");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("unstyled drops the Ultimate classes", () => {
      const host = render((component) => (component.unstyled = true)).nativeElement.querySelector(
        "u-ifta-label"
      ) as HTMLElement;
      expect(host.classList.contains("u-ifta-label")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { iftalabel: { color: "red" } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      const fixture = render((component) => (component.dt = { color: "blue" }));
      const host = fixture.nativeElement.querySelector("u-ifta-label") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-iftalabel"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-iftalabel-color:blue;}`);
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
        imports: [UIftaLabel, ProbeComponent],
        template: `<u-ifta-label><u-probe /></u-ifta-label>`,
      })
      class ProbeHostComponent {}
      const fixture = TestBed.createComponent(ProbeHostComponent);
      fixture.detectChanges();
      const iftaLabel = fixture.debugElement.query(By.directive(UIftaLabel)).componentInstance;
      expect(parent).toBe(iftaLabel);
    });
  });
});
