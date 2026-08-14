# Delegated Planning

Use this reference whenever `plan-it` creates or revises a plan through a worker.

## Single Kickoff Configuration

Use the repository's existing agent-workspace convention and its single `kickoff.yaml`. Store the planning selector under `plan_it.workers`:

```yaml
version: 1
plan_it:
  workers:
    codex:
      agent: "<planning-worker-name>"
    opencode:
      model: "<provider/model-id>"
      reasoning_effort: "<optional-harness-native-level>"
plan_review:
  workers:
    codex:
      agent: "<review-worker-name>"
ship_it:
  workers:
    codex:
      agent: "<implementation-worker-name>"
```

Each harness entry must use exactly one selector:

- `agent`: an exact harness-native named worker. Its native definition is the sole source of truth for model, reasoning, instructions, and other settings.
- `model`: direct per-spawn model selection, with optional `reasoning_effort`, only when the harness does not require named workers.

Never combine `agent` and `model`, duplicate a named worker's settings in `kickoff.yaml`, persist the current orchestrator, or overwrite another stage or harness entry. The same exact selector may be copied across stages when the user intentionally reuses a worker, but each stage still runs in its own worker session.

## First-Use Worker Bootstrap

Before planning:

1. Honor an explicit planning-worker choice supplied for the task.
2. Read and validate `plan_it.workers.<harness>` when it exists.
3. If it is missing, discover selectors already configured for the active harness under `plan_review.workers` or `ship_it.workers` and ask whether to reuse one or configure a separate planning worker. Copy only the exact selector when reusing it.
4. Otherwise discover named workers available to the active harness before asking for model settings.
5. If a suitable named worker exists, ask the user to select or confirm its exact name, validate it, and store only `agent`.
6. If named workers are supported but none is suitable, ask for the name, model, supported reasoning level, and personal or project scope. Create and validate the smallest native definition, then store only `agent`.
7. If the harness dispatches directly by model, ask for the model and supported reasoning level, validate them, and store `model` plus optional `reasoning_effort`.
8. Update only the active harness entry under `plan_it.workers`, preserving every unrelated key and harness.

Do not create `.agent/` or `.agents/` solely for worker configuration when the repository has no such convention. Do not configure inactive harnesses or ask for a named worker's model settings.

Revalidate the selector before every planning run. If it is unavailable or invalid, do not substitute another worker or add overrides silently. Ask whether to repair it or choose a replacement.

If the harness cannot spawn workers, stop during kickoff and ask the user to use a supporting harness or explicitly accept orchestrator planning for this task. For direct `plan-it` use, current-session planning is allowed only after the same explicit acceptance. Record that the plan was not worker-created.

## Planning Packet

Dispatch one fresh planning worker with the smallest complete context:

- `plan-it` skill and this reference.
- Planning mode: `full` or `fast`.
- Work type, objective, requirements, acceptance criteria, constraints, timeline, risks, and open questions.
- Work brief and task-workspace paths.
- Worktree path and repository instructions.
- Relevant specs, tickets, logs, screenshots, architecture docs, and code references.
- Required artifact location and the plan content standard.

Tell the worker to inspect the repository and cited evidence before planning. It must make no implementation changes, spawn no additional workers, and avoid unrelated exploration. Durable artifacts and explicit paths are the source of truth; do not rely on orchestrator conversation history.

## Artifact And Result Contract

For `full`, create and open the Lavish artifact required by `plan-it` and satisfy the Full Plan Content Standard. For `fast`, create a concise Markdown plan in the brief or the repository's established sibling plan location and satisfy the smaller Fast Plan Content Standard.

Return:

```markdown
# Planning Result

## Status

<Ready / Needs input / Blocked>

## Artifacts

- Plan: <absolute path>
- Work brief updated: <absolute path or no>
- Artifact type: <Lavish HTML / Markdown>

## Evidence Inspected

- <path or source and why it mattered>

## Decisions And Assumptions

- <decision or assumption>

## Risks And Open Questions

- <risk, question, or none>

## Validation Basis

- <commands, tests, or repository evidence used to make the plan executable>
```

The orchestrator must verify that the artifact exists, is inside the intended worktree, covers the brief and acceptance criteria, and contains no implementation changes before advancing it to review.

## Revision Contract

Route accepted adversarial findings, dispositions, simplicity findings, user annotations, and changed requirements back through the configured planning worker. Resume the original planning session when supported and its context is still trustworthy. Otherwise start a fresh planning worker with the original brief, current plan, complete review outputs, dispositions, and requested changes.

Require the planner to update the artifact and return the same structured result plus a concise revision summary. The orchestrator records dispositions and validates the handoff; it does not silently author substantive plan revisions itself.

After the user accepts a full plan, route that acceptance to the planning worker. Require it to end the Lavish session, export the self-contained read-only archive, and return both the editable artifact and accepted archive paths. The orchestrator validates the archive and hands the archive—not the live editing session—to implementation.
