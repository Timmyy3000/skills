---
name: adversarial-review
description: Independently challenge an engineering brief, plan, investigation, or delivery proposal for correctness, missing requirements, unsafe assumptions, and inadequate validation. Use before execution when risk or workflow policy warrants a fresh review; produce findings for plan revision, never implementation changes.
version: 0.6.0
---

# Adversarial Review

Decide whether the proposed work can responsibly proceed. Find material gaps; do not manufacture findings or redesign the product.

## Independence And Context

Use a fresh configured `plan_review.workers.<harness>` session when available. Pass only the brief, plan, episode state, relevant evidence pointers, repository instructions, and the review question. Do not pass the orchestrator's suspected findings or the full conversation.

Use the repository's existing agent-workspace convention and single `kickoff.yaml`. A selector under `plan_review.workers.<harness>` contains exactly one of: an exact harness-native `agent`, or a direct `model` with optional `reasoning_effort` when named workers are unsupported. Honor an explicit current choice, validate a saved selector before use, and never substitute a worker silently. If missing, discover available native workers before asking the user to select or configure one, then update only the active harness entry while preserving every other key.

The review is read-only. The worker must not edit files, implement fixes, or spawn more workers. Under Kickoff, an unavailable independent worker sets the review phase to `needs-input` or `blocked` until the user chooses a valid worker or explicitly accepts a non-independent fallback. In standalone use, current-session review is allowed only after the same explicit acceptance and must be labeled non-independent.

## When Required

- Always for `full` work.
- For `fast` work.
- For `tiny` work only when route assessment finds material ambiguity, blast radius, consequence, irreversibility, novelty, or coordination—or repository policy requires it.

Assess risk in the work's own domain. Include user journeys, interaction and content states, visual-system consistency, accessibility, trust, compatibility, performance, data and security, delivery, and operations when relevant; do not default to backend concerns.

## Review Method

Trace the plan against the objective and acceptance criteria. Challenge:

- missing user, interaction, content, or operational states;
- unverified repository assumptions;
- behavior, presentation, accessibility, trust, security, privacy, integrity, performance, and compatibility boundaries;
- cross-repository sequencing and ownership;
- adoption or migration, rollout, rollback, observability, and failure recovery;
- tests that cannot prove the claimed behavior;
- scope that is too large or too small for the outcome.

Inspect only enough repository evidence to confirm or reject a finding. Do not perform another general planning sweep.

## Findings

Give each finding a stable ID such as `ADV-001`.

- `Blocker`: proceeding is likely to cause a wrong or unsafe result.
- `Major`: resolve before execution unless the owner explicitly accepts the risk.
- `Minor`: useful tightening that does not block.
- `Question`: a material owner decision is missing.

Do not inflate severity. Do not repeat the same root issue as several findings.

## Output

```markdown
# Adversarial Review
## Verdict
Ready | Needs revision | Blocked

## Findings
| ID | Severity | Area | Evidence | Impact | Required plan change |
| --- | --- | --- | --- | --- | --- |

## Missing Owner Decisions
- <decision or none>

## Residual Risk
- <risk remaining even after revision>

## Review Metrics
- Started at:
- Completed at:
- Evidence opened:
- Findings by severity:
- Independent worker: yes | no
```

The caller records every finding and disposition in the episode state, then sends only accepted changes back to `plan-it`. Re-review only after a material plan change.
