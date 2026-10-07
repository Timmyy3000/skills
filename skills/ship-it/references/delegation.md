# Delegated Implementation

Use this reference only when `ship-it` resolves implementation delegation to `always` or when `auto` selects workers.

## Worker Resolution

Resolve the worker from the `code role for the playbook (`feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`, or `hardest tasks`)` role per the kickoff skill's `references/config.md`. A missing role runs as a fresh child on the parent's model; never stop to ask the user to configure a worker. Map the spawn primitive through the kickoff skill's `references/harness.md`.

`implementation_delegation_default` in `kickoff.yaml` stores a lasting `never`, `auto`, or `always`. If the harness cannot spawn workers, `auto` continues in the orchestrator and records it, and `always` records the gate as degraded and continues in the orchestrator.

## Auto-Mode Decision

Lean toward delegation when one or more bounded tasks can run without blocking the orchestrator. Before choosing a single packet, inspect the accepted plan for additional dependency-ready lanes that can run concurrently, especially when:

- Two or more tasks are dependency-ready and own separate files or systems.
- A focused implementation, test, documentation, migration-verification, or read-heavy task can run independently.
- Parallel execution reduces elapsed time without increasing integration risk.

Keep execution with the orchestrator when:

- The change is a single tiny edit.
- Candidate tasks modify the same files or shared contract.
- The next task depends immediately on unresolved output from the first.
- Task-packet creation and integration cost more than the work itself.

Record the auto decision and brief rationale in the work brief before implementation.

## Task Workspace

Reuse the task-workspace path handed off by kickoff or the repository's established agent-work convention. Do not place temporary worker artifacts beside a durable plan merely because it is nearby.

Create only the coordination artifacts needed for this task:

```text
<task-workspace>/
├── execution-manifest.md
└── worker-results/
```

Reference rather than duplicate the accepted plan, work brief, adversarial review, simplicity review, and repository instructions.

## Execution Manifest

Make the manifest the contract between orchestrator and workers:

```markdown
# Execution Manifest

## Shared Context

- Work brief: <path>
- Accepted plan: <path>
- Adversarial review or dispositions: <path or brief section>
- Simplicity review or dispositions: <path or brief section>
- Repository instructions: <paths>

## Task <ID>

### Objective

### Dependencies

### Owned Files Or Systems

### Required Context

- Ponytail skill at `full` intensity; accepted requirements and safeguards take precedence.

### Acceptance Criteria

### Validation

### Required Result

- Files changed
- Tests and results
- Assumptions
- Blockers
- Integration notes
```

Create the smallest useful number of tasks, but prefer separate packets for genuinely independent workstreams with non-overlapping ownership and explicit integration contracts. A substantial plan should not collapse into one worker merely because one worker could technically do everything. Do not split work merely to maximize worker count.

## Dispatch Contract

For each dependency-ready task:

- Spawn the resolved role entry. A named agent runs without model or reasoning overrides.
- Prefer a fresh worker context where supported.
- Pass the task ID, manifest path, brief path, plan path, relevant review findings, applicable repository instructions, and exact task-workspace or worktree path.
- Tell the worker to read those artifacts before editing.
- Open the brief with the kickoff skill's `references/delegate-brief.md`, and require the worker to invoke Ponytail Full and confirm activation before editing.
- Give exclusive file or system ownership.
- Prohibit scope expansion, unrelated edits, additional worker spawning, and silent architecture changes.
- Require the structured result listed in the manifest.

Do not rely on the orchestrator's conversation history as worker context. Durable artifacts and explicit work packets are the source of truth.

Run only independent tasks concurrently. Use sequential waves for dependencies and close completed worker sessions when they are no longer needed.

## Integration Contract

The orchestrator must:

1. Inspect each worker's result and actual diff.
2. Reject or correct work outside the assigned scope.
3. Resolve integration conflicts and shared decisions itself.
4. Run targeted validation after each accepted task.
5. Run integrated repository validation after all tasks land.
6. Record worker outcomes and any rejected assumptions in the work brief.

Worker-reported tests are evidence, not a substitute for orchestrator validation.

## Cleanup

Preserve:

- Accepted plans and repository-required planning archives.
- Work briefs and decisions the repository treats as durable.
- `kickoff.yaml` and any harness-native worker profiles it names.

Remove temporary `execution-manifest.md` and `worker-results/` only when all are true:

- They were created by the current `ship-it` run.
- They are not tracked or required by repository policy.
- The PR is ready, merged, canceled, or the user explicitly requests cleanup.
- Their exact paths have been verified inside the intended task workspace.

Never use broad recursive cleanup against an unresolved path. If ownership or retention is unclear, leave the artifacts and report them.
