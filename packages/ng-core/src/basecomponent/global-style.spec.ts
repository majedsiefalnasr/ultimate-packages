import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UBaseComponent } from "./base-component";
import { ngCoreStyleSheetFor } from "./style-sheet";

const GLOBAL_CSS = "li.u-gs-option{transition:none;}";

@Component({
  standalone: true,
  selector: "u-gs-probe",
  template: "<div></div>",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GlobalStyleProbeComponent extends UBaseComponent {
  protected override readonly componentName = "gs-probe";
  protected override readonly styleModule = { css: ".u-gs-probe {}", classes: {} };
}

describe("preset global style registration (F4, Angular)", () => {
  beforeEach(() => {
    ngCoreStyleSheetFor(document).clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
    Theme.setTheme({
      preset: { primitive: {}, css: GLOBAL_CSS, components: { "gs-probe": { root: {} } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
  });

  it("injects the preset css once into the document head on first init", () => {
    TestBed.createComponent(GlobalStyleProbeComponent).detectChanges();
    TestBed.createComponent(GlobalStyleProbeComponent).detectChanges();

    expect(ngCoreStyleSheetFor(document).has("u-global-style")).toBe(true);
    expect(
      Array.from(document.head.querySelectorAll("style")).filter(
        (el) => (el.textContent ?? "") === GLOBAL_CSS
      )
    ).toHaveLength(1);
  });
});
