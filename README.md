# Chalk for Claude Code

This is the Claude Code plugin for [Chalk](https://getchalk.dev), a whiteboard you share with Claude Code. Claude lays its plan out as cards on a board beside your terminal. You cross a card out, circle one, drag them into a new order or write a question mark, and Claude gets a structured description of each mark and revises the plan before it writes code.

**This plugin does nothing by itself. It requires the Chalk app, which is a separate, paid, closed-source product.** The plugin only connects Claude Code to an installed copy of Chalk.

## Requirements

* macOS 13 or newer, on Apple silicon or Intel. Chalk does not run on Windows or Linux.
* Claude Code.
* The Chalk app, installed separately (see below).

## Price

The Chalk download is free. The first time the board opens it asks for a one-time payment of $24, which unlocks Chalk on that Mac. There is no subscription. Refunds are available within 7 days. Details are at [getchalk.dev](https://getchalk.dev).

This plugin is free and MIT licensed. The license covers the files in this repository only, not the Chalk app.

## Install

### 1. Install the Chalk app

```sh
curl -fsSL https://getchalk.dev/install | sh -s -- --no-claude
```

This installs Chalk into `~/.chalk` and puts the `chalk` command on your PATH. The `--no-claude` option tells the installer to skip its own Claude Code setup, because this plugin provides it instead (see "If you already use Chalk" below).

### 2. Install the plugin

Inside Claude Code:

```
/plugin install chalk-board --marketplace ubmids/chalk-claude-plugin
```

Or from your shell:

```sh
claude plugin marketplace add ubmids/chalk-claude-plugin
claude plugin install chalk-board@getchalk
```

Restart Claude Code, then say "let's plan this on the board" or run `/chalk-board:board`.

## What the plugin adds

* **An MCP server entry named `chalk`.** It runs `scripts/chalk-mcp.sh`, which starts the installed app's own server with `chalk mcp`. This gives Claude the board tools: open the board, lay out a plan, read your marks, set a card's status, add notes and files, show a screenshot of what it built beside its step, and ask a question on the board. If Chalk is not installed, the script prints the install command and exits.
* **A skill named `chalk`.** It tells Claude when to use the board and how to read your marks.
* **A command, `/chalk-board:board`.** It opens the board and lays out the current task. You can pass the thing to plan as an argument.
* **One `UserPromptSubmit` hook.** It runs `scripts/prompt-hook.sh` on each prompt, which passes the prompt to the installed app with `chalk hook`. The app may add one line of context for Claude: that a board is open, that you said "no board", or that the request looks like planning and the board would help. If you say "no board" or "just tell me", Chalk records that in `~/.chalk` and Claude stops opening the board by itself for 12 hours.

While Claude waits for you to mark the board, it runs `chalk wait --live` as a background command. That command comes from the Chalk app.

There are no compiled binaries in this repository. Both scripts are short shell files you can read.

### The stand-in server (Docker, MCP directories)

The board tools only work with the Chalk app on a Mac. So that Chalk's MCP interface can still be built and inspected anywhere, for example by MCP directories that test servers in Docker, the `server/` folder holds a small stand-in server. It lists the same tools as the app, and every tool call returns an error explaining how to install Chalk. It makes no network requests and reads no files. Claude Code doesn't use it: the plugin always starts the app's own server.

To try it:

```sh
docker build -t chalk-mcp .
docker run -i --rm chalk-mcp
```

Or without Docker, from the `server/` folder: `npm ci`, then `npm start`. `npm test` starts it and checks that it lists its tools.

### Optional: skip the permission prompts

A plugin cannot grant permissions, so Claude Code asks before it uses the board tools and before it runs `chalk wait`. To allow them once, add these rules to `permissions.allow` in `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["mcp__plugin_chalk-board_chalk", "Bash(chalk wait:*)"]
  }
}
```

## If you already use Chalk

The Chalk installer normally connects Chalk to Claude Code by itself. It registers the same MCP server, skill, command and hook in your user settings, together with activity hooks that show what Claude is doing on the board and tick cards off as its to-do list moves, and its own permission rules for the board tools and `chalk wait`.

That setup and this plugin do the same job. Use one, not both. With both enabled, Claude sees two copies of every board tool and the hook runs twice.

* **To use the plugin:** run `chalk uninstall-claude` first, then install the plugin. `chalk update` runs the installer again and restores the built-in setup, so run `chalk uninstall-claude` again after each update.
* **To use the built-in setup:** do not install this plugin. Run `chalk install-claude` if you removed it. This is the more complete option today, because the plugin does not include the activity hooks.

The plugin is for people who prefer to manage Claude Code extensions as plugins, or who want to turn Chalk on and off per project.

## Privacy

Everything runs on your Mac. The plugin itself makes no network requests and collects nothing. The Chalk app serves the board from `127.0.0.1` and keeps boards in `~/.chalk/projects`, one set per project. What Claude reads from the board reaches Claude the same way your prompts do. The app contacts getchalk.dev to download, update and unlock, and payment is handled by Stripe. The full policy is at [getchalk.dev/privacy](https://getchalk.dev/privacy).

## Remove

Remove the plugin:

```sh
claude plugin uninstall chalk-board@getchalk
claude plugin marketplace remove getchalk
```

Remove the Chalk app and everything it added:

```sh
chalk uninstall
```

## Support

Email hello@getchalk.dev.

Chalk is an independent product. It is not affiliated with, endorsed by or sponsored by Anthropic.
