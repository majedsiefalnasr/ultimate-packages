// packages/mcp/src/bin.ts
//
// The ONLY file in this package that starts the real stdio transport. Per
// spec §5.1.1: stdout is the MCP protocol wire from the moment this
// process starts — no console.log anywhere in this file or anything it
// calls. Startup diagnostics go to stderr.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "./server.js";

async function main(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[@ultimate/mcp] server started (stdio)");
}

main().catch((error) => {
  console.error("[@ultimate/mcp] fatal startup error:", error);
  process.exit(1);
});
