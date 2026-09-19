import { Injectable, Type } from "@angular/core";
import { Subject } from "rxjs";
import { UDynamicDialogRef } from "./dynamic-dialog-ref";

/** Options accepted by `UDialogService.open()`. Scoped subset of real PrimeNG's `DynamicDialogConfig` — header/data/inputValues only, matching `UDialog`'s already-established smaller surface (no draggable/resizable/breakpoints/maximizable). */
export interface UDynamicDialogConfig<InputValuesType extends Record<string, unknown> = Record<string, unknown>> {
  /** Title text of the dialog. */
  header?: string;
  /** Arbitrary data made available to the loaded component via its own `data` input, if it declares one. */
  data?: unknown;
  /** Signal/`@Input()` values to set on the dynamically-loaded component instance. */
  inputValues?: InputValuesType;
  /** Whether an overlay mask is displayed behind the dialog. */
  modal?: boolean;
  /** Specifies if pressing escape key should hide the dialog. */
  closeOnEscape?: boolean;
}

/** Request payload `UDialogService.open()` dispatches — the always-mounted `UDynamicDialog` companion component subscribes to `UDialogService.open$` and renders one instance per request. */
export interface UDynamicDialogOpenRequest<T = unknown, ResultType = unknown> {
  component: Type<T>;
  config: UDynamicDialogConfig;
  ref: UDynamicDialogRef<ResultType>;
}

/**
 * Ultimate-owned adaptation of PrimeNG's own `DialogService` (see
 * `.vendor-extracted/ng/dynamicdialog/dialogservice.ts`) — genuinely new
 * `ng-core` work, disclosed per this task's brief: real PrimeNG's
 * `DynamicDialog` capability is inherently service-driven (`DialogService.
 * open(component, config)` returns a `DynamicDialogRef`), and Angular's
 * `ng-core` had no equivalent before this task.
 *
 * Real upstream's own `DialogService.open()` calls Angular's `createComponent`
 * + `ApplicationRef.attachView` directly, appending the created view's root
 * node to `document.body` itself. This port instead dispatches an `open$`
 * request that `UDynamicDialog` (`packages/ng/src/dynamic-dialog/`) — an
 * always-mounted companion component — subscribes to and renders via its
 * own template's `*ngComponentOutlet`, closing each instance by subscribing
 * to that instance's own `ref.requestClose$` (see `dynamic-dialog-ref.ts`)
 * instead of a second, competing `close$` channel on this service. This is
 * the same "service call → Subject emit → subscribing component renders"
 * shape this task's Vue infrastructure prefix (`UDialogService` in
 * `vue-core`) already established for the same reason: keeping `ng-core`
 * free of a dependency on `packages/ng`'s own `UDialog`/`UDynamicDialog`
 * components (`ng-core` has no Angular component-authoring dependency on
 * `packages/ng` anywhere else either — a direct `createComponent`-into-
 * `document.body` call here would require `ng-core` to import
 * `UDynamicDialog` from `packages/ng`, inverting that dependency direction).
 */
@Injectable({ providedIn: "root" })
export class UDialogService {
  private readonly openSource = new Subject<UDynamicDialogOpenRequest>();

  /** Emitted when `open()` is called — `UDynamicDialog` subscribes and renders. */
  readonly open$ = this.openSource.asObservable();

  /** Opens a dialog rendering `component`, returning a handle for lifecycle control. `ResultType` is the type `ref.close()`/`ref.onClose` carries — independent of `component`'s own type. */
  open<T, ResultType = unknown>(
    component: Type<T>,
    config: UDynamicDialogConfig = {}
  ): UDynamicDialogRef<ResultType> {
    const ref = new UDynamicDialogRef<ResultType>();
    this.openSource.next({
      component,
      config,
      ref,
    } as unknown as UDynamicDialogOpenRequest);
    return ref;
  }

  /** Closes the dialog identified by the given ref (convenience alias for `ref.close()`). */
  close<T>(ref: UDynamicDialogRef<T>, result?: T): void {
    ref.close(result);
  }
}
