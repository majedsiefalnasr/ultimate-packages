import { validateComponentMetadata } from "@ultimate/component-schema";
import { ALL_COMPONENTS } from "../dist/index.mjs";

let failed = false;
for (const record of ALL_COMPONENTS) {
  const result = validateComponentMetadata(record, ALL_COMPONENTS);
  if (!result.valid) {
    failed = true;
    console.error(`[validate] ${record.name}: ${result.errors.join("; ")}`);
  }
}
if (failed) {
  console.error("[validate] FAILED");
  process.exit(1);
}
console.log(`[validate] OK: ${ALL_COMPONENTS.length} record(s) validated`);
