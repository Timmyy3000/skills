---
name: simplicity-review
description: Independently force an engineering plan toward the least machinery that achieves the requested outcome while preserving constraints and safety controls. Use for full plans, or when a fast/tiny plan introduces material complexity; return reconciled plan feedback, not code changes.
version: 1.0.0
---

# Simplicity Review

Force the plan toward the least machinery that achieves the requested outcome and covers demonstrated risks. Challenge proposed mechanisms without arguing against the user's desired outcome.

## When To Run

- Required for `full` work.
- Required for `fast` or `tiny` work when the plan or adversarial revision adds a material layer, abstraction, dependency, variant, configuration surface, workflow, migration, or coordination mechanism.
- Optional for a lean direct change that only reuses an established path.

Skipping this review must be recorded in the episode state with the route-based reason; it is not silently omitted.

## Inputs And Independence

Use a fresh reviewer on the first entry of the `plan review` role. Pass the brief, revised plan, episode state, complete adversarial findings and dispositions, repository policies, and focused evidence pointers. Do not pass the orchestrator's preferred simplification.

Resolve the reviewer from the `plan review` role per the kickoff skill's `references/config.md`, and map the spawn through its `references/harness.md`. A missing role runs as a fresh child on the parent's model. Never stop to ask the user to configure a reviewer.

The review is read-only. Do not rewrite the plan, implement code, or spawn additional workers. When the harness cannot spawn a child, review inline, label the result non-independent, and record the degraded gate in the episode state.

## Priority

Preserve, in order:

1. the user's desired outcome, acceptance criteria, and explicit constraints;
2. repository policy and established architecture;
3. correctness, security, privacy, data integrity, compatibility, and operational safety;
4. accepted adversarial outcomes;
5. simplicity.

Accepted safeguards are outcomes to preserve, not necessarily mechanisms to preserve. Treat a proposed implementation mechanism as challengeable unless the user explicitly confirms that the mechanism itself is required.

## Method

Trace the real flow first, then run three passes. Stop at the first cheaper option that fully holds.

1. **Delete.** Does the planned item need to exist now? Remove or defer speculative work, parallel paths, scaffolding, flexibility, phases, and validations that serve no current outcome or demonstrated risk.
2. **Reuse.** Prefer, in order, an established repository path, the standard library, a native platform capability, then an already-installed dependency. Do not introduce a parallel solution when one already exists.
3. **Compress.** Inline single-use abstractions and configuration, collapse layers and handoffs, reduce touched surfaces, and select the smallest coherent change at the root cause.

Only then keep new machinery, with a one-sentence statement of the present requirement or risk that earns its cost. Deletion is preferred to addition, but the smallest change in the wrong place is not simplification. Do not weaken correctness, accessibility, security, privacy, integrity, compatibility, or explicit constraints.

Do not repeat adversarial correctness review unless a proposed simplification would affect a safeguard. Limit `Protected Complexity` to non-obvious items whose removal would cause concrete harm; it must not become a defense of the entire plan.

## Output

```markdown
# Simplicity Review
## Verdict
Lean | Simplification recommended | Needs decision | Needs context

## Findings
| ID | Classification | Plan area | What to cut | Replacement | Preserved outcome |
| --- | --- | --- | --- | --- | --- |

## Complexity Delta
- Plan steps/phases: <before> -> <after>
- New layers/abstractions: <before> -> <after>
- New dependencies/services: <before> -> <after>
- New configuration/variants: <before> -> <after>
- Touched surfaces: <before> -> <after>
- Removed or avoided:

## Protected Complexity
- <mechanism and demonstrated reason>

## Plan Feedback
- <specific revision, or none>

## Review Metrics
- Started at:
- Completed at:
- Components challenged:
- Simplify/remove findings:
- Net machinery removed:
- Independent worker: yes | no
```

Use stable IDs such as `SIM-001` and classify findings as `Keep`, `Simplify`, `Remove/Defer`, or `Conflict`. Do not invent numeric deltas when the plan lacks enough detail; use `unknown` and list concrete removals instead.

The caller records a disposition for every `Simplify`, `Remove/Defer`, and `Conflict`, routes accepted feedback through `plan-it`, then checks the revised plan against the findings before implementation. Do not proceed with an unresolved material `Conflict` or an accepted finding missing from the revised plan. A full independent re-review is needed only after a material structural revision; reconciliation itself is mandatory.
