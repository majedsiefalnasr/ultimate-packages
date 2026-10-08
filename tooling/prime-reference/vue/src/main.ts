import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";

// Prime as Prime ships: default PrimeVue setup with the Aura preset, styled mode.
createApp(App)
  .use(PrimeVue, { theme: { preset: Aura } })
  .mount("#root");
