# Harness map

Kickoff and every skill it routes to name T3 Code's tools. Detect the harness once per episode, record it in the episode state, and map each primitive through this table. Use the first row that the harness actually exposes. Probe a tool by calling it once; a missing tool in an initial catalog scan is not proof it is absent.

| Primitive (T3 name) | T3 Code | Claude Code | Codex | Nothing available |
| --- | --- | --- | --- | --- |
| Delegate a child task: `delegate_task`, `task_status`, `task_cancel` | as named, models from `orchestrator_capabilities` | Agent tool (`subagent_type`, `model`), background by default, `SendMessage` only for a live worker | the harness's subagent or named-agent spawn | run inline, label the result non-independent |
| Model catalog: `orchestrator_capabilities` | as named | the Agent tool's model enum (`fable`, `opus`, `sonnet`, `haiku`) | named agents and their definitions | the current model only |
| Isolated worktree: `t3_thread_launch` with `workspaceStrategy`, `t3_worktree_handoff` | as named | `EnterWorktree`, or Agent `isolation: "worktree"` for a worker | `git worktree add`, or Forest when the repository uses it | `git worktree add` |
| Watch a PR: `watch_pull_request`, `unwatch_pull_request` | as named, then end the turn | a recurring scheduler job (`CronCreate`, `/loop`) every five minutes | a saved automation every five minutes | one `gh` status pass, record the watch as `blocked` |
| Register a PR: `link_pull_request`, `list_thread_pull_requests` | as named | skip, record the URL in the episode state | skip, record the URL | skip, record the URL |
| Recurring work: `schedule_task` | as named | `CronCreate` (session-scoped, expires after seven days) | a saved automation | none, record the cadence as a follow-up |
| Thread memory: `t3_thread_read`, `t3_thread_search` | as named | the session transcript, then repository artifacts | the session history, then repository artifacts | repository artifacts |
| Prove a browser UI: `preview_*` | as named | the built-in or Chrome browser tools | the harness browser | a headless script (Playwright) run through the shell |
| Prove a mobile UI: `device_*` | as named | the simulator CLI (`xcrun simctl`, `adb`) | the simulator CLI | the simulator CLI |

## Rules

- A degraded primitive is recorded in the episode state with the row used and its consequence, for example "plan review ran inline, non-independent". Never silently drop the gate it served.
- A scheduler-based watch saves a self-contained prompt that names the repository, PR, expected head and base, worktree, episode state, and the Babysit mode. It stays quiet while nothing actionable changed and deletes itself at the episode's terminal condition.
- One writer per worktree in every harness. A second writer gets its own worktree.
- Role resolution: read `roles.<harness>.<role>` from `kickoff.yaml`. A missing file, harness, or role means `inherit-parent`, which runs the role on the current model. Setup is never required. See `kickoff-setup`.
- A panel role (a list) runs one worker per entry. In a harness with one model, a panel of identical entries still buys independence, not diversity. Say so in the reply.
