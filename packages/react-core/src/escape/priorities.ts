// Numeric values match verified PrimeReact ESC_KEY_HANDLING_PRIORITIES (Tooltip.js
// import, confirmed during the Real-Source Verification Gate) for the three
// proof-set-relevant tiers only. Upstream's full enum also has SIDEBAR (100),
// SLIDE_MENU (200), IMAGE (400), OVERLAY_PANEL (600), PASSWORD (700),
// CASCADE_SELECT (800), SPLIT_BUTTON (900), SPEED_DIAL (1000) — not declared
// here since none are Phase 3 components; extend only when a real component
// needs a tier.
export const ESCAPE_PRIORITIES = {
  DIALOG: 300,
  MENU: 500,
  TOOLTIP: 1200,
} as const;
