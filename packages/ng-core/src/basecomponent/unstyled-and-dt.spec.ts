import { ChangeDetectionStrategy, Component, PLATFORM_ID } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UltimateConfig } from "../config/ultimate-config";
import { UBaseComponent } from "./base-component";
import { ngCoreStyleSheet } from "./style-sheet";

/**
 * F15: per-instance `unstyled` and `dt`. Oracle: PrimeNG 21.1.9
 * `BaseComponent` (`$unstyled`, `cx`, `_loadScopedThemeStyles`).
 */
@Component({
  standalone: true,
  selector: "u-dtdemo",
  template: "<div [class]=\"cx('root')\"></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DtDemoComponent extends UBaseComponent {
  protected override readonly componentName = "dtdemo";
  protected override readonly styleModule = {
    css: ".u-dtdemo { color: dt('dtdemo.color'); }",
    classes: { root: () => "u-dtdemo" },
  };
}

function styleKeys(): string[] {
  return Array.from(document.head.querySelectorAll("style[data-u-ng-style]")).map(
    (el) => el.getAttribute("data-u-ng-style") ?? ""
  );
}

function scopedAttrs(element: Element): string[] {
  return element.getAttributeNames().filter((name) => name.startsWith("pc"));
}

function mount(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(DtDemoComponent);
  for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
  fixture.detectChanges();
  return fixture;
}

beforeAll(() => {
  Theme.setTheme({
    preset: { components: { dtdemo: { color: "#111111" } } },
    options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
  });
});

afterEach(() => {
  ngCoreStyleSheet.clear();
  document.head.querySelectorAll("style[data-u-ng-style]").forEach((el) => el.remove());
});

describe("UBaseComponent — unstyled", () => {
  it("resolves classes and reports $unstyled() false by default", () => {
    const fixture = mount();
    expect(fixture.componentInstance.$unstyled()).toBe(false);
    expect(fixture.nativeElement.querySelector("div").className).toBe("u-dtdemo");
  });

  it("makes cx() return undefined when unstyled", () => {
    const fixture = mount({ unstyled: true });
    expect(fixture.componentInstance.$unstyled()).toBe(true);
    expect(fixture.nativeElement.querySelector("div").className).toBe("");
  });

  it("registers no component css or theme variables when unstyled", () => {
    mount({ unstyled: true });
    expect(styleKeys()).not.toContain("dtdemo");
    expect(styleKeys()).not.toContain("dtdemo-variables");
    expect(styleKeys()).not.toContain("u-common-variables");
    expect(styleKeys()).not.toContain("u-box-model:dtdemo");
    expect(styleKeys()).not.toContain("u-base");
  });

  it("still registers the shared base rules when unstyled", () => {
    mount({ unstyled: true });
    expect(styleKeys()).toContain("u-hidden-accessible");
    expect(styleKeys()).toContain("u-icon-spin");
  });

  it("registers the styles when styled", () => {
    mount();
    expect(styleKeys()).toContain("dtdemo");
    expect(styleKeys()).toContain("dtdemo-variables");
    expect(styleKeys()).toContain("u-base");
  });

  it("follows the global UltimateConfig.unstyled when the input is unset", () => {
    TestBed.inject(UltimateConfig).unstyled.set(true);
    const fixture = mount();
    expect(fixture.componentInstance.$unstyled()).toBe(true);
    expect(fixture.nativeElement.querySelector("div").className).toBe("");
    expect(styleKeys()).not.toContain("dtdemo");
  });

  it("lets the instance input override the global setting, like PrimeNG's $unstyled", () => {
    TestBed.inject(UltimateConfig).unstyled.set(true);
    const fixture = mount({ unstyled: false });
    expect(fixture.componentInstance.$unstyled()).toBe(false);
    expect(fixture.nativeElement.querySelector("div").className).toBe("u-dtdemo");
    expect(styleKeys()).toContain("dtdemo");
  });

  it("registers the styles and restores the classes when unstyled turns off", () => {
    const fixture = mount({ unstyled: true });
    expect(styleKeys()).not.toContain("dtdemo");

    fixture.componentRef.setInput("unstyled", false);
    fixture.detectChanges();

    expect(styleKeys()).toContain("dtdemo");
    expect(fixture.nativeElement.querySelector("div").className).toBe("u-dtdemo");
  });

  it("drops the classes when unstyled turns on", () => {
    const fixture = mount();
    fixture.componentRef.setInput("unstyled", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("div").className).toBe("");
  });
});

describe("UBaseComponent — dt", () => {
  it("adds no scoped attribute or style by default", () => {
    const fixture = mount();
    expect(scopedAttrs(fixture.nativeElement)).toEqual([]);
    expect(styleKeys().filter((key) => key.startsWith("pc"))).toEqual([]);
  });

  it("scopes the dt variables to the host through an attribute selector", () => {
    const fixture = mount({ dt: { color: "#ff0000" } });

    const [attr] = scopedAttrs(fixture.nativeElement);
    expect(attr).toMatch(/^pc[A-Za-z0-9_]+$/);
    const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-dtdemo"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-dtdemo-color:#ff0000;}`);
  });

  it("keeps two instances apart", () => {
    const first = mount({ dt: { color: "#ff0000" } });
    const second = mount({ dt: { color: "#00ff00" } });

    expect(scopedAttrs(first.nativeElement)[0]).not.toBe(scopedAttrs(second.nativeElement)[0]);
    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(2);
  });

  it("rewrites the scoped style in place when dt changes", () => {
    const fixture = mount({ dt: { color: "#ff0000" } });
    const [attr] = scopedAttrs(fixture.nativeElement);

    fixture.componentRef.setInput("dt", { color: "#0000ff" });
    fixture.detectChanges();

    const scoped = document.head.querySelectorAll(`style[data-u-ng-style="${attr}-dtdemo"]`);
    expect(scoped).toHaveLength(1);
    expect(scoped[0].textContent).toContain("--u-dtdemo-color:#0000ff");
  });

  it("removes the scoped style and attribute when dt is cleared", () => {
    const fixture = mount({ dt: { color: "#ff0000" } });
    const [attr] = scopedAttrs(fixture.nativeElement);

    fixture.componentRef.setInput("dt", undefined);
    fixture.detectChanges();

    expect(document.head.querySelector(`style[data-u-ng-style="${attr}-dtdemo"]`)).toBeNull();
    expect(fixture.nativeElement.hasAttribute(attr)).toBe(false);
  });

  it("starts scoping when dt is set after creation", () => {
    const fixture = mount();

    fixture.componentRef.setInput("dt", { color: "#ff0000" });
    fixture.detectChanges();

    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(1);
  });

  it("removes the scoped style when the component is destroyed", () => {
    const fixture = mount({ dt: { color: "#ff0000" } });
    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(1);

    fixture.destroy();

    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toHaveLength(0);
  });

  it("follows a theme change", () => {
    mount({ dt: { color: "#ff0000" } });

    Theme.setTheme({
      preset: { components: { dtdemo: { color: "#222222" } } },
      options: { prefix: "k", darkModeSelector: "system", cssLayer: false },
    });

    const scoped = document.head.querySelector("style[data-u-ng-style$='-dtdemo']");
    expect(scoped?.textContent).toContain("--k-dtdemo-color:#ff0000");
  });

  it("applies dt on an unstyled instance too", () => {
    const fixture = mount({ unstyled: true, dt: { color: "#ff0000" } });
    const [attr] = scopedAttrs(fixture.nativeElement);
    expect(styleKeys()).toContain(`${attr}-dtdemo`);
  });

  it("writes no scoped style or attribute on the server, like PrimeNG", () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: document },
        { provide: PLATFORM_ID, useValue: "server" },
      ],
    });
    const fixture = mount({ dt: { color: "#ff0000" } });
    expect(scopedAttrs(fixture.nativeElement)).toEqual([]);
    expect(styleKeys().filter((key) => key.endsWith("-dtdemo"))).toEqual([]);
  });
});
