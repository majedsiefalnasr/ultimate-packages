// packages/ai/src/validate.ts
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import {
  parseFrontmatter,
  SECTION_KEYS,
  startMarker,
  endMarker,
  renderMarkerBlockInterior,
  type Framework,
} from "./skill-file";
import { renderSection } from "./render-section";

const KNOWN_FRAMEWORKS = new Set<string>(["ng", "react", "vue"]);

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

export function validateSkillFile(
  content: string
): { valid: true } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  // Stage 1: frontmatter.
  const frontmatter = parseFrontmatter(content);
  if (frontmatter === undefined) {
    return { valid: false, errors: ["missing or malformed frontmatter block"] };
  }

  const component = ALL_COMPONENTS.find((c) => c.name === frontmatter.component);
  if (component === undefined) {
    errors.push(
      `frontmatter "component" field names an unknown component: "${frontmatter.component}". Known components: ${ALL_COMPONENTS.map((c) => c.name).join(", ")}.`
    );
  }

  for (const framework of frontmatter.frameworks) {
    if (!KNOWN_FRAMEWORKS.has(framework)) {
      errors.push(`frontmatter "frameworks" field lists an unrecognized framework: "${framework}"`);
      continue;
    }
    if (component !== undefined && component.api?.[framework as Framework] === undefined) {
      errors.push(
        `frontmatter "frameworks" field claims framework "${framework}", which "${component.name}" has no api entry for`
      );
    }
  }

  if (component !== undefined && frontmatter.metadataVersion !== component.metadataVersion) {
    errors.push(
      `frontmatter "metadataVersion" (${frontmatter.metadataVersion}) does not match "${component.name}"'s current metadataVersion (${component.metadataVersion})`
    );
  }

  if (errors.length > 0 || component === undefined) {
    return { valid: false, errors };
  }

  // Stage 2: marker structure. Fidelity is only attempted if this stage is
  // fully clean, per spec §10.2's explicit ordering rule.
  const markerErrors = checkMarkerStructure(content);
  if (markerErrors.length > 0) {
    return { valid: false, errors: markerErrors };
  }

  // Stage 3: generated-section fidelity.
  const fidelityErrors = checkFidelity(content, component, frontmatter.frameworks as Framework[]);
  if (fidelityErrors.length > 0) {
    return { valid: false, errors: fidelityErrors };
  }

  return { valid: true };
}

function checkMarkerStructure(content: string): string[] {
  const errors: string[] = [];
  const positions: Partial<Record<(typeof SECTION_KEYS)[number], { start: number; end: number }>> =
    {};

  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const startCount = countOccurrences(content, startText);
    const endCount = countOccurrences(content, endText);

    if (startCount === 0 && endCount === 0) {
      errors.push(`missing required generated section: ${key}`);
      continue;
    }
    if (startCount > 1 || endCount > 1) {
      errors.push(`duplicate generated section: ${key}`);
      continue;
    }
    if (startCount !== endCount) {
      errors.push(`unmatched marker for section: ${key}`);
      continue;
    }
    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    if (end < start) {
      errors.push(`unmatched marker for section: ${key}`);
      continue;
    }
    positions[key] = { start, end };
  }

  if (errors.length > 0) {
    return errors;
  }

  for (const outer of SECTION_KEYS) {
    const outerRange = positions[outer]!;
    for (const inner of SECTION_KEYS) {
      if (inner === outer) continue;
      const innerStartIndex = content.indexOf(startMarker(inner));
      if (innerStartIndex > outerRange.start && innerStartIndex < outerRange.end) {
        errors.push(`nested generated block: ${outer} contains ${inner}`);
      }
    }
  }

  return errors;
}

/**
 * Byte-exact comparison — no `.trim()`. The expected value is built with
 * the exact same `renderMarkerBlockInterior` helper `skill-file.ts` uses
 * to write these bytes in the first place, so this check can never drift
 * out of sync with what the generator actually produces: a bug in the
 * shared helper is caught here as a fidelity failure, not silently
 * tolerated by a whitespace-insensitive comparison on both sides.
 */
function checkFidelity(
  content: string,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): string[] {
  const errors: string[] = [];
  for (const key of SECTION_KEYS) {
    const startText = startMarker(key);
    const endText = endMarker(key);
    const start = content.indexOf(startText) + startText.length;
    const end = content.indexOf(endText);
    const actual = content.slice(start, end);
    const expected = renderMarkerBlockInterior(renderSection(key, component, frameworks));
    if (actual !== expected) {
      errors.push(`generated-section fidelity check failed for section: ${key}`);
    }
  }
  return errors;
}

export function validateContextFileReproducibility(
  actualContent: string,
  renderFn: () => string
): { valid: true } | { valid: false; error: string } {
  const expected = renderFn();
  if (actualContent === expected) {
    return { valid: true };
  }
  return {
    valid: false,
    error: "generated LLM-context file does not match its own reproducible rendering",
  };
}
