---
name: nabu
description: Work with any self-hosted Nabu deployment through its HTTP API or MCP server. Use when discovering a deployment contract, authenticating, reading, creating, updating, moving, deleting, sharing, or verifying Nabu vault notes.
---

# Nabu agent contract

Use the deployment's HTTP API for normal note operations. Use MCP when the
deployment or agent integration requires it. Do not use browser automation for
normal note operations; use the browser only for human navigation or explicit
UI testing.

## Base URL and contract discovery

Set `NABU_URL` to the user's Nabu deployment base URL without a trailing slash.
Never assume a particular hosted deployment.

```bash
export NABU_URL="https://nabu.example.com"
curl -fsS "${NABU_URL}/agents.md"
```

Fetch `${NABU_URL}/agents.md` whenever the deployment or API version is
uncertain. The route is public and returns raw Markdown so a new agent can
discover the workflow before authenticating. Use HTTPS for non-loopback
deployments.

Check the HTTP status and JSON body on every request. Never treat an HTTP error
as a successful operation.

## Authentication and secret handling

- Owner login: `POST /api/auth/login` with
  `Content-Type: application/x-www-form-urlencoded` and fields `password` and
  `redirect`.
- A successful login sets the `nabu_session` cookie. Persist it in a cookie jar
  and reuse it for owner requests.
- Existing owner sessions and `NABU_AGENT_TOKEN` authentication remain
  supported.
- Shared collaborators use `Authorization: Bearer <scoped-access-token>`;
  they do not use the owner password.
- A shared token is scoped to exactly one shared space, its permissions, and its
  lease expiry. It cannot be broadened or extended by the collaborator.
- Never log or commit passwords, session cookies, invite URLs, access tokens, or
  agent tokens. Persist credentials only in an approved secret store, never in
  Markdown, source files, ordinary workspace files, or chat.

```bash
curl -fsS -c /tmp/nabu-cookies.txt \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data 'password=YOUR_PASSWORD&redirect=%2Fagents.md' \
  "${NABU_URL}/api/auth/login"
```

## Note identity and read surfaces

- Treat `relPath` (the vault-relative `relPath`) as the canonical note identity.
- Prefer deterministic reads through
  `/api/vault/notes/by-path?path=<vault-relative-path>`.
- Treat `/api/vault/notes/$slug` as convenience lookup only; slugs may collide.
- URL-encode query parameters such as `path`, `q`, and `tag`.
- Use vault-relative paths only. Never send absolute paths, traversal paths, or
  paths outside the vault.

Read surfaces:

- `GET /api/vault/`
- `GET /api/vault/index/stats`
- `GET /api/vault/tree`
- `GET /api/vault/folders?path=`
- `GET /api/vault/notes/$slug`
- `GET /api/vault/notes/by-path?path=`
- `GET /api/vault/notes/neighborhood?path=`
- `GET /api/vault/search?q=&path=&tag=&limit=&offset=`

## Note writes

Write surfaces:

- `POST /api/vault/folders`
- `DELETE /api/vault/folders?path=`
- `POST /api/vault/notes`
- `PUT /api/vault/notes/by-path`
- `PATCH /api/vault/notes/by-path`
- `DELETE /api/vault/notes/by-path?path=` (single note only)

Use `rawMarkdown` or a structured `document` payload, never both. Do not use
top-level `body` or `content`. Prefer structured documents for agent-authored
notes because they render canonical frontmatter metadata. Supported metadata
includes `title`, `summary`, `tags`, `authors`, `source`, and `references`.

After every mutation, read the note again by its canonical path and verify the
content and metadata. Move notes with `{ "path": "from.md", "toPath":
"to.md" }`. Folder deletion is empty-only and non-recursive. Moves do not
rewrite wiki-links or Markdown links. Successful mutations rebuild the
in-memory index immediately.

## Revision-aware writes

Every note read returns `note.revision` and an `ETag`, such as
`"revision-42"`.

- Shared-token updates and moves must send `If-Match: "<revision>"` or
  `expectedRevision` in the request body.
- Existing owner agents may continue legacy writes without a revision during
  migration. Those responses include
  `migration.code = WRITE_REVISION_MIGRATION_REQUIRED`; migrate that agent to
  revision-aware writes.
- On `428 WRITE_REVISION_REQUIRED`, GET the supplied `readUrl`, merge the
  intended change, and retry with the returned revision.
- On `409 STALE_NOTE_REVISION`, GET `readUrl`, merge against `currentRevision`,
  and retry. Never silently overwrite a newer note.
- Human source saves may send `expectedRawContentHash`; a `409` means the raw
  file changed since it was read. `expectedContentHash` remains the parsed-note
  agent contract.

## Temporary shared spaces

Shared spaces are temporary, live recursive knowledge boundaries. Existing
descendants are accessible immediately, and files or folders created later
under the shared root become accessible automatically until the lease expires
or is revoked.

- Never share the vault root.
- Shared roots are segment-aware; a folder name must match a complete path
  segment rather than a prefix.
- Shared spaces have no exclusion rules in v1; choose a narrower root instead.
- A shared token cannot access parent paths, siblings, symlink targets, or
  metadata that reveals private paths.
- Private linked notes are filtered from search, backlinks, neighborhoods, and
  graph results.
- Lease duration defaults to 7 days, has a minimum of 1 day, and has a maximum
  of 30 days.
- Access expires synchronously using server time; cleanup may happen
  asynchronously.
- Invite URLs are opaque, one-time capabilities valid for one hour. They are
  not long-lived access tokens.

### 1. Propose a scope (no sharing side effect)

Call `POST ${NABU_URL}/api/shared-spaces/proposals` with a vault-relative path
and duration:

```json
{
  "path": "shared-folder",
  "durationDays": 14
}
```

Normalize and validate the path first. Reject empty/root paths, absolute paths,
traversal, symlinks, and paths outside the vault. Show the human the complete
recursive `files` and `folders` lists, `fileCount`, `totalBytes`, `warnings`,
proposal ID, and expiry before asking for confirmation. Clearly state that
files or folders added under this path later will also be part of the shared
space. A proposal alone never shares anything.

### 2. Confirm explicitly and create an invite

Call `POST ${NABU_URL}/api/shared-spaces/`:

```json
{
  "proposalId": "proposal_123",
  "confirmed": true,
  "durationDays": 14,
  "permissions": ["read", "write"]
}
```

`confirmed: true` is mandatory. Never infer confirmation from a proposal
request or the original user wording. `durationDays` must be between 1 and 30;
omitting it uses the 7-day default where supported. The proposal must be
unexpired and owned by the authenticated owner. The response includes a
one-time `inviteUrl`, `inviteExpiresAt`, and `sharedSpaceExpiresAt`. Do not log
or persist the invite URL; send it only to the intended collaborator.

### 3. Redeem an invite exactly once

The invite URL identifies the Nabu deployment that owns the shared space. The
joining party does not need its own Nabu deployment.

Do not GET or POST directly to the invite URL. Derive the deployment origin
from it, then call that deployment's redemption endpoint:

```bash
INVITE_URL="<exact-one-time-invite-url>"
NABU_URL="${INVITE_URL%%/invites/*}"

curl -fsS -X POST \
  "${NABU_URL}/api/shared-spaces/invites/redeem" \
  -H 'Content-Type: application/json' \
  --data "{\"inviteUrl\":\"${INVITE_URL}\"}"
```

For example, an invite issued as:

```text
https://invite-host.example/invites/opaque-secret
```

must be redeemed through:

```text
https://invite-host.example/api/shared-spaces/invites/redeem
```

The JSON field is exactly `inviteUrl`. Do not substitute `invite`, `token`, or
`inviteToken`.

A successful `200` response returns `accessToken`, `sharedSpaceId`, `rootPath`,
`permissions`, `sharedSpaceExpiresAt`, and `accessTokenExpiresAt`. Before
reporting success:

1. Save the token in an approved credential store that remains available across
   turns. Use a stable reference keyed by `NABU_URL` and `sharedSpaceId`.
2. Never print it, place it in chat or Markdown, or save it in an ordinary
   workspace file.
3. Save the non-secret metadata with the credential reference: `NABU_URL`,
   `sharedSpaceId`, `rootPath`, permissions, and `accessTokenExpiresAt`.
4. Use the same `NABU_URL` for all subsequent shared-space API requests.
5. Verify access immediately. Load the token from the credential store into
   process memory without printing it, then GET the scoped tree:

```bash
curl -fsS \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  "${NABU_URL}/api/vault/tree"
```

After the tree GET succeeds:

- GET `/api/vault/folders?path=<url-encoded-rootPath>` when the shared root is a
  folder and enumerate the documents in scope.
- For each note the user asks to inspect, GET
  `/api/vault/notes/by-path?path=<url-encoded-path>` with the same bearer token.
- Report the documents actually found, not only the scope and expiry.

If a verification GET fails, report the error and do not claim that shared
space access is ready. On later turns, retrieve the persisted token and repeat
the GET before asking for a new invite. If the token is missing after a
successful redemption, treat it as a local credential-persistence failure and
check the approved store before requesting another one-time invite.

`410 SHARED_SPACE_INVITE_INVALID` means the invite is malformed, expired,
already redeemed, or its space is expired or revoked. Do not retry alternate
field names or blindly retry the same invite. If a network failure leaves
redemption status unknown, do not assume a retry is safe; ask the owner to
generate another invite. Each additional collaborator needs a new one-time
invite.

### Shared-space management

- `GET /api/shared-spaces/` lists spaces owned by the authenticated owner.
- `GET /api/shared-spaces/:sharedSpaceId` inspects an owned space.
- `POST /api/shared-spaces/:sharedSpaceId/revoke` revokes the space immediately;
  existing tokens fail synchronously.
- `POST /api/shared-spaces/:sharedSpaceId/invites` creates another one-time
  invite for an active owned space.
- `POST /api/shared-spaces/:sharedSpaceId/extend` requires explicit
  confirmation and may not exceed the 30-day maximum.

Extension body:

```json
{ "confirmed": true, "durationDays": 7 }
```

Owner-only management operations require the owner password session or
configured owner agent token. Shared collaborators cannot create broader
tokens, extend leases, or revoke spaces.

## Error contract

- `400`: invalid path, request body, duration, or permissions. Fix the request;
  do not retry unchanged.
- `401`: missing, expired, or revoked authentication. Re-authenticate as owner
  or use a valid shared token.
- `403`: authenticated principal lacks permission for the operation or path.
- `404`: note/folder not found or intentionally hidden outside shared scope.
- `409`: create conflict, move destination exists, folder is not empty, raw
  source conflict, or stale note revision.
- `410 SHARED_SPACE_INVITE_INVALID`: invite invalid, expired, redeemed, revoked,
  or unavailable.
- `428 WRITE_REVISION_REQUIRED`: re-read and retry with `If-Match` or
  `expectedRevision`.

When present, use structured `code`, `nextAction`, `readUrl`, and
`currentRevision` fields to decide the next request. Do not expose or repeat
private paths from errors, search results, backlinks, neighborhoods, or graph
responses.

## MCP

- Local command: `npm run mcp`.
- Direct vault: `NABU_MCP_MODE=direct` and
  `KNOWLEDGE_PATH=<absolute-vault-path>`.
- Deployed service: `NABU_MCP_MODE=remote`, `NABU_URL=<https-url>`, and
  `NABU_AGENT_TOKEN=<32-plus-character-token>`.
- Transport: stdio.
- The native remote MCP endpoint is a separate follow-up; do not assume it is
  the same as local stdio.
- MCP and HTTP use the same domain service and authorization rules.

## Deployment requirements

- Use the deployment-specific `/agents.md`; never assume a hosted Nabu
  version.
- Store shared-space leases, invite hashes, and access-token hashes in durable
  server-side metadata, not Markdown files or ephemeral request memory.
- If multiple instances run, share the same durable metadata store and vault;
  otherwise one-time redemption and revocation consistency cannot be
  guaranteed.
- Never store raw invite or access-token secrets. Use cryptographically secure
  randomness, hashed persistence, atomic redemption, and server-time expiry
  checks.

## Safety checklist

- Sharing: preview -> show complete scope -> obtain explicit confirmation ->
  confirm -> distribute one-time invite.
- Redemption: derive `NABU_URL` from the invite URL -> POST the exact
  `inviteUrl` payload to `${NABU_URL}/api/shared-spaces/invites/redeem` once ->
  persist the token and metadata securely -> GET the shared-space tree and
  requested documents -> use bearer auth -> never log the secret.
- Writes: read -> edit/merge -> send revision precondition -> on `409`/`428`
  re-read and retry safely -> verify by canonical path.
- Private data: authorize before reading or mutating every endpoint and filter
  all derived results to the caller's scope.

Source: the user's Nabu deployment's `/agents.md` contract.
