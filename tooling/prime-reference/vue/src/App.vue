<template>
  <!-- Each case mirrors the content of the matching @ultimate/vue story (see ../../cases.ts). -->
  <component :is="g3e" v-if="g3e" :id="raw" />
  <template v-else-if="id === 'tag/default'">
    <Tag value="New" />
  </template>
  <template v-else-if="id === 'tag/severities'">
    <Tag severity="success" value="Success" />
    <Tag severity="info" value="Info" />
    <Tag severity="warn" value="Warn" />
    <Tag severity="danger" value="Danger" />
    <Tag severity="secondary" value="Secondary" />
    <Tag severity="contrast" value="Contrast" />
  </template>

  <template v-else-if="id === 'message/default'">
    <Message severity="info">This is an informational message.</Message>
  </template>
  <template v-else-if="id === 'message/severities'">
    <Message severity="success">Success message</Message>
    <Message severity="info">Info message</Message>
    <Message severity="warn">Warn message</Message>
    <Message severity="error">Error message</Message>
    <Message severity="secondary">Secondary message</Message>
    <Message severity="contrast">Contrast message</Message>
  </template>
  <template v-else-if="id === 'message/closable'">
    <Message severity="warn" closable>This message can be closed.</Message>
  </template>
  <!-- Class D cases (no Ultimate support): rendered for the record only. -->
  <template v-else-if="id === 'message/outlined'">
    <Message severity="info" variant="outlined">Outlined message</Message>
  </template>
  <template v-else-if="id === 'message/simple'">
    <Message severity="info" variant="simple">Simple message</Message>
  </template>
  <template v-else-if="id === 'message/sizes'">
    <Message severity="info" size="small">Small message</Message>
    <Message severity="info" size="large">Large message</Message>
  </template>

  <div v-else-if="drawer">
    <button @click="visible = true">Show drawer</button>
    <Drawer v-model:visible="visible" :header="drawer.header" :position="drawer.position">{{
      drawer.body
    }}</Drawer>
  </div>
</template>

<script setup lang="ts">
import Drawer from "primevue/drawer";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { ref } from "vue";

import { G3E_CASES } from "./g3e";

const raw = location.hash.replace(/^#\//, "");
// G3-E routes are `g3e/<key>/<case>`; the smoke route `g3e/tag/default` reuses the pilot Tag case.
const id = raw.replace(/^g3e\/(?=tag\/)/, "");
const g3e = raw.startsWith("g3e/") ? G3E_CASES[raw.split("/")[1]] : undefined;
const visible = ref(false);

const DRAWERS: Record<string, { header: string; position: string; body: string; rtl?: boolean }> = {
  "drawer/left": { header: "Menu", position: "left", body: "Drawer body content." },
  "drawer/closed": { header: "Menu", position: "left", body: "Drawer body content." },
  "drawer/right": { header: "Settings", position: "right", body: "Right-positioned drawer." },
  "drawer/top": { header: "Top", position: "top", body: "Drawer body content." },
  "drawer/bottom": { header: "Bottom", position: "bottom", body: "Drawer body content." },
  "drawer/full": { header: "Full", position: "full", body: "Drawer body content." },
  "drawer/rtl": { header: "RTL", position: "left", body: "Drawer body content.", rtl: true },
};
const drawer = DRAWERS[id];
if (drawer?.rtl) document.documentElement.dir = "rtl";
</script>
