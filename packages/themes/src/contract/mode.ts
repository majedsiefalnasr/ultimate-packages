/**
 * Light/dark mode selector. 'system' follows the OS preference
 * (prefers-color-scheme); a string starting with '.' or '[' is a
 * class/attribute selector; any other string is passed through as a raw
 * media-query or custom selector. Matches @ultimate/uix-styled's
 * darkModeSelector option shape exactly (packages/uix-styled/src/utils/themeUtils.ts's
 * regex.rules dispatcher).
 */
export type UltimateThemeMode = "system" | "light" | "dark" | string;
