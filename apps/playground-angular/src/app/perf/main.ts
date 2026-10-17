import { bootstrapApplication } from "@angular/platform-browser";
import { ActivatedRoute, provideRouter, withDisabledInitialNavigation } from "@angular/router";
import { ComponentIdGenerator } from "@ultimate/ng-core";
import { applyUltimateTheme } from "@ultimate/themes";
import {
  INITIAL_STATE,
  SELECT_UPDATE_VALUE,
  installPerfApi,
  perfRoot,
} from "../../../../../scripts/perf/browser/harness";
import { PerfPageComponent } from "./perf-page.component";

/** Client-only perf page entry (no hydration); see perf-page.component.ts. */
applyUltimateTheme();

const click = (selector: string) => perfRoot().querySelector<HTMLElement>(selector)?.click();

// Same RouterLink support as ../router-link-support.ts (UMenu imports
// RouterModule), but with no initial navigation: there are no routes, and
// `/perf/<subject>` would otherwise log NG04002 on every page load.
bootstrapApplication(PerfPageComponent, {
  providers: [
    provideRouter([], withDisabledInitialNavigation()),
    { provide: ActivatedRoute, useValue: new ActivatedRoute() },
    ComponentIdGenerator,
  ],
})
  .then((appRef) => {
    const page = appRef.components[0].instance as PerfPageComponent;
    const { subject, state } = page;
    if (!subject) return;
    installPerfApi(subject, {
      mount: () => state.set({ ...INITIAL_STATE, mounted: true }),
      unmount: () => state.set(INITIAL_STATE),
      update: (kind) => {
        state.update((current) => ({ ...current, updated: kind }));
        // USelect has no value input: its value is written through its
        // ControlValueAccessor, as a form control would.
        if (kind === "value") page.select()?.writeValue(SELECT_UPDATE_VALUE);
      },
      open: () => click(subject === "select" ? '[role="combobox"]' : "[data-perf-trigger]"),
      close: () => {
        if (subject === "dialog" || subject === "drawer") page.setVisible(false);
        else if (subject === "select") click('[role="combobox"]');
        else if (subject === "popover") page.popover()?.hide();
        else page.menu()?.hide();
      },
    });
  })
  .catch((err) => console.error(err));
