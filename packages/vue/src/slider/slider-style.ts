import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `SliderStyle` (see
 * `.vendor-extracted/vue/slider/style/SliderStyle.js`, sourced from
 * `@primeuix/styles/slider`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/vue/src/password/password-style.ts`.
 */
const css = /*css*/ `
    .u-slider {
        position: relative;
        background: dt('slider.track.background');
        border-radius: dt('slider.track.border.radius');
    }

    .u-slider.u-slider-horizontal {
        height: dt('slider.track.size');
        width: 100%;
    }

    .u-slider.u-slider-vertical {
        width: dt('slider.track.size');
        height: 100%;
    }

    .u-slider-range {
        position: absolute;
        display: block;
        background: dt('slider.range.background');
        border-radius: dt('slider.track.border.radius');
    }

    .u-slider.u-slider-horizontal .u-slider-range {
        top: 0;
        inset-inline-start: 0;
        height: 100%;
    }

    .u-slider.u-slider-vertical .u-slider-range {
        bottom: 0;
        inset-inline-start: 0;
        width: 100%;
    }

    .u-slider-handle {
        position: absolute;
        display: block;
        touch-action: none;
        cursor: grab;
        height: dt('slider.handle.height');
        width: dt('slider.handle.width');
        background: dt('slider.handle.background');
        border-radius: dt('slider.handle.border.radius');
    }

    .u-slider.u-slider-horizontal .u-slider-handle {
        top: 50%;
        margin-block-start: calc(-1 * calc(dt('slider.handle.height') / 2));
        margin-inline-start: calc(-1 * calc(dt('slider.handle.width') / 2));
    }

    .u-slider.u-slider-vertical .u-slider-handle {
        inset-inline-start: 50%;
        margin-inline-start: calc(-1 * calc(dt('slider.handle.width') / 2));
        margin-block-end: calc(-1 * calc(dt('slider.handle.height') / 2));
    }

    .u-slider.u-slider-disabled .u-slider-handle {
        cursor: default;
    }
`;

const classes = {
  root: (params: { orientation?: "horizontal" | "vertical"; disabled?: boolean } = {}) => [
    "u-slider u-component",
    {
      "u-slider-horizontal": params.orientation !== "vertical",
      "u-slider-vertical": params.orientation === "vertical",
      "u-slider-disabled": Boolean(params.disabled),
    },
  ],
  range: "u-slider-range",
  handle: "u-slider-handle",
};

/** `createBaseComponent`-shaped style module for `USlider`. */
export const sliderStyleModule: StyleModule = { css, classes };
