// packages/ai/src/bin-validate.ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateSkillFile, validateContextFileReproducibility } from "./validate";
import { renderLlmsTxt, renderLlmsFullTxt, renderFrameworkContext } from "./context-files";

function validateSkillFiles(skillsDir: string): number {
  const files = readdirSync(skillsDir).filter(
    (f) => f.endsWith(".md") && f !== "AGENT_CONVENTIONS.md" && f !== "README.md"
  );

  let failed = 0;
  for (const file of files) {
    const path = join(skillsDir, file);
    const content = readFileSync(path, "utf8");
    const result = validateSkillFile(content);
    if (!result.valid) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${file}`);
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
    } else {
      console.error(`[@ultimate/ai] validate: OK ${file}`);
    }
  }
  console.error(
    `[@ultimate/ai] validate: ${files.length - failed} of ${files.length} Skill file(s) passed`
  );
  return failed;
}

function validateContextFiles(contextDir: string): number {
  const checks: [string, () => string][] = [
    ["llms.txt", renderLlmsTxt],
    ["llms-full.txt", renderLlmsFullTxt],
    ["llms-ng.txt", () => renderFrameworkContext("ng")],
    ["llms-react.txt", () => renderFrameworkContext("react")],
    ["llms-vue.txt", () => renderFrameworkContext("vue")],
  ];

  let failed = 0;
  for (const [filename, renderFn] of checks) {
    const path = join(contextDir, filename);
    if (!existsSync(path)) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${filename} — file does not exist at ${path}`);
      continue;
    }
    const actualContent = readFileSync(path, "utf8");
    const result = validateContextFileReproducibility(actualContent, renderFn);
    if (!result.valid) {
      failed++;
      console.error(`[@ultimate/ai] validate: FAIL ${filename} — ${result.error}`);
    } else {
      console.error(`[@ultimate/ai] validate: OK ${filename}`);
    }
  }
  console.error(
    `[@ultimate/ai] validate: ${checks.length - failed} of ${checks.length} LLM-context file(s) reproducible`
  );
  return failed;
}

function main(): void {
  const skillsDir = process.argv[2] ?? join(process.cwd(), "skills");
  const contextDir = process.argv[3] ?? join(process.cwd(), "dist", "context");

  const skillFailures = validateSkillFiles(skillsDir);
  const contextFailures = validateContextFiles(contextDir);

  if (skillFailures > 0 || contextFailures > 0) {
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
