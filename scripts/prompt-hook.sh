#!/bin/sh
# Claude Code UserPromptSubmit hook for Chalk.
#
# Passes the hook input (on stdin) to the installed `chalk` command, which may answer with
# one line of context for Claude:
#   - a board is open in this project: a short line saying so
#   - this prompt says "no board" or "just tell me": Claude stops opening the board by itself
#   - the prompt reads like planning with several parts: a suggestion to open the board
#   - otherwise: nothing
# Everything stays on this machine. The hook never blocks a prompt.

if command -v chalk >/dev/null 2>&1; then
  exec chalk hook
fi

# The Chalk installer's default location, for sessions whose PATH does not include `chalk`.
if [ -x ~/.chalk/app/bin/chalk ]; then
  exec ~/.chalk/app/bin/chalk hook
fi

# Chalk is not installed. Say so only when the prompt is about the board.
if grep -qiE '"prompt" *: *"[^"]*(whiteboard|on the board|chalk)' 2>/dev/null; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"The Chalk plugin is enabled, but the Chalk app is not installed, so there are no board tools in this session. If the user wants the board, tell them once that it needs the Chalk app (macOS 13 or newer, https://getchalk.dev), installed with: curl -fsSL https://getchalk.dev/install | sh -s -- --no-claude , followed by a restart of Claude Code. Otherwise answer in chat."}}'
fi
exit 0
