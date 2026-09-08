import type { ComponentMetadata } from "@ultimate/component-schema";

export type Framework = "ng" | "react" | "vue";
export type SectionKey =
  | "preferred-patterns"
  | "allowed-apis"
  | "anti-patterns"
  | "accessibility-guidance"
  | "related-components";

/**
 * Renders the exact content for one of the 5 v1 generated marker sections
 * (spec §6.3.3), directly from ComponentMetadata fields — never from prose,
 * never fabricated. Returns "" (empty string) when the backing field is
 * entirely absent, per the "marker present, content empty" rule (spec
 * §6.2/§6.3.3) — the caller (skill-file.ts) is responsible for still
 * emitting the marker pair around this possibly-empty string.
 */
export function renderSection(
  section: SectionKey,
  component: ComponentMetadata,
  frameworks: readonly Framework[]
): string {
  switch (section) {
    case "preferred-patterns":
      return component.guidance?.usageNotes ?? "";
    case "anti-patterns":
      return renderAntiPatterns(component);
    case "allowed-apis":
      return renderAllowedApis(component, frameworks);
    case "accessibility-guidance":
      return renderAccessibilityGuidance(component);
    case "related-components":
      return renderRelatedComponents(component);
  }
}

function renderAntiPatterns(component: ComponentMetadata): string {
  const items = component.guidance?.antiPatterns;
  if (items === undefined || items.length === 0) {
    return "";
  }
  return items.map((item) => `- ${item}`).join("\n");
}

function renderAllowedApis(component: ComponentMetadata, frameworks: readonly Framework[]): string {
  // Each "### <heading>" block is pushed as its own group and the groups
  // are joined with a blank line between them — this is what makes the
  // generator's own output a Prettier-Markdown fixed point (Prettier
  // requires a blank line between a preceding list and a following ATX
  // heading). Regenerating must never again produce content the repo's own
  // `format:check` disagrees with, since that byte content is exactly what
  // the fidelity validator compares against.
  const groups: string[] = [];
  for (const framework of frameworks) {
    const frameworkApi = component.api?.[framework];
    if (frameworkApi === undefined) {
      continue;
    }
    if (frameworkApi.props.length > 0) {
      const propItems = frameworkApi.props.map((prop) => {
        const requiredLabel = prop.required ? " (required)" : "";
        const defaultLabel = prop.default !== undefined ? ` (default: ${prop.default})` : "";
        return `- \`${prop.name}\`: ${prop.type}${requiredLabel}${defaultLabel}`;
      });
      // Blank line between the "### <heading>" and its list — Prettier
      // requires a blank line between an ATX heading and a following list.
      groups.push(`### ${framework} props\n\n${propItems.join("\n")}`);
    }
    if (frameworkApi.events.length > 0) {
      const eventItems = frameworkApi.events.map(
        (event) => `- \`${event.frameworkName}\` (${event.mechanism}): ${event.semanticId}`
      );
      groups.push(`### ${framework} events\n\n${eventItems.join("\n")}`);
    }
  }
  return groups.join("\n\n");
}

function renderAccessibilityGuidance(component: ComponentMetadata): string {
  const facts = component.accessibility;
  if (facts === undefined) {
    return "";
  }
  const lines: string[] = [];
  if (facts.verifiedRoles !== undefined && facts.verifiedRoles.length > 0) {
    lines.push(`Roles: ${facts.verifiedRoles.join(", ")}`);
  }
  if (facts.verifiedAriaAttributes !== undefined && facts.verifiedAriaAttributes.length > 0) {
    lines.push(`ARIA attributes: ${facts.verifiedAriaAttributes.join(", ")}`);
  }
  if (facts.guidance !== undefined) {
    lines.push(facts.guidance);
  }
  return lines.join("\n");
}

function renderRelatedComponents(component: ComponentMetadata): string {
  const dependsOn = component.relationships?.dependsOn;
  if (dependsOn === undefined || dependsOn.length === 0) {
    return "";
  }
  return dependsOn.map((name) => `- ${name}`).join("\n");
}
