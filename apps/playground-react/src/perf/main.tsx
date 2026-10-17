import * as React from "react";
import { createRoot } from "react-dom/client";
import { applyUltimateTheme } from "@ultimate/themes";
import { UButton } from "@ultimate/react/button";
import { UDataView } from "@ultimate/react/data-view";
import { UDatePicker } from "@ultimate/react/date-picker";
import { UDialog } from "@ultimate/react/dialog";
import { UDrawer } from "@ultimate/react/drawer";
import { UInputText } from "@ultimate/react/input-text";
import { UMenu } from "@ultimate/react/menu";
import type { UMenuHandle } from "@ultimate/react/menu";
import { UOrganizationChart } from "@ultimate/react/organization-chart";
import { UPopover } from "@ultimate/react/popover";
import type { UPopoverHandle } from "@ultimate/react/popover";
import { UScroller } from "@ultimate/react/scroller";
import { USelect } from "@ultimate/react/select";
import { UTable } from "@ultimate/react/table";
import {
  INITIAL_STATE,
  ITEMS_10K,
  MENU_MODEL,
  ORG_TREE,
  ROWS_100,
  ROWS_1000,
  ROWS_10K,
  ROW_HEIGHT,
  SELECT_OPTIONS,
  SELECT_UPDATE_VALUE,
  TABLE_COLUMNS,
  TABLE_FILTER,
  TABLE_SORT,
  installPerfApi,
  perfRoot,
  subjectFromLocation,
} from "../../../../scripts/perf/browser/harness";
import type { PerfRow, PerfState } from "../../../../scripts/perf/browser/harness";

/**
 * Client-only ADR-057 Stage 1 perf page (`/perf/<subject>`), built by
 * `build:perf` into dist/perf. It is separate from the SSR proof page
 * (App.tsx and the entry-* files), which it does not import.
 */
applyUltimateTheme();

const ORG_VALUE = [ORG_TREE];

const popoverRef = React.createRef<UPopoverHandle>();
const menuRef = React.createRef<UMenuHandle>();

/** The button that opens an overlay subject; `open()` clicks it. */
function trigger(onClick: (event: React.MouseEvent) => void): React.ReactElement {
  return (
    <button type="button" data-perf-trigger onClick={onClick}>
      Open
    </button>
  );
}

function Subject({ subject, state }: { subject: string; state: PerfState }): React.ReactElement {
  const [date, setDate] = React.useState<Date | null>(null);
  const [text, setText] = React.useState("");
  const close = () => controller.set((current) => ({ ...current, visible: false }));
  const table = (rows: PerfRow[]) => (
    <UTable
      value={rows}
      columns={TABLE_COLUMNS}
      sortField={state.updated === "sort" ? TABLE_SORT.field : undefined}
      sortOrder={state.updated === "sort" ? TABLE_SORT.order : 0}
      filters={state.updated === "filter" ? TABLE_FILTER : {}}
    />
  );
  switch (subject) {
    case "button":
      return <UButton label="Perf Button" />;
    case "inputtext":
      return <UInputText value={text} onChange={(e) => setText(e.target.value)} />;
    case "select":
      return (
        <USelect
          value={state.updated === "value" ? SELECT_UPDATE_VALUE : null}
          onChange={() => undefined}
          options={SELECT_OPTIONS}
          optionLabel="label"
          optionValue="value"
          placeholder="Select"
        />
      );
    case "datepicker":
      return <UDatePicker value={date} onChange={setDate} />;
    case "dialog":
      return (
        <div>
          {trigger(() => controller.set((current) => ({ ...current, visible: true })))}
          <UDialog visible={state.visible} onHide={close} header="Perf Dialog">
            Dialog body
          </UDialog>
        </div>
      );
    case "drawer":
      return (
        <div>
          {trigger(() => controller.set((current) => ({ ...current, visible: true })))}
          <UDrawer visible={state.visible} onHide={close} header="Perf Drawer">
            Drawer body
          </UDrawer>
        </div>
      );
    case "popover":
      return (
        <div>
          {trigger((e) => popoverRef.current?.toggle(e))}
          <UPopover ref={popoverRef}>Popover body</UPopover>
        </div>
      );
    case "menu":
      return (
        <div>
          {trigger((e) => menuRef.current?.toggle(e))}
          <UMenu ref={menuRef} model={MENU_MODEL} popup />
        </div>
      );
    case "table-100":
      return table(ROWS_100);
    case "table-1000":
      return table(ROWS_1000);
    case "table-virtual-10k":
      return (
        <UTable
          value={ROWS_10K}
          columns={TABLE_COLUMNS}
          virtualScrollerOptions={{ itemSize: ROW_HEIGHT }}
        />
      );
    case "scroller-10k":
      return <UScroller items={ITEMS_10K} itemSize={ROW_HEIGHT} />;
    case "dataview":
      return <UDataView value={ROWS_1000} itemTemplate={(row: PerfRow) => row.name} />;
    case "organizationchart":
      return <UOrganizationChart value={ORG_VALUE} />;
    default:
      throw new Error(`perf page: unknown subject "${subject}"`);
  }
}

const controller: { set: React.Dispatch<React.SetStateAction<PerfState>> } = {
  set: () => undefined,
};

function PerfPage({ subject }: { subject: string }): React.ReactElement | null {
  const [state, setState] = React.useState(INITIAL_STATE);
  controller.set = setState;
  return state.mounted ? <Subject subject={subject} state={state} /> : null;
}

const click = (selector: string) => perfRoot().querySelector<HTMLElement>(selector)?.click();

const subject = subjectFromLocation();
if (subject) {
  createRoot(perfRoot()).render(<PerfPage subject={subject} />);
  installPerfApi(subject, {
    mount: () => controller.set({ ...INITIAL_STATE, mounted: true }),
    unmount: () => controller.set(INITIAL_STATE),
    update: (kind) => controller.set((state) => ({ ...state, updated: kind })),
    open: () => click(subject === "select" ? '[role="combobox"]' : "[data-perf-trigger]"),
    close: () => {
      if (subject === "dialog" || subject === "drawer") {
        controller.set((state) => ({ ...state, visible: false }));
      } else if (subject === "select") {
        click('[role="combobox"]');
      } else if (subject === "popover") {
        popoverRef.current?.hide();
      } else {
        menuRef.current?.hide();
      }
    },
  });
}
