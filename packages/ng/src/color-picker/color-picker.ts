import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder, UOverlay } from "@ultimate/ng-core";
import { colorPickerStyleModule } from "./color-picker-style";

export interface UColorPickerChangeEvent {
  originalEvent: Event;
  value: string | { r: number; g: number; b: number } | { h: number; s: number; b: number };
}

interface Hsb {
  h: number;
  s: number;
  b: number;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `ColorPicker` component (see
 * `.vendor-extracted/ng/colorpicker/colorpicker.ts`). Real source extends
 * `BaseEditableHolder<ColorPickerPassThrough>` — confirmed against `export
 * class ColorPicker extends BaseEditableHolder<...>` — same tier `URating`/
 * `USlider`/`UKnob` already extend, not `UBaseInput`.
 *
 * Overlay-based: real source's own template composes `p-overlay` around a
 * color-selector square (saturation/brightness drag) plus a hue strip
 * (vertical drag) — this port composes `UOverlay` the same way `USelect`
 * does (`packages/ng/src/select/select.ts`), matching real source's own
 * "preview input trigger + overlay panel" shape.
 *
 * Value format matches real source's own `format` input: `'hex'` (default,
 * a `#rrggbb` string), `'rgb'` (`{r,g,b}`), or `'hsb'` (`{h,s,b}`) — same
 * HSB/RGB/HEX conversion math as real source's own `HSBtoRGB`/`RGBtoHSB`/
 * `HSBtoHEX`/`HEXtoHSB`.
 *
 * Deliberately excludes real source's much larger surface: `inline` mode,
 * touch-event handling (mouse/keyboard interaction only, matching every
 * sibling component's established "smaller surface than upstream"
 * precedent), and passthrough (`pt`).
 */
@Component({
  standalone: true,
  selector: "u-color-picker",
  imports: [UOverlay],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UColorPicker, multi: true }],
  template: `
    <input
      #input
      type="text"
      readonly
      [class]="cx('preview', previewClassesParams())"
      [attr.tabindex]="$disabled() ? -1 : 0"
      [attr.disabled]="$disabled() ? '' : undefined"
      [style.backgroundColor]="inputBgColor()"
      [attr.aria-label]="'Select color'"
      [attr.aria-haspopup]="true"
      [attr.aria-expanded]="overlayVisible()"
      (click)="onInputClick()"
      (keydown)="onInputKeydown($event)"
    />
    @if (renderOverlay()) {
      <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('panel')">
        <div [class]="cx('content')">
          <div
            #colorSelector
            [class]="cx('colorSelector')"
            [style.backgroundColor]="colorSelectorBg()"
            (mousedown)="onColorMouseDown($event)"
          >
            <div [class]="cx('colorBackground')">
              <div #colorHandle [class]="cx('colorHandle')" [style.left.px]="colorHandleLeft()" [style.top.px]="colorHandleTop()"></div>
            </div>
          </div>
          <div #hue [class]="cx('hue')" (mousedown)="onHueMouseDown($event)">
            <div #hueHandle [class]="cx('hueHandle')" [style.top.px]="hueHandleTop()"></div>
          </div>
        </div>
      </div>
    }
  `,
  host: {
    "[class]": "cx('root')",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UColorPicker extends UBaseEditableHolder {
  protected override readonly componentName = "colorpicker";
  protected override readonly styleModule = colorPickerStyleModule;

  /** Format to use in value binding. */
  format = input<"hex" | "rgb" | "hsb">("hex");
  /** Default color to display initially when model value is not present. */
  defaultColor = input("ff0000");
  /** Whether to automatically manage layering. */
  autoZIndex = input(true, { transform: booleanAttribute });

  /** Callback to invoke on value change. */
  onChange = output<UColorPickerChangeEvent>();
  /** Callback to invoke when the panel is shown. */
  onShow = output<void>();
  /** Callback to invoke when the panel is hidden. */
  onHide = output<void>();

  protected readonly overlayVisible = signal(false);
  protected readonly renderOverlay = computed(() => this.overlayVisible());

  private readonly hsbValue = signal<Hsb>({ h: 0, s: 100, b: 100 });

  private colorDragging = false;
  private hueDragging = false;

  protected readonly inputBgColor = computed(() => "#" + this.hsbToHex(this.hsbValue()));
  protected readonly colorSelectorBg = computed(() => {
    const hsb = this.hsbValue();
    return "#" + this.hsbToHex(this.validateHsb({ h: hsb.h, s: 100, b: 100 }));
  });
  protected readonly colorHandleLeft = computed(() => Math.floor((150 * this.hsbValue().s) / 100));
  protected readonly colorHandleTop = computed(() => Math.floor((150 * (100 - this.hsbValue().b)) / 100));
  protected readonly hueHandleTop = computed(() => Math.floor(150 - (150 * this.hsbValue().h) / 360));

  protected previewClassesParams() {
    return { disabled: this.$disabled() };
  }

  protected onInputClick(): void {
    if (this.$disabled()) {
      return;
    }
    this.togglePanel();
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

  private togglePanel(): void {
    this.overlayVisible() ? this.hide() : this.show();
  }

  private show(): void {
    if (this.$disabled()) {
      return;
    }
    this.overlayVisible.set(true);
    this.onShow.emit();
  }

  private hide(): void {
    this.overlayVisible.set(false);
    this.onHide.emit();
  }

  protected onColorMouseDown(event: MouseEvent): void {
    if (this.$disabled()) {
      return;
    }
    this.colorDragging = true;
    this.colorSelectorEl = event.currentTarget as HTMLElement;
    this.pickColor(event);
    this.bindDragListeners();
  }

  protected onHueMouseDown(event: MouseEvent): void {
    if (this.$disabled()) {
      return;
    }
    this.hueDragging = true;
    this.hueEl = event.currentTarget as HTMLElement;
    this.pickHue(event);
    this.bindDragListeners();
  }

  // Captured from `event.currentTarget` on mousedown, not looked up via
  // `this.el.nativeElement.querySelector` — UOverlay moves the overlay panel
  // (and everything inside it, including the color selector/hue elements) to
  // `document.body` while visible, so a query rooted at the component's own
  // host element would miss them once relocated.
  private colorSelectorEl: HTMLElement | null = null;
  private hueEl: HTMLElement | null = null;

  private bindDragListeners(): void {
    const move = (event: MouseEvent) => {
      if (this.colorDragging) {
        this.pickColor(event);
      }
      if (this.hueDragging) {
        this.pickHue(event);
      }
    };
    const up = () => {
      this.colorDragging = false;
      this.hueDragging = false;
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }

  private pickColor(event: MouseEvent): void {
    if (!this.colorSelectorEl) return;
    const rect = this.colorSelectorEl.getBoundingClientRect();
    const saturation = Math.floor((100 * Math.max(0, Math.min(150, event.clientX - rect.left))) / 150);
    const brightness = Math.floor((100 * (150 - Math.max(0, Math.min(150, event.clientY - rect.top)))) / 150);
    const current = this.hsbValue();
    this.hsbValue.set(this.validateHsb({ h: current.h, s: saturation, b: brightness }));
    this.updateModel(event);
  }

  private pickHue(event: MouseEvent): void {
    if (!this.hueEl) return;
    const rect = this.hueEl.getBoundingClientRect();
    const hue = Math.floor((360 * (150 - Math.max(0, Math.min(150, event.clientY - rect.top)))) / 150);
    const current = this.hsbValue();
    this.hsbValue.set(this.validateHsb({ h: hue, s: current.s, b: current.b }));
    this.updateModel(event);
  }

  private updateModel(event: Event): void {
    const value = this.getValueToUpdate();
    this.writeModelValue(value);
    this.onModelChange(value);
    this.onModelTouched();
    this.onChange.emit({ originalEvent: event, value });
  }

  private getValueToUpdate(): UColorPickerChangeEvent["value"] {
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
    if (!hex) return { r: 0, g: 0, b: 0 };
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
