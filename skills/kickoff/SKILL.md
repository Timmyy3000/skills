---
name: kickoff
description: Orchestrate engineering work from intent through proportionate planning, independent review, implementation, pull request creation, active review monitoring, and verified closeout. Use for /kickoff or $kickoff and for work explicitly requested as an end-to-end shipped change.
version: 0.5.0
---

# Kickoff

Run one engineering delivery episode from intent to a verified terminal state. Keep the conversation small by making durable artifacts—not chat history—the source of truth.

## Non-Negotiable Outcomes

- Preserve the user's scope, target branch, delivery path, and authorization boundaries.
- Use repository evidence before assumptions.
- Keep one isolated worktree per modifying episode unless it is a read-only investigation or the user explicitly chooses an allowed direct-branch path.
- Do not call a one-time PR status check “monitoring.”
- Do not finish merely because code was written or a PR was opened.
- After a merged PR, do not silently leave a Forest worktree behind; obtain and record the user's close-or-retain decision.
- Do not start unrelated work inside a completed episode; recommend a new task.

## Episode State

Before planning, create `<task-workspace>/episode-state.md` using [references/episode-state.md](references/episode-state.md). Update it at every phase transition and before any handoff.

The state file is the compact source of truth for downstream skills and compaction recovery. Pass its path to every worker. After compaction or interruption, read it before exploring the repository again.

Record user corrections as durable decisions. Never make the user repeat a settled decision because it fell out of conversation context.

## Route Selection

Choose the smallest route that responsibly covers the work:

- `investigation`: read-only findings; no implementation or PR stages.
- `tiny`: narrow, established-pattern change with clear acceptance and low security/data/operational risk. Concise plan in the brief. Adversarial or simplicity review only when a risk trigger below applies.
- `fast`: bounded change with a short Markdown plan. Require adversarial review. Require simplicity review only when the plan adds machinery or the adversarial revision materially increases complexity.
- `full`: materially ambiguous, cross-cutting, high-consequence, hard-to-reverse, coordination-heavy, or novel work. Require full plan, adversarial review, simplicity review, and user approval.

Choose the route by evaluating six dimensions in the task's own domain: ambiguity, blast radius, consequence of error, reversibility, novelty relative to established patterns, and coordination required. Consider effects on users and workflows, product behavior and presentation, accessibility and trust, data and security, compatibility and performance, and delivery or operations. A visually small interface change can warrant `full` when it alters a critical journey or design-system contract; a backend change can remain `tiny` when it is isolated, established, and easy to reverse.

Record the route and reason. Do not upgrade a small task merely because a richer artifact is possible. Upgrade when evidence reveals material risk.

For `investigation`, stop the delivery workflow after intake and workspace discovery. Inspect only evidence needed to answer the investigation, write durable findings with sources, uncertainties, and recommended next decisions, update the episode status to `investigation-complete`, and close out without invoking `plan-it`, `ship-it`, or `create-pr`.

## Workflow

1. **Intake once.** Ask only questions that change scope, risk, priority, delivery path, or authorization. Record objective, acceptance criteria, out-of-scope behavior, target branch, rollout, and explicit user choices.
2. **Establish the workspace.** Discover repository instructions and artifact conventions. For modifying work, create or select the worktree safely; for investigation, preserve read-only scope. Record exact paths and initial Git state.
3. **Resolve only needed workers.** Configure a planning worker for fast/full work, a review worker only for selected review stages, and an implementation worker only when delegation selects one. Preserve the repository's single `kickoff.yaml`; do not re-ask for a valid selector.
4. **Plan with `plan-it`.** For non-investigation routes, pass the brief, episode state, route, evidence pointers, constraints, and artifact path. Reject a plan that is disproportionate, duplicates the brief, or relies on uncited assumptions.
5. **Review proportionately.** Run `adversarial-review` and `simplicity-review` according to the route. Give each finding a stable ID and record its disposition. Route accepted changes back through `plan-it`; do not rewrite substantive plan content in the orchestrator.
6. **Approve when required.** Full plans require user approval after reviews. Tiny and fast plans proceed once their required reviews and unresolved decisions are clear.
7. **Execute with `ship-it`.** Hand off the accepted plan, episode state, findings, worktree, delivery path, selectors, risks, and validation expectations.
8. **Verify terminal state.** Kickoff is complete only when the episode state records a delivery-path-appropriate terminal status: `investigation-complete`, `ready-to-merge`, `merged`, `delivered-direct`, `canceled`, or `blocked-external`, together with applicable delivery, monitor, and closeout evidence. For a Forest-backed PR expected to be followed through merge, `ready-to-merge` is a milestone rather than the episode terminal state.

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
- It creates or updates the five-minute monitor when automation is available.
- It returns a structured PR record including `monitor_status` and `monitor_id`.
- If monitoring cannot be established, record phase `monitoring`, status `blocked`, and the exact reason; do not report normal completion.

The monitor checks current-head CI, security/policy/code review, mergeability, human comments, and head changes. It stays quiet when nothing actionable changes, applies only authorized scoped fixes, and never merges without explicit permission. For a Forest-managed worktree, a verified merge starts the cleanup-decision phase: ask once whether to close or retain the worktree, stay quiet while the answer is pending, and stop only after the decision and its result are recorded.

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

After a merge is verified, inspect the exact Forest-managed worktree and ask the user once whether they want it closed. If they approve and it has no uncommitted or unpushed work, close it through `forest close`, verify with Forest status that it is gone, and record the result. If they decline, record that it is intentionally retained. If it is dirty or contains unpushed work, do not close it; report the evidence and ask how that work should be handled. The episode is not fully closed out while this choice remains pending.

## Version And Dependency Preflight

Check the installed bundle version once per episode. If a newer compatible bundle exists, offer the update once and require a fresh task after an accepted update. Do not repeatedly prompt after a decline or compare unlike package and skill versions.

Resolve capabilities only for stages the selected route and delivery path will execute: `plan-it` for planning; `adversarial-review` and `simplicity-review` when their review gates apply; `ship-it`, `ponytail-review`, and `code-review` for implementation; and `create-pr` only for PR delivery. Stop before a missing dependent stage, not before unrelated read-only work.
