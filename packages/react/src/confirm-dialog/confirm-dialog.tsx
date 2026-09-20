import * as React from "react";
import { useComponentBase, confirmationEventBus, type UConfirmationOptions } from "@ultimate/react-core";
import { UButton } from "../button/button";
import { UDialog } from "../dialog/dialog";
import { confirmDialogStyleModule } from "./confirm-dialog-style";

export interface UConfirmDialogProps {
  /** Matches only `confirmDialog()` calls carrying the same `group` (undefined matches undefined) — matching real PrimeReact's own `group` field. */
  group?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ConfirmDialog` component (real
 * source: `components/lib/confirmdialog/ConfirmDialog.js`). Confirmed
 * against real source: `ConfirmDialog` is a service-driven overlay — it
 * subscribes to `OverlayService`'s `confirm-dialog` event (via
 * `OverlayService.on('confirm-dialog', confirm)`) and renders itself (via
 * a composed `Dialog`) whenever the event's `group` matches its own,
 * invoking `accept`/`reject` callbacks from its own accept/reject button
 * handlers.
 *
 * This port keeps that same real mechanism, using this task's own
 * `confirmationEventBus`/`confirmDialog()` (`@ultimate/react-core` — new
 * for React this task, see that module's own doc comment) in place of real
 * PrimeReact's `OverlayService`, and composes the already-Built `UDialog`
 * the same way real upstream composes `Dialog`.
 *
 * Deliberately excludes upstream's much larger surface — draggable,
 * breakpoints-driven responsive `<style>`, custom footer/message/icon
 * render-prop templates, and RTL — none of these appear in this
 * capability's spec-mandated surface. A single always-mounted
 * `UConfirmDialog` per `group` is the expected usage, matching real
 * upstream's own single-instance-per-group convention.
 */
export function UConfirmDialog({ group }: UConfirmDialogProps): React.ReactNode {
  const { cx } = useComponentBase({
    componentName: "confirm-dialog",
    styleModule: confirmDialogStyleModule,
  });
  const [confirmation, setConfirmation] = React.useState<UConfirmationOptions | null>(null);

  React.useEffect(() => {
    const handler = (event: unknown) => {
      const options = event as UConfirmationOptions;
      if (options.visible === false) {
        setConfirmation(null);
        return;
      }
      if (options.group === group) {
        setConfirmation(options);
      }
    };
    confirmationEventBus.on("confirm-dialog", handler);
    return () => confirmationEventBus.off("confirm-dialog", handler);
  }, [group]);

  const hide = () => setConfirmation(null);

  const onAccept = () => {
    confirmation?.accept?.();
    hide();
  };

  const onReject = () => {
    confirmation?.reject?.();
    hide();
  };

  return (
    <UDialog
      visible={confirmation !== null}
      onHide={hide}
      header={confirmation?.header}
      modal={confirmation?.modal ?? true}
      closeOnEscape={confirmation?.closeOnEscape ?? true}
      className={cx("root")}
      footer={
        <div className={cx("footer")}>
          {confirmation?.rejectVisible !== false && (
            <UButton label={confirmation?.rejectLabel ?? "No"} severity="secondary" text onClick={onReject} />
          )}
          {confirmation?.acceptVisible !== false && (
            <UButton label={confirmation?.acceptLabel ?? "Yes"} onClick={onAccept} />
          )}
        </div>
      }
    >
      {confirmation?.icon}
      <span className={cx("message")}>{confirmation?.message}</span>
    </UDialog>
  );
}
