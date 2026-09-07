import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";

import { detectFramework, type Framework } from "../detect-framework.js";

/**
 * `detectFramework`/`matchCompatibility` use `"angular"`, but
 * `ComponentMetadata.packages`/`ComponentMetadata.api` (spec §5/
 * `@ultimate/component-schema`) key their per-framework entries as `"ng"`
 * for Angular (matching the real `@ultimate/ng` package directory name).
 * Reuses the exact same mapping `doctor.ts` (Task 7) established, rather
 * than inventing a second one.
 */
const FRAMEWORK_TO_METADATA_KEY: Record<Framework, "ng" | "react" | "vue"> = {
  angular: "ng",
  react: "react",
  vue: "vue",
};

export interface GenerateResult {
  exitCode: number;
}

/**
 * Returns a minimal, real placeholder value literal for a required prop,
 * derived only from its documented `type` string — never inventing an
 * example value beyond what the type itself justifies. Falls back to a
 * generic `undefined` placeholder for any type not simply "string",
 * "number", or "boolean" (e.g. arrays, unions, custom interfaces) rather
 * than fabricating a fake object/array literal.
 */
function placeholderValueFor(type: string): string {
  const normalized = type.trim();
  if (normalized === "string") {
    return '""';
  }
  if (normalized === "boolean") {
    return "false";
  }
  if (normalized === "number") {
    return "0";
  }
  return "undefined";
}

/** Renders the exact "8-component ceiling" refusal message (brief's own wording pattern). */
function notFoundMessage(componentName: string): string {
  const availableNames = ALL_COMPONENTS.map((component) => component.name).join(", ");
  return `generate: component "${componentName}" is not yet in the metadata proof set. Available: ${availableNames}.`;
}

/** Renders the stdout snippet for a found component/framework pair. */
function formatSnippet(component: ComponentMetadata, framework: Framework): string {
  const metadataKey = FRAMEWORK_TO_METADATA_KEY[framework];
  const packageInfo = component.packages[metadataKey];
  const packageName = packageInfo?.packageName ?? `@ultimate/${metadataKey}`;

  const requiredProps = component.api?.[metadataKey]?.props.filter((prop) => prop.required) ?? [];

  const lines: string[] = [];
  lines.push(`import { ${component.name} } from "${packageName}";`);
  lines.push("");

  if (requiredProps.length === 0) {
    lines.push(`<${component.name} />`);
  } else {
    lines.push(`<${component.name}`);
    for (const prop of requiredProps) {
      lines.push(`  ${prop.name}={${placeholderValueFor(prop.type)}}`);
    }
    lines.push("/>");
  }

  return lines.join("\n");
}

/**
 * Implements `ultimate generate <component>` per spec §7.2: stdout-only,
 * real-metadata-only, 8-component ceiling enforced. Never writes to the
 * filesystem in any way — the only side effects are `console.log` (success)
 * or `console.error` (failure).
 */
export function runGenerate(projectDir: string, componentName: string): GenerateResult {
  const framework = detectFramework(projectDir);
  if (framework === null) {
    console.error(
      "generate requires an existing, already-scaffolded Angular/React/Vue project " +
        "(an angular.json or a recognizable framework dependency in package.json).",
    );
    return { exitCode: 1 };
  }

  const component = ALL_COMPONENTS.find((candidate) => candidate.name === componentName);
  if (component === undefined) {
    console.error(notFoundMessage(componentName));
    return { exitCode: 1 };
  }

  console.log(formatSnippet(component, framework));
  return { exitCode: 0 };
}
