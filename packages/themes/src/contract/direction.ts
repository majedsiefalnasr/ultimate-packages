/**
 * Text direction. Ultimate does not implement JS-driven direction
 * switching — component CSS already responds to a `dir` attribute on any
 * ancestor element via the native CSS :dir() pseudo-class (verified in
 * @ultimate/uix-styles' shipped component CSS). This type documents the
 * two supported values for API/prop surfaces that accept a direction
 * hint; it is not itself a runtime mechanism.
 */
export type UltimateThemeDirection = "ltr" | "rtl";
