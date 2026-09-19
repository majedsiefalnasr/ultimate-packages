<template>
  <template v-for="instance in instances" :key="instance.ref">
    <UDialog
      :visible="true"
      :header="instance.options.header"
      :modal="instance.options.modal ?? true"
      :closeOnEscape="instance.options.closeOnEscape ?? true"
      @update:visible="onDialogVisibleChange(instance)"
    >
      <component :is="instance.content" v-bind="instance.options.inputValues" />
    </UDialog>
  </template>
</template>

<script>
import { toRaw } from "vue";
import { dialogEventBus } from "@ultimate/vue-core";
import UDialog from "../dialog/Dialog.vue";
import { createBaseDynamicDialog } from "./BaseDynamicDialog";

// Ultimate-owned adaptation of PrimeVue's `DynamicDialog` component (see
// .vendor-extracted/vue/dynamicdialog/DynamicDialog.vue). Confirmed against
// real source: DynamicDialog is the always-mounted companion component
// that subscribes to DynamicDialogEventBus's 'open'/'close' events and
// renders one Dialog + `<component :is>` pair per currently-open instance
// (real source's own `instanceMap`, keyed by a generated uuid) — this port
// mirrors that same real multiple-simultaneous-instances mechanism exactly,
// using this task's own vue-core `dialogEventBus`/`UDialogService` (same
// event bus shape, not a reinvented mechanism) in place of real PrimeVue's
// `primevue/dynamicdialogeventbus`.
export default {
  name: "UDynamicDialog",
  extends: createBaseDynamicDialog(),
  data() {
    return {
      instances: [],
    };
  },
  openListener: null,
  closeListener: null,
  mounted() {
    this.openListener = ({ ref }) => {
      this.instances.push(ref);
    };
    // `this.instances` is a reactive array (data()): once `ref` is pushed
    // above, reading it back off `this.instances` returns a reactive Proxy
    // wrapping the original object, not the same reference. The `close`
    // event, however, always carries the original un-proxied `ref` (it's
    // emitted from UDialogService.open()'s own closure / DynamicDialogRef,
    // which never passes through Vue's reactivity). A plain `!==` filter
    // therefore never matches and the instance is never actually removed —
    // toRaw() unwraps both sides to the same underlying object for a
    // correct identity comparison.
    this.closeListener = ({ ref }) => {
      this.instances = this.instances.filter((instance) => toRaw(instance) !== toRaw(ref));
    };
    dialogEventBus.on("open", this.openListener);
    dialogEventBus.on("close", this.closeListener);
  },
  beforeUnmount() {
    dialogEventBus.off("open", this.openListener);
    dialogEventBus.off("close", this.closeListener);
  },
  methods: {
    onDialogVisibleChange(instance) {
      instance.close();
    },
  },
  components: { UDialog },
};
</script>
