# Scan Bench Meet server

A small Cloudflare Worker that relays Scan Bench meeting messages. One Durable Object (SQLite, free plan) per meeting code.
Nothing is stored. Deployed by Cloudflare Workers Builds from this folder (root directory `meet-server`, deploy command `npx wrangler deploy`).

- `GET /health` says it is running.
- `wss://<worker>/room/ABC123` joins meeting ABC-123.
