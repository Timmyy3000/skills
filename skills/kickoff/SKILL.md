---
name: kickoff
description: Orchestrate engineering work from intent through proportionate planning, independent review, implementation, pull request creation, active review monitoring, and verified closeout. Use for /kickoff or $kickoff and for work explicitly requested as an end-to-end shipped change.
version: 0.6.0
---

# Kickoff

Run one engineering delivery episode from intent to a verified terminal state. Keep the conversation small by making durable artifacts—not chat history—the source of truth.

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

## Non-Negotiable Outcomes

- Preserve the user's scope, target branch, delivery path, and authorization boundaries.
- Use repository evidence before assumptions.
- Keep one isolated worktree per modifying episode unless it is a read-only investigation or the user explicitly chooses an allowed direct-branch path.
- Do not call a one-time PR status check “monitoring.”
- Do not finish merely because code was written or a PR was opened.
- After a merged PR, do not silently leave a Forest worktree behind; resolve and record the applicable close-or-retain decision and its authorization source.
- Do not start unrelated work inside a completed episode; recommend a new task.

## Episode State

When artifact writes are authorized, create `<task-workspace>/episode-state.md` before planning using [references/episode-state.md](references/episode-state.md), and update it at phase transitions and handoffs. For strict read-only work, keep state, findings, and evidence references in chat instead; skip all state-file creation, updates, and cleanup.

For authorized artifact workflows, the state file is the compact source of truth for downstream skills and compaction recovery. Pass its path to every worker. After compaction or interruption, read it before exploring the repository again.

Record user corrections as durable decisions when writes are authorized, or in chat for read-only work. Never make the user repeat a settled decision because it fell out of conversation context.

## Route Selection

Choose the smallest route that responsibly covers the work:

- `investigation`: read-only findings; no implementation or PR stages.
- `tiny`: narrow, established-pattern change with clear acceptance and low security/data/operational risk. Concise plan in the brief. Adversarial or simplicity review only when a risk trigger below applies.
- `fast`: bounded change with a short Markdown plan. Require adversarial review. Require simplicity review only when the plan adds machinery or the adversarial revision materially increases complexity.
- `full`: materially ambiguous, cross-cutting, high-consequence, hard-to-reverse, coordination-heavy, or novel work. Require a full plan, adversarial review, simplicity review, and applicable user authorization; honor an explicit instruction to execute the agreed scope without another plan gate.

Choose the route by evaluating six dimensions in the task's own domain: ambiguity, blast radius, consequence of error, reversibility, novelty relative to established patterns, and coordination required. Consider effects on users and workflows, product behavior and presentation, accessibility and trust, data and security, compatibility and performance, and delivery or operations. A visually small interface change can warrant `full` when it alters a critical journey or design-system contract; a backend change can remain `tiny` when it is isolated, established, and easy to reverse.

Record the route and reason. Do not upgrade a small task merely because a richer artifact is possible. Upgrade when evidence reveals material risk.

For `investigation`, stop the delivery workflow after intake and workspace discovery. Inspect only evidence needed to answer the investigation and report findings with sources, uncertainties, and recommended next decisions. Write durable findings and update episode status to `investigation-complete` only when artifact writes are authorized; otherwise report completion in chat. Close out without invoking `plan-it`, `ship-it`, or `create-pr`.

## Workflow

1. **Intake once.** Ask only questions that change scope, risk, priority, delivery path, or authorization. Record objective, acceptance criteria, out-of-scope behavior, target branch, rollout, and explicit user choices.
2. **Establish the workspace.** Discover repository instructions and artifact conventions. For modifying work, create or select the worktree safely; for investigation, preserve read-only scope. Record exact paths and initial Git state.
3. **Resolve only needed workers.** Configure a planning worker for fast/full work, a review worker only for selected review stages, and an implementation worker only when delegation selects one. Preserve the repository's single `kickoff.yaml`; do not re-ask for a valid selector.
4. **Plan with `plan-it`.** For non-investigation routes, pass the brief, episode state, route, evidence pointers, constraints, and artifact path. Reject a plan that is disproportionate, duplicates the brief, or relies on uncited assumptions.
5. **Review proportionately.** Run `adversarial-review` and `simplicity-review` according to the route. Give each finding a stable ID and record its disposition. Route accepted changes back through `plan-it`; do not rewrite substantive plan content in the orchestrator.
6. **Approve when required.** Full plans require approval after reviews unless the user has already explicitly authorized execution of the agreed scope without another plan gate. Tiny and fast plans proceed once their required reviews and unresolved decisions are clear.
7. **Execute with `ship-it`.** Hand off the accepted plan, episode state, findings, worktree, delivery path, selectors, risks, and validation expectations.
8. **Verify terminal state.** Kickoff is complete when the episode state (or chat for read-only investigations) records a delivery-path-appropriate terminal status: `investigation-complete`, `ready-to-merge`, `merged`, `delivered-direct`, `canceled`, or `blocked-external`, together with applicable delivery, monitor, and closeout evidence. For a Forest-backed PR expected to be followed through merge, `ready-to-merge` is a milestone rather than the episode terminal state.

For read-only investigations, record `investigation-complete` and applicable closeout evidence in chat. All recording, handoff, and closeout requirements below use chat while artifact writes are outside scope.

## Corrections And Drift

When the user corrects scope, architecture, branch target, monitoring, or closeout:

1. acknowledge the exact correction;
2. update the brief, plan if affected, and episode state;
3. identify which completed phases are invalidated;
4. rerun only those phases;
5. increment `User correction count` with a category.

Do not silently reinterpret a correction or continue from stale artifacts.

## Context Control

- Pass paths and short deltas to workers, not the full conversation.
- Do not repeatedly rediscover repository structure already recorded in the evidence index.
- Summarize large tool output into the state file; preserve raw output only when it is durable evidence.
- If the work changes feature, repository objective, or delivery outcome after a terminal state, start a new episode and preferably a new task.
- Phase updates should contain only current phase, changed decisions, blocker, and next action.

## PR And Monitoring Contract

For a PR delivery path, `ship-it` must invoke `create-pr`. PR creation and monitor establishment are one handoff:

- `create-pr` validates the intended base branch from explicit user instructions, repository policy, and episode state.
- It creates or updates the five-minute monitor when required and automation is available; an explicitly excluded monitor is recorded as `not-applicable`.
- It returns a structured PR record including `monitor_status` and `monitor_id`.
- If required monitoring cannot be established, record phase `monitoring`, status `blocked`, and the exact reason; do not report normal completion.

The monitor checks current-head CI, security/policy/code review, mergeability, human comments, and head changes. It stays quiet when nothing actionable changes, applies only authorized scoped fixes, and never merges without explicit permission. Use Ship-it's integration contract to distinguish verified Git ancestry or patch/aggregate equivalence from exact merged PR head evidence; PR evidence must match the repository, PR, head SHA, base, and merged state. A missing or deleted tracking ref alone does not prove unpublished work, and stale or unmatched PR evidence cannot bypass Forest's dirty or integration safeguards. For a Forest-managed worktree, a verified merge starts cleanup: re-inspect the exact worktree and its current owner, then honor the latest applicable explicit task or saved user close-or-retain instruction. Ask once only when no applicable authorization exists. Stay quiet while an answer is pending, and record the decision, source, and verified result.

## Closeout Contract

Before the final answer, verify and record:

- terminal delivery state and final local/remote SHA;
- required checks/reviews and unresolved findings;
- deployment or promotion status when in scope;
- branch/worktree disposition;
- durable artifact paths and removal of temporary coordination files;
- delivery-board or knowledge-record reconciliation when the repository requires it;
- monitor stopped or intentionally retained, with reason.

If the PR is ready but not merged, preserve the worktree unless repository policy or the user explicitly authorizes safe closure. Do not claim post-merge deployment or cleanup that has not happened.

Ship-it owns detailed Forest closeout. Re-inspect the exact worktree and current owner, re-evaluate the latest close-or-retain authority, and record its source. Verify Forest state, `git worktree list --porcelain`, and the exact disk path after closure; a partial or unverified close remains `closure-blocked` with owner, content, branch, and monitor retained.

## Version And Dependency Preflight

Check the installed bundle version once per episode. If a newer compatible bundle exists, offer the update once and require a fresh task after an accepted update. Do not repeatedly prompt after a decline or compare unlike package and skill versions.

Resolve capabilities only for stages the selected route and delivery path will execute: `plan-it` for planning; `adversarial-review` and `simplicity-review` when their review gates apply; `ship-it` and `code-review` for implementation, plus `ponytail-review` when the review mode requires a separate pass; and `create-pr` only for PR delivery. Stop before a missing dependent stage, not before unrelated read-only work.
