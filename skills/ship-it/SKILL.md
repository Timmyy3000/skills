---
name: ship-it
description: Execute an accepted engineering plan through implementation, integrated validation, code review, pull request creation, active review monitoring, and verified closeout. Use after Kickoff approval/review or when the user explicitly asks to ship an existing plan.
version: 0.6.0
---

# Ship It

Own execution from an accepted plan to a recorded terminal delivery state. Do not reopen settled product decisions unless new repository evidence creates a material conflict.

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

## Required Handoff

Read the accepted plan, brief, episode state, finding dispositions, worktree, intended base branch and delivery path, validation expectations, and implementation-delegation decision. If any disagree, stop and reconcile the durable artifacts before editing.

After compaction or interruption, recover from the episode state and current Git/PR state. Do not reconstruct the task from chat memory.

If the user corrects scope, architecture, branch target, validation, monitoring, or closeout during execution, record the correction in episode state before continuing. Reconcile the brief or plan when affected, invalidate only the stale validation/review phases, and never make the user repeat the decision.

## Implementation Delegation

Resolve `never`, `auto`, or `always` from explicit task choice, saved repository default, then `auto`. The default applies only when the active harness permits delegation; explicit user or harness restrictions take precedence. Configure `ship_it.workers.<harness>` only when a worker will be used.

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
5. Run targeted checks during implementation and integrated repository/acceptance validation at the final head SHA. Reuse evidence for unchanged content and environment; repeat affected checks after fixes or integration, not merely because a new workflow stage starts.
6. Select and record the review mode below. Tiny low-risk diffs may use one focused review covering simplicity and correctness; other non-empty diffs require dedicated `ponytail-review` followed by `code-review`.
7. Apply or explicitly disposition every simplicity finding from the selected review mode. Resolve P0/P1 code-review findings; resolve or explicitly disposition P2 findings. Update episode state.
8. For a PR delivery path, invoke `create-pr` with the intended base, accepted artifacts, final validation, risks, and monitor requirement. For an explicitly authorized direct path, use the direct-delivery contract below.
9. Verify that the returned delivery record matches the intended local/remote refs and contains the applicable monitor evidence or a concrete blocker.
10. Continue the review loop until terminal state, then perform closeout.

## Implementation review

Use `combined` only for a tiny, established-pattern diff with no material
ambiguity, security/data risk, compatibility impact, or coordination, and only
when repository policy permits it. The focused `code-review` must check both
unnecessary machinery and correctness; record the reason and findings. A missing
Ponytail installation does not block this route. Reassess the mode if scope grows.

Use `separate` for other non-empty diffs or when required by the user or repository:


1. `ponytail-review` receives the final diff, brief, accepted plan, and repository instructions—not the full conversation. It reviews only for removable code, duplicated paths, reinvention, speculative abstraction or flexibility, unnecessary dependencies, and opportunities to shrink. Preserve requirements and safeguards. Record its output and estimated net removable lines in episode state.
2. `code-review` reviews the same head SHA for correctness, behavior, regression, accessibility, security/privacy, compatibility, reliability, and test coverage. It must not treat the Ponytail pass as correctness evidence.

If Ponytail finds nothing, record `Lean already. Ship.` If it finds something, apply it or record a concrete reason the machinery is required. Re-run the affected validation after changes. Re-run the selected review mode when the implementation changes materially; do not repeat them for comments, formatting, or metadata-only edits.

When separate review is required and `ponytail-review` is unavailable, record phase `code-review`, status `blocked`, and the missing capability as the blocking condition rather than silently folding simplicity into the normal code review.

## Direct Delivery Contract

Use a no-PR path only when the user's current instruction explicitly authorizes it and repository policy permits it. Verify the target branch, remote, exact commit set, current-head validation, and applicable review dispositions immediately before delivery. Verification is a tool check, not another user confirmation when authorization is already clear. Deliver without rewriting shared history, then read back the remote target SHA and any required CI, deployment, or promotion state. Record status `delivered-direct` only when the intended remote state is verified; otherwise record status `blocked` with the exact mismatch or external condition.

Do not invoke `create-pr` for direct delivery. Establish a branch or deployment monitor only when the delivery contract requires one and the available automation can observe the relevant state. After direct integration is verified, use the same Forest close-or-retain decision described in Closeout.

## Atomic PR And Monitor Gate

PR creation is incomplete until all are recorded:

- PR URL and number;
- head/base branches and head SHA;
- initial mergeability/check state;
- when monitoring is required, `monitor_status: active` and monitor ID, or `blocked` with exact reason; otherwise `not-applicable` with its authorization basis;
- terminal condition.

Record whether integration is proven by Git ancestry, verified patch/aggregate equivalence against the intended base, or exact merged PR head evidence. When relying on a merged PR, verify its repository, number, head SHA, base branch, and merged state against the worktree being closed; separately prove any additional commits integrated. A missing upstream tracking ref alone does not prove unpublished work. Exact merged PR head evidence can establish publication, but stale or unmatched evidence cannot bypass Forest's dirty or integration safeguards.

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

At closeout, re-inspect the exact Forest worktree and current owner, then resolve the latest applicable explicit task or saved user close-or-retain decision and record its source. For temporary retention, record the owner and revisit trigger (`review/testing complete` or `merge`), then hand off that revisit to a named owner/follow-up or keep an applicable authorized monitor until the trigger; an actively running worktree cannot close.

When Forest closeout is in scope, record each closure CLI's command name, resolved executable path, and reported version in episode state. Before `forest close`, enumerate ignored names (for example, `git ls-files --others --ignored --exclude-standard`), inspect only relevant names established by repository instructions or targeted checks, preserve relevant unique evidence/config at an authorized durable location, verify copied contents by hash, and record names and hashes without printing secret contents.

With verified integration and no uncommitted or unpushed work, run `forest close` and record Forest state, `git worktree list --porcelain`, and the exact disk path. A partial or unverified close remains `closure-blocked`; retain the owner, content, branch, and monitor and record the failed surface. If the stored Forest base is missing or unresolvable, block closure; restore a locally resolvable base only when already authorized, rerun Forest close checks, and do not guess or rewrite Forest state from PR metadata. Preserve unresolved changes and any retained decision; ask once only when closure authority is missing. Do not issue final closeout while a required decision or closure remains pending.

Return a compact final report from the episode state. Do not leave a monitor running after the episode's actual terminal condition. A merged PR with unresolved cleanup, including a temporary-retention revisit still owned by this task, is not yet terminal. Stop the monitor after verified close, permanent retention, or an explicit revisit handoff unless the user requested further monitoring. Do not create a monitor when monitoring is out of scope.
