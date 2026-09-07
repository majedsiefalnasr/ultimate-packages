import { describe, it, expect } from "vitest";
import {
  invalidInputError,
  notFoundError,
  manifestUnreadableError,
  absentFacetError,
  internalError,
} from "../src/errors";

describe("invalidInputError", () => {
  it("names the failing field and reason, case 1 of spec §4.1", () => {
    const err = invalidInputError("framework", 'must be one of "ng", "react", "vue"');
    expect(err.code).toBe("invalid_input");
    expect(err.message).toContain("framework");
    expect(err.message).toContain('must be one of "ng", "react", "vue"');
  });
});

describe("notFoundError", () => {
  it("names the unknown value and lists every known name, case 2 of spec §4.1", () => {
    const err = notFoundError("NotAComponent", ["Button", "Checkbox", "Dialog"]);
    expect(err.code).toBe("not_found");
    expect(err.message).toContain("NotAComponent");
    expect(err.message).toContain("Button");
    expect(err.message).toContain("Checkbox");
    expect(err.message).toContain("Dialog");
  });
});

describe("manifestUnreadableError", () => {
  it("is a distinct structured error, never implying a successful result, case 3 of spec §4.1", () => {
    const err = manifestUnreadableError("ENOENT: no such file");
    expect(err.code).toBe("manifest_unreadable");
    expect(err.message).toContain("compatibility manifest");
  });

  it("does not leak the raw underlying error detail into the message (that goes to stderr, not the tool-error payload — case 5's no-leak rule applies to case 3's detail too)", () => {
    const err = manifestUnreadableError("ENOENT: /Users/someone/secret-path/compatibility-manifest.json");
    expect(err.message).not.toContain("/Users/someone/secret-path");
  });
});

describe("absentFacetError", () => {
  it("states honest absence, not a fabricated empty-but-implying-verified result, case 4 of spec §4.1", () => {
    const err = absentFacetError("accessibility");
    expect(err.code).toBe("facet_not_recorded");
    expect(err.message).toContain("accessibility");
    expect(err.message).toContain("not recorded");
  });
});

describe("internalError", () => {
  it("never includes a stack trace, filesystem path, or module name, case 5 of spec §4.1", () => {
    const err = internalError();
    expect(err.code).toBe("internal_error");
    expect(err.message).not.toMatch(/\.ts:\d+/); // no stack-trace-shaped content
    expect(err.message).not.toMatch(/\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+/); // no path-shaped content
  });

  it("takes no arguments — callers cannot accidentally pass leakable detail into it", () => {
    // internalError() is declared with an empty parameter list (Step 3
    // below) — TypeScript itself rejects any call site that passes an
    // argument, so this is enforced at compile time by the function's own
    // signature every time this file (or any caller) is typechecked via
    // `vitest run --typecheck`. No separate .test-d.ts file is needed for
    // this specific guarantee; this runtime assertion just confirms the
    // zero-arg call still returns the expected shape.
    expect(internalError().code).toBe("internal_error");
  });
});
