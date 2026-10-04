// The Vue floor that the GAP-083 consumer check tests (ADR-050). The floor is
// stated in three machine-readable places; they must agree on one caret range
// `^X.Y.Z`, and `X.Y.Z` is the version the floor pass installs.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CARET_RANGE = /^\^(\d+)\.(\d+)\.(\d+)$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Reads the three floor statements; a missing one is `undefined`. */
export function readVueFloorRanges({ vueDir, vueCoreDir, manifestPath }) {
  const vueEntry = readJson(manifestPath).find((entry) => entry.framework === "vue");
  return {
    "@ultimate/vue peerDependencies.vue": readJson(join(vueDir, "package.json")).peerDependencies
      ?.vue,
    "@ultimate/vue-core peerDependencies.vue": readJson(join(vueCoreDir, "package.json"))
      .peerDependencies?.vue,
    "compatibility-manifest.json vue frameworkVersionRange": vueEntry?.frameworkVersionRange,
  };
}

/** Returns `X.Y.Z` when every range is the same `^X.Y.Z`; throws otherwise. */
export function resolveVueFloor(ranges) {
  const values = Object.values(ranges);
  const match = values.every((value) => value === values[0])
    ? CARET_RANGE.exec(values[0] ?? "")
    : null;
  if (!match) {
    const got = Object.entries(ranges)
      .map(([label, value]) => `${label}=${value ?? "(missing)"}`)
      .join(", ");
    throw new Error(
      `[validate-consumer-types] Vue floor ranges must be one identical caret range ^X.Y.Z; got ${got}`
    );
  }
  return `${match[1]}.${match[2]}.${match[3]}`;
}
