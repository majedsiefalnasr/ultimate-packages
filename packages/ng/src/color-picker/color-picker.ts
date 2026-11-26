import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder, UBind, UOverlay, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UAutoFocus } from "@ultimate/ng/autofocus";
import { createMotion, type MotionInstance, type MotionOptions } from "@ultimate/uix-motion";
import {
  ConnectedOverlayScrollHandler,
  absolutePosition,
  isTouchDevice,
  relativePosition,
} from "@ultimate/uix-utils/dom";
import { colorPickerStyleModule } from "./color-picker-style";

export type UColorPickerValue =
  string | { r: number; g: number; b: number } | { h: number; s: number; b: number };

export interface UColorPickerChangeEvent {
  originalEvent: Event;
  value: UColorPickerValue;
}

/** Where the panel is attached: in place (`'self'`), `'body'`, or a given element. */
export type UColorPickerAppendTo = "self" | "body" | HTMLElement | ElementRef<HTMLElement>;

interface Hsb {
  h: number;
  s: number;
  b: number;
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

/**
 * Ultimate-owned adaptation of PrimeNG's `ColorPicker` component (see
 * `.vendor-extracted/ng/colorpicker/colorpicker.ts`). Real source extends
 * `BaseEditableHolder<ColorPickerPassThrough>`, the same tier `UKnob` and
 * `USlider` extend.
 *
 * A preview input opens a panel with a saturation/brightness square and a
 * hue strip; `inline` renders the panel in place without the input. The
 * panel sits in `UOverlay`: `appendTo` defaults to `'self'` (PrimeNG's
 * `overlayAppendTo` default), and `'body'` or an element moves it there. It
 * is aligned to the host with `relativePosition`/`absolutePosition`, animated
 * with `@ultimate/uix-motion` (`u-anchored-overlay`, overridable through
 * `motionOptions`), stacked by `UOverlay` when `autoZIndex` is set, and closed
 * on an outside click, a scroll of any scrollable ancestor
 * (`ConnectedOverlayScrollHandler`), a window resize on non-touch devices, and
 * Escape or Tab on the input, as PrimeNG's overlay does.
 *
 * Pointer input is mouse and touch. A drag binds document listeners, follows
 * only the touch that started it, ends on `touchcancel`, and is removed when
 * it ends or the component is destroyed. The value is `#rrggbb` for `'hex'`,
 * `{r,g,b}` for `'rgb'` and `{h,s,b}` for `'hsb'`; hex input is read with or
 * without `#`. The HSB maths is PrimeNG's.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`. The root section is
 * bound through the `UBind` host directive, the component provides itself as
 * `U_PARENT_INSTANCE`, and `preview`, `panel`, `content`, `colorSelector`,
 * `colorBackground`, `colorHandle`, `hue` and `hueHandle` bind their own
 * sections. The CSS is the shared `@ultimate/uix-styles/colorpicker` module
 * (ADR-082).
 *
 * Deliberately excludes PrimeNG's `styleClass`, `showTransitionOptions` and
 * `hideTransitionOptions` (deprecated), `overlayOptions` and the `pcOverlay`
 * section (no Ultimate overlay-options API), and the `$pcColorPicker`
 * instance token; each is recorded in ADR-104.
 */
@Component({
  standalone: true,
  selector: "u-color-picker",
  imports: [UBind, UOverlay, UAutoFocus],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UColorPicker, multi: true },
    { provide: U_PARENT_INSTANCE, useExisting: UColorPicker },
  ],
  template: `
    @if (!inline()) {
      <input
        #input
        [uBind]="ptm('preview')"
        type="text"
        readonly
        [class]="cx('preview', previewClassesParams())"
        [attr.id]="inputId()"
        [attr.tabindex]="tabindex()"
        [attr.disabled]="$disabled() ? '' : undefined"
        [style.backgroundColor]="inputBgColor()"
        [attr.aria-label]="ariaLabel"
        aria-haspopup="true"
        [attr.aria-expanded]="overlayVisible()"
        [uAutoFocus]="autofocus()"
        (click)="onInputClick()"
        (keydown)="onInputKeydown($event)"
        (focus)="onInputFocus()"
      />
    }
    @if (inline() || overlayRendered()) {
      <div
        #panel
        uOverlay
        [visible]="!inline()"
        [appendTo]="inline() ? 'self' : $appendTo()"
        [autoZIndex]="autoZIndex()"
        [uBind]="ptm('panel')"
        [class]="cx('panel', panelClassesParams())"
      >
        <div [uBind]="ptm('content')" [class]="cx('content')">
          <div
            [uBind]="ptm('colorSelector')"
            [class]="cx('colorSelector')"
            [style.backgroundColor]="colorSelectorBg()"
            (mousedown)="onDragStart($event, 'color')"
            (touchstart)="onDragStart($event, 'color')"
          >
            <div [uBind]="ptm('colorBackground')" [class]="cx('colorBackground')">
              <div
                [uBind]="ptm('colorHandle')"
                [class]="cx('colorHandle')"
                [style.left.px]="colorHandleLeft()"
                [style.top.px]="colorHandleTop()"
              ></div>
            </div>
          </div>
          <div
            [uBind]="ptm('hue')"
            [class]="cx('hue')"
            (mousedown)="onDragStart($event, 'hue')"
            (touchstart)="onDragStart($event, 'hue')"
          >
            <div
              [uBind]="ptm('hueHandle')"
              [class]="cx('hueHandle')"
              [style.top.px]="hueHandleTop()"
            ></div>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    "[class]": "cx('root', rootClassesParams())",
  },
  hostDirectives: [UBind],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UColorPicker extends UBaseEditableHolder {
  protected override readonly componentName = "colorpicker";
  protected override readonly styleModule = colorPickerStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });
  private readonly injector = inject(Injector);

  /** Whether to display the panel in place, without the preview input. */
  inline = input(false, { transform: booleanAttribute });
  /** Format to use in value binding. */
  format = input<"hex" | "rgb" | "hsb">("hex");
  /** Index of the preview input in tabbing order. */
  tabindex = input<string | number | undefined>(undefined);
  /** Identifier of the preview input, to match a label. */
  inputId = input<string>();
  /** Whether to automatically manage layering. */
  autoZIndex = input(true, { transform: booleanAttribute });
  /** When present, the preview input gets focus on load. */
  autofocus = input(false, { transform: booleanAttribute });
  /** Default color to display initially when model value is not present. */
  defaultColor = input("ff0000");
  /** Where the panel is attached. Defaults to `'self'`. */
  appendTo = input<UColorPickerAppendTo | null | undefined>(undefined);
  /** Motion options of the panel; merged over `{ name: "u-anchored-overlay" }`. */
  motionOptions = input<MotionOptions | undefined>(undefined);
  /** Accepted for parity with PrimeNG, which renders nothing for it on ColorPicker. */
  invalid = input(false, { transform: booleanAttribute });
  /** Accepted for parity with PrimeNG, which renders nothing for it on ColorPicker. */
  required = input(false, { transform: booleanAttribute });
  /** Accepted for parity with PrimeNG, which renders nothing for it on ColorPicker. */
  name = input<string>();

  /** Callback to invoke on value change. */
  onChange = output<UColorPickerChangeEvent>();
  /** Callback to invoke when the panel is shown. */
  onShow = output<void>();
  /** Callback to invoke when the panel is hidden. */
  onHide = output<void>();

  /** Accessible name of the preview input. */
  protected readonly ariaLabel = "Select a color";

  protected readonly overlayVisible = signal(false);
  protected readonly overlayRendered = signal(false);
  private readonly dragging = signal(false);
  private readonly hsbValue = signal<Hsb>({ h: 0, s: 100, b: 100 });

  private readonly panelRef = viewChild<ElementRef<HTMLElement>>("panel");

  protected readonly $appendTo = computed<"self" | "body" | HTMLElement>(() => {
    const appendTo = this.appendTo();
    if (!appendTo) return "self";
    return appendTo instanceof ElementRef ? appendTo.nativeElement : appendTo;
  });

  protected readonly inputBgColor = computed(() => "#" + this.hsbToHex(this.hsbValue()));
  protected readonly colorSelectorBg = computed(
    () => "#" + this.hsbToHex(this.validateHsb({ h: this.hsbValue().h, s: 100, b: 100 }))
  );
  protected readonly colorHandleLeft = computed(() => Math.floor((150 * this.hsbValue().s) / 100));
  protected readonly colorHandleTop = computed(() =>
    Math.floor((150 * (100 - this.hsbValue().b)) / 100)
  );
  protected readonly hueHandleTop = computed(() =>
    Math.floor(150 - (150 * this.hsbValue().h) / 360)
  );

  private motion: MotionInstance | null = null;
  private stopDrag: (() => void) | null = null;
  private unbindOverlayListeners: (() => void) | null = null;
  private destroyed = false;

  private readonly destroyRegistration = inject(DestroyRef).onDestroy(() => {
    this.destroyed = true;
    this.stopDrag?.();
    this.unbindOverlayListeners?.();
    this.motion?.cancel();
    this.motion = null;
  });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }

  protected rootClassesParams() {
    return { inline: this.inline(), dragging: this.dragging() };
  }

  protected previewClassesParams() {
    return { disabled: this.$disabled() };
  }

  protected panelClassesParams() {
    return { inline: this.inline(), disabled: this.$disabled() };
  }

  /** Opens the panel. */
  show(): void {
    if (this.inline() || this.overlayVisible()) return;
    this.overlayVisible.set(true);
    if (this.overlayRendered()) {
      this.onPanelShown();
      return;
    }
    this.overlayRendered.set(true);
    afterNextRender(() => this.onPanelShown(), { injector: this.injector });
  }

  /** Closes the panel. */
  hide(): void {
    if (this.inline() || !this.overlayVisible()) return;
    this.overlayVisible.set(false);
    this.unbindOverlayListeners?.();
    const panel = this.panelRef()?.nativeElement;
    if (!panel) {
      this.onPanelHidden();
      return;
    }
    this.motion ??= createMotion(panel, this.resolvedMotionOptions());
    void this.motion.leave().then(() => {
      if (this.destroyed || this.overlayVisible()) return;
      this.onPanelHidden();
    });
  }

  /** Opens the panel when it is closed, and closes it when it is open. */
  togglePanel(): void {
    if (this.overlayVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  private resolvedMotionOptions(): MotionOptions {
    return { name: "u-anchored-overlay", ...this.motionOptions() };
  }

  private onPanelShown(): void {
    const panel = this.panelRef()?.nativeElement;
    if (this.destroyed || !panel || !this.overlayVisible()) return;
    this.alignOverlay(panel);
    this.bindOverlayListeners(panel);
    this.onShow.emit();
    this.motion = createMotion(panel, this.resolvedMotionOptions());
    void this.motion.enter();
  }

  private onPanelHidden(): void {
    this.motion = null;
    this.overlayRendered.set(false);
    this.onHide.emit();
  }

  private alignOverlay(panel: HTMLElement): void {
    const target = this.el.nativeElement as HTMLElement;
    if (this.$appendTo() === "self") {
      relativePosition(panel, target);
    } else {
      absolutePosition(panel, target);
    }
  }

  private bindOverlayListeners(panel: HTMLElement): void {
    this.unbindOverlayListeners?.();
    const host = this.el.nativeElement as HTMLElement;
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (event.button !== 2 && !host.contains(target) && !panel.contains(target)) {
        this.hide();
      }
    };
    const onWindowResize = () => {
      if (!isTouchDevice()) this.hide();
    };
    const scrollHandler = new ConnectedOverlayScrollHandler(host, () => this.hide());
    this.document.addEventListener("click", onDocumentClick);
    window.addEventListener("resize", onWindowResize);
    scrollHandler.bindScrollListener();
    this.unbindOverlayListeners = () => {
      this.unbindOverlayListeners = null;
      this.document.removeEventListener("click", onDocumentClick);
      window.removeEventListener("resize", onWindowResize);
      scrollHandler.destroy();
    };
  }

  protected onInputClick(): void {
    if (this.$disabled()) return;
    this.togglePanel();
  }

  protected onInputFocus(): void {
    this.onModelTouched();
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    switch (event.code) {
      case "Space":
        this.togglePanel();
        event.preventDefault();
        break;
      case "Escape":
      case "Tab":
        this.hide();
        break;
      default:
        break;
    }
  }

  protected onDragStart(event: MouseEvent | TouchEvent, part: "color" | "hue"): void {
    if (this.$disabled()) return;
    this.stopDrag?.();
    const element = event.currentTarget as HTMLElement;
    const touch = "changedTouches" in event;
    const touchId = touch ? event.changedTouches[0]?.identifier : undefined;
    if (!touch) event.preventDefault();

    const pick = (pickEvent: MouseEvent | TouchEvent) => {
      const point = pointFromEvent(pickEvent, touchId);
      if (!point) return;
      if (part === "color") {
        this.pickColor(element, point, pickEvent);
      } else {
        this.pickHue(element, point, pickEvent);
      }
    };
    const move = (moveEvent: MouseEvent | TouchEvent) => {
      if (this.$disabled()) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      pick(moveEvent);
    };
    const stop = () => {
      this.stopDrag = null;
      this.dragging.set(false);
      this.document.removeEventListener("mousemove", move);
      this.document.removeEventListener("mouseup", stop);
      this.document.removeEventListener("touchmove", move);
      this.document.removeEventListener("touchend", stop);
      this.document.removeEventListener("touchcancel", stop);
    };

    if (touch) {
      this.document.addEventListener("touchmove", move, { passive: false });
      this.document.addEventListener("touchend", stop);
      this.document.addEventListener("touchcancel", stop);
    } else {
      this.document.addEventListener("mousemove", move);
      this.document.addEventListener("mouseup", stop);
    }
    this.stopDrag = stop;
    this.dragging.set(true);
    pick(event);
  }

  private pickColor(element: HTMLElement, point: { x: number; y: number }, event: Event): void {
    const rect = element.getBoundingClientRect();
    const saturation = Math.floor((100 * Math.max(0, Math.min(150, point.x - rect.left))) / 150);
    const brightness = Math.floor(
      (100 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150
    );
    this.hsbValue.set(this.validateHsb({ h: this.hsbValue().h, s: saturation, b: brightness }));
    this.updateModel(event);
  }

  private pickHue(element: HTMLElement, point: { x: number; y: number }, event: Event): void {
    const rect = element.getBoundingClientRect();
    const hue = Math.floor((360 * (150 - Math.max(0, Math.min(150, point.y - rect.top)))) / 150);
    const current = this.hsbValue();
    this.hsbValue.set(this.validateHsb({ h: hue, s: current.s, b: current.b }));
    this.updateModel(event);
  }

  private updateModel(event: Event): void {
    const value = this.getValueToUpdate();
    this.writeModelValue(value);
    this.onModelChange(value);
    this.onChange.emit({ originalEvent: event, value });
  }

  private getValueToUpdate(): UColorPickerValue {
    switch (this.format()) {
      case "rgb":
        return this.hsbToRgb(this.hsbValue());
      case "hsb":
        return { ...this.hsbValue() };
      case "hex":
      default:
        return "#" + this.hsbToHex(this.hsbValue());
    }
  }

  private validateHsb(hsb: Hsb): Hsb {
    return {
      h: Math.min(360, Math.max(0, hsb.h)),
      s: Math.min(100, Math.max(0, hsb.s)),
      b: Math.min(100, Math.max(0, hsb.b)),
    };
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    if (!hex || typeof hex !== "string") return { r: 0, g: 0, b: 0 };
    const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
    return { r: hexValue >> 16, g: (hexValue & 0x00ff00) >> 8, b: hexValue & 0x0000ff };
  }

  private hexToHsb(hex: string): Hsb {
    return this.rgbToHsb(this.hexToRgb(hex));
  }

  private rgbToHsb(rgb: { r: number; g: number; b: number }): Hsb {
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

  private hsbToRgb(hsb: Hsb): { r: number; g: number; b: number } {
    let rgb = { r: 0, g: 0, b: 0 };
    const s = (hsb.s * 255) / 100;
    const v = (hsb.b * 255) / 100;
    if (s === 0) {
      rgb = { r: v, g: v, b: v };
    } else {
      const t1 = v;
      const t2 = ((255 - s) * v) / 255;
      const t3 = ((t1 - t2) * (hsb.h % 60)) / 60;
      const h = hsb.h === 360 ? 0 : hsb.h;
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

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const hex = [rgb.r.toString(16), rgb.g.toString(16), rgb.b.toString(16)];
    for (let i = 0; i < hex.length; i++) {
      if (hex[i].length === 1) hex[i] = "0" + hex[i];
    }
    return hex.join("");
  }

  private hsbToHex(hsb: Hsb): string {
    return this.rgbToHex(this.hsbToRgb(hsb));
  }

  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    let hsb: Hsb;
    if (value) {
      switch (this.format()) {
        case "rgb":
          hsb = this.rgbToHsb(value as { r: number; g: number; b: number });
          break;
        case "hsb":
          hsb = value as Hsb;
          break;
        case "hex":
        default:
          hsb = this.hexToHsb(value as string);
          break;
      }
    } else {
      hsb = this.hexToHsb(this.defaultColor());
    }
    this.hsbValue.set(hsb);
    setModelValue(value ?? this.getValueToUpdate());
  }
}
