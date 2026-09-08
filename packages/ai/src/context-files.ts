// packages/ai/src/context-files.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import type { Framework } from "./render-section";

export function renderLlmsTxt(): string {
  return ALL_COMPONENTS.map((c) => `${c.name} (${c.category}): ${c.description}`).join("\n") + "\n";
}

function renderComponentFull(component: ComponentMetadata, onlyFramework?: Framework): string {
  const lines: string[] = [
    `## ${component.name}`,
    `Category: ${component.category}`,
    component.description,
  ];

  const frameworksToRender: Framework[] =
    onlyFramework !== undefined ? [onlyFramework] : ["ng", "react", "vue"];
  for (const framework of frameworksToRender) {
    const frameworkApi = component.api?.[framework];
    if (frameworkApi === undefined) {
      continue;
    }
    lines.push(`### ${framework} API`);
    for (const prop of frameworkApi.props) {
      lines.push(`- \`${prop.name}\`: ${prop.type}`);
    }
    for (const event of frameworkApi.events) {
      lines.push(`- event \`${event.frameworkName}\` (${event.mechanism})`);
    }
  }

  if (component.accessibility !== undefined) {
    lines.push("### Accessibility");
    if (component.accessibility.verifiedRoles !== undefined) {
      lines.push(`Roles: ${component.accessibility.verifiedRoles.join(", ")}`);
    }
    if (component.accessibility.guidance !== undefined) {
      lines.push(component.accessibility.guidance);
    }
  }

  if (
    component.relationships?.dependsOn !== undefined &&
    component.relationships.dependsOn.length > 0
  ) {
    lines.push(`### Related components\n${component.relationships.dependsOn.join(", ")}`);
  }

  if (component.guidance?.usageNotes !== undefined) {
    lines.push(`### Guidance\n${component.guidance.usageNotes}`);
  }

  return lines.join("\n");
}

export function renderLlmsFullTxt(): string {
  return ALL_COMPONENTS.map((c) => renderComponentFull(c)).join("\n\n") + "\n";
}

export function renderFrameworkContext(framework: Framework): string {
  return ALL_COMPONENTS.map((c) => renderComponentFull(c, framework)).join("\n\n") + "\n";
}

/**
 * Writes all 5 LLM-context files to `outputDir`, creating that directory
 * (and any missing parent directories) first — `outputDir` is routinely a
 * not-yet-existing nested path (e.g. `dist/context`, before any prior
 * `tsup` or generation run has created `dist/` at all), so this function
 * is responsible for ensuring it exists rather than assuming a caller
 * already created it. Deterministic: given the same ALL_COMPONENTS input,
 * repeated calls (to the same or different empty output directories)
 * produce byte-identical file contents (Task 6 tests this explicitly).
 */
export function generateContextFiles(outputDir: string): { written: string[] } {
  mkdirSync(outputDir, { recursive: true });

  const files: [string, string][] = [
    ["llms.txt", renderLlmsTxt()],
    ["llms-full.txt", renderLlmsFullTxt()],
    ["llms-ng.txt", renderFrameworkContext("ng")],
    ["llms-react.txt", renderFrameworkContext("react")],
    ["llms-vue.txt", renderFrameworkContext("vue")],
  ];

  const written: string[] = [];
  for (const [filename, content] of files) {
    const path = join(outputDir, filename);
    writeFileSync(path, content, "utf8");
    written.push(path);
  }
  return { written };
}
