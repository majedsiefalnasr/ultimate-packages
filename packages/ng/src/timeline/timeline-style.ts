/**
 * Ultimate-owned adaptation of PrimeNG's `TimelineStyle` (see
 * `.vendor-extracted/ng/timeline/style/timelinestyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/timeline` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-timeline { display: flex; flex-direction: column; }
.u-timeline-horizontal { flex-direction: row; }
.u-timeline-event { display: flex; }
.u-timeline-vertical .u-timeline-event { flex-direction: row; }
.u-timeline-horizontal .u-timeline-event { flex-direction: column; flex: 1; }
.u-timeline-event-opposite { flex: 1; padding: 0 1rem; }
.u-timeline-event-separator { display: flex; flex-direction: column; align-items: center; }
.u-timeline-horizontal .u-timeline-event-separator { flex-direction: row; }
.u-timeline-event-marker { width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid var(--u-timeline-marker-border, #6b7280); background: var(--u-timeline-marker-bg, #fff); }
.u-timeline-event-connector { flex-grow: 1; background: var(--u-timeline-connector-bg, #d1d5db); }
.u-timeline-vertical .u-timeline-event-connector { width: 2px; }
.u-timeline-horizontal .u-timeline-event-connector { height: 2px; }
.u-timeline-event-content { flex: 1; padding: 0 1rem; }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-timeline u-component",
    `u-timeline-${(params?.["layout"] as string) ?? "vertical"}`,
  ],
  event: "u-timeline-event",
  eventOpposite: "u-timeline-event-opposite",
  eventSeparator: "u-timeline-event-separator",
  eventMarker: "u-timeline-event-marker",
  eventConnector: "u-timeline-event-connector",
  eventContent: "u-timeline-event-content",
};

/** `UBaseComponent`-shaped style module for `UTimeline`. */
export const timelineStyleModule = { css, classes };
