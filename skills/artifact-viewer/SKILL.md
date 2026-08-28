---
name: artifact-viewer-publishing
description: Use when an agent needs to publish a self-contained HTML artifact to an Artifact Viewer API and receive an immutable URL or stable named deployment link.
version: 1.0.0
author: Timi Ogunme / Artifact Viewer
license: MIT
platforms: [linux, macos, windows]
metadata:
  integration:
    runtime: provider-neutral
    api: REST
    repository: https://github.com/Vegapunk3000/artifact-viewer
---

# Artifact Viewer Publishing

Publish self-contained HTML artifacts to a remote Artifact Viewer service. This integration is provider-neutral: it works with Codex, Claude Code, Gemini, custom agents, CI jobs, or a normal shell/Python process. It does not require Hermes.

## What this provides

A successful publish creates:

- an immutable version URL: `https://<host>/a/<artifact-id>`;
- optionally, a stable named URL: `https://<host>/n/<name>`.

Publishing another artifact with the same name moves the named URL to the new version while preserving the previous immutable URL. Named URLs are aliases, not a versioning substitute.

The deployed HTML is unlisted rather than authenticated: anyone who obtains a link can view it. Never publish credentials, private keys, raw environment files, access tokens, or unnecessary personal data.

## Configuration

Configure the client outside the agent prompt and outside the repository:

```text
ARTIFACT_VIEWER_URL=https://artifacts.example.com
ARTIFACT_VIEWER_TOKEN=<secret>
```

Use the host and token supplied by the Artifact Viewer administrator. Store them in the agent runtime's secret manager, protected environment, or a local file with restrictive permissions. Never commit them, print them, put them in a command-line argument, or include them in the generated HTML.

The token authorizes publishing and management operations. If multiple agents use the service, prefer separate tokens with independent revocation when the server supports them.

## Publish workflow

1. Decide that a browser artifact materially improves the result. Do not turn ordinary prose into a web page for vanity.
2. Create one UTF-8 `.html` or `.htm` file. Inline CSS and JavaScript where practical; keep the artifact portable.
3. Validate the file locally. Check that it exists, is valid HTML, is under the server's size limit, and contains no secrets.
4. Choose a lowercase hyphenated name when the artifact should have a maintained URL. Use a unique name for separate artifacts; reuse a name only for intentional replacement.
5. Publish through `scripts/publish_artifact.py` or an equivalent HTTPS client.
6. Verify the returned immutable URL and named URL with unauthenticated `GET` requests. Inspect the rendered page and exercise important interactions before reporting completion.

Example:

```bash
export ARTIFACT_VIEWER_URL='https://artifacts.example.com'
# Inject ARTIFACT_VIEWER_TOKEN through your secret manager; do not paste it into shell history.
python3 scripts/publish_artifact.py ./dist/index.html \
  --title 'Project dashboard' \
  --description 'Current project status' \
  --source codex \
  --tag dashboard \
  --name project-dashboard
```

The script prints JSON containing the artifact ID, immutable version URL, and named URLs. Share the named URL for a maintained artifact and retain the immutable URL for rollback or audit.

## REST API

### Publish

```http
POST /api/artifacts
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Project dashboard",
  "description": "Current project status",
  "html": "<!doctype html><html>...</html>",
  "tags": ["dashboard", "project"],
  "source": "codex",
  "name": "project-dashboard"
}
```

`name` is optional. Without it, the response creates only an immutable artifact. Names must be lowercase, use single hyphens, and be at most 64 characters. The server is the source of truth for the exact validation rules and size limit.

### Manage artifacts

These management calls require the same bearer authorization:

```http
GET    /api/artifacts?limit=20
GET    /api/names?limit=200
PUT    /api/names/<name>       {"artifact_id":"<id>"}
DELETE /api/names/<name>
DELETE /api/artifacts/<id>
```

Use deletion sparingly. Releasing a name removes the alias but does not delete the immutable artifact. Do not delete an immutable version merely to replace a named artifact.

### Public verification

```http
GET /a/<artifact-id>
GET /n/<name>
```

The public document is sandboxed. It may not be embeddable, may have a restrictive Content Security Policy, and may not support third-party scripts or storage. Build the artifact so its important content is readable without those dependencies.

## Integration patterns

### Local Codex or Claude Code

Give the agent:

- this skill or the equivalent project instructions;
- the publisher script;
- `ARTIFACT_VIEWER_URL` as non-secret configuration;
- `ARTIFACT_VIEWER_TOKEN` through the runtime secret manager.

The agent needs outbound HTTPS only. It does not need SSH access to the Artifact Viewer host, access to the Dokploy dashboard, or the Artifact Viewer source repository.

### CI/CD

Store the URL and token as CI secrets. Publish after generating the artifact. Use a stable name only when the pipeline is intentionally updating an existing deployment. Treat the returned named URL as the user-facing output and retain the immutable URL in CI logs only if those logs are appropriately private.

### Git-backed source

GitHub or GitLab can hold the artifact source, but a repository push does not publish to Artifact Viewer by itself. Add a CI job or webhook consumer that calls `POST /api/artifacts`.

## Common pitfalls

1. **Confusing Artifact Viewer with GitHub Pages or Dokploy.** Dokploy may host the Artifact Viewer service, but clients publish through its REST API. A Git push alone does nothing.
2. **Expecting a new link every time.** Reusing a name updates one stable alias. Use the immutable `/a/<id>` URL for a permanent version.
3. **Publishing private HTML.** Artifact links are unlisted, not login-gated. Anyone with the link can read the page.
4. **Leaking the token.** Do not put it in prompts, source files, shell history, CI output, URLs, or generated artifacts.
5. **Skipping live verification.** A successful POST does not prove that the named URL serves the intended version. Fetch both URLs and inspect the rendered page.
6. **Assuming browser features work.** Test without third-party scripts, cross-origin fetches, or unrestricted storage; the service intentionally sandboxes documents.
7. **Using a mutable name for unrelated work.** Names are global aliases within the service. Choose names that identify the artifact's purpose and owner.

## Completion checklist

- [ ] The artifact is a self-contained UTF-8 HTML file.
- [ ] The file is under the server's size limit and contains no secrets.
- [ ] The URL and token came from protected runtime configuration.
- [ ] The publish request returned HTTP success and an artifact ID.
- [ ] The immutable `/a/<id>` URL returns HTTP 200.
- [ ] If named, `/n/<name>` returns HTTP 200 and serves the intended current version.
- [ ] The rendered artifact was inspected and important interactions work.
- [ ] The final response includes the correct stable URL, not only an internal artifact ID.
