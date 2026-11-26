import * as React from "react";
import {
  Portal,
  createPassThrough,
  useComponentBase,
  useMergeProps,
  useMountEffect,
  useMotion,
  useOverlayListener,
  useUnmountEffect,
  useUpdateEffect,
  useZIndex,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import type { MotionOptions } from "@ultimate/uix-motion";
import { ConnectedOverlayScrollHandler, alignOverlay } from "@ultimate/uix-utils/dom";
import { colorPickerStyleModule } from "./color-picker-style";

type Hsb = { h: number; s: number; b: number };
type Rgb = { r: number; g: number; b: number };

export type UColorPickerValue = string | Rgb | Hsb;

export interface UColorPickerChangeEvent {
  /** The pointer event that changed the value. */
  originalEvent: Event | React.SyntheticEvent;
  value: UColorPickerValue;
  /** PrimeReact's form-style target. */
  target: { name: string | undefined; id: string | undefined; value: UColorPickerValue };
  /** No-op kept for PrimeReact parity. */
  preventDefault: () => void;
  /** No-op kept for PrimeReact parity. */
  stopPropagation: () => void;
}

/** The `ref` handle of `UColorPicker`. */
export interface UColorPickerRef {
  show: () => void;
  hide: () => void;
  focus: () => void;
  getElement: () => HTMLDivElement | null;
  getOverlay: () => HTMLDivElement | null;
  getInput: () => HTMLInputElement | null;
}

export interface UColorPickerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue" | "defaultChecked"
> {
  value?: UColorPickerValue | null;
  onChange?: (event: UColorPickerChangeEvent) => void;
  format?: "hex" | "rgb" | "hsb";
  defaultColor?: string;
  disabled?: boolean;
  /** Renders the panel in place, without the preview input. */
  inline?: boolean;
  /** Where the panel is attached. Defaults to `document.body`; `'self'` keeps it in place. */
  appendTo?: HTMLElement | "self" | (() => HTMLElement) | null;
  /** Focuses the preview input on mount. */
  autoFocus?: boolean;
  /** Name reported in the change event's `target`. */
  name?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  inputClassName?: string;
  inputStyle?: React.CSSProperties;
  panelClassName?: string;
  panelStyle?: React.CSSProperties;
  tabIndex?: number;
  /** Motion options of the panel; merged over `{ name: "u-anchored-overlay" }`. */
  transitionOptions?: MotionOptions;
  onShow?: () => void;
  onHide?: () => void;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /**
   * Attributes for the `root`, `preview`, `panel`, `content`, `colorSelector`,
   * `colorBackground`, `colorHandle`, `hue` and `hueHandle` sections, plus
   * PrimeReact's `input`, `selector` and `color` names.
   */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

function validateHsb(hsb: Hsb): Hsb {
  return {
    h: Math.min(360, Math.max(0, hsb.h)),
    s: Math.min(100, Math.max(0, hsb.s)),
    b: Math.min(100, Math.max(0, hsb.b)),
  };
}

function hexToRgb(hex: string): Rgb {
  if (!hex || typeof hex !== "string") return { r: 0, g: 0, b: 0 };
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
  let h = Math.round(hsb.h);
  const s = Math.round((hsb.s * 255) / 100);
  const v = Math.round((hsb.b * 255) / 100);
  if (s === 0) {
    rgb = { r: v, g: v, b: v };
  } else {
    const t1 = v;
    const t2 = ((255 - s) * v) / 255;
    const t3 = ((t1 - t2) * (h % 60)) / 60;
    if (h === 360) h = 0;
    if (h < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3;
    } else if (h < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3;
    } else if (h < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3;
    } else if (h < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3;
    } else if (h < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3;
    } else if (h < 360) {
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

function toHsb(value: UColorPickerValue | null | undefined, format: string, defaultColor: string) {
  if (value) {
    switch (format) {
      case "rgb":
        return rgbToHsb(value as Rgb);
      case "hsb":
        return value as Hsb;
      case "hex":
      default:
        return hexToHsb(value as string);
    }
  }
  return hexToHsb(defaultColor);
}

function toValue(hsb: Hsb, format: string): UColorPickerValue {
  switch (format) {
    case "rgb":
      return hsbToRgb(hsb);
    case "hsb":
      return { ...hsb };
    case "hex":
    default:
      return hsbToHex(hsb);
  }
}

function pointFromEvent(
  event: MouseEvent | TouchEvent,
  touchId: number | undefined
): { x: number; y: number } | null {
  if ("changedTouches" in event) {
    const touches = Array.from(event.changedTouches);
    const touch =
      touchId === undefined ? touches[0] : touches.find((item) => item.identifier === touchId);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ColorPicker` (real source:
 * `components/lib/colorpicker/ColorPicker.js`/`ColorPickerBase.js`/
 * `ColorPickerPanel.js`). Controlled through `value`/`onChange`, per React's
 * no-shared-form-state-base-class convention.
 *
 * A preview input opens a panel with a saturation/brightness square and a
 * hue strip; `inline` renders the panel in place without the input. The
 * panel is rendered through `Portal` (`appendTo`, default `document.body`),
 * aligned to the root with `alignOverlay`, stacked with `useZIndex`, animated
 * with `useMotion` (`u-anchored-overlay`, overridable through
 * `transitionOptions`), closed on an outside click, and realigned on a window
 * resize or a scroll of any scrollable ancestor
 * (`ConnectedOverlayScrollHandler`), as PrimeReact does. `onShow` fires once
 * the enter motion ends and `onHide` once the leave motion ends.
 *
 * Pointer input is mouse and touch. A drag binds document listeners, follows
 * only the touch that started it, ends on `touchcancel`, and is removed when
 * it ends or the component unmounts. While a drag runs the picker keeps its
 * own colour and ignores `value` updates, as PrimeReact does. The value is
 * `rrggbb` (no `#`) for `'hex'`, `{r,g,b}` for `'rgb'` and `{h,s,b}` for
 * `'hsb'`; hex input is read with or without `#`. The HSB maths is
 * PrimeReact's.
 *
 * `pt`, `ptOptions` and `unstyled` follow the shared pass-through contract.
 * The sections are the PrimeNG/PrimeVue names, and PrimeReact's `input`,
 * `selector` and `color` are accepted for `preview`, `colorSelector` and
 * `colorBackground`. `aria-label` and `aria-labelledby` go to the preview
 * input; every other attribute goes to the root. The CSS is the shared
 * `@ultimate/uix-styles/colorpicker` module (ADR-082).
 *
 * Excluded (ADR-104): `tooltip`/`tooltipOptions` (compose `UTooltip`),
 * PrimeReact's global `context` lookup, the `props` entry of the ref handle,
 * and the `p-inputtext` class on the preview.
 */
export const UColorPicker = React.forwardRef<UColorPickerRef, UColorPickerProps>(
  function UColorPicker(
    {
      value,
      onChange,
      format = "hex",
      defaultColor = "ff0000",
      disabled = false,
      inline = false,
      appendTo,
      autoFocus = false,
      id,
      name,
      inputId,
      inputRef,
      inputClassName,
      inputStyle,
      panelClassName,
      panelStyle,
      tabIndex,
      transitionOptions,
      onShow,
      onHide,
      className,
      unstyled,
      pt,
      ptOptions,
      "aria-label": ariaLabel = "Select a color",
      "aria-labelledby": ariaLabelledby,
      ...rest
    },
    ref
  ) {
    const { cx } = useComponentBase({
      componentName: "colorpicker",
      styleModule: colorPickerStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("colorpicker", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const { set: setZIndex, clear: clearZIndex } = useZIndex();

    const elementRef = React.useRef<HTMLDivElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);
    const noMotionRef = React.useRef<HTMLDivElement>(null);
    const inputElementRef = React.useRef<HTMLInputElement | null>(null);

    const [overlayVisible, setOverlayVisible] = React.useState(false);
    const [containerVisible, setContainerVisible] = React.useState(false);
    const [portalReady, setPortalReady] = React.useState(false);
    const [dragging, setDragging] = React.useState(false);
    const [hsb, setHsb] = React.useState<Hsb>(() => toHsb(value, format, defaultColor));

    const hsbRef = React.useRef(hsb);
    const draggingRef = React.useRef(false);
    const stopDragRef = React.useRef<(() => void) | null>(null);
    const scrollHandlerRef = React.useRef<ConnectedOverlayScrollHandler | null>(null);
    const propsRef = React.useRef({ onChange, onShow, onHide, format, disabled, name, id });
    propsRef.current = { onChange, onShow, onHide, format, disabled, name, id };

    useUpdateEffect(() => {
      if (draggingRef.current) return;
      const next = toHsb(value, format, defaultColor);
      hsbRef.current = next;
      setHsb(next);
    }, [value, format, defaultColor]);

    const show = React.useCallback(() => setOverlayVisible(true), []);
    const hide = React.useCallback(() => setOverlayVisible(false), []);

    const align = React.useCallback(() => {
      if (overlayRef.current && elementRef.current) {
        alignOverlay(overlayRef.current, elementRef.current, appendTo === "self" ? "self" : "body");
      }
    }, [appendTo]);

    React.useImperativeHandle(ref, () => ({
      show,
      hide,
      focus: () => inputElementRef.current?.focus(),
      getElement: () => elementRef.current,
      getOverlay: () => overlayRef.current,
      getInput: () => inputElementRef.current,
    }));

    const onOverlayEvent = React.useCallback(
      (_event: Event, meta: { valid: boolean; type: string }) => {
        if (!meta.valid) return;
        if (meta.type === "outside") hide();
        else align();
      },
      [hide, align]
    );

    const [bindOverlay, unbindOverlay] = useOverlayListener({
      target: elementRef as React.RefObject<HTMLElement>,
      overlay: overlayRef as React.RefObject<HTMLElement>,
      listener: onOverlayEvent,
      when: overlayVisible,
    });

    const unbindScroll = () => {
      scrollHandlerRef.current?.destroy();
      scrollHandlerRef.current = null;
    };

    useUpdateEffect(() => {
      if (overlayVisible) {
        setContainerVisible(true);
      } else {
        unbindOverlay();
        unbindScroll();
      }
    }, [overlayVisible]);

    useUpdateEffect(() => {
      if (inline || !overlayVisible || !containerVisible || !overlayRef.current) return;
      setZIndex("overlay", overlayRef.current);
      align();
      bindOverlay();
      if (!scrollHandlerRef.current && elementRef.current) {
        scrollHandlerRef.current = new ConnectedOverlayScrollHandler(
          elementRef.current,
          (event) => {
            if (event.target !== document) align();
          }
        );
        scrollHandlerRef.current.bindScrollListener();
      }
    }, [overlayVisible, containerVisible, portalReady]);

    useMotion(
      inline ? noMotionRef : overlayRef,
      overlayVisible && containerVisible,
      {
        name: "u-anchored-overlay",
        ...transitionOptions,
        onAfterEnter: (event) => {
          transitionOptions?.onAfterEnter?.(event);
          propsRef.current.onShow?.();
        },
        onAfterLeave: (event) => {
          transitionOptions?.onAfterLeave?.(event);
          clearZIndex(overlayRef.current);
          setContainerVisible(false);
          setPortalReady(false);
          propsRef.current.onHide?.();
        },
      },
      portalReady
    );

    useMountEffect(() => {
      if (autoFocus) inputElementRef.current?.focus();
    });

    useUnmountEffect(() => {
      stopDragRef.current?.();
      unbindOverlay();
      unbindScroll();
      clearZIndex(overlayRef.current);
    });

    const togglePanel = () => {
      if (overlayVisible) hide();
      else show();
    };

    const onInputKeyDown = (event: React.KeyboardEvent) => {
      switch (event.code) {
        case "Space":
          togglePanel();
          event.preventDefault();
          break;
        case "Escape":
        case "Tab":
          hide();
          break;
        default:
          break;
      }
    };

    const updateModel = (next: Hsb, originalEvent: Event | React.SyntheticEvent) => {
      hsbRef.current = next;
      setHsb(next);
      const current = propsRef.current;
      const newValue = toValue(next, current.format);
      current.onChange?.({
        originalEvent,
        value: newValue,
        target: { name: current.name, id: current.id, value: newValue },
        preventDefault: () => {},
        stopPropagation: () => {},
      });
    };

    const beginDrag = (event: React.MouseEvent | React.TouchEvent, part: "color" | "hue") => {
      if (disabled) return;
      stopDragRef.current?.();
      const element = event.currentTarget as HTMLElement;
      const native = event.nativeEvent as MouseEvent | TouchEvent;
      const touch = "changedTouches" in native;
      const touchId = touch ? (native as TouchEvent).changedTouches[0]?.identifier : undefined;
      if (!touch) event.preventDefault();

      const pick = (pickEvent: MouseEvent | TouchEvent, original: Event | React.SyntheticEvent) => {
        const point = pointFromEvent(pickEvent, touchId);
        if (!point) return;
        const rect = element.getBoundingClientRect();
        const current = hsbRef.current;
        if (part === "color") {
          const saturation = Math.floor(
            (100 * Math.max(0, Math.min(150, point.x - rect.left))) / 150
          );
          const brightness = Math.floor(
            (100 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150
          );
          updateModel(validateHsb({ h: current.h, s: saturation, b: brightness }), original);
        } else {
          const hue = Math.floor(
            (360 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150
          );
          updateModel(validateHsb({ h: hue, s: current.s, b: current.b }), original);
        }
      };
      const move = (moveEvent: MouseEvent | TouchEvent) => {
        if (propsRef.current.disabled) return;
        if (moveEvent.cancelable) moveEvent.preventDefault();
        pick(moveEvent, moveEvent);
      };
      const stop = () => {
        stopDragRef.current = null;
        draggingRef.current = false;
        setDragging(false);
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", stop);
        document.removeEventListener("touchcancel", stop);
      };

      if (touch) {
        document.addEventListener("touchmove", move, { passive: false });
        document.addEventListener("touchend", stop);
        document.addEventListener("touchcancel", stop);
      } else {
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", stop);
      }
      stopDragRef.current = stop;
      draggingRef.current = true;
      setDragging(true);
      pick(native, event);
    };

    const colorSelectorBg = "#" + hsbToHex(validateHsb({ h: hsb.h, s: 100, b: 100 }));

    const panel = (
      <div
        ref={overlayRef}
        {...mergeProps(
          {
            className: [cx("panel", { inline, disabled }), panelClassName]
              .filter(Boolean)
              .join(" "),
            style: panelStyle,
          },
          ptm("panel")
        )}
      >
        <div {...mergeProps({ className: cx("content") }, ptm("content"))}>
          <div
            {...mergeProps(
              {
                className: cx("colorSelector"),
                style: { backgroundColor: colorSelectorBg },
                onMouseDown: (event: React.MouseEvent) => beginDrag(event, "color"),
                onTouchStart: (event: React.TouchEvent) => beginDrag(event, "color"),
              },
              ptm("selector"),
              ptm("colorSelector")
            )}
          >
            <div
              {...mergeProps(
                { className: cx("colorBackground") },
                ptm("color"),
                ptm("colorBackground")
              )}
            >
              <div
                {...mergeProps(
                  {
                    className: cx("colorHandle"),
                    style: {
                      left: Math.floor((150 * hsb.s) / 100),
                      top: Math.floor((150 * (100 - hsb.b)) / 100),
                    },
                  },
                  ptm("colorHandle")
                )}
              />
            </div>
          </div>
          <div
            {...mergeProps(
              {
                className: cx("hue"),
                onMouseDown: (event: React.MouseEvent) => beginDrag(event, "hue"),
                onTouchStart: (event: React.TouchEvent) => beginDrag(event, "hue"),
              },
              ptm("hue")
            )}
          >
            <div
              {...mergeProps(
                {
                  className: cx("hueHandle"),
                  style: { top: Math.floor(150 - (150 * hsb.h) / 360) },
                },
                ptm("hueHandle")
              )}
            />
          </div>
        </div>
      </div>
    );

    return (
      <div
        ref={elementRef}
        {...mergeProps(
          rest,
          {
            id,
            className: [cx("root", { inline, dragging }), className].filter(Boolean).join(" "),
          },
          ptm("root")
        )}
      >
        {!inline && (
          <input
            ref={(element) => {
              inputElementRef.current = element;
              assignRef(inputRef, element);
            }}
            {...mergeProps(
              {
                type: "text",
                readOnly: true,
                className: [cx("preview", { disabled }), inputClassName].filter(Boolean).join(" "),
                style: { ...inputStyle, backgroundColor: "#" + hsbToHex(hsb) },
                id: inputId,
                tabIndex,
                disabled,
                "aria-label": ariaLabel,
                "aria-labelledby": ariaLabelledby,
                "aria-haspopup": "true",
                "aria-expanded": overlayVisible,
                onClick: () => {
                  if (!disabled) togglePanel();
                },
                onKeyDown: onInputKeyDown,
              },
              ptm("input"),
              ptm("preview")
            )}
          />
        )}
        {inline ? (
          panel
        ) : containerVisible ? (
          <Portal
            element={panel}
            appendTo={appendTo ?? undefined}
            visible
            onMount={() => setPortalReady(true)}
          />
        ) : null}
      </div>
    );
  }
);

UColorPicker.displayName = "UColorPicker";
