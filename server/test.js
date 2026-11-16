// Starts the stand-in server over stdio and checks that it answers MCP introspection.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { TOOLS } from "./index.js";

const transport = new StdioClientTransport({ command: process.execPath, args: [fileURLToPath(new URL("./index.js", import.meta.url))] });
const client = new Client({ name: "chalk-fallback-test", version: "0.0.0" });
await client.connect(transport);

assert.equal(client.getServerVersion()?.name, "chalk");
const { tools } = await client.listTools();
assert.deepEqual(tools.map((t) => t.name).sort(), Object.keys(TOOLS).sort());
for (const t of tools) assert.ok(t.description && t.inputSchema, `${t.name} has a description and schema`);

const r = await client.callTool({ name: "board_open", arguments: {} });
assert.equal(r.isError, true);
assert.match(r.content[0].text, /getchalk\.dev\/install/);

await client.close();
console.log(`ok: ${tools.length} tools listed, calls return the install message`);
