import { describe, expect, it } from "vitest";
import { ComponentIdGenerator } from "./component-id-generator";

describe("ComponentIdGenerator", () => {
  it("returns sequential ids from a single instance", () => {
    const generator = new ComponentIdGenerator();
    expect(generator.next("u_test")).toBe("u_test_1");
    expect(generator.next("u_test")).toBe("u_test_2");
  });

  it("does not leak counter state across separately-created instances", () => {
    const first = new ComponentIdGenerator();
    first.next("u_test");
    first.next("u_test");

    const second = new ComponentIdGenerator();
    expect(second.next("u_test")).toBe("u_test_1");
  });
});
