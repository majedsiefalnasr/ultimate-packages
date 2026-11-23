import { Component, inject } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UFloatLabel } from "./float-label";

@Component({
  standalone: true,
  imports: [UFloatLabel],
  template: `
    <u-float-label [variant]="variant">
      <input type="text" [class.p-filled]="filled" />
      <label>Username</label>
    </u-float-label>
  `,
})
class TestHostComponent {
  variant: "in" | "over" | "on" = "over";
  filled = false;
}

describe("UFloatLabel", () => {
  it("projects its content (input + label) via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector("input")).toBeTruthy();
    expect(host.querySelector("label")).toBeTruthy();
  });

  it("applies the u-float-label root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label")).toBe(true);
  });

  it("applies the default 'over' variant class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label-over")).toBe(true);
  });

  it("applies the 'in' variant class when set", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.variant = "in";
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-float-label");
    expect(root.classList.contains("u-float-label-in")).toBe(true);
  });

  it("label-float trigger is pure CSS (:has()), driven by the projected input's own filled/focus state", () => {
    // Real source (and this port) carries no JS-side focus/content tracking
    // of its own — the label-float visual trigger is entirely CSS `:has()`
    // selectors against the projected input's class/attribute state. This
    // test confirms the wrapper does not add any extra DOM class in response
    // to the child's filled state (two independent fixtures, one unfilled,
    // one pre-filled, to avoid mutating a bound property mid-test and
    // tripping Angular's dev-mode ExpressionChangedAfterItHasBeenChecked
    // check) — that responsibility belongs to the CSS, not to
    // UFloatLabel's own class list.
    const unfilled = TestBed.createComponent(TestHostComponent);
    unfilled.detectChanges();
    const rootBefore = unfilled.nativeElement.querySelector("u-float-label").className;

    const filledFixture = TestBed.createComponent(TestHostComponent);
    filledFixture.componentInstance.filled = true;
    filledFixture.detectChanges();
    const rootAfter = filledFixture.nativeElement.querySelector("u-float-label").className;

    expect(rootAfter).toBe(rootBefore);
    expect(filledFixture.nativeElement.querySelector("input.p-filled")).toBeTruthy();
  });

  describe("pass-through, unstyled, dt and parent instance", () => {
    @Component({
      standalone: true,
      imports: [UFloatLabel],
      template: `
        <u-float-label [pt]="pt" [unstyled]="unstyled" [dt]="dt">
          <input type="text" />
          <label>Username</label>
        </u-float-label>
      `,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = { root: { id: "float-root", class: "extra-root" } };
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
      const host = render().nativeElement.querySelector("u-float-label") as HTMLElement;
      expect(host.id).toBe("float-root");
      expect(host.classList.contains("u-float-label")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("floatlabel");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("unstyled drops the Ultimate classes", () => {
      const host = render((component) => (component.unstyled = true)).nativeElement.querySelector(
        "u-float-label"
      ) as HTMLElement;
      expect(host.classList.contains("u-float-label")).toBe(false);
      expect(host.classList.contains("u-float-label-over")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { floatlabel: { color: "red" } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      const fixture = render((component) => (component.dt = { color: "blue" }));
      const host = fixture.nativeElement.querySelector("u-float-label") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-floatlabel"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-floatlabel-color:blue;}`);
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
        imports: [UFloatLabel, ProbeComponent],
        template: `<u-float-label><u-probe /></u-float-label>`,
      })
      class ProbeHostComponent {}
      const fixture = TestBed.createComponent(ProbeHostComponent);
      fixture.detectChanges();
      const floatLabel = fixture.debugElement.query(By.directive(UFloatLabel)).componentInstance;
      expect(parent).toBe(floatLabel);
    });
  });
});
