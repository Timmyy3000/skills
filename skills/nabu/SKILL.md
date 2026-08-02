---
name: nabu
description: Work with Nabu vault notes and agent integrations over its HTTP API or MCP server. Use when reading, creating, updating, moving, deleting, sharing, or verifying Nabu notes, authenticating to Nabu, or configuring a Nabu-aware agent.
---

# Nabu agent contract

Use Nabu's HTTP API for normal note operations. Set `NABU_URL` to the base URL
of the user's own deployment, then fetch `${NABU_URL}/agents.md` before starting
if the deployment or API version is uncertain; it returns raw Markdown. Do not
use browser automation for normal note operations. Use `curl` or another
ordinary HTTP client, and use the browser only for human navigation or explicit
UI testing.

For example:

```bash
export NABU_URL="https://nabu.example.com"
```

## Authentication

- Log in with `POST /api/auth/login`.
- Send `Content-Type: application/x-www-form-urlencoded`.
- Submit `password` and `redirect` fields.
- Persist and reuse the `nabu_session` cookie for subsequent requests.
- Shared collaborators may use `Authorization: Bearer <scoped-access-token>`.
- Keep agent tokens outside repositories and use HTTPS for non-loopback services.

Example login:

```bash
curl -i -c /tmp/nabu-cookies.txt \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'password=YOUR_PASSWORD&redirect=%2Fagents.md' \
  "${NABU_URL}/api/auth/login"
```

Never place a real password or token in a repository, shell history, or a
skill file.

## Read surfaces

- `GET /api/vault/`
- `GET /api/vault/index/stats`
- `GET /api/vault/tree`
- `GET /api/vault/folders?path=`
- `GET /api/vault/notes/$slug`
- `GET /api/vault/notes/by-path?path=`
- `GET /api/vault/notes/neighborhood?path=`
- `GET /api/vault/search?q=&path=&tag=&limit=&offset=`

Treat `relPath` as the canonical note identity. Read notes deterministically
with `/api/vault/notes/by-path?path=<vault-relative-path>`; slug lookup is
convenience-only and may collide.

## Write surfaces

- `POST /api/vault/folders`
- `DELETE /api/vault/folders?path=`
- `POST /api/vault/notes`
- `PUT /api/vault/notes/by-path`
- `PATCH /api/vault/notes/by-path`
- `DELETE /api/vault/notes/by-path?path=`

Use vault-relative paths only. Send note text as `rawMarkdown` or a structured
`document` payload, never both. Prefer structured documents for agent-authored
notes because they render canonical frontmatter metadata. Canonical metadata
fields include `title`, `summary`, `tags`, `authors`, `source`, and `references`.

After every mutation, read the note again by its canonical path and verify the
resulting content and metadata. Note moves use `{ "path": "from.md", "toPath":
"to.md" }`. Note deletion is single-note only. Folder deletion is empty-only
and non-recursive. Renaming does not rewrite wiki-links or Markdown links.
Successful mutations rebuild the in-memory index immediately.

## Shared spaces

- `POST /api/shared-spaces/proposals` previews a complete recursive scope; it
  does not share anything.
- `POST /api/shared-spaces/` explicitly confirms a proposal and creates a
  one-time invite.
- `GET /api/shared-spaces/` lists owned leases.
- `GET /api/shared-spaces/:sharedSpaceId` inspects an owned lease.
- `POST /api/shared-spaces/:sharedSpaceId/revoke` revokes access immediately.
- `POST /api/shared-spaces/:sharedSpaceId/invites` creates another one-time
  invite.
- `POST /api/shared-spaces/:sharedSpaceId/extend` explicitly extends within
  the 30-day maximum.
- `POST /api/shared-spaces/invites/redeem` redeems an invite once and returns a
  scoped bearer token.

Invite URLs are valid for one hour and never contain a long-lived access token.
Shared-space leases default to 7 days, allow 1–30 days, and are live recursive
path boundaries. Descendants under a shared root remain accessible until expiry
or revocation.

### Shared-space workflow

1. Propose the folder and show the returned files, folders, counts, size, and
   live-scope warning to the human.
2. Ask for explicit confirmation; never infer it from the proposal request.
3. Confirm with `{ "proposalId": "...", "confirmed": true,
   "durationDays": 14, "permissions": ["read", "write"] }`.
4. Give the one-time invite URL to the collaborator. They redeem it and use the
   returned access token as a bearer token on normal vault APIs.

## Revision-aware writes

Every note read returns `note.revision` and `ETag: "<revision>"`.

- New shared-token writes must send `If-Match: "<revision>"` or
  `expectedRevision` in the update/move body.
- During migration, legacy owner writes without a revision still succeed and
  return `migration.code = WRITE_REVISION_MIGRATION_REQUIRED`.
- On `428 WRITE_REVISION_REQUIRED`, GET the supplied `readUrl`, merge the
  intended change, then retry with its revision.
- On `409 STALE_NOTE_REVISION`, GET `readUrl`, merge against `currentRevision`,
  then retry. Never silently overwrite a newer note.
- Human source saves may send `expectedRawContentHash`; a `409` means the raw
  file changed since it was read. Existing `expectedContentHash` remains the
  parsed-note agent contract.

## Error semantics

- `400`: invalid path or invalid request body.
- `401`: missing or expired authenticated session.
- `404`: note or folder not found.
- `409`: create conflict, move destination exists, or folder is not empty.
- `409 STALE_NOTE_REVISION`: re-read, merge, and retry with the latest revision.
- `428 WRITE_REVISION_REQUIRED`: include `If-Match` or `expectedRevision`.

## MCP

Run the local MCP server with `npm run mcp` and use stdio transport.

- Direct vault: `NABU_MCP_MODE=direct` and `KNOWLEDGE_PATH=<absolute-vault-path>`.
- Deployed service: `NABU_MCP_MODE=remote`, `NABU_URL=<https-url>`, and
  `NABU_AGENT_TOKEN=<32-plus-character-token>`.
- The native remote MCP endpoint is a separate follow-up; do not assume it is
  the same as the local stdio command.

## Common pitfalls

- Use `rawMarkdown`, not top-level `body` or `content`.
- Use vault-relative paths only.
- Use deterministic by-path reads after every mutation.
- Do not silently overwrite newer note revisions.
- Keep shared-space tokens outside repositories and use HTTPS for non-loopback
  services.

## Examples

### Create a note

```bash
curl -s -b /tmp/nabu-cookies.txt \
  -X POST "${NABU_URL}/api/vault/notes" \
  -H 'Content-Type: application/json' \
  --data '{"path":"projects/example/notes/icp-findings","rawMarkdown":"# ICP Findings"}'
```

### Update a note

```bash
curl -s -b /tmp/nabu-cookies.txt \
  -X PUT "${NABU_URL}/api/vault/notes/by-path" \
  -H 'Content-Type: application/json' \
  --data '{"path":"projects/example/notes/icp-findings.md","rawMarkdown":"# ICP Findings\n\nUpdated"}'
```

### Move, delete, and verify by path

```bash
curl -s -b /tmp/nabu-cookies.txt \
  -X PATCH "${NABU_URL}/api/vault/notes/by-path" \
  -H 'Content-Type: application/json' \
  --data '{"path":"projects/example/notes/icp-findings.md","toPath":"projects/example/archive/icp-findings.md"}'

curl -s -b /tmp/nabu-cookies.txt \
  -X DELETE "${NABU_URL}/api/vault/notes/by-path?path=projects/example/archive/icp-findings.md"

curl -s -b /tmp/nabu-cookies.txt \
  "${NABU_URL}/api/vault/notes/by-path?path=projects/example/archive/icp-findings.md"
```

Source: the Nabu deployment's `/agents.md` contract.
