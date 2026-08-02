# Delegated Implementation

Use this reference only when `ship-it` resolves implementation delegation to `always` or when `auto` selects workers.

## Single Kickoff Configuration

Use one repo-level `kickoff.yaml` for this workflow:

- `implementation_delegation_default` optionally stores the user's lasting preference: `never`, `auto`, or `always`.
- `ship_it.workers` stores harness-specific implementation-worker profiles only after delegated implementation needs one.

Use the agent-workspace root already selected by repository instructions and kickoff, such as `.agents/` or `.agent/`. Do not create either convention blindly.

Example worker configuration:

```yaml
version: 1
implementation_delegation_default: "auto"
ship_it:
  workers:
    codex:
      model: "<harness-native-model-id>"
      reasoning_effort: "<optional-harness-native-level>"
      profile: "<optional-native-worker-profile>"
    claude-code:
      model: "<harness-native-model-id>"
      profile: "<optional-native-worker-profile>"
    opencode:
      model: "<provider/model-id>"
```

The lasting default is optional, and `ship_it` is optional until a worker is configured. Never create the file or an empty section merely because fallback mode is `never`. Store only worker settings under `ship_it`; the current session is the orchestrator and must not be persisted as a model choice.

Treat model identifiers, reasoning settings, and profile names as opaque harness-native values. A profile for one harness must not overwrite another harness's entry.

## First-Use Worker Bootstrap

When the current harness has no worker entry and delegation will be used:

1. Identify the active harness and its available subagent mechanism.
2. Determine whether it supports direct per-spawn model selection, requires a named worker definition, or lacks model-selectable workers.
3. Ask the user which worker model to use. Ask for a reasoning level only when the harness supports one.
4. Explain the native worker definition or configuration that must be created, including its path or scope.
5. After the user confirms the worker choice, create the smallest required native worker definition and add the harness entry under `ship_it.workers` in `kickoff.yaml`, preserving its other keys and harness entries.
6. Validate that the model and worker can actually be selected before dispatching implementation.

Do not ask the user to choose an orchestrator model. Do not create worker profiles for harnesses they are not currently using.

Revalidate the saved active-harness worker before each delegated run. If it is unavailable or invalid, do not substitute another worker silently. Ask for a replacement, repair its harness-native definition when required, and update only the active harness entry.

If the harness cannot spawn workers:

- In `auto`, record that delegation was unavailable and continue with the orchestrator.
- In `always`, stop and ask the user to switch the task to `never` or `auto`, configure a supported worker mechanism, or use a supporting harness.

## Auto-Mode Decision

Lean toward delegation when one or more bounded tasks can run without blocking the orchestrator, especially when:

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

### Acceptance Criteria

### Validation

### Required Result

- Files changed
- Tests and results
- Assumptions
- Blockers
- Integration notes
```

Create the smallest useful number of tasks. Do not split work merely to maximize worker count.

## Dispatch Contract

For each dependency-ready task:

- Spawn the configured worker using the active harness's native mechanism.
- Prefer a fresh worker context where supported.
- Pass the task ID, manifest path, brief path, plan path, relevant review findings, applicable repository instructions, and exact task-workspace or worktree path.
- Tell the worker to read those artifacts before editing.
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
- `kickoff.yaml` and required harness-native worker profiles.

Remove temporary `execution-manifest.md` and `worker-results/` only when all are true:

- They were created by the current `ship-it` run.
- They are not tracked or required by repository policy.
- The PR is ready, merged, canceled, or the user explicitly requests cleanup.
- Their exact paths have been verified inside the intended task workspace.

Never use broad recursive cleanup against an unresolved path. If ownership or retention is unclear, leave the artifacts and report them.
