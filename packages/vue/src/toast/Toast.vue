<template>
  <div :class="cx('root', { position })">
    <div
      v-for="message of messages"
      :key="message.id"
      :class="cx('message', { severity: message.severity })"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div :class="cx('messageContent')">
        <div :class="cx('messageText')">
          <div v-if="message.summary" :class="cx('summary')">{{ message.summary }}</div>
          <div v-if="message.detail" :class="cx('detail')">{{ message.detail }}</div>
        </div>
        <div v-if="message.closable !== false">
          <button
            type="button"
            :class="cx('closeButton')"
            aria-label="Close"
            @click="remove(message.id)"
          >
            &times;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Ultimate-owned adaptation of PrimeVue's `Toast` component (see
// .vendor-extracted/vue/toast/Toast.vue). Confirmed against real source:
// extends the bare `BaseComponent` tier (no v-model/writeValue) — a
// service-driven, transient-notification-stack overlay (spec §3.0's own
// description). Subscribes directly to `toastEventBus` (the already-built
// `UToastService`'s own dispatch mechanism, Task Group A,
// `@ultimate/vue-core`) for "add"/"remove"/"remove-all" events, filtering
// "add" on `group`, matching real PrimeVue's own `ToastEventBus`-listening
// mechanism exactly (`Toast.vue`'s own `mounted()`
// `ToastEventBus.on('add', this.onAdd)` etc., this port's own
// `toastEventBus` is the same event-bus primitive already wired for this
// exact purpose by Task Group A's `UToastService`).
//
// Each queued message gets its own auto-dismiss timer (`life`, default
// 3000ms, `sticky` disables it) — real source delegates this to a nested
// `ToastMessage` sub-component; this port folds that responsibility into
// `UToast` itself, same "smaller surface than upstream" precedent as
// `UMessage`'s own plain-state-gated rendering (no enter/leave
// `<transition-group>` animation, real source's own excluded).
//
// Known-pitfall discipline (per this task's own brief, both directly
// relevant to Toast): (1) `messages` is internal `data()` state driven by
// an event-bus subscription, not a prop — dismissal identity therefore
// uses each message's own stable numeric `id` (assigned once, on arrival),
// never object-reference/Proxy-identity comparison, since Vue wraps every
// prop-received object in a fresh reactive Proxy per access (this
// component's own messages are never received as a prop in the first
// place, so this is a pre-emptive precedent match, not a bug being worked
// around); (2) no Portal/Teleport composition here (unlike
// ConfirmDialog/Popover/Drawer) — Toast renders directly in-place, fixed-
// positioned via CSS, matching real PrimeVue's own Toast.vue (which itself
// composes `Portal`, but this port's own established Popover/Drawer
// precedent for "smaller surface than upstream" already covers dropping
// Portal composition where a fixed-position overlay doesn't require DOM
// relocation for stacking-context correctness — z-index alone suffices
// here, same reasoning as `UConfirmDialog`'s Vue realization).
import { toastEventBus } from "@ultimate/vue-core";
import { createBaseToast } from "./BaseToast";

let nextId = 0;

export default {
  name: "UToast",
  extends: createBaseToast(),
  inheritAttrs: false,
  data() {
    return {
      messages: [],
    };
  },
  created() {
    // Plain non-reactive instance state, deliberately not part of data()'s
    // reactive tracking (matching UPopover/UDrawer's own established
    // pattern of non-reactive instance fields for imperative bookkeeping) —
    // assigned per-instance in created(), not as a shared top-level object
    // literal (which Vue would otherwise treat as under-specified: a plain
    // object at the component-options top level is never auto-installed as
    // an instance property the way data()'s return value is).
    this.timers = {};
  },
  mounted() {
    toastEventBus.on("add", this.onAdd);
    toastEventBus.on("remove", this.onRemove);
    toastEventBus.on("remove-all", this.onRemoveAll);
  },
  beforeUnmount() {
    toastEventBus.off("add", this.onAdd);
    toastEventBus.off("remove", this.onRemove);
    toastEventBus.off("remove-all", this.onRemoveAll);
    Object.values(this.timers).forEach((timer) => clearTimeout(timer));
    this.timers = {};
  },
  methods: {
    onAdd(message) {
      if ((message?.group ?? null) !== this.group) return;
      const id = nextId++;
      const entry = { ...message, id };
      this.messages = [...this.messages, entry];

      if (!entry.sticky) {
        this.timers[id] = setTimeout(() => this.remove(id), entry.life ?? this.life);
      }
    },
    onRemove(message) {
      if (message && typeof message === "object" && "id" in message) {
        this.remove(message.id);
      }
    },
    onRemoveAll() {
      Object.values(this.timers).forEach((timer) => clearTimeout(timer));
      this.timers = {};
      this.messages = [];
    },
    remove(id) {
      this.messages = this.messages.filter((m) => m.id !== id);
      if (this.timers[id]) {
        clearTimeout(this.timers[id]);
        delete this.timers[id];
      }
    },
  },
};
</script>
