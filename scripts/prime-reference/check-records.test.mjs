// scripts/prime-reference/check-records.test.mjs
//
// Behaviour tests for the record checking tool. They use small synthetic record
// sets, menus and archive listings, so they need neither the pinned archives nor
// the real records. The tool is exercised through its public function
// (checkRecords) and its command line.

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS, checkRecords, formatReport } from "./check-records.mjs";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-records.mjs");

const ARCHIVES = {
  "primevue-4.5.5": new Set([
    "packages",
    "packages/primevue",
    "packages/primevue/src/select/Select.vue",
  ]),
  "primeng-21.1.9": new Set(["packages", "packages/primeng/src/select/select.ts"]),
};

function menu(...groups) {
  return {
    data: groups.map(([name, ...items]) => ({
      name,
      children: items.map((item) =>
        typeof item === "string"
          ? { name: item, to: `/${item}` }
          : { name: item[0], children: item[1].map((n) => ({ name: n })) }
      ),
    })),
  };
}

const MENUS = {
  primeng: menu(["Components", ["Form", ["Select"]]]),
  primevue: menu(["Components", ["Form", ["Select"]]]),
  primereact: menu(["Components", ["Form", ["Select"]]]),
};

function record({ skip = [], swap = false, body = "Some text." } = {}) {
  let titles = SECTIONS.map((t, i) => `${i + 1}. ${t}`).filter((t, i) => !skip.includes(i + 1));
  if (swap) titles = [titles[1], titles[0], ...titles.slice(2)];
  return `# Select\n\n${titles.map((t) => `## ${t}\n\n${body}\n`).join("\n")}`;
}

function fixture(records, { foundations = {}, mapping, menus = MENUS } = {}) {
  const docsDir = mkdtempSync(join(tmpdir(), "check-records-"));
  mkdirSync(join(docsDir, "components"), { recursive: true });
  mkdirSync(join(docsDir, "foundations"), { recursive: true });
  for (const [name, text] of Object.entries(records))
    writeFileSync(join(docsDir, "components", name), text);
  for (const [name, text] of Object.entries(foundations))
    writeFileSync(join(docsDir, "foundations", name), text);
  const result = checkRecords({ docsDir, archives: ARCHIVES, menus, mapping: mapping ?? {} });
  return { docsDir, result };
}

function run(records, options) {
  const { docsDir, result } = fixture(records, options);
  rmSync(docsDir, { recursive: true, force: true });
  return result;
}

const kinds = (result) => result.problems.map((p) => p.kind);

test("a clean record set passes", () => {
  const result = run({ "select.md": record() });
  assert.deepEqual(result.problems, []);
  assert.equal(result.stats.records, 1);
});

test("a missing section is reported with the record name", () => {
  const result = run({ "select.md": record({ skip: [8] }) });
  assert.deepEqual(kinds(result), ["section"]);
  assert.equal(result.problems[0].subject, "components/select.md");
  assert.match(result.problems[0].detail, /missing section "## 8\. Theming"/);
});

test("sections in the wrong order are reported", () => {
  const result = run({ "select.md": record({ swap: true }) });
  assert.deepEqual(kinds(result), ["section"]);
  assert.match(result.problems[0].detail, /out of order/);
});

test("an empty section is reported", () => {
  const result = run({
    "select.md": `${record()}\n`.replace(
      "## 3. Per framework\n\nSome text.",
      "## 3. Per framework\n"
    ),
  });
  assert.deepEqual(kinds(result), ["section"]);
  assert.match(result.problems[0].detail, /empty section "## 3\. Per framework"/);
});

test("headings inside code fences do not count as sections", () => {
  const text = record().replace("Some text.", "```md\n## 99. Fake\n```");
  assert.deepEqual(run({ "select.md": text }).problems, []);
});

test("a citation to an existing archive path passes", () => {
  const text = record({ body: "See `primevue-4.5.5:packages/primevue/src/select/Select.vue`." });
  assert.deepEqual(run({ "select.md": text }).problems, []);
});

test("a citation to a missing path is reported with the record name", () => {
  const text = record({ body: "See `primevue-4.5.5:packages/primevue/src/select/Missing.vue`." });
  const result = run({ "select.md": text });
  assert.deepEqual(kinds(result), ["citation"]);
  assert.equal(result.problems[0].subject, "components/select.md");
  assert.match(result.problems[0].detail, /Missing\.vue/);
});

test("path case matters in citations", () => {
  const text = record({ body: "See `primevue-4.5.5:packages/primevue/src/select/select.vue`." });
  assert.deepEqual(kinds(run({ "select.md": text })), ["citation"]);
});

test("a citation to an unknown archive version is reported", () => {
  const text = record({ body: "See `primevue-4.9.9:packages/primevue`." });
  const result = run({ "select.md": text });
  assert.deepEqual(kinds(result), ["citation"]);
  assert.match(result.problems[0].detail, /unknown archive "primevue-4\.9\.9"/);
});

test("glob citations are not checked and trailing punctuation is ignored", () => {
  const text = record({
    body: "See `primevue-4.5.5:packages/*/src` and primevue-4.5.5:packages/primevue.",
  });
  assert.deepEqual(run({ "select.md": text }).problems, []);
});

test("foundation notes are checked for citations too", () => {
  const { docsDir, result } = fixture(
    { "select.md": record() },
    { foundations: { "primevue.md": "See primevue-4.5.5:nope/file.ts" } }
  );
  rmSync(docsDir, { recursive: true, force: true });
  assert.deepEqual(kinds(result), ["citation"]);
  assert.equal(result.problems[0].subject, "foundations/primevue.md");
});

test("a menu item with no record, foundation or exclusion is reported", () => {
  const menus = { ...MENUS, primevue: menu(["Components", ["Form", ["Select", "Rating"]]]) };
  const result = run({ "select.md": record() }, { menus });
  assert.deepEqual(kinds(result), ["unmapped-item"]);
  assert.equal(result.problems[0].subject, "primevue: Components / Form / Rating");
});

test("a record that no menu item maps to is reported as an orphan", () => {
  const result = run({ "select.md": record(), "rating.md": record() });
  assert.deepEqual(kinds(result), ["orphan"]);
  assert.equal(result.problems[0].subject, "components/rating.md");
});

test("alias, foundation and exclusion entries cover menu items", () => {
  const menus = {
    ...MENUS,
    primereact: menu(
      ["Components", ["Form", ["Dropdown"]]],
      ["Getting Started", "Installation"],
      ["Support", "Forum"]
    ),
  };
  const mapping = {
    primereact: {
      "Components / Form / Dropdown": { record: "select" },
      "Getting Started": { foundation: "foundations/primereact.md" },
      Support: { excluded: "out of scope" },
    },
  };
  const { docsDir, result } = fixture(
    { "select.md": record() },
    { menus, mapping, foundations: { "primereact.md": "Notes." } }
  );
  rmSync(docsDir, { recursive: true, force: true });
  assert.deepEqual(result.problems, []);
  const covered = result.coverage.filter((c) => c.framework === "primereact");
  assert.deepEqual(
    covered.map((c) => c.target),
    ["record select", "foundation foundations/primereact.md", "excluded: out of scope"]
  );
});

test("a mapping entry pointing at a missing record or foundation is reported", () => {
  const menus = {
    ...MENUS,
    primeng: menu(["Components", ["Form", ["Select", "Rating"]]], ["Theming", "Styled"]),
  };
  const mapping = {
    primeng: {
      "Components / Form / Rating": { record: "rating" },
      Theming: { foundation: "foundations/none.md" },
    },
  };
  const result = run({ "select.md": record() }, { menus, mapping });
  assert.deepEqual(kinds(result), ["missing-target", "missing-target"]);
});

test("a mapping entry that matches no menu item is reported as stale", () => {
  const result = run(
    { "select.md": record() },
    { mapping: { primeng: { "Components / Form / Gone": { excluded: "x" } } } }
  );
  assert.deepEqual(kinds(result), ["stale-mapping"]);
});

test("the most specific mapping entry wins over a group entry", () => {
  const menus = { ...MENUS, primeng: menu(["Misc", "Bind", "Other"]) };
  const mapping = { primeng: { Misc: { excluded: "group" }, "Misc / Bind": { excluded: "item" } } };
  const result = run(
    { "select.md": record() },
    { menus: { ...menus, primevue: menu(), primereact: menu() }, mapping }
  );
  assert.deepEqual(
    result.coverage.map((c) => c.target),
    ["excluded: item", "excluded: group"]
  );
});

test("problems are sorted and the report is deterministic", () => {
  const records = { "b.md": record({ skip: [1] }), "a.md": record({ skip: [2] }) };
  const first = formatReport(run(records));
  const second = formatReport(run(records));
  assert.equal(first, second);
  const lines = first.split("\n");
  assert.ok(
    lines.findIndex((l) => l.includes("components/a.md")) <
      lines.findIndex((l) => l.includes("components/b.md"))
  );
  assert.match(lines.at(-1), /^2 records checked, \d+ problems \(.*section=2.*\)$/);
});

test("the command line exits non-zero when the vendor cache is missing", () => {
  const empty = mkdtempSync(join(tmpdir(), "check-records-vendor-"));
  try {
    const run = spawnSync("node", [SCRIPT, "--vendor-dir", empty], { encoding: "utf8" });
    assert.equal(run.status, 2);
    assert.match(run.stderr, /Missing archive/);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("the command line rejects unknown arguments", () => {
  const run = spawnSync("node", [SCRIPT, "--nope"], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /Unknown argument/);
});
