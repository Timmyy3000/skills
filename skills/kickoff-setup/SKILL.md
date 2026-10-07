---
name: kickoff-setup
description: Configure which models kickoff uses per role and at what reasoning budget. Detects the current harness and its available models, migrates a version 1 kickoff.yaml, and writes kickoff.yaml version 2. Use for /kickoff-setup, "configure kickoff models", "kickoff budget", or changing kickoff's model choices.
version: 1.0.0
disable-model-invocation: true
---

# Kickoff setup

Write `kickoff.yaml` per the kickoff skill's [`references/config.md`](../kickoff/references/config.md), which owns the schema, the role list, and resolution. Setup is optional. Without it, every role runs as a fresh child on the parent's model.

## Steps

### 1. Choose the location

Default to the repository's agent-workspace convention when it has one, else the project root. Offer `~/.agents/kickoff.yaml` as the global option. A project file wins over the global one.

### 2. Detect the harness and its models

Use the kickoff skill's `references/harness.md` to name the harness. Then list what it can actually run:

- **T3 Code.** Call `orchestrator_capabilities`. Each entry is `<providerInstanceId>/<model>` with its reasoning options.
- **Claude Code.** The Agent tool's model aliases and the available `subagent_type` names.
- **Codex.** The configured named agents.

That list is the only source. Never write an entry it did not return. `inherit-parent` is always valid.

### 3. Load current state

Read an existing file. For `version: 1`, convert it per config.md's Migrating section and keep every unrelated key. Treat its budget and role values as the current choices. Drop roles config.md no longer lists, and report them.

### 4. Budget, map, and confirm

**(a) Budget.** Ask plainly, naming the current one when recorded: `unlimited — keep max`, `large — xhigh reasoning`, `medium — high reasoning`, `small — medium reasoning`.

**(b) Map.** On a fresh run, give the code roles, the explorer, investigator, and swarm roles the fastest strong coding model detected. Give `planning`, `judgment and prose`, `hardest tasks`, the explainer, the synthesizers, and `reflect tooling` the most capable model detected. Fill each panel role, `plan review` included, with one entry per distinct provider detected, up to three. Leave `code review` as `inherit-parent` unless the user picks otherwise. On a re-run, keep any role the user changed.

Set each entry's effort from the budget when the catalog exposes options: `unlimited` takes the highest, and `large`, `medium`, `small` take `xhigh`, `high`, `medium`. The ladder is `max` > `xhigh` > `high` > `medium` > `low`. If the target is missing, use the highest option below it. A named agent takes no effort token; its definition owns its settings.

**(c) Confirm.** Show every role and its entry, mark any entry not detected, and list dropped roles. Ask whether to accept or change specific roles, offering the detected entries plus `inherit-parent`.

### 5. Validate and write

Every entry must come from step 2 under the harness it came from. Write only the current harness's section under `roles`, and preserve every other harness section and key. Rewriting the same choices produces the same file.

### 6. Confirm

Say where the file was written and that it applies to new sessions.

### 7. Offer a verification skill (optional)

If the project has no way to drive the real app for proof (a `verify-*` skill or an existing harness), offer once to generate one with `/create-verification-skill`. On no, move on.
