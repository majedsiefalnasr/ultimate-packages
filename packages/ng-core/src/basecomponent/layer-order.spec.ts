import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UBaseComponent } from "./base-component";
import { ngCoreStyleSheetFor } from "./style-sheet";

@Component({
  standalone: true,
  selector: "u-lo-probe",
  template: "<div></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LayerOrderProbeComponent extends UBaseComponent {
  protected override readonly componentName = "lo-probe";
  protected override readonly styleModule = { css: ".u-lo-probe {}", classes: {} };
}

function applyTheme(cssLayer: boolean | object) {
  Theme.setTheme({
    preset: { primitive: {}, components: { "lo-probe": { root: {} } } },
    options: { prefix: "u", darkModeSelector: "system", cssLayer },
  });
}

function headStyleTexts(): string[] {
  return Array.from(document.head.querySelectorAll("style")).map((el) => el.textContent ?? "");
}

describe("CSS layer-order registration (F6, Angular)", () => {
  beforeEach(() => {
    ngCoreStyleSheetFor(document).clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("puts the layer-order statement first in the document head when cssLayer is on", () => {
    applyTheme({ name: "ultimate", order: "ultimate, app" });

    TestBed.createComponent(LayerOrderProbeComponent).detectChanges();
    TestBed.createComponent(LayerOrderProbeComponent).detectChanges();

    const texts = headStyleTexts();
    expect(texts[0]).toBe("@layer ultimate, app");
    expect(texts.filter((text) => text.startsWith("@layer ultimate, app"))).toHaveLength(1);
    expect(texts.length).toBeGreaterThan(1);
    expect([...ngCoreStyleSheetFor(document).getStyles().keys()][0]).toBe("u-layer-order");
  });

  it("registers no layer-order statement and no @layer rule when cssLayer is off", () => {
    applyTheme(false);

    TestBed.createComponent(LayerOrderProbeComponent).detectChanges();

    expect(ngCoreStyleSheetFor(document).has("u-layer-order")).toBe(false);
    expect(headStyleTexts().some((text) => text.includes("@layer"))).toBe(false);
  });

  it("follows cssLayer switched on after the component has initialised", () => {
    applyTheme(false);
    TestBed.createComponent(LayerOrderProbeComponent).detectChanges();

    Theme.setOptions({ prefix: "u", darkModeSelector: "system", cssLayer: true });

    expect(headStyleTexts()[0]).toBe("@layer ultimate");
  });
});
