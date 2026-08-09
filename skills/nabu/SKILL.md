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

Normalize the deployment to one exact canonical API base before constructing
any route or looking for a saved profile. Parse the URL with a standards-based
URL parser and then:

- require `https` except for an explicitly configured loopback development
  deployment;
- lowercase the hostname, preserve a non-default port, preserve the complete
  path prefix, remove dot segments and the trailing slash, and reject
  credentials, query strings, fragments, empty hosts, or unsafe schemes;
- never derive the base from `Host`, forwarded-host headers, or an untrusted
  request origin.

`NABU_URL` is that canonical base (it is not just an origin and does not
include `/api`). For example, `https://nabu.example.test/base` keeps `/base`
when resolving `/agents.md` and every `/api/...` route.

```bash
export NABU_URL="https://nabu.example.test/base"
curl -fsS "${NABU_URL}/agents.md"
```

Fetch `${NABU_URL}/agents.md` before authentication whenever the deployment or
API version is uncertain. The route is public and returns raw Markdown. Treat
the JSON `contractVersion` in proposal, confirmation, and redemption responses
as the v2 feature-detection signal; Markdown itself is not a JSON response.
Use HTTPS for non-loopback deployments.

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
- A read-only URL token is a separate query-token capability for browser and
  API reads. It never grants owner authentication or write access.
- Never log or commit passwords, session cookies, invite URLs, access tokens,
  idempotency keys, or agent tokens. Owner passwords stay in an OS secret store.
  A scoped collaborator token may be persisted only in the secure profile
  workflow below; never put it in Markdown, source files, an ordinary workspace
  file, a URL, or chat.

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
- `GET /api/vault/assets?path=` for in-scope local images and files

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
  of 183 days.
- Access expires synchronously using server time; cleanup may happen
  asynchronously.
- Invite URLs are opaque, one-time capabilities valid for one hour. They are
  not long-lived access tokens.

### Shared-space contract versions

The current joining contract is version 2. Feature-detect proposal and
confirmation behavior from their responses. For redemption, send an
idempotency key on the first request to every server. If that request has an
unknown network outcome, make at most one recovery request with the exact same
invite and key. A v2 server returns the same token; a v1 server either completes
the still-pending redemption or returns `410` when the first request consumed
the invite. Version 2 adds bound consent, retry-safe redemption, and a portable
profile; older deployments remain usable through the version-1 fallback.

- For v2, propose with exactly the bound shape below. The server stores the
  normalized path, duration, and canonical permission order.
- A v2 confirmation must repeat the same path, duration, and permissions. A
  mismatch is rejected; it never silently changes consent. Show a fresh preview
  and create a new proposal after a mismatch or expiry.
- If a v2-shaped proposal POST succeeds but its response has no
  `contractVersion: 2`, treat that returned proposal as v1 and confirm that
  proposal with the v1 shape; do not create a duplicate proposal. Retry the
  side-effect-free preview with the v1 shape only when the v2-shaped request is
  rejected before a proposal is created. Once a server has returned a v2
  confirmation or redemption response, use its v2 fields; otherwise do not
  assume them.
- Requests without `contractVersion: 2`, persisted proposals without a version
  marker, and responses without `contractVersion` are v1. Keep the existing
  explicit confirmation behavior and one-shot redemption semantics; do not
  assume retry safety or invent v2 fields for an older server.

### 1. Propose a scope (no sharing side effect)

For a v2 server, call `POST ${NABU_URL}/api/shared-spaces/proposals` with a
vault-relative path, duration, and permissions:

```json
{
  "contractVersion": 2,
  "path": "projects/example/shared",
  "durationDays": 14,
  "permissions": ["read", "write"]
}
```

Normalize and validate the path first. Reject empty/root paths, absolute paths,
traversal, symlinks, and paths outside the vault. Show the human the complete
recursive `files` and `folders` lists, `fileCount`, `totalBytes`, `warnings`,
proposal ID, and expiry before asking for confirmation. Clearly state that
files or folders added under this path later will also be part of the shared
space. A proposal alone never shares anything. A v1 server keeps its existing
request shape and behavior.

### 2. Confirm explicitly and create an invite

Call `POST ${NABU_URL}/api/shared-spaces/`. For v2, repeat the exact consent:

```json
{
  "proposalId": "proposal_123",
  "confirmed": true,
  "contractVersion": 2,
  "path": "projects/example/shared",
  "durationDays": 14,
  "permissions": ["read", "write"]
}
```

`confirmed: true` is mandatory. Never infer confirmation from a proposal
request or the original user wording. `durationDays` must be between 1 and 183;
omitting it uses the 7-day default where supported. The proposal must be
unexpired and owned by the authenticated owner. The response includes a
one-time `inviteUrl`, `inviteExpiresAt`, and `sharedSpaceExpiresAt`. A v2
confirmation also describes the exact redemption method, relative endpoint,
`inviteUrl` body field, required `Idempotency-Key`, expiry, and
`nextAction: "redeem_and_save_profile"`. Require the fixed
`/api/shared-spaces/invites/redeem` suffix, remove its leading slash, and append
it beneath the canonical base pathname. Do not resolve it as an origin-root URL
that can drop a base-path prefix; never use an untrusted host or request origin. Do not log
or persist the invite URL; send it only to the intended collaborator.

### 3. Redeem an invite and recover safely

The invite URL identifies the Nabu deployment that owns the shared space. The
joining party does not need its own Nabu deployment.

Do not GET or POST directly to the invite URL. Parse it, reject credentials,
query/fragment, and unsafe schemes, and require a path ending in
`/invites/<opaque-secret>`. Derive the exact canonical deployment base by
removing only that final `/invites/<opaque-secret>` segment; preserve any base
path prefix, port, and canonical host. Then call the deployment's redemption
endpoint under that base:

```bash
INVITE_URL="<exact-one-time-invite-url>"
# Derive NABU_URL with a URL parser; this shell shorthand is illustrative only.
NABU_URL="https://invite-host.example/base"

curl -fsS -X POST \
  "${NABU_URL}/api/shared-spaces/invites/redeem" \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: <in-memory-random-key>' \
  --data "{\"inviteUrl\":\"${INVITE_URL}\"}"
```

For example, an invite issued as:

```text
https://invite-host.example/base/invites/opaque-secret
```

must be redeemed through:

```text
https://invite-host.example/base/api/shared-spaces/invites/redeem
```

The JSON field is exactly `inviteUrl`. Do not substitute `invite`, `token`, or
`inviteToken`.

A successful `200` response returns `accessToken`, `sharedSpaceId`, `rootPath`,
`permissions`, `sharedSpaceExpiresAt`, and `accessTokenExpiresAt`. A v2 response
also returns `contractVersion: 2`, deterministic non-secret `profileId`,
`nextAction: "save_credential_profile"`, and exactly four relative,
token-free link templates: `tree`, `rootFolder`, `noteByPath`, and `search`.
The fixed templates are:

```text
/api/vault/tree
/api/vault/folders?path={rootPath}
/api/vault/notes/by-path?path={path}
/api/vault/search?path={rootPath}&q={query}
```

These `/api/...` values are deployment-base-relative suffixes, not origin-root
URLs: append them to the exact canonical `NABU_URL` so a prefix such as
`/base` is preserved. URL-encode only the allowlisted variables. Never resolve
one against the bare origin (which would drop the prefix), and never put a
token or `Authorization` value in a link.

For every initial redemption, generate one cryptographically random
`Idempotency-Key` with at least 128 bits of entropy (for example, 16 random
bytes encoded with URL-safe characters). Validate its length/character set,
keep it only in process memory, and reuse that exact key for the entire
redemption attempt: the initial POST, any retry after an unknown network
outcome, profile persistence, and immediate verification. Do not generate a
replacement key between those steps, and never print or save the key. A
For an unknown first outcome, make at most one recovery request with that same
invite and key even though the server version is not yet known. A successful
response without `contractVersion: 2` is v1 and must not be retried again;
older servers safely ignore the extra request header. A `410` from the recovery
request can mean a v1 server consumed the invite but lost the response, so the
token is unrecoverable and the owner must create a new invite.

Before reporting success:

1. Persist the token in the secure profile workflow below, keyed by the exact
   canonical `NABU_URL` and `sharedSpaceId`. Keep the token in memory only until
   the atomic write and verification finish.
2. Never print it, place it in chat or Markdown, or save it in an ordinary
   workspace file.
3. Save only the non-secret metadata required by the profile:
   `NABU_API_BASE_URL`, `NABU_SHARED_SPACE_ID`, `NABU_ROOT_PATH`, canonical
   permissions, and `NABU_ACCESS_TOKEN_EXPIRES_AT`.
4. Use the same canonical base for every subsequent shared-space API request.
5. Verify access immediately. Load the token into process memory without
   printing it, then GET the scoped tree:

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
space access is ready. A local expiry check must happen before any request; an
expired profile is unusable. A `401` or a server response identifying an
expired/revoked token means the profile is unusable; do not silently reuse it or
request a broader token. If the token is missing after successful redemption,
treat it as a local credential-persistence failure and inspect the approved
store before requesting another invite.

`410 SHARED_SPACE_INVITE_INVALID` means the invite is malformed, expired,
already redeemed, or its space is expired/revoked. Do not retry alternate field
names. If a network failure leaves the first redemption status unknown, make at
most one recovery request with the exact same invite URL and in-memory
`Idempotency-Key`. Version 2 returns the identical token and metadata. On a
version-1 server, success means the retry performed the redemption; `410` means
the original response and token were lost, so ask the owner for a new invite.
A different key remains rejected. If either the invite or key is lost, ask the
owner for a new invite. Headerless v1 redemption remains one-shot. Each
additional collaborator needs a newly generated one-time invite.

### 4. Persist one scoped credential profile

Profiles are runtime-local persistence for one deployment and one shared space.
They contain only a scoped collaborator token; owner passwords remain in an OS
secret store. The parser accepts exactly these newline-delimited keys:

```text
NABU_PROFILE_VERSION=2
NABU_API_BASE_URL=https://nabu.example.test/base
NABU_SHARED_SPACE_ID=space_EXAMPLE
NABU_ROOT_PATH=projects/example/shared
NABU_PERMISSIONS=read,write
NABU_ACCESS_TOKEN_EXPIRES_AT=2030-01-01T00:00:00.000Z
NABU_ACCESS_TOKEN=<scoped-token-from-redemption>
```

Use synthetic values like these in examples only. The writer emits exactly
these seven keys (in this order, with no comments or shell syntax) and the
parser accepts only this exact UTF-8, newline-delimited allowlist: reject
duplicate or unknown keys, malformed
encoding, BOMs, multiline values, missing/empty required values,
and trailing shell syntax. Never shell-source the file. Validate that the
profile version is `2`, the API base is the exact canonical base, the shared
space/profile ID is a server-issued filename-safe value (no separators), the
root is a normalized vault-relative path, permissions are the canonical
`read` or `read,write` in canonical order, and expiry is a strict UTC
timestamp.

Choose the profile root in this exact order:

1. If `NABU_CREDENTIALS_DIR` is set, use that directory as the explicit
   override, create the same `<deployment-id>/<shared-space-id>.env` structure
   beneath it, and do not silently fall back to another runtime directory.
2. Otherwise use the structured directory belonging to the current runtime:
   Codex uses `~/.codex/secrets/nabu/<deployment-id>/<shared-space-id>.env`,
   while Hermes uses
   `~/.hermes/secrets/nabu/<deployment-id>/<shared-space-id>.env`. Do not
   silently cross between runtime directories. If the runtime cannot be
   identified, inspect Codex then Hermes in that order and stop on ambiguity.

`<deployment-id>` is exactly `sha256-` followed by the 64-character lowercase
hex SHA-256 digest of the canonical API base's UTF-8 bytes (including scheme,
non-default port, and path prefix), not the host alone. The profile filename is
exactly the validated server `sharedSpaceId` plus `.env`; `profileId` is a
response hint and is not persisted as an eighth profile key. Never derive a
filename from an untrusted host or path. Separate deployments and shared spaces
must never overwrite one another.

On POSIX, create profile directories with mode `0700` and files with mode
`0600`; verify the current-user owner and exact permissions before reading.
On Windows, reject symlinks/reparse points in every destination component,
require the current user as owner, and require a current-user-only DACL with no
inherited or broad access. If ownership or permissions cannot be proven, fail
closed and use an approved OS secret store instead; do not weaken the checks.

Write with an exclusive temporary file in the *same directory*, write the
profile, flush it (and the directory where the platform supports it), then
atomically rename it into place. Verify owner/permissions after the rename and
remove any temporary file on failure. Never leave a second plaintext copy or
include a token in diagnostics.

### 5. Discover and verify at the beginning of a chat

Normalize the requested deployment to its exact canonical base before scanning
profiles. Scan only that deployment's directory. If no deployment is named and
more than one canonical base is present, ask the user which deployment to use;
never guess. Reject malformed, symlinked/reparse-point, wrong-owner,
over-permissive, or locally expired profiles before using their token.

For a requested vault-relative path and operation, normalize `/` segments,
discard profiles without the required permission (`read` for reads;
`read,write` for writes), and keep only candidate roots that contain the path
at a segment boundary (`projects/example` contains
`projects/example/note.md`, but not `projects/example-private`). Then select the
greatest segment depth. Equal-depth eligible candidates are ambiguous and must
stop discovery rather than silently choosing; an out-of-scope path is an error.

Read the legacy Hermes flat file `~/.hermes/secrets/nabu.env` only when no
structured profile exists for the selected deployment. Validate it with the same
allowlist and security checks, derive its structured destination from the exact
canonical base and server-issued shared-space ID, and migrate it using the same
exclusive same-directory temporary write, flush, and atomic rename before use.
Do not use the legacy file when a structured profile exists, and do not delete
it implicitly.

Before any requested note operation, verify the selected bearer token with
`GET /api/vault/tree` (or the v2 `tree` link) using the canonical base. A server
401, explicit revocation/expiry, scope mismatch, or failed verification makes
the profile unusable; report that fact and obtain a new invite only with the
user's direction.

### Read-only URL tokens

Owners can issue a browser/API read capability for an existing shared space:

```bash
curl -fsS -X POST \
  "${NABU_URL}/api/shared-spaces/${SHARED_SPACE_ID}/read-link" \
  -H "Cookie: nabu_session=${SESSION_COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"durationDays":14}'
```

- `durationDays` is optional; it defaults to 7 and must be between 1 and 183.
  The effective expiry cannot outlive the shared-space lease.
- The response includes `shareUrl`, `sharedSpaceId`, `rootPath`,
  `permission: "read"`, `durationDays`, and `expiresAt`.
- There is one active read link per shared space. Issuing a new one immediately
  invalidates the old token. `DELETE /api/shared-spaces/:sharedSpaceId/read-link`
  revokes the current read link without revoking the shared space and is
  idempotent.
- Treat `shareUrl` as a secret capability. Never print it, commit it, or save
  it in an ordinary workspace file.
- Humans can open `${NABU_URL}/?path=projects%2Fcanner&token=<opaque-token>`.
  The UI is read-only, preserves the token while navigating within the subtree,
  and returns a generic unavailable message outside the subtree.
- Agents can use the same token on read APIs:

```bash
curl -fsS "${NABU_URL}/api/vault/tree?token=<opaque-token>"
curl -fsS "${NABU_URL}/api/vault/notes/by-path?path=projects%2Fcanner%2Freadme.md&token=<opaque-token>"
curl -fsS "${NABU_URL}/api/vault/assets?path=projects%2Fcanner%2Fdiagram.png&token=<opaque-token>"
```

Do not use a read-link token on write endpoints. Private linked notes and
metadata are redacted from public projections; outside paths and assets return
`{"error":"Shared space unavailable"}` without repeating the private path.

### Shared-space management

- `GET /api/shared-spaces/` lists spaces owned by the authenticated owner.
- `GET /api/shared-spaces/:sharedSpaceId` inspects an owned space.
- `POST /api/shared-spaces/:sharedSpaceId/revoke` revokes the space immediately;
  existing tokens fail synchronously.
- `POST /api/shared-spaces/:sharedSpaceId/invites` creates another one-time
  invite for an active owned space.
- `POST /api/shared-spaces/:sharedSpaceId/extend` requires explicit
  confirmation and may not exceed the 183-day maximum.

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
- Public read-link requests outside their shared subtree return the stable
  `Shared space unavailable` error and do not repeat the private path.

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
- Read links: issue as the owner -> store the share URL only as a secret ->
  verify one in-scope read -> distribute it -> rotate or revoke when needed.
- Redemption: parse the invite URL and derive its exact canonical base (including
  any prefix) -> generate one in-memory 128-bit-plus `Idempotency-Key` for the
  initial request on every server -> POST the exact `inviteUrl` payload to
  `${NABU_URL}/api/shared-spaces/invites/redeem` -> persist the token and
  metadata securely -> GET the shared-space tree and requested documents ->
  use bearer auth -> never log a secret. After an unknown first outcome, make
  at most one recovery request with the same invite and key. Version 2 recovers
  the token; a version-1 `410` requires a new invite.
- Writes: read -> edit/merge -> send revision precondition -> on `409`/`428`
  re-read and retry safely -> verify by canonical path.
- Private data: authorize before reading or mutating every endpoint and filter
  all derived results to the caller's scope.

Source: the user's Nabu deployment's `/agents.md` contract.
