---
name: ship-it
description: Execute an accepted engineering plan through implementation, integrated validation, code review, pull request creation, active review monitoring, and verified closeout. Use after Kickoff approval/review or when the user explicitly asks to ship an existing plan.
version: 0.5.0
---

# Ship It

Own execution from an accepted plan to a recorded terminal delivery state. Do not reopen settled product decisions unless new repository evidence creates a material conflict.

## Required Handoff

Read the accepted plan, brief, episode state, finding dispositions, worktree, intended base branch and delivery path, validation expectations, and implementation-delegation decision. If any disagree, stop and reconcile the durable artifacts before editing.

After compaction or interruption, recover from the episode state and current Git/PR state. Do not reconstruct the task from chat memory.

If the user corrects scope, architecture, branch target, validation, monitoring, or closeout during execution, record the correction in episode state before continuing. Reconcile the brief or plan when affected, invalidate only the stale validation/review phases, and never make the user repeat the decision.

## Implementation Delegation

Resolve `never`, `auto`, or `always` from explicit task choice, saved repository default, then workflow default. Configure `ship_it.workers.<harness>` only when a worker will be used.

When `auto` selects workers or the mode is `always`, read [references/delegation.md](references/delegation.md) for selector bootstrap, execution manifests, bounded dispatch, integration, and temporary-artifact cleanup.

- `never`: implement in the orchestrator.
- `auto`: delegate only when bounded non-overlapping work saves more time than packet/integration cost.
- `always`: delegate at least one bounded task or stop if the configured worker is unavailable.

Workers receive paths to the brief, plan, episode state, findings, repository instructions, and a small execution manifest. Never send the full conversation. The orchestrator owns shared schemas, sequencing, integration, and final validation.

## Workflow

1. Verify worktree, branch, base, and dirty state. Preserve unrelated work.
2. Map implementation steps to accepted plan items and finding IDs.
3. Implement the smallest compliant change, using test-first work when practical.
4. Inspect every worker diff and reject scope expansion.
5. Run targeted checks during implementation and integrated repository/acceptance validation at the final head SHA.
6. Run a dedicated `ponytail-review` on the complete implementation diff, then run the separate correctness-focused `code-review`. Both passes are required for every non-empty implementation diff.
7. Apply or explicitly disposition every Ponytail finding. Resolve P0/P1 code-review findings; resolve or explicitly disposition P2 findings. Update episode state.
8. For a PR delivery path, invoke `create-pr` with the intended base, accepted artifacts, final validation, risks, and monitor requirement. For an explicitly authorized direct path, use the direct-delivery contract below.
9. Verify that the returned delivery record matches the intended local/remote refs and contains the applicable monitor evidence or a concrete blocker.
10. Continue the review loop until terminal state, then perform closeout.

## Two-Pass Implementation Review

Keep the passes separate so neither objective is diluted:

1. `ponytail-review` receives the final diff, brief, accepted plan, and repository instructions—not the full conversation. It reviews only for removable code, duplicated paths, reinvention, speculative abstraction or flexibility, unnecessary dependencies, and opportunities to shrink. Preserve requirements and safeguards. Record its output and estimated net removable lines in episode state.
2. `code-review` reviews the same head SHA for correctness, behavior, regression, accessibility, security/privacy, compatibility, reliability, and test coverage. It must not treat the Ponytail pass as correctness evidence.

If Ponytail finds nothing, record `Lean already. Ship.` If it finds something, apply it or record a concrete reason the machinery is required. Re-run the affected validation after changes. Re-run both passes when the implementation changes materially; do not repeat them for comments, formatting, or metadata-only edits.

If `ponytail-review` is unavailable, record phase `code-review`, status `blocked`, and the missing capability as the blocking condition rather than silently folding simplicity into the normal code review.

## Direct Delivery Contract

Use a no-PR path only when the user's current instruction explicitly authorizes it and repository policy permits it. Reconfirm the target branch, remote, exact commit set, current-head validation, and both review dispositions immediately before delivery. Deliver without rewriting shared history, then read back the remote target SHA and any required CI, deployment, or promotion state. Record status `delivered-direct` only when the intended remote state is verified; otherwise record status `blocked` with the exact mismatch or external condition.

Do not invoke `create-pr` for direct delivery. Establish a branch or deployment monitor only when the delivery contract requires one and the available automation can observe the relevant state. After direct integration is verified, use the same Forest close-or-retain decision described in Closeout.

## Atomic PR And Monitor Gate

PR creation is incomplete until all are recorded:

- PR URL and number;
- head/base branches and head SHA;
- initial mergeability/check state;
- `monitor_status: active` and monitor ID, or `blocked` with exact reason;
- terminal condition.

If the user asks “are you monitoring?”, verify the live automation record. Do not answer from intention, a todo list, or a previous one-time poll.

For actionable review or CI feedback, confirm it applies to the current head, make only an authorized scoped fix, validate, push, update the state, and keep monitoring. Never merge without explicit permission.

## Delivery States

- `ready-to-merge`: current head is mergeable, required checks/reviews pass or are intentionally absent, and no actionable findings remain. This is terminal only when the accepted delivery path ends at PR readiness; for a Forest-backed episode being followed through merge, it is a milestone and monitoring continues quietly.
- `merged`: merge and final SHA are verified; the episode becomes terminal after required Forest close-or-retain disposition and other closeout evidence are recorded.
- `delivered-direct`: the explicitly authorized remote target and final SHA are verified without a PR, with required delivery monitoring and closeout complete.
- `canceled`: user or repository owner explicitly canceled the work.
- `blocked-external`: a concrete external condition prevents progress and is recorded with the required next actor/action.

An open PR with pending checks is not terminal.

## Closeout

Record final validation, PR state, deployment/promotion state when applicable, unresolved limitations, durable artifact locations, task-record reconciliation, temporary artifact cleanup, and worktree disposition.

Close a Forest worktree only through Forest and only when integration is proven or the user/repository policy authorizes closure. A squash merge may require explicit remote evidence; do not mistake ancestry mismatch for unmerged work.

When a merge is verified and the Forest worktree still exists, inspect its Forest and Git status, then ask the user whether to close it. On approval, refuse closure if uncommitted or unpushed work remains; otherwise run `forest close` for the resolved worktree, verify its removal with Forest status, and record the evidence. If the user chooses to keep it, record `retained` so it is an intentional exception rather than forgotten cleanup. Do not issue the final closeout while the choice is still pending.

Return a compact final report from the episode state. Do not leave a monitor running after the episode's actual terminal condition. A merged PR with a pending Forest close-or-retain decision is not yet terminal; after that decision is recorded, stop the monitor unless the user explicitly requested further monitoring.
