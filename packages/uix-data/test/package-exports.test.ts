import { describe, expect, it } from "vitest";
import * as uixData from "../src/index";

describe("public barrel", () => {
  it("exports equals", () => {
    expect(typeof uixData.equals).toBe("function");
  });

  it("exports getPageCount", () => {
    expect(typeof uixData.getPageCount).toBe("function");
  });

  it("exports calculateNumItemsInViewport", () => {
    expect(typeof uixData.calculateNumItemsInViewport).toBe("function");
  });

  it("exports calculateLast", () => {
    expect(typeof uixData.calculateLast).toBe("function");
  });

  it("exports exactly the approved runtime surface (no accidental extra exports)", () => {
    const runtimeExportNames = Object.keys(uixData).sort();
    expect(runtimeExportNames).toEqual(
      ["calculateLast", "calculateNumItemsInViewport", "equals", "getPageCount"].sort()
    );
  });
});
