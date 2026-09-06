import { describe, it, expect } from "vitest";
import * as ComponentSchema from "../src/index";

describe("@ultimate/component-schema package exports", () => {
  it("exports a defined module (barrel exists and is importable)", () => {
    expect(ComponentSchema).toBeDefined();
  });
});
