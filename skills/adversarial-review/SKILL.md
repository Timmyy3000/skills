---
name: adversarial-review
description: Independently challenge an engineering brief, plan, investigation, or delivery proposal for correctness, missing requirements, unsafe assumptions, and inadequate validation. Use before execution when risk or workflow policy warrants a fresh review; produce findings for plan revision, never implementation changes.
version: 1.0.0
---

# Adversarial Review

Decide whether the proposed work can responsibly proceed. Find material gaps; do not manufacture findings or redesign the product.

## Independence And Context

Use a fresh reviewer for every round. For `full` work, run a panel: one reviewer per entry in the `plan review` role, on different providers when the catalog has them, each seeded identically. Merge their findings, dedupe by root cause, and note where reviewers agreed, since cross-model agreement is high-signal. `fast` work uses the first entry. Pass only the brief, plan, episode state, relevant evidence pointers, repository instructions, and the review question. Do not pass the orchestrator's suspected findings or the full conversation.

Resolve the reviewer from the `plan review` role per the kickoff skill's `references/config.md`, and map the spawn through its `references/harness.md`. A missing role runs as a fresh child on the parent's model. Never stop to ask the user to configure a reviewer.

The review is read-only. The worker must not edit files, implement fixes, or spawn more workers. When the harness cannot spawn a child, review inline, label the result non-independent, and record the degraded gate in the episode state.

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
