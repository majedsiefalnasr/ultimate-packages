import * as React from "react";
import {
  useComponentBase,
  Portal,
  FocusTrap,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  UTimesIcon,
} from "@ultimate/react-core";
import { imageStyleModule } from "./image-style";

export interface UImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  preview?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  className?: string;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;

/**
 * Ultimate-owned adaptation of PrimeReact's `Image` component (real
 * source: `components/lib/image/Image.js`). Displays an `img` with an
 * optional fullscreen preview overlay offering rotate-left/rotate-right/
 * zoom-in/zoom-out/close controls — matching real source's own
 * `src`/`preview`/rotate/zoom structural shape.
 *
 * Deliberately excludes real source's `downloadable`/download button,
 * `zoomInDisabled`/`zoomOutDisabled` external overrides, and its
 * `CSSTransition`-driven mask/preview enter-leave animation — this port
 * toggles the mask/preview via a plain conditional render with no
 * animation, same "smaller surface than upstream" precedent as every
 * sibling component (Fieldset/Carousel).
 *
 * Overlay/focus-trap wiring follows `UDialog`'s own established
 * composition: `Portal` moves the mask to `document.body`; `FocusTrap`
 * traps focus within the toolbar/close button. Escape handling uses
 * `useGlobalEscapeKey`/`useDisplayOrder` under the `IMAGE` priority
 * (`ESCAPE_PRIORITIES.IMAGE`, added to
 * `packages/uix-utils/src/escape/priorities.ts` by this task, matching
 * real PrimeReact's own `ESC_KEY_HANDLING_PRIORITIES.IMAGE = 400` value
 * verified in `components/lib/image/Image.js`'s own `useGlobalOnEscapeKey`
 * call), mirroring `UDialog`'s own `useGlobalEscapeKey` composition.
 */
export function UImage({
  src,
  alt,
  width,
  height,
  preview = false,
  onShow,
  onHide,
  onImageError,
  className,
}: UImageProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "image", styleModule: imageStyleModule });
  const [maskVisible, setMaskVisible] = React.useState(false);
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [rotate, setRotate] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const isZoomOutDisabled = scale - ZOOM_STEP <= ZOOM_MIN;
  const isZoomInDisabled = scale + ZOOM_STEP >= ZOOM_MAX;

  const displayOrder = useDisplayOrder("image", maskVisible);

  const close = React.useCallback(() => {
    setMaskVisible(false);
    setPreviewVisible(false);
    setRotate(0);
    setScale(1);
    onHide?.();
  }, [onHide]);

  useGlobalEscapeKey({
    callback: close,
    when: maskVisible,
    priority: [ESCAPE_PRIORITIES.IMAGE, displayOrder],
  });

  const open = () => {
    if (!preview) return;
    setMaskVisible(true);
    setPreviewVisible(true);
    onShow?.();
    queueMicrotask(() => closeButtonRef.current?.focus());
  };

  return (
    <span className={[cx("root"), className].filter(Boolean).join(" ")}>
      <img src={src} alt={alt} width={width} height={height} onError={onImageError} />
      {preview && (
        <button type="button" className={cx("previewMask")} aria-label="Zoom image" onClick={open}>
          <svg viewBox="0 0 24 24" className={cx("previewIcon")} fill="currentColor" aria-hidden="true">
            <path d="M12 5c-7.633 0-11.65 6.61-11.816 6.89a1 1 0 0 0 0 1.02C.35 13.19 4.367 19.8 12 19.8s11.65-6.61 11.816-6.89a1 1 0 0 0 0-1.02C23.65 11.61 19.633 5 12 5zm0 12.8a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zm0-7.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z" />
          </svg>
        </button>
      )}
      {maskVisible && (
        <Portal
          element={
            <div
              className={cx("mask")}
              role="dialog"
              aria-modal={maskVisible}
              onClick={close}
              onKeyDown={(event) => {
                if (event.code === "Escape") {
                  close();
                  event.preventDefault();
                }
              }}
            >
              <FocusTrap autoFocus>
                <div className={cx("toolbar")} onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className={cx("rotateRightButton")}
                    aria-label="Rotate right"
                    onClick={() => setRotate((r) => r + 90)}
                  >
                    &#8635;
                  </button>
                  <button
                    type="button"
                    className={cx("rotateLeftButton")}
                    aria-label="Rotate left"
                    onClick={() => setRotate((r) => r - 90)}
                  >
                    &#8634;
                  </button>
                  <button
                    type="button"
                    className={cx("zoomOutButton")}
                    aria-label="Zoom out"
                    disabled={isZoomOutDisabled}
                    onClick={() => setScale((s) => (s - ZOOM_STEP <= ZOOM_MIN ? s : s - ZOOM_STEP))}
                  >
                    &minus;
                  </button>
                  <button
                    type="button"
                    className={cx("zoomInButton")}
                    aria-label="Zoom in"
                    disabled={isZoomInDisabled}
                    onClick={() => setScale((s) => (s + ZOOM_STEP >= ZOOM_MAX ? s : s + ZOOM_STEP))}
                  >
                    +
                  </button>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className={cx("closeButton")}
                    aria-label="Close"
                    onClick={close}
                  >
                    <UTimesIcon />
                  </button>
                </div>
              </FocusTrap>
              {previewVisible && (
                <img
                  src={src}
                  className={cx("original")}
                  style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}
                  onClick={(event) => event.stopPropagation()}
                />
              )}
            </div>
          }
          visible
        />
      )}
    </span>
  );
}
