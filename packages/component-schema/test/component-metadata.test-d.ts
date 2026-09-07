import { expectTypeOf } from "vitest";
import type { ComponentMetadata } from "../src/component-metadata";

// Strict-mode shape check (spec §13): exactly these top-level keys, nothing
// else — a future unrecognized field is a deliberate schemaVersion-bump
// event, not something that silently type-checks today.
type ExpectedKeys =
  | "name" | "category" | "description" | "schemaVersion" | "metadataVersion" | "packages"
  | "api" | "accessibility" | "style" | "relationships" | "provenanceRef" | "guidance";
expectTypeOf<keyof ComponentMetadata>().toEqualTypeOf<ExpectedKeys>();
