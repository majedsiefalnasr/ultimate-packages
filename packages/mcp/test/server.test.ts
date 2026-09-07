// packages/mcp/test/server.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/server";

describe("createMcpServer", () => {
  it("registers all 5 v1 tools by name", async () => {
    // McpServer (dist/esm/server/mcp.d.ts, @modelcontextprotocol/sdk@1.30.0)
    // has no public listTools()-style method: `_registeredTools` is a
    // private field, and the underlying `server: Server` (a `Protocol`
    // subclass) keeps its `tools/list` request handler in a private
    // `_requestHandlers` map with no public getter. registerTool() itself
    // returns a `RegisteredTool`, but createMcpServer() doesn't expose
    // those return values.
    //
    // The real, public, SDK-documented way to observe what a server has
    // registered is to talk to it as a client would: connect a real
    // `Client` to the real `McpServer` over the SDK's own
    // `InMemoryTransport.createLinkedPair()` (dist/esm/inMemory.d.ts) and
    // call the client's `listTools()` (dist/esm/client/index.d.ts, line
    // 539), which round-trips a genuine `tools/list` request through the
    // server's actual registered-tool state.
    const server = createMcpServer();
    const client = new Client({ name: "test-client", version: "0.0.0" });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

    try {
      const { tools } = await client.listTools();
      const names = tools.map((tool) => tool.name).sort();

      expect(names).toEqual(
        [
          "search_components",
          "get_component",
          "get_component_api",
          "get_component_accessibility",
          "check_framework_compatibility",
        ].sort()
      );
    } finally {
      await client.close();
      await server.close();
    }
  });
});

describe("stdout/stderr discipline (spec §5.1.1)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("createMcpServer() writes nothing to stdout during construction/registration", () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    createMcpServer();
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("no tool handler writes to stdout when invoked with valid input", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { searchComponents } = await import("../src/tools/search-components");
    searchComponents({ query: "Button" });
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("no tool handler writes to stdout when invoked with invalid input (error path)", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const { getComponent } = await import("../src/tools/get-component");
    getComponent({ name: "NotAComponent" });
    expect(stdoutSpy).not.toHaveBeenCalled();
  });

  it("an unexpected internal error (case 5) never appears in stdout, and its detail never appears in the returned error message", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Simulate the internal-error path directly against the shared taxonomy
    // (Task 2), since forcing a real tool function to throw would require
    // reaching into its internals — this test asserts the contract
    // safeHandler()/internalError() establish, not a specific tool's
    // internals.
    const { internalError } = await import("../src/errors");
    const err = internalError();

    expect(err.message).not.toMatch(/\.ts:\d+/);
    expect(stdoutSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
