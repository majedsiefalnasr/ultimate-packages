// Numeric values match verified PrimeReact ESC_KEY_HANDLING_PRIORITIES (Tooltip.js
// import, confirmed during Phase 3's Real-Source Verification Gate) for the three
// proof-set-relevant tiers only. Upstream's full enum also has SLIDE_MENU (200),
// PASSWORD (700), CASCADE_SELECT (800), SPLIT_BUTTON (900), SPEED_DIAL (1000) —
// not declared here since none are current proof-set components; extend only
// when a real component needs a tier. Moved verbatim from
// react-core/src/escape/priorities.ts during Phase 4's prerequisite extraction
// (spec §11) — no value change.
//
// SIDEBAR (100) and OVERLAY_PANEL (600) added during Phase C Batch 1's Overlay
// family task (Drawer/Popover), matching real PrimeReact's own
// ESC_KEY_HANDLING_PRIORITIES values exactly (verified against
// `components/lib/hooks/useGlobalOnEscapeKey.js` this session via
// extract-primereact-source.mjs) — same "extend only when a real component
// needs a tier" precedent this file's own comment already establishes.
//
// IMAGE (400) added during Phase C Batch 1's Panel sub-batch 2 (Image's
// fullscreen preview mask needs its own Escape-close priority, real
// PrimeReact source confirms `ESC_KEY_HANDLING_PRIORITIES.IMAGE = 400` in
// `components/lib/image/Image.js`'s own `useGlobalOnEscapeKey` call) — same
// extend-only-when-needed precedent.
export const ESCAPE_PRIORITIES = {
  SIDEBAR: 100,
  DIALOG: 300,
  IMAGE: 400,
  MENU: 500,
  OVERLAY_PANEL: 600,
  TOOLTIP: 1200,
} as const;
