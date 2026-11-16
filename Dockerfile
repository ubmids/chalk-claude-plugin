# Builds the stand-in Chalk MCP server (server/), which runs anywhere and answers MCP
# introspection. The real board needs the Chalk app for macOS; see README.md.
FROM node:22-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-fund --no-audit
COPY server/index.js ./
USER node
ENTRYPOINT ["node", "index.js"]
