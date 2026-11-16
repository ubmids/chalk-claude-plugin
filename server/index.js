#!/usr/bin/env node
// A stand-in MCP server for Chalk (https://getchalk.dev).
//
// The real board tools come from the Chalk app for macOS, which this plugin starts with
// `chalk mcp` (see ../scripts/chalk-mcp.sh). That app is a separate, paid product and runs
// only on macOS 13 or newer, so it can't start inside a Linux container or on a machine
// without Chalk installed.
//
// This server exists so Chalk's MCP interface can be built, started and inspected anywhere
// (for example by MCP directories that check servers in Docker). It lists the same tools as
// the app. It has no board of its own: every tool call returns an error that explains how to
// install the Chalk app. Nothing here touches the network or the file system.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const VERSION = "0.3.0";

export const INSTALL_MESSAGE = [
  "The Chalk app isn't available here, so the board can't open.",
  "",
  "Chalk is a whiteboard you share with Claude Code. It needs the Chalk app, a separate product for macOS 13 or newer.",
  "The download is free; the board asks for a one-time $24 unlock the first time it opens.",
  "",
  "Install it on a Mac with:",
  "",
  "  curl -fsSL https://getchalk.dev/install | sh -s -- --no-claude",
  "",
  "Then add the Chalk plugin to Claude Code and restart it. More at https://getchalk.dev",
].join("\n");

const id = z.string().describe('An element id from board_read, such as "c3" for one of Claude\'s cards or "h2" for one of the human\'s marks');
const ids = z.array(id).min(1).describe("One or more element ids from board_read");
const near = id.optional().describe("Put the new element next to this one");
const side = z.enum(["right", "below", "left", "above"]).optional().describe("Which side of `near` to use (default right)");
const x = z.number().optional().describe("Horizontal board position. Leave out to place it automatically.");
const y = z.number().optional().describe("Vertical board position. Leave out to place it automatically.");
const status = z.enum(["todo", "doing", "done", "failed"]).describe("The card's status");

/** Chalk's board tools: name, what it does, and its inputs. */
export const TOOLS = {
  board_open: {
    description: "Open the Chalk whiteboard beside the terminal, starting the app if needed.",
    shape: {
      name: z.string().optional().describe("Which board to open (default: this project's current board)"),
      auto: z.boolean().optional().describe("True when Claude opens the board on its own initiative rather than because the human asked"),
    },
  },
  layout_plan: {
    description: "Lay a plan out on the board as a row of step cards the human can mark up.",
    shape: {
      title: z.string().optional().describe("A heading for the plan"),
      steps: z.array(z.string()).min(1).describe("The plan's steps, one card each, in order"),
    },
  },
  board_read: {
    description: "Read the board: Claude's cards and the human's marks on them (cross-outs, circles, reorders, question marks, notes), as structured text.",
    shape: {
      mark: z.boolean().optional().describe("Mark what was read as seen (default true)"),
    },
  },
  board_snapshot: {
    description: "Take a picture of the board or part of it, for sketches and handwriting.",
    shape: {
      ids: z.array(id).optional().describe("Only these elements"),
      max_size: z.number().optional().describe("Largest width or height of the picture, in pixels"),
    },
  },
  add_note: {
    description: "Add a note to the board, for example a reply right next to one of the human's marks.",
    shape: { text: z.string().describe("What the note says"), near, side, x, y },
  },
  update_note: {
    description: "Change the text of one of Claude's notes or cards.",
    shape: { id, text: z.string().describe("The new text") },
  },
  think: {
    description: "Show a short, fading line of thought on the board near what Claude is working through.",
    shape: { text: z.string().describe("The thought, one short line"), near },
  },
  add_file: {
    description: "Put a picture or file from the project on the board.",
    shape: { path: z.string().describe("Path of the file inside the project"), near, side, x, y },
  },
  connect: {
    description: "Draw an arrow from one element to another.",
    shape: { from: id, to: id, label: z.string().optional().describe("Text on the arrow") },
  },
  group: {
    description: "Put a titled frame around some elements.",
    shape: { ids, title: z.string().describe("The frame's title") },
  },
  highlight: {
    description: "Highlight elements in a colour.",
    shape: { ids, color: z.enum(["yellow", "green", "blue", "pink", "orange", "purple"]).optional().describe("Highlight colour") },
  },
  set_status: {
    description: "Set the status of plan cards as the work moves on.",
    shape: { ids, status },
  },
  remove: {
    description: "Remove some of Claude's elements from the board.",
    shape: { ids },
  },
  clear_claude: {
    description: "Remove everything Claude put on the board, leaving the human's marks.",
    shape: {},
  },
  hand_over: {
    description: "Ask the human a question on the board and hand the turn to them.",
    shape: {
      message: z.string().optional().describe("The question or request"),
      about: z.array(id).optional().describe("The cards the question is about"),
    },
  },
  wait_for_turn: {
    description: "Wait until the human hands the turn back from the board.",
    shape: { timeout: z.number().optional().describe("How long to wait, in seconds") },
  },
  wait_for_change: {
    description: "Wait until the human changes the board.",
    shape: { timeout: z.number().optional().describe("How long to wait, in seconds") },
  },
};

export function createServer() {
  const server = new McpServer(
    { name: "chalk", version: VERSION },
    {
      instructions:
        "Chalk is a whiteboard shared between the human and Claude Code. This copy of the server is a stand-in that runs without the Chalk app: every tool returns how to install Chalk on a Mac. Pass that on to the human once and don't retry.",
    },
  );
  for (const [name, def] of Object.entries(TOOLS)) {
    server.registerTool(name, { description: def.description, inputSchema: def.shape }, async () => ({
      content: [{ type: "text", text: INSTALL_MESSAGE }],
      isError: true,
    }));
  }
  return server;
}

function isMain() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isMain()) {
  await createServer().connect(new StdioServerTransport());
}
