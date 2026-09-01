import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  PrimitiveTokens,
  SemanticTokens,
  ComponentTokens,
  UltimateThemeMode,
  UltimateThemeDirection,
} from "../src/contract";

describe("theme contract types", () => {
  it("PrimitiveTokens accepts a nested color-scale shape", () => {
    const primitive: PrimitiveTokens = {
      blue: { 500: "#3B82F6", 600: "#2563EB" },
      borderRadius: { sm: "4px", md: "6px" },
    };
    expect(primitive.blue?.[500]).toBe("#3B82F6");
  });

  it("SemanticTokens splits by light/dark colorScheme", () => {
    const semantic: SemanticTokens = {
      colorScheme: {
        light: { primary: { color: "{blue.500}" } },
        dark: { primary: { color: "{blue.400}" } },
      },
    };
    expect(semantic.colorScheme.light.primary?.color).toBe("{blue.500}");
  });

  it("ComponentTokens<T> accepts a per-component token object with light/dark", () => {
    type ButtonTokens = { primary: { color: string; background: string } };
    const button: ComponentTokens<ButtonTokens> = {
      root: { borderRadius: "{form.field.border.radius}" },
      colorScheme: {
        light: { primary: { color: "#fff", background: "{primary.color}" } },
        dark: { primary: { color: "#000", background: "{primary.color}" } },
      },
    };
    expect(button.colorScheme.light.primary.color).toBe("#fff");
  });

  it("UltimateThemeMode is 'system' | 'light' | 'dark' | a custom selector string", () => {
    const modes: UltimateThemeMode[] = ["system", "light", "dark", ".dark-mode"];
    expect(modes).toHaveLength(4);
  });

  it("UltimateThemeDirection is 'ltr' | 'rtl'", () => {
    const directions: UltimateThemeDirection[] = ["ltr", "rtl"];
    expect(directions).toHaveLength(2);
  });
});
