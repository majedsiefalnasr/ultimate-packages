import { createApp, reactive } from "vue";
import { applyUltimateTheme } from "@ultimate/themes";
import PerfPage from "./PerfPage.vue";
import {
  INITIAL_STATE,
  installPerfApi,
  perfRoot,
  subjectFromLocation,
} from "../../../../scripts/perf/browser/harness";

/** Client-only perf page entry; see PerfPage.vue. */
applyUltimateTheme();

const click = (selector: string) => perfRoot().querySelector<HTMLElement>(selector)?.click();

const subject = subjectFromLocation();
if (subject) {
  const state = reactive({ ...INITIAL_STATE });
  const page = createApp(PerfPage, { subject, state }).mount(perfRoot()) as unknown as {
    hideOverlay(): void;
  };
  installPerfApi(subject, {
    mount: () => Object.assign(state, INITIAL_STATE, { mounted: true }),
    unmount: () => Object.assign(state, INITIAL_STATE),
    update: (kind) => {
      state.updated = kind;
    },
    open: () => click(subject === "select" ? '[role="combobox"]' : "[data-perf-trigger]"),
    close: () => {
      if (subject === "dialog" || subject === "drawer") {
        state.visible = false;
      } else if (subject === "select") {
        click('[role="combobox"]');
      } else {
        page.hideOverlay();
      }
    },
  });
}
