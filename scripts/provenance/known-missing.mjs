// scripts/provenance/known-missing.mjs
//
// Pure logic for the provenance ratchet (ADR-072). No file or git access: the
// validator reads the list and passes its text in, so every branch is testable
// without fixtures.
//
// The list is a JSON object keyed by manifest name (ng, react, vue). Each value
// is a sorted, duplicate-free array of production file paths that are known to
// have no manifest entry (GAP-094). The ratchet excuses exactly those files.

// Plain code-point order, never locale order, so the result does not depend on
// the machine that generated or checks the list.
function compareCodePoints(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// Returns { ok: true, list } or { ok: false, error }. Anything not provably a
// well-formed list is an error, so a broken list can never read as empty.
export function parseKnownMissing(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    return { ok: false, error: `not valid JSON: ${err.message}` };
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "must be a JSON object keyed by manifest name" };
  }

  const list = {};
  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) return { ok: false, error: `"${key}" must be an array` };
    const prefix = `packages/${key}/src/`;
    for (let index = 0; index < value.length; index++) {
      const item = value[index];
      if (typeof item !== "string") {
        return { ok: false, error: `"${key}"[${index}] must be a string` };
      }
      if (!item.startsWith(prefix)) {
        return {
          ok: false,
          error: `"${key}"[${index}] ${JSON.stringify(item)} must start with ${prefix}`,
        };
      }
      if (index > 0) {
        const order = compareCodePoints(value[index - 1], item);
        if (order === 0) {
          return { ok: false, error: `"${key}" has a duplicate: ${JSON.stringify(item)}` };
        }
        if (order > 0) {
          return {
            ok: false,
            error: `"${key}" is not sorted: ${JSON.stringify(value[index - 1])} comes before ${JSON.stringify(item)}`,
          };
        }
      }
    }
    list[key] = value;
  }
  return { ok: true, list };
}

function flatten(byKey) {
  return Object.values(byKey ?? {}).flat();
}

// missing: files the validator found without a manifest entry, by manifest name.
// list: the parsed known-missing list. Both have the shape { name: [path, ...] }.
//   added     missing and not listed (new debt); fails the ratchet.
//   stale     listed and no longer missing; fails, so the list only shrinks.
//   remaining missing files that are listed, for the progress line.
export function compareKnownMissing(missing, list) {
  const missingSet = new Set(flatten(missing));
  const listedSet = new Set(flatten(list));
  const added = [...missingSet].filter((path) => !listedSet.has(path)).sort(compareCodePoints);
  const stale = [...listedSet].filter((path) => !missingSet.has(path)).sort(compareCodePoints);
  const remaining = [...missingSet].filter((path) => listedSet.has(path)).length;
  return { added, stale, remaining };
}
