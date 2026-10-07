# Delegated Planning

Use this reference whenever `plan-it` creates or revises a plan through a worker.

## Worker Resolution

Resolve the worker from the `planning` role per the kickoff skill's `references/config.md`. A missing role runs as a fresh child on the parent's model; never stop to ask the user to configure a worker. Map the spawn primitive through the kickoff skill's `references/harness.md`.

If the harness cannot spawn workers, plan inline and record the plan as not worker-created.

## Planning Packet

Dispatch one fresh planning worker with the smallest complete context:

- `plan-it` skill and this reference.
- Planning mode: `tiny`, `fast`, or `full`; tiny reaches a worker only when explicitly delegated or repository policy requires it.
- Work type, objective, requirements, acceptance criteria, constraints, timeline, risks, and open questions.
- Work brief and task-workspace paths.
- Worktree path and repository instructions.
- Relevant specs, tickets, logs, screenshots, architecture docs, and code references.
- Required artifact location, plan content standard, and recorded `HTML required: yes | no` with its reason.

Tell the worker to inspect the repository and cited evidence before planning. It must make no implementation changes, spawn no additional workers, and avoid unrelated exploration. Durable artifacts and explicit paths are the source of truth; do not rely on orchestrator conversation history.

## Artifact And Result Contract

For `full`, create the required Markdown plan. Create and open a Lavish artifact only when the packet records `HTML required: yes`; otherwise Markdown is the complete review artifact. For `fast`, create a concise Markdown plan in the brief or the repository's established sibling plan location. For an explicitly delegated `tiny` plan, write only the inline objective, affected surface, 1–3 steps, acceptance checks, and rollback required by `plan-it`.

Return:

```markdown
# Planning Result

## Status

<Ready / Needs input / Blocked>

## Artifacts

- Plan: <absolute path>
- Work brief updated: <absolute path or no>
- Artifact type: <Lavish HTML / Markdown / Inline Markdown>

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

Route accepted adversarial findings, dispositions, simplicity findings, user annotations, and changed requirements back through the configured planning worker. Start a fresh planning worker with the original brief, current plan, complete review outputs, dispositions, and requested changes.

Require the planner to update the artifact and return the same structured result plus a concise revision summary. The orchestrator records dispositions and validates the handoff; it does not silently author substantive plan revisions itself.

After a full plan is accepted under the task authorization, route acceptance to the planning worker. If HTML was required, end the Lavish session, export the self-contained read-only archive, and return the Markdown, editable HTML, and accepted archive paths. Otherwise return the accepted Markdown without starting a visual session. The orchestrator validates the accepted artifacts and hands those to implementation.
