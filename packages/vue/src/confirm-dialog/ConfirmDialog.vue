<template>
  <UDialog
    :visible="visible"
    role="alertdialog"
    :header="confirmation?.header"
    :modal="confirmation?.modal ?? true"
    :closeOnEscape="confirmation?.closeOnEscape ?? true"
    :class="cx('root')"
    @update:visible="onDialogVisibleChange"
  >
    <i v-if="confirmation?.icon" :class="[confirmation.icon, cx('icon')]" />
    <span :class="cx('message')">{{ confirmation?.message }}</span>
    <template #footer>
      <div :class="cx('footer')">
        <button
          v-if="confirmation?.rejectVisible !== false"
          type="button"
          @click="onReject"
        >
          {{ confirmation?.rejectLabel ?? "No" }}
        </button>
        <button
          v-if="confirmation?.acceptVisible !== false"
          type="button"
          @click="onAccept"
        >
          {{ confirmation?.acceptLabel ?? "Yes" }}
        </button>
      </div>
    </template>
  </UDialog>
</template>

<script>
import { confirmationEventBus } from "@ultimate/vue-core";
import UDialog from "../dialog/Dialog.vue";
import { createBaseConfirmDialog } from "./BaseConfirmDialog";

// Ultimate-owned adaptation of PrimeVue's `ConfirmDialog` component (see
// .vendor-extracted/vue/confirmdialog/ConfirmDialog.vue). Confirmed against
// real source: ConfirmDialog subscribes to `ConfirmationEventBus`'s
// 'confirm'/'close' events (real source's own module-level singleton event
// bus, matching this task's own vue-core `confirmationEventBus` exactly —
// same primitive, not a reinvented mechanism) and renders itself (via a
// composed Dialog) whenever a confirmation matching its own `group` arrives.
//
// This port keeps that same real mechanism, composing the already-Built
// UDialog the same way real upstream composes Dialog.
export default {
  name: "UConfirmDialog",
  extends: createBaseConfirmDialog(),
  data() {
    return {
      confirmation: null,
    };
  },
  computed: {
    visible() {
      return this.confirmation !== null;
    },
  },
  confirmListener: null,
  closeListener: null,
  mounted() {
    this.confirmListener = (options) => {
      if (options && options.key === this.group) {
        this.confirmation = options;
      }
    };
    this.closeListener = () => {
      this.confirmation = null;
    };
    confirmationEventBus.on("confirm", this.confirmListener);
    confirmationEventBus.on("close", this.closeListener);
  },
  beforeUnmount() {
    confirmationEventBus.off("confirm", this.confirmListener);
    confirmationEventBus.off("close", this.closeListener);
  },
  methods: {
    hide() {
      this.confirmation = null;
    },
    onAccept() {
      this.confirmation?.accept?.();
      this.hide();
    },
    onReject() {
      this.confirmation?.reject?.();
      this.hide();
    },
    onDialogVisibleChange(value) {
      if (!value) this.hide();
    },
  },
  components: { UDialog },
};
</script>
