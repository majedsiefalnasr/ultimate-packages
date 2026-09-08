// packages/ai/test/validate.test.ts
import { describe, it, expect, vi } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { generateSkillFile, startMarker, endMarker } from "../src/skill-file";
import { validateSkillFile, validateContextFileReproducibility } from "../src/validate";
import { renderLlmsTxt, renderLlmsFullTxt, renderFrameworkContext } from "../src/context-files";

const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;

describe("validateSkillFile", () => {
  it("passes for a freshly-generated, untouched Skill file", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]);
    const result = validateSkillFile(content);
    expect(result.valid).toBe(true);
  });

  it("fails with a malformed-frontmatter error when metadataVersion is a non-integer number — exercises parseFrontmatter's strict positive-integer contract from validateSkillFile's own entry point, not just parseFrontmatter in isolation", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 1.5"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors).toEqual(["missing or malformed frontmatter block"]);
  });

  it("fails with a component-not-found error when the frontmatter names an unknown component", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "component: Button",
      "component: NotAComponent"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("NotAComponent"))).toBe(true);
  });

  it("fails with an unrecognized-framework error when frontmatter lists a framework value outside ng/react/vue", () => {
    // This exercises the SEPARATE "unrecognized framework" branch — a
    // value not in KNOWN_FRAMEWORKS at all. It is deliberately kept
    // distinct from the "recognized but uncovered" test below (Plan
    // Review round 1 found the two branches were being conflated by a
    // single loose test).
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "frameworks: [ng, react, vue]",
      "frameworks: [ng, react, vue, svelte]"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("unrecognized framework"))).toBe(true);
  });

  it("fails with a framework-coverage error when frontmatter claims a KNOWN framework the component genuinely has no api entry for (synthetic fixture, since no real v1 record has this gap)", async () => {
    // No real component in ALL_COMPONENTS has a gap between a recognized
    // framework and its own api coverage (all 8 records have ng/react/vue
    // all populated) — mirroring packages/mcp/test/tools/get-component-api.test.ts's
    // own precedent for exercising an otherwise-unreachable real-data path
    // via vi.doMock, strictly test-local, never touching the real
    // ALL_COMPONENTS export or any committed metadata record.
    vi.resetModules();
    vi.doMock("@ultimate/component-metadata", () => ({
      ALL_COMPONENTS: [
        {
          name: "SyntheticGapComponent",
          category: "Test",
          description:
            "A synthetic record with no react api entry, used only to exercise the framework-coverage validation path.",
          schemaVersion: "1.0.0",
          metadataVersion: 1,
          packages: { ng: { packageName: "@ultimate/ng", sourcePath: "n/a" } },
          api: {
            ng: { props: [], events: [] },
            // Deliberately no `react` key — a real "known framework,
            // genuinely uncovered" gap this synthetic fixture creates on
            // purpose, since no real v1 record has one.
          },
        },
      ],
    }));

    const { validateSkillFile: validateSkillFileWithMock } = await import("../src/validate");
    const syntheticContent = [
      "---",
      "component: SyntheticGapComponent",
      "metadataVersion: 1",
      "frameworks: [ng, react]",
      "---",
      "",
      "# SyntheticGapComponent",
      "",
      startMarker("preferred-patterns"),
      endMarker("preferred-patterns"),
      startMarker("allowed-apis"),
      endMarker("allowed-apis"),
      startMarker("anti-patterns"),
      endMarker("anti-patterns"),
      startMarker("accessibility-guidance"),
      endMarker("accessibility-guidance"),
      startMarker("related-components"),
      endMarker("related-components"),
      "",
    ].join("\n");

    const result = validateSkillFileWithMock(syntheticContent);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("react") && e.includes("no api entry for"))).toBe(
      true
    );

    vi.doUnmock("@ultimate/component-metadata");
    vi.resetModules();
  });

  it("fails with a metadataVersion mismatch error when the frontmatter's version is stale", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "metadataVersion: 1",
      "metadataVersion: 999"
    );
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("metadataVersion"))).toBe(true);
  });

  it("fails with a missing-marker error, and does NOT also report a fidelity error for the same run (marker-structure checked before fidelity)", () => {
    // Both the start AND end marker for the section must be absent to
    // trigger the "missing" classification — removing only one of the two
    // is the SEPARATE "unmatched" case (see skill-file.test.ts's own
    // "only a start marker" / "only an end marker" tests for
    // `regenerateSkillFile`, which pin down this exact distinction for the
    // shared locateMarkers-equivalent classification logic that
    // checkMarkerStructure below reuses). The brief's original version of
    // this test stripped only the start marker via a literal string
    // replace, which — per that same already-tested contract — actually
    // produces "unmatched marker for section", not "missing required
    // generated section"; corrected here to strip both markers so the
    // assertion matches the verified, established classification.
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"])
      .replace('<!-- ultimate:generated:start section="anti-patterns" -->', "")
      .replace('<!-- ultimate:generated:end section="anti-patterns" -->', "");
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.includes("missing required generated section"))).toBe(true);
    expect(result.errors.some((e) => e.toLowerCase().includes("fidelity"))).toBe(false);
  });

  it("fails with a fidelity error when a marker section's content has been hand-edited to diverge from what regeneration would produce", () => {
    const content = generateSkillFile(
      ALL_COMPONENTS.find((c) => c.name === "Table")!,
      ["ng", "react", "vue"]
    ).replace("virtualized window", "SOMETHING ELSE ENTIRELY");
    const result = validateSkillFile(content);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.errors.some((e) => e.toLowerCase().includes("fidelity"))).toBe(true);
  });

  it("never reports an error about hand-authored prose outside marker pairs", () => {
    const content = generateSkillFile(BUTTON, ["ng", "react", "vue"]).replace(
      "## When to use\n",
      "## When to use\nThis sentence is factually wrong about Button on purpose.\n"
    );
    const result = validateSkillFile(content);
    // Must still pass — prose is never semantically validated (spec §10.2/§12).
    expect(result.valid).toBe(true);
  });
});

describe("validateContextFileReproducibility", () => {
  // A separate check on a different artifact type (an LLM-context .txt
  // file, not a Skill file) — see this task's boundary-clarification note
  // above. Added in Plan Review round 2's correction pass: this function
  // was previously exported but had no test and was never invoked from
  // any executable path (bin-validate.ts only called validateSkillFile).

  it("passes when actualContent exactly matches renderFn()'s current output", () => {
    const actual = renderLlmsTxt();
    const result = validateContextFileReproducibility(actual, renderLlmsTxt);
    expect(result.valid).toBe(true);
  });

  it("fails with a structured error when actualContent diverges from renderFn()'s current output", () => {
    const stale = renderLlmsTxt().replace("Button", "SomethingElse");
    const result = validateContextFileReproducibility(stale, renderLlmsTxt);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.error).toContain("does not match its own reproducible rendering");
  });

  it("is exercised for all 5 real context-render functions, each passing against its own fresh output", () => {
    const checks: (() => string)[] = [
      renderLlmsTxt,
      renderLlmsFullTxt,
      () => renderFrameworkContext("ng"),
      () => renderFrameworkContext("react"),
      () => renderFrameworkContext("vue"),
    ];
    for (const renderFn of checks) {
      const content = renderFn();
      const result = validateContextFileReproducibility(content, renderFn);
      expect(result.valid).toBe(true);
    }
  });
});
