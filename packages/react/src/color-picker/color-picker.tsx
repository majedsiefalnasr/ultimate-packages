import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { colorPickerStyleModule } from "./color-picker-style";

type Hsb = { h: number; s: number; b: number };
type Rgb = { r: number; g: number; b: number };

export type UColorPickerValue = string | Rgb | Hsb;

export interface UColorPickerChangeEvent {
  originalEvent: Event | React.SyntheticEvent;
  value: UColorPickerValue;
}

export interface UColorPickerProps {
  value: UColorPickerValue | null;
  onChange: (event: UColorPickerChangeEvent) => void;
  format?: "hex" | "rgb" | "hsb";
  defaultColor?: string;
  disabled?: boolean;
  className?: string;
  onShow?: () => void;
  onHide?: () => void;
}

function validateHsb(hsb: Hsb): Hsb {
  return {
    h: Math.min(360, Math.max(0, hsb.h)),
    s: Math.min(100, Math.max(0, hsb.s)),
    b: Math.min(100, Math.max(0, hsb.b)),
  };
}

function hexToRgb(hex: string): Rgb {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
  return { r: hexValue >> 16, g: (hexValue & 0x00ff00) >> 8, b: hexValue & 0x0000ff };
}

function rgbToHsb(rgb: Rgb): Hsb {
  const hsb: Hsb = { h: 0, s: 0, b: 0 };
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const delta = max - min;
  hsb.b = max;
  hsb.s = max !== 0 ? (255 * delta) / max : 0;
  if (hsb.s !== 0) {
    if (rgb.r === max) hsb.h = (rgb.g - rgb.b) / delta;
    else if (rgb.g === max) hsb.h = 2 + (rgb.b - rgb.r) / delta;
    else hsb.h = 4 + (rgb.r - rgb.g) / delta;
  } else {
    hsb.h = -1;
  }
  hsb.h *= 60;
  if (hsb.h < 0) hsb.h += 360;
  hsb.s *= 100 / 255;
  hsb.b *= 100 / 255;
  return hsb;
}

function hexToHsb(hex: string): Hsb {
  return rgbToHsb(hexToRgb(hex));
}

function hsbToRgb(hsb: Hsb): Rgb {
  let rgb = { r: 0, g: 0, b: 0 };
  const h = hsb.h;
  const s = (hsb.s * 255) / 100;
  const v = (hsb.b * 255) / 100;
  if (s === 0) {
    rgb = { r: v, g: v, b: v };
  } else {
    const t1 = v;
    const t2 = ((255 - s) * v) / 255;
    const t3 = ((t1 - t2) * (h % 60)) / 60;
    let hh = h;
    if (hh === 360) hh = 0;
    if (hh < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3;
    } else if (hh < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3;
    } else if (hh < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3;
    } else if (hh < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3;
    } else if (hh < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3;
    } else if (hh < 360) {
      rgb.r = t1;
      rgb.g = t2;
      rgb.b = t1 - t3;
    }
  }
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

function rgbToHex(rgb: Rgb): string {
  const hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
  for (let i = 0; i < hex.length; i++) {
    if (hex[i].length === 1) hex[i] = "0" + hex[i];
  }
  return hex.join("");
}

function hsbToHex(hsb: Hsb): string {
  return rgbToHex(hsbToRgb(hsb));
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ColorPicker` (real source:
 * `components/lib/colorpicker/ColorPicker.js`/`ColorPickerBase.js`/
 * `ColorPickerPanel.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention — same shape every sibling React component in this batch
 * follows.
 *
 * Overlay-based: real source's own `ColorPickerPanel` is a Portal-based
 * overlay (`react-transition-group` + `Portal`) around a color-selector
 * square (saturation/brightness drag) plus a hue strip (vertical drag).
 * This port instead follows the "absolute-positioned panel, no Portal"
 * convention `USelect`'s own React realization already established for this
 * batch (`packages/react/src/select/select.tsx`) — same reasoning: no
 * cross-batch precedent for introducing a new Portal dependency into
 * `react-core`, and an absolute-positioned panel is sufficient for this
 * capability's own layout needs.
 *
 * Value format matches real source's own `format` prop: `'hex'` (default, a
 * `#rrggbb` string), `'rgb'` (`{r,g,b}`), or `'hsb'` (`{h,s,b}`) — same
 * HSB/RGB/HEX conversion math as real source's own `HSBtoRGB`/`RGBtoHSB`/
 * `HSBtoHEX`/`HEXtoHSB`.
 *
 * Deliberately excludes real source's much larger surface: `inline` mode,
 * touch-event handling (mouse/keyboard interaction only, matching every
 * sibling component's established "smaller surface than upstream"
 * precedent), and PrimeReact's global `context` config lookup.
 */
export function UColorPicker({
  value,
  onChange,
  format = "hex",
  defaultColor = "ff0000",
  disabled = false,
  className,
  onShow,
  onHide,
}: UColorPickerProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "color-picker", styleModule: colorPickerStyleModule });
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const colorSelectorRef = React.useRef<HTMLDivElement>(null);
  const hueRef = React.useRef<HTMLDivElement>(null);
  const draggingColorRef = React.useRef(false);
  const draggingHueRef = React.useRef(false);

  const toHsb = React.useCallback(
    (v: UColorPickerValue | null): Hsb => {
      if (v) {
        switch (format) {
          case "rgb":
            return rgbToHsb(v as Rgb);
          case "hsb":
            return v as Hsb;
          case "hex":
          default:
            return hexToHsb(v as string);
        }
      }
      return hexToHsb(defaultColor);
    },
    [format, defaultColor]
  );

  const hsbValue = toHsb(value);

  const getValueToUpdate = (hsb: Hsb): UColorPickerValue => {
    switch (format) {
      case "rgb":
        return hsbToRgb(hsb);
      case "hsb":
        return { ...hsb };
      case "hex":
      default:
        return "#" + hsbToHex(hsb);
    }
  };

  const updateModel = (hsb: Hsb, event: Event | React.SyntheticEvent) => {
    onChange({ originalEvent: event, value: getValueToUpdate(hsb) });
  };

  const togglePanel = () => {
    if (disabled) return;
    setOverlayVisible((visible) => {
      const next = !visible;
      if (next) onShow?.();
      else onHide?.();
      return next;
    });
  };

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    switch (event.code) {
      case "Space":
        togglePanel();
        event.preventDefault();
        break;
      case "Escape":
      case "Tab":
        if (overlayVisible) {
          setOverlayVisible(false);
          onHide?.();
        }
        break;
      default:
        break;
    }
  };

  const pickColor = (clientX: number, clientY: number, event: Event | React.SyntheticEvent) => {
    const rect = colorSelectorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const saturation = Math.floor((100 * Math.max(0, Math.min(150, clientX - rect.left))) / 150);
    const brightness = Math.floor((100 * (150 - Math.max(0, Math.min(150, clientY - rect.top)))) / 150);
    updateModel(validateHsb({ h: hsbValue.h, s: saturation, b: brightness }), event);
  };

  const pickHue = (clientY: number, event: Event | React.SyntheticEvent) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hue = Math.floor((360 * (150 - Math.max(0, Math.min(150, clientY - rect.top)))) / 150);
    updateModel(validateHsb({ h: hue, s: hsbValue.s, b: hsbValue.b }), event);
  };

  const onColorMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    draggingColorRef.current = true;
    pickColor(event.clientX, event.clientY, event);
    bindDragListeners();
  };

  const onHueMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    draggingHueRef.current = true;
    pickHue(event.clientY, event);
    bindDragListeners();
  };

  const bindDragListeners = () => {
    const move = (event: MouseEvent) => {
      if (draggingColorRef.current) pickColor(event.clientX, event.clientY, event);
      if (draggingHueRef.current) pickHue(event.clientY, event);
    };
    const up = () => {
      draggingColorRef.current = false;
      draggingHueRef.current = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const inputBgColor = "#" + hsbToHex(hsbValue);
  const colorSelectorBg = "#" + hsbToHex(validateHsb({ h: hsbValue.h, s: 100, b: 100 }));
  const colorHandleLeft = Math.floor((150 * hsbValue.s) / 100);
  const colorHandleTop = Math.floor((150 * (100 - hsbValue.b)) / 100);
  const hueHandleTop = Math.floor(150 - (150 * hsbValue.h) / 360);

  return (
    <div className={[cx("root"), className].filter(Boolean).join(" ")}>
      <input
        type="text"
        readOnly
        className={cx("preview", { disabled })}
        tabIndex={disabled ? -1 : 0}
        disabled={disabled}
        style={{ backgroundColor: inputBgColor }}
        aria-label="Select color"
        aria-haspopup="true"
        aria-expanded={overlayVisible}
        onClick={togglePanel}
        onKeyDown={onInputKeyDown}
      />
      {overlayVisible && (
        <div className={cx("panel")}>
          <div className={cx("content")}>
            <div
              ref={colorSelectorRef}
              className={cx("colorSelector")}
              style={{ backgroundColor: colorSelectorBg }}
              onMouseDown={onColorMouseDown}
            >
              <div className={cx("colorBackground")}>
                <div
                  className={cx("colorHandle")}
                  style={{ left: colorHandleLeft, top: colorHandleTop }}
                />
              </div>
            </div>
            <div ref={hueRef} className={cx("hue")} onMouseDown={onHueMouseDown}>
              <div className={cx("hueHandle")} style={{ top: hueHandleTop }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
