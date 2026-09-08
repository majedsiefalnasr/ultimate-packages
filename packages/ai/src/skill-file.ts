import { dump, load } from "js-yaml";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { renderSection, type Framework, type SectionKey } from "./render-section";

export type { Framework, SectionKey };

export const SECTION_KEYS: readonly SectionKey[] = [
  "preferred-patterns",
  "allowed-apis",
  "anti-patterns",
  "accessibility-guidance",
  "related-components",
];

const SECTION_HEADINGS: Record<SectionKey, string> = {
  "preferred-patterns": "## Preferred patterns",
  "allowed-apis": "## Allowed/recommended APIs",
  "anti-patterns": "## Anti-patterns",
  "accessibility-guidance": "## Accessibility guidance",
  "related-components": "## Related components",
};

export function startMarker(section: SectionKey): string {
  return `<!-- ultimate:generated:start section="${section}" -->`;
}

export function endMarker(section: SectionKey): string {
  return `<!-- ultimate:generated:end section="${section}" -->`;
}

interface Frontmatter {
  component: string;
  metadataVersion: number;
  frameworks: Framework[];
}

/**
 * Parses and mechanically validates the frontmatter block's exact type
 * contract (spec §6.3.2): `component` must be a string; `metadataVersion`
 * must be a positive integer — NOT merely `typeof === "number"`, which
 * would silently accept a non-integer like `1.5` or a non-positive value
 * like `0`/`-1`; `frameworks` must be an array whose every element is a
 * string. Any violation of this shape returns `undefined` (the same
 * "malformed frontmatter" outcome as a missing block entirely) — this
 * function only ever hands back a Frontmatter value once every field's
 * exact type is confirmed, so no downstream caller (validate.ts) needs to
 * re-check these basic shape invariants itself.
 */
export function parseFrontmatter(content: string): Frontmatter | undefined {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (match === null) {
    return undefined;
  }
  const parsed = load(match[1]) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }
  const record = parsed as Record<string, unknown>;

  if (typeof record.component !== "string") {
    return undefined;
  }
  if (
    typeof record.metadataVersion !== "number" ||
    !Number.isInteger(record.metadataVersion) ||
    record.metadataVersion <= 0
  ) {
    return undefined;
  }
  if (!Array.isArray(record.frameworks) || !record.frameworks.every((f) => typeof f === "string")) {
    return undefined;
  }

  return {
    component: record.component,
    metadataVersion: record.metadataVersion,
    frameworks: record.frameworks as Framework[],
  };
}

function renderFrontmatter(component: ComponentMetadata, frameworks: readonly Framework[]): string {
  const body = dump(
    { component: component.name, metadataVersion: component.metadataVersion, frameworks: [...frameworks] },
    { flowLevel: 1 }
  );
  return `---\n${body}---\n`;
}

/**
 * Generates the complete text of a freshly-created Skill file for a
 * component with no existing file yet. Each of the 5 section keys gets
 * exactly one heading, emitted immediately before that section's own
 * start marker — a deterministic, unambiguous one-heading-per-marker-pair
 * structure (fixed after Plan Review round 1 found the prior split-
 * conditional version misplaced/omitted headings; see Task 3's Step 1
 * tests for the assertions that pin this structure down).
 */
export function generateSkillFile(component: ComponentMetadata, frameworks: readonly Framework[]): string {
  const frontmatter = renderFrontmatter(component, frameworks);
  const parts: string[] = [frontmatter, `# ${component.name}\n`, "## When to use\n"];

  for (const key of SECTION_KEYS) {
    parts.push(SECTION_HEADINGS[key]);
    parts.push(startMarker(key));
    parts.push(renderSection(key, component, frameworks));
    parts.push(endMarker(key));
  }

  parts.push("## Framework-specific guidance\n");
  return parts.join("\n") + "\n";
}

const malformedResult = (error: string): { error: string } => ({ error });

/** Locates every marker occurrence in `content`, returning per-section start/end positions or a structured malformed-input error. */
function locateMarkers(
  content: string
): { positions: Record<SectionKey, { start: number; end: number }> } | { error: string } {
  const positions: Partial<Record<SectionKey, { start: number; end: number }>> = {};

  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const startOccurrences = countOccurrences(content, startText);
    const endOccurrences = countOccurrences(content, endText);

    if (startOccurrences === 0 || endOccurrences === 0) {
      return malformedResult(`missing required generated section: ${key}`);
    }
    if (startOccurrences > 1 || endOccurrences > 1) {
      return malformedResult(`duplicate generated section: ${key}`);
    }

    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    if (end < start) {
      return malformedResult(`unmatched marker for section: ${key}`);
    }
    positions[key] = { start, end };
  }

  // Nesting check: no other section's start marker may fall strictly inside this section's range.
  for (const outer of SECTION_KEYS) {
    const outerRange = positions[outer]!;
    for (const inner of SECTION_KEYS) {
      if (inner === outer) continue;
      const innerStartIndex = content.indexOf(startMarker(inner));
      if (innerStartIndex > outerRange.start && innerStartIndex < outerRange.end) {
        return malformedResult(`nested generated block: ${outer} contains ${inner}`);
      }
    }
  }

  return { positions: positions as Record<SectionKey, { start: number; end: number }> };
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Regenerates only the marker-delimited bytes and the frontmatter's
 * metadataVersion of an existing Skill file, preserving all hand-authored
 * content verbatim. Refuses (never throws, never guesses) if the existing
 * content already fails one of the 5 malformed-marker conditions.
 */
export function regenerateSkillFile(
  existingContent: string,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): { content: string } | { error: string } {
  const located = locateMarkers(existingContent);
  if ("error" in located) {
    return located;
  }

  // Rewrite section bodies back-to-front so earlier offsets stay valid.
  let content = existingContent;
  const orderedByPosition = [...SECTION_KEYS].sort((a, b) => located.positions[b].start - located.positions[a].start);
  for (const key of orderedByPosition) {
    const { start, end } = located.positions[key];
    const newBody = renderSection(key, component, frameworks);
    content = content.slice(0, start) + `\n${newBody}\n` + content.slice(end);
  }

  const frontmatterMatch = /^---\n([\s\S]*?\n)---\n/.exec(content);
  if (frontmatterMatch !== null) {
    content = content.replace(frontmatterMatch[0], renderFrontmatter(component, frameworks));
  }

  return { content };
}
