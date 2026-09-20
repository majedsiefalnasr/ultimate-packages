<template>
  <span :class="cx('root')">
    <img :src="src" :alt="alt" :width="width" :height="height" @error="onImageError" />
    <button v-if="preview" type="button" :class="cx('previewMask')" aria-label="Zoom image" @click="open">
      <svg viewBox="0 0 24 24" :class="cx('previewIcon')" fill="currentColor" aria-hidden="true">
        <path
          d="M12 5c-7.633 0-11.65 6.61-11.816 6.89a1 1 0 0 0 0 1.02C.35 13.19 4.367 19.8 12 19.8s11.65-6.61 11.816-6.89a1 1 0 0 0 0-1.02C23.65 11.61 19.633 5 12 5zm0 12.8a4.9 4.9 0 1 1 0-9.8 4.9 4.9 0 0 1 0 9.8zm0-7.8a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z"
        />
      </svg>
    </button>
    <UPortal>
      <div
        v-if="maskVisible"
        ref="mask"
        v-focustrap
        :class="cx('mask')"
        role="dialog"
        :aria-modal="maskVisible"
        @click="close"
        @keydown="onMaskKeydown"
      >
        <div :class="cx('toolbar')" @click.stop>
          <button type="button" :class="cx('rotateRightButton')" aria-label="Rotate right" @click="rotateRight">&#8635;</button>
          <button type="button" :class="cx('rotateLeftButton')" aria-label="Rotate left" @click="rotateLeft">&#8634;</button>
          <button type="button" :class="cx('zoomOutButton')" aria-label="Zoom out" :disabled="isZoomOutDisabled" @click="zoomOut">&minus;</button>
          <button type="button" :class="cx('zoomInButton')" aria-label="Zoom in" :disabled="isZoomInDisabled" @click="zoomIn">+</button>
          <button ref="closeButton" type="button" :class="cx('closeButton')" aria-label="Close" @click="close">
            <UTimesIcon />
          </button>
        </div>
        <img
          v-if="previewVisible"
          :src="src"
          :class="cx('original')"
          :style="{ transform: `rotate(${rotate}deg) scale(${scale})` }"
          @click.stop
        />
      </div>
    </UPortal>
  </span>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Image` component (see
// .vendor-extracted/vue/image/Image.vue). Displays an `img` with an
// optional fullscreen preview overlay offering rotate-left/rotate-right/
// zoom-in/zoom-out/close controls — matching real source's own
// `src`/`preview`/rotate/zoom structural shape.
//
// Deliberately excludes real source's `previewicon`/`refresh`/`undo`/
// `zoomout`/`zoomin`/`close`/`original` slot-override system and its
// `<transition name="p-image-original">` mask/preview enter-leave
// animation — this port toggles the mask/preview via a plain `v-if` with
// no animation, same "smaller surface than upstream" precedent as every
// sibling component (Fieldset/Carousel).
//
// Overlay/focus-trap wiring follows `UDrawer`'s own established
// composition: `UPortal` moves the mask to `document.body`; `v-focustrap`
// traps focus within the toolbar/close button. Escape handling uses
// `createGlobalEscapeKeyMixin`/`createDisplayOrderMixin` under the
// `IMAGE` priority (`ESCAPE_PRIORITIES.IMAGE`, added to
// `packages/uix-utils/src/escape/priorities.ts` by this task).
//
// Known Vue pitfall (already discovered this session, avoided here): the
// mask's `v-if="maskVisible"` sits directly inside `UPortal`'s slot (not
// nested deeper), matching `UDrawer`'s own structure exactly — this keeps
// Vue's slot-content reactivity able to re-render on `maskVisible`
// changes. The escape/display-order mixins' `updated()` hooks are still
// called explicitly from `open()`/`close()` (not relied upon to fire from
// Vue's own lifecycle alone) as a defensive match to `UDrawer`'s pattern,
// since both mixins are driven by internal `data()` state, not a prop.
import {
  Portal as UPortal,
  TimesIcon as UTimesIcon,
  focusTrapDirective,
  createGlobalEscapeKeyMixin,
  createDisplayOrderMixin,
} from "@ultimate/vue-core";
import { ESCAPE_PRIORITIES } from "@ultimate/uix-utils/escape";
import { createBaseImage } from "./BaseImage";

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;

export default {
  name: "UImage",
  extends: createBaseImage(),
  inheritAttrs: false,
  emits: ["show", "hide", "imageError"],
  data() {
    return {
      maskVisible: false,
      previewVisible: false,
      rotate: 0,
      scale: 1,
    };
  },
  computed: {
    isZoomOutDisabled() {
      return this.scale - ZOOM_STEP <= ZOOM_MIN;
    },
    isZoomInDisabled() {
      return this.scale + ZOOM_STEP >= ZOOM_MAX;
    },
  },
  created() {
    this.displayOrderMixin = createDisplayOrderMixin({
      group: "image",
      isVisible: () => this.maskVisible,
    });
    this.escapeMixin = createGlobalEscapeKeyMixin({
      callback: () => this.close(),
      when: () => this.maskVisible,
      priority: [ESCAPE_PRIORITIES.IMAGE, () => this.displayOrder],
    });
  },
  mounted() {
    this.displayOrderMixin.mounted.call(this);
    this.escapeMixin.mounted.call(this);
  },
  beforeUnmount() {
    this.displayOrderMixin.beforeUnmount.call(this);
    this.escapeMixin.beforeUnmount.call(this);
  },
  methods: {
    open() {
      if (!this.preview) return;
      this.maskVisible = true;
      this.previewVisible = true;
      this.$emit("show");
      this.displayOrderMixin.updated.call(this);
      this.escapeMixin.updated.call(this);
      this.$nextTick(() => this.$refs.closeButton?.focus());
    },
    close() {
      this.maskVisible = false;
      this.previewVisible = false;
      this.rotate = 0;
      this.scale = 1;
      this.$emit("hide");
      this.displayOrderMixin.updated.call(this);
      this.escapeMixin.updated.call(this);
    },
    onMaskKeydown(event) {
      if (event.code === "Escape") {
        this.close();
        event.preventDefault();
      }
    },
    rotateRight() {
      this.rotate += 90;
    },
    rotateLeft() {
      this.rotate -= 90;
    },
    zoomIn() {
      if (this.isZoomInDisabled) return;
      this.scale += ZOOM_STEP;
    },
    zoomOut() {
      if (this.isZoomOutDisabled) return;
      this.scale -= ZOOM_STEP;
    },
    onImageError(event) {
      this.$emit("imageError", event);
    },
  },
  directives: { focustrap: focusTrapDirective },
  components: { UPortal, UTimesIcon },
};
</script>
