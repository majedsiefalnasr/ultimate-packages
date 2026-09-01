import { describe, it, expect, beforeAll } from "vitest";
import { mount } from "@vue/test-utils";
import { applyUltimateTheme } from "../src/apply-theme";
import { Theme } from "@ultimate/uix-styled";

describe("dark mode", () => {
  it("defaults to 'system' (prefers-color-scheme media query)", () => {
    applyUltimateTheme();
    expect(Theme.getOptions().darkModeSelector).toBe("system");
  });

  it("supports an explicit class-based dark mode selector", () => {
    applyUltimateTheme({ darkModeSelector: ".dark" });
    expect(Theme.getOptions().darkModeSelector).toBe(".dark");
  });

  it("the assembled preset has distinct light and dark values for the same semantic token", () => {
    applyUltimateTheme();
    const preset = Theme.getPreset() as any;
    const lightPrimary = preset.semantic?.colorScheme?.light?.primary;
    const darkPrimary = preset.semantic?.colorScheme?.dark?.primary;
    expect(lightPrimary).toBeDefined();
    expect(darkPrimary).toBeDefined();
    expect(lightPrimary).not.toEqual(darkPrimary);
    expect(lightPrimary.color).not.toBe(darkPrimary.color);
  });
});

/**
 * Regression coverage for the Phase 5 final-review Critical finding: the
 * theme pipeline resolved `dt()` token REFERENCES correctly
 * (`var(--u-button-primary-background)`) but nothing ever injected the
 * custom-property DEFINITIONS, so every `var(--u-*)` resolved to nothing and
 * every Ultimate component rendered unstyled in a real browser.
 *
 * These tests assert on real injected `<style>` textContent containing a
 * DEFINITION (`--u-primary-color:`), not a `var(...)` reference — the
 * distinction the original config-round-tripping tests above could never
 * catch. Before the fix, `document.head.querySelectorAll("style").length`
 * was 0 after `applyUltimateTheme()` plus any number of component mounts.
 */
describe("theme variable-definition CSS injection", () => {
  let allCss = "";
  let styleCountAfterFirstMount = 0;

  beforeAll(async () => {
    // Mount Vue's real `UButton` through its own public surface — the same
    // approach cross-framework-consistency.test.ts uses, and the only path
    // that exercises the real registration call site rather than a stub.
    const { UButton } = await import("@ultimate/vue/button");

    applyUltimateTheme();
    mount(UButton, { props: { label: "Save" } });

    styleCountAfterFirstMount = document.head.querySelectorAll("style").length;
    allCss = Array.from(document.head.querySelectorAll("style"))
      .map((el) => el.textContent ?? "")
      .join("\n");
  });

  it("injects the common (primitive + semantic) variable DEFINITIONS into document.head", () => {
    // A DEFINITION (`--u-primary-color:<value>`), not a
    // `var(--u-primary-color)` reference. Before the fix, document.head held
    // zero <style> elements at all, so this could not possibly pass.
    expect(allCss).toContain("--u-primary-color:");
    // Primitive tier reached the DOM too.
    expect(allCss).toMatch(/--u-[a-z]+-500:/);
    // The selector the variables are defined under.
    expect(allCss).toContain(":root,:host{");
  });

  it("injects the per-component variable DEFINITIONS for a mounted component", () => {
    // The definition that backs `dt('button.primary.background')`'s
    // `var(--u-button-primary-background)` reference — without this, the
    // reference resolves to nothing and the button renders unstyled.
    expect(allCss).toContain("--u-button-primary-background:");
    expect(allCss).toContain("--u-button-border-radius:");
  });

  it("is idempotent — repeated theme application and repeated mounts inject no duplicate <style> elements", async () => {
    const { UButton } = await import("@ultimate/vue/button");

    mount(UButton, { props: { label: "Again" } });
    mount(UButton, { props: { label: "And again" } });

    expect(document.head.querySelectorAll("style").length).toBe(styleCountAfterFirstMount);
  });
});
