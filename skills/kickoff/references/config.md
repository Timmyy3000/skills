# kickoff.yaml

One optional file per repository, in its agent-workspace convention (`.agents/`, `.agent/`, or the root), or `~/.agents/kickoff.yaml` globally. A project file wins over the global one. No file is a valid configuration: every role runs as a fresh child task on the parent's model. `kickoff-setup` writes it. No other skill asks the user to configure a worker.

```yaml
version: 2
budget: large (xhigh)                    # unlimited | large | medium | small, and its effort
implementation_delegation_default: auto  # never | auto | always
roles:
  t3:                                    # entries: <providerInstanceId>/<model> (<effort>)
    planning: codex/gpt-6.1-sol (xhigh)
    plan review: [claudeAgent/claude-opus-5-5 (high), codex/gpt-6.1-sol (xhigh)]
    code review: inherit-parent
    feature, refactoring: grok/grok-build
    judgment and prose: claudeAgent/claude-opus-5-5 (high)
  codex:                                 # entries: agent:<named-agent> or <model> (<effort>)
    planning: agent:sol_planning_worker
    plan review: agent:sol_review_worker
    feature, refactoring: agent:sol_execution_worker
  claude-code:                           # entries: agent:<subagent_type>, a model alias, or both
    plan review: agent:general-purpose opus
```

## Roles

Workflow gates: `planning`, `plan review`, `code review`.

Code work, by playbook: `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, and `hardest tasks` for cross-cutting design, gnarly concurrency, and subtle algorithms.

Judgment: `judgment and prose`, `how explorer`, `how explainer`, `why investigators`, `why synthesizer`, `reflect tooling`, `reflect judgment, divergent, synthesizer`.

Panels (lists, one worker per entry): `plan review`, `arena runners`, `arena cross-judge pool`, `architect runners`, `interrogate reviewers`. `swarm workers` is the default worker model for a swarm.

## Resolution

1. An explicit choice in the current task wins.
2. Then `roles.<harness>.<role>` from the nearest file.
3. Then `inherit-parent`. The role still runs as a fresh, independent child. Only the model is shared.

Validate an entry against the harness catalog (`orchestrator_capabilities` in T3) before dispatch. An invalid entry falls back to `inherit-parent` for this episode, and the episode state records the fallback. Never stop the episode to ask about a model.

## Migrating version 1

A `version: 1` file still resolves: `plan_it.workers.<h>` is `planning`, `plan_review.workers.<h>` is `plan review`, and `ship_it.workers.<h>` fills every code role. A selector `agent: X` becomes `agent:X`. A selector `model: M` with `reasoning_effort: E` becomes `M (E)`. `kickoff-setup` rewrites the file as version 2 and preserves every unrelated key.
