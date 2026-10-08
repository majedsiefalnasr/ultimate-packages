/**
 * GAP-064 G3-E canonical cases (Spec §6; PARITY_PLAYBOOK.md §5). Each case renders
 * `#/g3e/<prime>` in both reference apps (each with its own framework's content) and
 * the mapped Ultimate story. Components are added per batch (Plan Tasks 5, 8, 11, 14).
 */
import type { Framework, Open, Pair, RecordedCase, State } from "./cases";

export type Batch = "smoke" | "E-1" | "E-2" | "E-3" | "E-4";

/** Actions run on both sides before probing; strings are part names, `advance` is ms. */
export type Action =
  | { click: string }
  | { press: string }
  | { hover: string }
  | { range: [string, number] }
  | { fill: [string, string] }
  | { advance: number };

/** Observable facts compared Prime ↔ Ultimate. */
export type Fact =
  | { shown: string }
  | { texts: string }
  | { attr: [string, string] }
  | { focused: true }
  | { direction: string };

export interface G3ECase {
  id: string;
  batch: Batch;
  section: string;
  axis: string;
  /** Reference route; the same id in both reference apps (each renders its own framework's content). */
  prime: string;
  story: Partial<Record<Framework, string>>;
  open: Record<Framework, Open>;
  state?: State;
  clock?: boolean;
  actions?: Action[];
  capture: "container" | "viewport";
  parts: string[];
  facts?: Fact[];
  kind: "visual" | "behavior";
}

export interface G3EComponent {
  key: string;
  tier: "A" | "B";
  batch: Batch;
  parts: Record<string, Pair | Record<Framework, Pair>>;
  cases: G3ECase[];
  recorded: RecordedCase[];
}

const none = { ng: "none", vue: "none" } as const;

export const G3E: G3EComponent[] = [
  {
    key: "smoke",
    tier: "B",
    batch: "smoke",
    parts: { root: [".p-tag", ".u-tag"], label: [".p-tag-label", ".u-tag-label"] },
    cases: [
      {
        id: "smoke/tag",
        batch: "smoke",
        section: "Basic",
        axis: "runner smoke test",
        prime: "tag/default",
        story: { ng: "ng-tag--default", vue: "vue-tag--default" },
        open: none,
        capture: "container",
        parts: ["root", "label"],
        facts: [{ texts: "label" }, { direction: "root" }],
        kind: "visual",
      },
      {
        // G3E-4 / Review Focus 2: the clock path (paused clock, settled by advancing time).
        id: "smoke/tag-clock",
        batch: "smoke",
        section: "Basic",
        axis: "runner smoke test with the clock",
        prime: "tag/default",
        story: { ng: "ng-tag--default", vue: "vue-tag--default" },
        open: none,
        clock: true,
        actions: [{ advance: 500 }],
        capture: "container",
        parts: ["root", "label"],
        kind: "visual",
      },
    ],
    recorded: [],
  },
];
