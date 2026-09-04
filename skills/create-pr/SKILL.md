---
name: create-pr
description: Validate a delivery branch, create or update its pull request against the intended base, and atomically establish review monitoring. Use when shipping changes through PR or when Ship It delegates PR creation; return a structured PR and monitor record.
version: 0.5.0
---

# Create PR

Create the correct PR and establish its review monitor. PR creation is not complete until the target and monitor are verified.

## Delivery Contract

Require:

- repository, remote, head branch, intended base branch, and delivery path;
- brief, accepted plan, and episode-state paths when available;
- final head SHA and validation results;
- review finding dispositions and known limitations;
- whether monitoring is required or explicitly not applicable.

Resolve the base in this order: explicit current user instruction, accepted episode decision, repository release policy, then normal integration branch. If sources conflict, stop instead of guessing. Never infer that `prod`, `staging`, or a fast-lane branch is interchangeable with another target.

## Preflight

1. Read repository PR/release instructions and template.
2. Verify current branch, remote, base, divergence, dirty/staged files, and commits included.
3. Confirm the final validation and code review apply to the current head SHA.
4. Refuse unrelated staged files or an unsafe protected-branch source unless explicitly authorized.
5. Push the intended branch without rewriting shared history unless explicitly authorized.

## PR Creation

Create or update one PR with repository-required sections plus:

- objective and scope;
- accepted plan/brief links;
- implementation summary;
- validation commands/results tied to the head SHA;
- P0–P2 dispositions;
- rollout/rollback and known limitations;
- delegated-work summary when relevant.

After creation, read the live PR and verify URL, number, head, base, head SHA, mergeability, and initial checks. If head/base is wrong, correct it when the intended target is unambiguous and safe; otherwise stop for the owner decision.

## Monitor Creation

When automation is available and monitoring is required, create or update a five-minute monitor before returning. Its saved prompt must:

- identify repository, PR, expected head/base, worktree, accepted plan, and episode state;
- verify current-head CI, security/policy/code review, mergeability, comments, and head changes;
- stay quiet while state is unchanged and non-actionable;
- apply only authorized scoped fixes, validate, push, update episode state, and continue;
- after any material implementation fix, rerun affected validation, run `ponytail-review` and disposition its findings, then run `code-review` against the new head before reporting the PR ready;
- never merge without explicit permission;
- notify once at `ready-to-merge`, then continue quietly when a Forest worktree must be followed through merge;
- on verified merge, ask once in the owner task whether to close or retain the exact Forest worktree, record the pending choice, and stay quiet until the user answers;
- never close a worktree itself without the user's answer; stop at `ready-to-merge` when the accepted delivery path ends there, at verified `merged` when no cleanup decision remains, after a Forest close/retain result when that cleanup is tracked, or at `canceled` or `blocked-external`.

Read the created automation back when supported. A planned monitor, todo item, or one-time status check does not satisfy this gate.

If automation is unavailable or creation fails, return `monitor_status: blocked` with the exact reason. Do not describe the PR handoff as complete.

## Output

```markdown
# Pull Request Record
- Status: ready | blocked
- PR URL/number:
- Head/base:
- Head SHA:
- Mergeability:
- Checks/reviews:
- Monitor required: yes | no
- Monitor status: active | not-applicable | blocked
- Monitor ID:
- Monitor terminal condition:
- Episode state updated: yes | no
- Remaining blocker:
```

The caller must verify `monitor_status` before advancing. Standalone use follows the same rule when automation tools are available.
