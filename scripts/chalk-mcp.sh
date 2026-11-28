#!/bin/sh
# Starts the Chalk MCP server for Claude Code.
#
# This plugin contains no server of its own. The board tools come from the Chalk app
# (https://github.com/ubmids/chalk), which is installed separately. This script hands over to the
# installed `chalk` command, or explains how to install it when it is missing.

if command -v chalk >/dev/null 2>&1; then
  exec chalk mcp
fi

# The Chalk installer's default location, for sessions whose PATH does not include `chalk`.
if [ -x ~/.chalk/app/bin/chalk ]; then
  exec ~/.chalk/app/bin/chalk mcp
fi

cat >&2 <<'EOF'
Chalk is not installed, so the Chalk board tools are not available.

This plugin needs the Chalk app for macOS 13 or newer, which is free and open source (MIT).

Install it with:

  git clone https://github.com/ubmids/chalk.git ~/chalk && ~/chalk/install.sh

Then restart Claude Code. More at https://github.com/ubmids/chalk
EOF
exit 1
