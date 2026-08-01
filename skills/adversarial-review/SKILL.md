---
name: adversarial-review
description: Run an independent adversarial review of an engineering work brief, implementation plan, investigation output, or delivery proposal. Use when a workflow needs a fresh-agent critique before accepting a plan, especially from $kickoff after $plan-it creates a plan. Produces structured findings that can be fed back into planning, not implementation changes.
---

# Adversarial Review

Review a proposed plan or finding set from a skeptical, evidence-driven perspective. The output is meant to be read by the calling workflow and fed back into planning before execution.

Do not implement fixes. Do not rewrite the plan unless explicitly asked. Identify gaps, contradictions, weak assumptions, missing validation, and risks.

## Fresh Session Rule

When this skill is invoked by another workflow, prefer a fresh agent session when the environment supports it.

The calling workflow should pass only:

- This skill.
- The work brief.
- The plan, investigation output, or proposal under review.
- Relevant source specs, tickets, logs, screenshots, docs, or code references.
- The specific question to answer.

Avoid passing the calling agent's private conclusions, intended fixes, or expected findings. The point is an independent review, not confirmation.

## Review Goals

Evaluate whether the plan or proposal is good enough to proceed.

Look for:

- Requirements missing from the plan.
- Acceptance criteria that are vague, untestable, or absent.
- Phases that do not map back to the objective.
- Hidden dependencies, sequencing issues, or cross-repo coordination gaps.
- Risks around data integrity, permissions, migrations, rollout, rollback, performance, observability, support, and operations.
- Test plans that are missing, too broad, too narrow, or not tied to risk.
- Unproven assumptions or source material that was not used.
- Timeline claims that do not match scope or validation needs.
- Places where the plan is overbuilt for the stated goal.
- Places where the plan is under-scoped for production readiness.

## Work-Type Lenses

For `feature` work, challenge:

- User workflow coverage.
- Permission, empty, loading, error, retry, and edge states.
- Rollout, analytics, documentation, and support needs.
- Whether the plan describes what users can actually do when complete.

For `bug` work, challenge:

- Whether the bug is reproduced before fixing.
- Whether expected behavior is stated clearly.
- Whether there is a regression test or equivalent verification.
- Whether the fix could mask symptoms without addressing cause.
- Whether severity and release urgency match the proposed path.

For `improvement` work, challenge:

- Whether the baseline is known.
- Whether the target outcome is measurable.
- Whether the measurement method can prove before/after change.
- Whether tradeoffs are explicit.
- Whether the plan confuses activity with improvement.

For `refactor` work, challenge:

- Whether behavior-preservation boundaries are explicit.
- Whether tests prove no behavior changed.
- Whether the refactor scope is too broad.
- Whether rollout or migration risk exists despite "no behavior change" claims.

For `hotfix` work, challenge:

- Whether the plan is small enough for urgency.
- Whether rollback and mitigation paths are credible.
- Whether validation is sufficient for production risk.
- Whether follow-up cleanup is tracked separately.

For `investigation` work, challenge:

- Whether the stated question is actually answered.
- Whether evidence is cited and traceable.
- Whether confidence level is clear.
- Whether unknowns and follow-up questions are explicit.
- Whether recommended next steps are justified by the evidence.

For `exploration` work, challenge:

- Whether the timebox is clear.
- Whether decision criteria are clear.
- Whether prototype work is isolated from production work.
- Whether the output can support a decision.

## Severity

Classify findings:

- `Blocker`: proceeding is likely to fail, produce the wrong outcome, or create serious production/review risk.
- `Major`: should be fixed before execution unless the user explicitly accepts the risk.
- `Minor`: useful improvement, clarification, or tightening.
- `Question`: needs user or owner input.

Do not inflate severity. A finding is only a blocker when it materially prevents responsible execution.

## Output Format

Return only a structured review:

```markdown
# Adversarial Review

## Verdict

<Ready / Needs revision / Blocked>

## Findings

| Severity | Area | Finding | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Blocker/Major/Minor/Question | <area> | <specific issue> | <brief source reference> | <actionable next step> |

## Missing Questions

- <question that must be answered, if any>

## Plan Feedback For Revision

- <specific change to feed back into the plan>

## Confidence

<High / Medium / Low> - <one sentence reason>
```

If there are no meaningful findings, say `Ready` and explain the residual risk or test gap in one sentence.

## Handoff Back To Caller

The calling workflow should read this output, update the work brief with accepted findings, and feed `Plan Feedback For Revision` back into the planner. After revising the plan and recording finding dispositions, pass the revised plan, this complete review, and those dispositions to `simplicity-review` before approval or execution.
