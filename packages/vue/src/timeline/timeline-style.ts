/**
 * Ultimate-owned adaptation of PrimeVue's `Timeline` style (see
 * `.vendor-extracted/vue/timeline/style/TimelineStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/timeline` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-timeline{display: flex;flex-grow: 1;flex-direction: column;direction: ltr;list-style: none;margin: 0;padding: 0;}
.u-timeline-vertical .u-timeline-event-opposite, .u-timeline-vertical .u-timeline-event-content{padding: dt('timeline.vertical.event.content.padding');}
.u-timeline-vertical .u-timeline-event-connector{width: dt('timeline.event.connector.size');}
.u-timeline-event{display: flex;position: relative;min-height: dt('timeline.event.min.height');}
.u-timeline-event:last-child{min-height: 0;}
.u-timeline-event-opposite{flex: 1;}
.u-timeline-event-content{flex: 1;}
.u-timeline-event-separator{flex: 0;display: flex;align-items: center;flex-direction: column;}
.u-timeline-event-marker{display: inline-flex;align-items: center;justify-content: center;position: relative;align-self: baseline;border-width: dt('timeline.event.marker.border.width');border-style: solid;border-color: dt('timeline.event.marker.border.color');border-radius: dt('timeline.event.marker.border.radius');width: dt('timeline.event.marker.size');height: dt('timeline.event.marker.size');background: dt('timeline.event.marker.background');}
.u-timeline-event-marker::before{content: ' ';border-radius: dt('timeline.event.marker.content.border.radius');width: dt('timeline.event.marker.content.size');height: dt('timeline.event.marker.content.size');background: dt('timeline.event.marker.content.background');}
.u-timeline-event-marker::after{content: ' ';position: absolute;width: 100%;height: 100%;border-radius: dt('timeline.event.marker.border.radius');box-shadow: dt('timeline.event.marker.content.inset.shadow');}
.u-timeline-event-connector{flex-grow: 1;background: dt('timeline.event.connector.color');}
.u-timeline-horizontal{flex-direction: row;}
.u-timeline-horizontal .u-timeline-event{flex-direction: column;flex: 1;}
.u-timeline-horizontal .u-timeline-event:last-child{flex: 0;}
.u-timeline-horizontal .u-timeline-event-separator{flex-direction: row;}
.u-timeline-horizontal .u-timeline-event-connector{width: 100%;height: dt('timeline.event.connector.size');}
.u-timeline-horizontal .u-timeline-event-opposite, .u-timeline-horizontal .u-timeline-event-content{padding: dt('timeline.horizontal.event.content.padding');}
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    ["u-timeline u-component", `u-timeline-${(params?.["layout"] as string) ?? "vertical"}`].join(" "),
  event: "u-timeline-event",
  eventOpposite: "u-timeline-event-opposite",
  eventSeparator: "u-timeline-event-separator",
  eventMarker: "u-timeline-event-marker",
  eventConnector: "u-timeline-event-connector",
  eventContent: "u-timeline-event-content",
};

/** `createBaseComponent`-shaped style module for `UTimeline`. */
export const timelineStyleModule = { css, classes };
