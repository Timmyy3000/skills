---
name: simplicity-review
description: Run an independent simplicity review of an engineering work brief and revised implementation plan after adversarial review. Use when a workflow needs a fresh-agent check for overengineering before plan approval or implementation while preserving requirements, accepted risk controls, and repository policies. Produce structured simplification findings, not implementation changes.
---

# Simplicity Review

Review a proposed plan for unnecessary complexity after its correctness and risk gaps have been challenged. Seek the least complicated solution that fully satisfies the current problem.

Do not implement changes or rewrite the plan. Return evidence-backed recommendations to the calling workflow.

## Fresh Session And Inputs

Run this review in a fresh agent session when the environment supports it. Fresh means independent, not blind.

Require the calling workflow to pass:

- This skill.
- The original work brief and acceptance criteria.
- The revised plan under review.
- The adversarial-review output and the disposition of each meaningful finding.
- Relevant repository instructions, conventions, source documents, and code references.
- A short instruction to assess whether the plan solves the problem with the least necessary complexity.

Do not accept the calling agent's private conclusions, expected findings, or preferred simplifications. Read the supplied evidence and inspect referenced repository files before judging the plan.

If required inputs are missing, return `Needs context` and list only the missing material.

## Review Priority

Apply this order of precedence:

1. Explicit requirements and acceptance criteria.
2. Repository policies and established conventions.
3. Correctness, security, data integrity, compatibility, and operational safety.
4. Accepted adversarial-review concerns.
5. Simplicity and implementation economy.

Treat an accepted adversarial concern as an outcome that must remain protected, not necessarily as an implementation that must be preserved verbatim. Recommend a simpler mitigation only when it addresses the same concern. Never silently remove a requirement, repository constraint, risk control, or accepted finding to make the plan smaller.

## Review Method

Trace every proposed component, abstraction, dependency, phase, migration, configuration option, and cross-system interaction to at least one of:

- A current requirement or acceptance criterion.
- A demonstrated risk or failure mode.
- A repository policy or established local pattern.
- An accepted adversarial-review concern.

Challenge items that lack that traceability. Look especially for:

- New abstractions, services, layers, or dependencies where an existing pattern is sufficient.
- Speculative scale, reuse, extensibility, configurability, or edge cases not required now.
- Broad refactors bundled into a focused feature, bug fix, or improvement.
- Parallel mechanisms, compatibility paths, flags, or fallbacks without a concrete need.
- Excessive phase splitting or coordination overhead for a small change.
- Validation work that is duplicative rather than risk-based.
- Custom infrastructure that recreates repository capabilities.

Do not equate fewer files or fewer lines with better design. Keep complexity that reduces real risk, follows the codebase's architecture, or makes the required behavior clearer and safer.

For each concern, identify the smallest alternative that preserves behavior, constraints, and validation. Prefer deferring unrelated work over expanding the current scope.

## Classification

Classify each reviewed item as:

- `Keep`: The complexity is justified. Preserve it.
- `Simplify`: The same required outcome can be achieved with less machinery.
- `Remove/Defer`: The item has no demonstrated current value or belongs in separate follow-up work.
- `Conflict`: Simplification would weaken a requirement or risk control, or the supplied inputs disagree and need an owner decision.

Do not manufacture findings to appear useful. A lean plan may receive a `Lean` verdict with no simplification findings.

## Output Format

Return only a structured review:

```markdown
# Simplicity Review

## Verdict

<Lean / Simplification recommended / Needs decision / Needs context>

## Findings

| Classification | Plan area | Evidence | Recommendation | Preserved outcome |
| --- | --- | --- | --- | --- |
| Keep/Simplify/Remove or Defer/Conflict | <item> | <requirement, policy, risk, or source> | <specific action> | <behavior or safeguard retained> |

## Protected Complexity

- <non-obvious complexity that must remain and why>

## Plan Feedback For Revision

- <specific revision for the calling planner>

## Residual Risk

- <risk that remains after the recommended simplification>

## Confidence

<High / Medium / Low> - <one sentence reason>
```

Include only meaningful `Keep` items in `Protected Complexity`; do not inventory the whole plan. If the verdict is `Lean`, state why in one sentence and leave revision feedback empty.

## Handoff Back To Caller

Require the calling workflow to reconcile every `Simplify`, `Remove/Defer`, and `Conflict` finding. Feed accepted revision feedback back into the planner, preserve protected complexity, and record rejected feedback with a reason.

Do not start implementation while a material `Conflict` remains unresolved. Re-run this review only when revisions materially change the architecture, scope, or risk controls.
