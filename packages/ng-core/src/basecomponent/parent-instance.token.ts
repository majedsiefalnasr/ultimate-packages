import { InjectionToken } from "@angular/core";
import type { UBaseComponent } from "./base-component";

/**
 * A component that renders other `UBaseComponent`s provides itself under this
 * token (`{ provide: U_PARENT_INSTANCE, useExisting: Self }`). A descendant
 * finds its nearest providing ancestor through it and exposes that ancestor as
 * `parent.instance` in the params its `pt` functions receive.
 */
export const U_PARENT_INSTANCE = new InjectionToken<UBaseComponent>("U_PARENT_INSTANCE");
