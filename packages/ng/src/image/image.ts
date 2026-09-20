import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { UBaseComponent, UFocusTrap, UOverlay, UTimesIcon } from "@ultimate/ng-core";
import { ESCAPE_PRIORITIES, displayOrderRegistry, escapeRegistry } from "@ultimate/uix-utils/escape";
import { imageStyleModule } from "./image-style";

let imageDisplayOrderUid = 0;

/**
 * Ultimate-owned adaptation of PrimeNG's `Image` component (see
 * `.vendor-extracted/ng/image/image.ts`). Displays an `img` with an
 * optional fullscreen preview overlay offering rotate-left/rotate-right/
 * zoom-in/zoom-out/close controls — matching real source's own
 * `src`/`preview`/rotate/zoom structural shape.
 *
 * Deliberately excludes real source's `srcSet`/`sizes`/`previewImageSrc`/
 * `previewImageSrcSet`/`previewImageSizes` responsive-image inputs, its
 * custom `image`/`indicator`/`preview`/rotate/zoom-icon `<ng-template>`
 * overrides, and its `@primeuix/motion`-driven mask/preview enter-leave
 * animation — this port renders a plain `<img>`, a fixed eye-icon preview
 * indicator, and toggles the mask/preview via plain `@if` with no
 * animation, same "smaller surface than upstream" precedent as every
 * sibling component (Fieldset/Carousel).
 *
 * Overlay/focus-trap wiring follows `UDialog`'s own established
 * composition: `UOverlay` (`appendTo="body"`) moves the mask to
 * `document.body` and assigns a z-index; `UFocusTrap` traps focus within
 * the toolbar/close button. Escape handling registers with the shared
 * `@ultimate/uix-utils/escape` registries under the `IMAGE` priority
 * (added to `packages/uix-utils/src/escape/priorities.ts` by this task,
 * matching real PrimeReact's own `ESC_KEY_HANDLING_PRIORITIES.IMAGE = 400`
 * value verified in `components/lib/image/Image.js`), mirroring
 * `UDialog`'s own `syncEscapeRegistration` pattern.
 */
@Component({
  standalone: true,
  selector: "u-image",
  imports: [UOverlay, UFocusTrap, UTimesIcon],
  template: `
    <span [class]="cx('root')">
      <img [attr.src]="src()" [attr.alt]="alt()" [attr.width]="width()" [attr.height]="height()" (error)="onImageError.emit($event)" />
      @if (preview()) {
        <button
          type="button"
          [class]="cx('previewMask')"
          [attr.aria-label]="'Zoom image'"
          (click)="onImageClick()"
        >
          <svg viewBox="0 0 24 24" [class]="cx('previewIcon')" fill="currentColor" aria-hidden="true">
            <path d="M12 5c-7.633 0-11.65 6.61-11.816 6.89a1 1 0 0 0 0 1.02C.35 13.19 4.367 19.8 12 19.8s11.65-6.61 11.816-6.89a1 1 0 0 0 0-1.02C23.65 11.61 19.633 5 12 5zm0 12.8a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zm0-7.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z" />
          </svg>
        </button>
      }
      @if (renderMask()) {
        <div uOverlay [visible]="maskVisible()" appendTo="body" [class]="cx('mask')" role="dialog" [attr.aria-modal]="maskVisible()" (click)="onMaskClick()" (keydown)="onMaskKeydown($event)">
          <div uFocusTrap [class]="cx('toolbar')" (click)="$event.stopPropagation()">
            <button type="button" [class]="cx('rotateRightButton')" (click)="rotateRight()" aria-label="Rotate right">&#8635;</button>
            <button type="button" [class]="cx('rotateLeftButton')" (click)="rotateLeft()" aria-label="Rotate left">&#8634;</button>
            <button type="button" [class]="cx('zoomOutButton')" (click)="zoomOut()" [disabled]="isZoomOutDisabled()" aria-label="Zoom out">&minus;</button>
            <button type="button" [class]="cx('zoomInButton')" (click)="zoomIn()" [disabled]="isZoomInDisabled()" aria-label="Zoom in">+</button>
            <button type="button" [class]="cx('closeButton')" (click)="closePreview()" aria-label="Close" #closeButton>
              <u-times-icon />
            </button>
          </div>
          @if (previewVisible()) {
            <img [attr.src]="src()" [class]="cx('original')" [style.transform]="previewTransform()" />
          }
        </div>
      }
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UImage extends UBaseComponent {
  protected override readonly componentName = "image";
  protected override readonly styleModule = imageStyleModule;

  /** The source path for the image. */
  src = input<string>();
  /** Attribute of the image element. */
  alt = input<string>();
  /** Attribute of the image element. */
  width = input<string>();
  /** Attribute of the image element. */
  height = input<string>();
  /** Controls the preview functionality. */
  preview = input(false, { transform: booleanAttribute });

  /** Triggered when the preview overlay is shown. */
  onShow = output<void>();
  /** Triggered when the preview overlay is hidden. */
  onHide = output<void>();
  /** This event is triggered if an error occurs while loading the image. */
  onImageError = output<Event>();

  @ViewChild("closeButton") private closeButtonRef?: ElementRef<HTMLButtonElement>;

  protected readonly renderMask = signal(false);
  protected readonly maskVisible = signal(false);
  protected readonly previewVisible = signal(false);
  private readonly rotate = signal(0);
  private readonly scale = signal(1);

  private readonly zoomSettings = { step: 0.1, max: 1.5, min: 0.5 };

  protected readonly isZoomOutDisabled = computed(
    () => this.scale() - this.zoomSettings.step <= this.zoomSettings.min
  );
  protected readonly isZoomInDisabled = computed(
    () => this.scale() + this.zoomSettings.step >= this.zoomSettings.max
  );
  protected readonly previewTransform = computed(
    () => `rotate(${this.rotate()}deg) scale(${this.scale()})`
  );

  private readonly displayOrderUid = ++imageDisplayOrderUid;
  private registeredDisplayOrder: number | undefined;

  protected onImageClick(): void {
    if (!this.preview()) return;
    this.renderMask.set(true);
    this.maskVisible.set(true);
    this.previewVisible.set(true);
    this.syncEscapeRegistration(true);
    this.onShow.emit();
    queueMicrotask(() => this.closeButtonRef?.nativeElement.focus());
  }

  protected onMaskClick(): void {
    this.closePreview();
  }

  protected onMaskKeydown(event: KeyboardEvent): void {
    if (event.code === "Escape") {
      this.closePreview();
      event.preventDefault();
    }
  }

  protected rotateRight(): void {
    this.rotate.update((v) => v + 90);
  }

  protected rotateLeft(): void {
    this.rotate.update((v) => v - 90);
  }

  protected zoomIn(): void {
    if (this.isZoomInDisabled()) return;
    this.scale.update((v) => v + this.zoomSettings.step);
  }

  protected zoomOut(): void {
    if (this.isZoomOutDisabled()) return;
    this.scale.update((v) => v - this.zoomSettings.step);
  }

  protected closePreview(): void {
    this.maskVisible.set(false);
    this.previewVisible.set(false);
    this.renderMask.set(false);
    this.rotate.set(0);
    this.scale.set(1);
    this.syncEscapeRegistration(false);
    this.onHide.emit();
  }

  private syncEscapeRegistration(visible: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (visible && this.registeredDisplayOrder === undefined) {
      this.registeredDisplayOrder = displayOrderRegistry.register("image", this.displayOrderUid);
      escapeRegistry.register(ESCAPE_PRIORITIES.IMAGE, this.registeredDisplayOrder, () => {
        this.closePreview();
      });
    } else if (!visible && this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.IMAGE, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("image", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.registeredDisplayOrder !== undefined) {
      escapeRegistry.unregister(ESCAPE_PRIORITIES.IMAGE, this.registeredDisplayOrder);
      displayOrderRegistry.unregister("image", this.displayOrderUid);
      this.registeredDisplayOrder = undefined;
    }
  }
}
