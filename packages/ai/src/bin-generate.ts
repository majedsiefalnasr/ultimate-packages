// packages/ai/src/bin-generate.ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import type { ComponentMetadata } from "@ultimate/component-schema";
import { generateSkillFile, regenerateSkillFile, type Framework } from "./skill-file";
import { generateContextFiles } from "./context-files";

function frameworksFor(component: ComponentMetadata): Framework[] {
  return (["ng", "react", "vue"] as const).filter((framework) => component.api?.[framework] !== undefined);
}

function skillFileName(component: ComponentMetadata): string {
  return `${component.name.toLowerCase()}.md`;
}

export function generateAllSkillFiles(skillsDir: string): {
  written: string[];
  errors: { component: string; error: string }[];
} {
  const written: string[] = [];
  const errors: { component: string; error: string }[] = [];

  for (const component of ALL_COMPONENTS) {
    const path = join(skillsDir, skillFileName(component));
    const frameworks = frameworksFor(component);

    if (existsSync(path)) {
      const existing = readFileSync(path, "utf8");
      const result = regenerateSkillFile(existing, component, frameworks);
      if ("error" in result) {
        errors.push({ component: component.name, error: result.error });
        continue;
      }
      writeFileSync(path, result.content, "utf8");
      written.push(path);
    } else {
      const content = generateSkillFile(component, frameworks);
      writeFileSync(path, content, "utf8");
      written.push(path);
    }
  }

  return { written, errors };
}

function main(): void {
  const skillsDir = process.argv[2] ?? join(process.cwd(), "skills");
  const contextDir = process.argv[3] ?? join(process.cwd(), "dist", "context");

  const skillResult = generateAllSkillFiles(skillsDir);
  for (const error of skillResult.errors) {
    console.error(`[@ultimate/ai] generate: ${error.component}: ${error.error}`);
  }
  console.error(`[@ultimate/ai] generate: wrote ${skillResult.written.length} Skill file(s)`);

  const contextResult = generateContextFiles(contextDir);
  console.error(`[@ultimate/ai] generate: wrote ${contextResult.written.length} LLM-context file(s)`);

  if (skillResult.errors.length > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
