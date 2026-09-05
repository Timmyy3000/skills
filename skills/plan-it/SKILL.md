---
name: plan-it
description: Create or revise proportionate implementation plans, using inline planning for tiny work and a configured planning worker for fast/full work. Use standalone or when Kickoff delegates planning; produce concise Markdown or a full human-review artifact as warranted.
version: 0.6.0
---

# Plan It

Produce the smallest executable plan that covers the current objective and demonstrated risks. Durable artifacts and the Kickoff episode state are the source of truth; conversation history is not.

## Scope and authorization

Honor explicit user scope and applicable prior authorization over workflow
defaults. Continue authorized preparation and reversible work using established
conventions; ask only for material unresolved decisions or authority not already
given. Preserve engineering safeguards and access controls. If a skill blocks
progress, identify the exact instruction and concrete conflict, and continue
independent authorized work.

For a read-only or no-change request, return findings in chat without creating or
updating plans, state, memory, configuration, or knowledge records unless those
writes are explicitly authorized. Preserve current user corrections over stale
artifacts, updating those artifacts only when writes are in scope.

## Required Inputs

- Route: `tiny`, `fast`, or `full`.
- Work brief and acceptance criteria.
- Episode-state path when called from Kickoff.
- Worktree and intended base branch.
- Relevant repository instructions and an evidence index.
- Constraints, open decisions, and prior review findings for revisions.

Return `Needs context` and list only missing inputs when planning cannot proceed responsibly.

## Worker Contract

Tiny planning runs in the current session unless the user or repository explicitly requires a planning worker. Keep its plan inline in the brief or episode state so worker setup costs do not exceed the work.

For fast/full planning, or explicitly delegated tiny planning, read [references/delegation.md](references/delegation.md) for selector discovery, first-use configuration, dispatch, artifact validation, and revision handoffs.

When dispatching, use `plan_it.workers.<harness>` from the repository's single `kickoff.yaml`. Revalidate it before dispatch. Configure it only when planning actually needs a worker. Never substitute the orchestrator or a different worker silently.

Dispatch a fresh worker with artifact paths and focused evidence pointers. Do not pass the full conversation. The worker may inspect cited and adjacent repository evidence, but must avoid unrelated repository sweeps and make no implementation changes.

## Proportional Routes

### Tiny

Write the plan inside the brief or episode state. Limit it to objective, affected surface, 1–3 implementation steps, acceptance checks, and rollback. Do not create HTML, diagrams, exhaustive user stories, or speculative phases.

### Fast

Create one concise Markdown plan. Include scope, simplest viable approach, affected files/systems, acceptance criteria, focused validation, material risk, rollback, and unresolved decisions. Prefer 3–6 coherent steps.

### Full

Create the repository-required Markdown plan. Record `HTML required: yes | no` from the user request, applicable repository policy, and whether visual review adds value. Create a Lavish artifact only when that recorded choice is yes; pass the choice unchanged through worker handoffs and acceptance. Cover the relevant product behavior, experience and accessibility, technical structure, sequencing, boundaries, adoption or rollout, risk, rollback, and concrete validation. HTML and Markdown must agree; do not maintain two divergent plans.

## Planning Method

1. Read the brief, episode state, repository instructions, existing patterns, and cited evidence.
2. State the current behavior and intended outcome.
3. Recommend the simplest approach that meets acceptance criteria.
4. Map each proposed component to a requirement, repository pattern, or demonstrated risk. Remove anything without a reason.
5. Specify only the files/systems likely to change; mark uncertainty instead of inventing paths.
6. Tie validation directly to acceptance criteria and failure modes.
7. Record assumptions and decisions in the episode state.

Do not plan speculative scale, compatibility, infrastructure, abstractions, or future flexibility without evidence. Do not repeat the same requirement across multiple sections merely to appear complete.

## Revision Discipline

For review or user revisions, read the current plan, finding IDs, dispositions, and changed decisions. Patch only affected sections. Do not repeat full repository discovery unless evidence changed or the state file says prior evidence is stale.

Re-run independent reviews only when the revision materially changes architecture, scope, risk controls, or validation—not for wording or formatting changes.

## Output

Return:

```markdown
# Planning Result
- Status: Ready | Needs input | Blocked
- Route:
- Plan path:
- HTML required: yes | no
- Episode state updated: yes | no
- Evidence newly inspected:
- Decisions added or changed:
- Assumptions:
- Material risks/open questions:
- Validation basis:
- Started at:
- Completed at:
- Revision count:
```

The caller validates that the plan exists inside the intended worktree, covers acceptance criteria, remains proportional, and contains no implementation changes.
