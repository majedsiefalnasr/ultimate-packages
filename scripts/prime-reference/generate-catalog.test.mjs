// scripts/prime-reference/generate-catalog.test.mjs
//
// Determinism and freshness tests for the Prime catalog generator. They read
// the pinned framework archives from the vendor cache (see the lookup order in
// generate-catalog.mjs), so run `pnpm run vendor:fetch -- primeng primevue
// primereact` first on a fresh checkout.

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_OUT_DIR, FRAMEWORKS, generateCatalog, normalize } from "./generate-catalog.mjs";

const EXPECTED_FILES = FRAMEWORKS.map((framework) => `${framework.package}.json`).sort();

function readDir(dir) {
  const files = {};
  for (const name of readdirSync(dir).sort()) files[name] = readFileSync(join(dir, name));
  return files;
}

test("two generator runs produce byte-identical catalog files", async () => {
  const first = mkdtempSync(join(tmpdir(), "prime-catalog-a-"));
  const second = mkdtempSync(join(tmpdir(), "prime-catalog-b-"));
  try {
    await generateCatalog({ outDir: first });
    await generateCatalog({ outDir: second });
    const a = readDir(first);
    const b = readDir(second);
    assert.deepEqual(Object.keys(a), EXPECTED_FILES);
    assert.deepEqual(Object.keys(b), EXPECTED_FILES);
    for (const name of EXPECTED_FILES) {
      assert.ok(a[name].equals(b[name]), `${name} differs between runs`);
    }
  } finally {
    rmSync(first, { recursive: true, force: true });
    rmSync(second, { recursive: true, force: true });
  }
});

test("committed catalog matches a fresh generation", async () => {
  const outDir = mkdtempSync(join(tmpdir(), "prime-catalog-fresh-"));
  try {
    const fresh = await generateCatalog({ outDir });
    for (const name of EXPECTED_FILES) {
      const committed = readFileSync(join(DEFAULT_OUT_DIR, name), "utf8");
      assert.equal(
        committed === fresh[name],
        true,
        `${name} is stale; run node scripts/prime-reference/generate-catalog.mjs`
      );
    }
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("catalog files carry no upstream prose fields", () => {
  for (const name of EXPECTED_FILES) {
    const text = readFileSync(join(DEFAULT_OUT_DIR, name), "utf8");
    assert.doesNotMatch(
      text,
      /"(description|eventDescription|methodDescription|typeDescription)":/
    );
    assert.doesNotMatch(text, /<span\b/);
  }
});

test("normalize drops prose, unwraps sections, sorts named entries, keeps parameter order", () => {
  const input = {
    description: "Prose.",
    props: {
      description: "Section prose.",
      values: [
        { name: "zeta", type: "string", default: "", description: "z" },
        { name: "alpha", type: "boolean", default: "false", deprecated: "since v2.\nMore prose." },
      ],
    },
    emits: {
      description: "Section prose.",
      values: [
        {
          name: "onChange",
          parameters: [
            { name: "second", type: "B" },
            { name: "first", type: "A" },
          ],
        },
      ],
    },
  };
  assert.deepEqual(normalize(input), {
    emits: [
      {
        name: "onChange",
        parameters: [
          { name: "second", type: "B" },
          { name: "first", type: "A" },
        ],
      },
    ],
    props: [
      { default: "false", deprecated: "since v2.", name: "alpha", type: "boolean" },
      { name: "zeta", type: "string" },
    ],
  });
});

test("normalize strips showcase markup and inline comments from type strings", () => {
  const type =
    '{\n  \t <span class="ml-3 doc-option-parameter-name">active</span>: ' +
    '<span class="doc-option-parameter-type">(i: number) &rArr; void</span>, ' +
    '<span class="doc-option-parameter-type">// Whether active.</span>\n }';
  assert.equal(normalize(type, "type"), "{ active: (i: number) => void }");
  assert.equal(
    normalize("{\n  \t $implicit: boolean, // Expanded state.\n  }", "type"),
    "{ $implicit: boolean }"
  );
});
