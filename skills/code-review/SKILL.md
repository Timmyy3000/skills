---
name: code-review
description: Review the current branch or pull-request diff for actionable correctness, security, reliability, regression, and test issues before PR creation or after material fixes. Use a fresh reviewer when change risk or size justifies independence; report evidence-backed findings only.
version: 0.5.0
---

# Code Review

Review only changes introduced by the target diff. Prioritize defects that can affect behavior or safe delivery; omit generic style advice and pre-existing issues.

This is the correctness-focused second pass after `ponytail-review`. Do not duplicate its complexity audit, and do not assume that a short diff is correct merely because the Ponytail pass accepted it.

## Inputs

- Head and base refs plus final head SHA.
- Changed files, commits, and whether uncommitted changes are included.
- Brief, accepted plan, episode state, and relevant finding dispositions when part of Kickoff.
- Applicable repository instructions and PR title/body when available.

Stop if the diff is empty, the base cannot be determined, or unrelated staged changes make the review boundary unsafe.

## Reviewer Selection

Use an isolated reviewer when the diff has material ambiguity, blast radius, consequence, irreversibility, novelty, or coordination cost. Assess those dimensions in the change's own domain—including user experience, visual systems, accessibility, compatibility, performance, data/security, and delivery—not by a backend-only checklist. For a tiny low-risk diff, a focused orchestrator review is sufficient unless repository policy requires independence.

Seed an isolated reviewer with the diff and durable artifacts, not the implementation conversation.

## Passes

1. Repository-policy and accepted-plan compliance.
2. Concrete behavior, interaction, logic, and state-transition tracing.
3. Failure modes relevant to the product: empty/loading/error/offline/boundary states, interruption, partial failure, and cleanup.
4. Accessibility, user trust, security, privacy, and integrity boundaries.
5. Consumer, platform, browser/device, visual-system, and rollout compatibility where relevant.
6. Tests for consequential new behavior and regressions.

Use history or sibling code only when it clarifies an introduced invariant. Verify findings before reporting them.

## Findings

Report only findings with confidence at least 70/100:

- `P0`: critical safety, security, privacy, data-loss, user-harm, or widespread release-breaking defect.
- `P1`: high-confidence serious bug or required-policy violation.
- `P2`: meaningful edge case or missing risky validation that should normally be fixed.
- `P3`: non-blocking improvement; omit unless the caller explicitly requests nits.

Give every finding a stable ID such as `CR-001`. Do not split one root cause into several findings.

## Output

```markdown
# Code Review
- Head/base/SHA:
- Files reviewed:
- Independent reviewer: yes | no
- Started/completed at:

## Findings
| ID | Priority | Confidence | File:line | Evidence and impact | Suggested fix |
| --- | --- | --- | --- | --- | --- |

## Coverage Checked
- <areas checked>
```

If no finding qualifies, say so and list the risky areas checked. The caller records dispositions in episode state and repeats review only after material logic changes.
