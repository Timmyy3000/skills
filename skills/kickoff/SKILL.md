---
name: kickoff
description: Start an IC engineering workflow from initial intent through planning, independent adversarial and simplicity reviews, implementation, pull request creation, and review monitoring. Use when the user invokes /kickoff or $kickoff, wants to start feature work, bug fixing, improvements, refactors, hotfixes, investigations, or explorations, or asks for either a full human-reviewed plan or a fast agent-reviewed Markdown plan before execution.
---

# Kickoff

Guide an engineer from an initial work idea to a clear brief, proportionate plan, implementation, pull request, and monitored review loop.

Keep this skill thin. Own intake, context capture, planning-mode and implementation-delegation selection, routing, and any required plan approval. Do not duplicate `plan-it`, `adversarial-review`, `simplicity-review`, `ship-it`, `code-review`, or `create-pr`.

## Rules

- Treat `/kickoff` as the user-facing invocation.
- Verify required workflow skills before routing work to them.
- Set up or select one isolated task worktree before writing planning artifacts.
- Create durable context before planning, implementation, or investigation.
- Ask only for information that materially changes scope, risk, priority, or execution.
- Prefer repo evidence over assumptions. Read local instructions, templates, docs, tickets, specs, and nearby code when relevant.
- Use the full planning path by default for substantial, ambiguous, or risky work. After the user approves its reviewed plan, continue through implementation, PR creation, and review monitoring without routine confirmations.
- Use the fast planning path when the user explicitly asks to skip human plan review or when the work is clearly small, bounded, and low risk. Skip only the Lavish artifact and human plan-approval gate; never skip the Markdown plan or independent reviews.
- Do not start implementation until the full-path plan is approved or the fast-path plan has passed adversarial and simplicity review.
- Keep the work brief updated as decisions are made.
- Default implementation delegation to `never`. Use `auto` or `always` only when the user explicitly selects it for this task or has explicitly saved it as the repository default.
- Treat implementation delegation as a `ship-it` execution preference only. It does not disable or alter independent adversarial or simplicity plan reviews.
- Delegate Lavish command selection to `plan-it`. Preserve its configured fork package and do not invoke the published `lavish-axi` package directly from kickoff.
- Escalate from fast to full planning if investigation reveals material ambiguity, broader scope, or risk. If the user explicitly requested no human plan review, keep a Markdown plan and ask only for the specific product, safety, or authorization decision that blocks execution.
- Stop after plan approval only for real blockers: missing credentials, unavailable required systems, destructive actions, broad scope changes, unresolved product decisions, failed external authentication, or explicit user pause.

## Dependency Check

Before starting intake, verify that the required workflow skills are available:

- `plan-it`
- `adversarial-review`
- `simplicity-review`
- `ship-it`
- `code-review`
- `create-pr`

Check the active skill list and common local skill paths:

- The active agent's configured skills directory.
- `~/.agents/skills/<skill-name>`
- `<workspace>/.agents/skills/<skill-name>`
- The current skills repository, when the user is working inside one.

If a required skill is missing:

1. Tell the user which dependency is missing.
2. Do not proceed into a workflow phase that needs the missing dependency unless the user explicitly asks for a partial intake only. `plan-it` is required for full planning; both review skills and the delivery skills are required for either implementation path.
3. Suggest installing the full workflow bundle:

```powershell
npx skills add Timmyy3000/skills --skill kickoff --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr
```

For local testing from this repository, suggest:

```powershell
npx skills add . --skill kickoff --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr --agent <agent-name>
```

If the user only wants an investigation that will not plan, implement, review, or create a PR, `kickoff` may continue without all delivery dependencies after clearly stating the missing skills and limiting the workflow to read-only investigation.

## Worktree Setup

Before creating the work brief, ask for worktree and branch preferences:

- Worktree manager: `forest` or `git`. Recommend `forest` and default to it when the user does not choose.
- Branch/worktree name: ask what the user wants to name the branch or worktree. Default to `auto`, where the agent creates a slug and branch from the work type, title, and repo conventions.
- Base branch or ref, if different from the repo default.

Use one isolated worktree per kickoff effort. Run planning, `adversarial-review`, `simplicity-review`, and `ship-it` from that same worktree so multiple kickoff efforts can happen in parallel without colliding.

### Forest Mode

When using Forest, follow the Forest agent contract:

1. Run `forest status --json` before creating or selecting a worktree. If `--json` is unavailable in the installed Forest version, use `forest status` and avoid scraping more than needed.
2. Never reuse another agent's dirty worktree.
3. Create the worktree with Forest:

```powershell
forest add -b <branch-name> --from <base-ref> --agent <agent-name> --json
```

If the user chose a simple worktree name instead of a branch name, use:

```powershell
forest add <worktree-name> --from <base-ref> --agent <agent-name> --json
```

Omit `--from` when using the repo default base. Use `--fetch` only when the base branch cannot be resolved locally or the user asks to refresh remotes.

4. Read the returned worktree path and do all kickoff work inside that path.
5. Mark activity from inside the worktree:

```powershell
forest mark --phase working --agent <agent-name> --note "kickoff planning"
```

6. Do not remove Forest worktrees manually. Cleanup must go through `forest close` only when the user asks or the work is proven integrated.
7. If Forest reports inconsistent state, run `forest doctor --json` and report the findings rather than repairing state manually.

When Forest is missing, tell the user and ask whether to install Forest, switch to ordinary git worktrees, or continue without a worktree for a read-only investigation.

### Git Worktree Mode

When the user chooses ordinary git, use Git directly and keep the same isolation principle:

1. Inspect `git status --short --branch` and `git worktree list --porcelain`.
2. Choose or confirm a branch name.
3. Choose or confirm a worktree path by repo convention. If none exists, ask before creating a new convention.
4. Create the worktree:

```powershell
git worktree add -b <branch-name> <worktree-path> <base-ref>
```

If the branch already exists, omit `-b` and add the branch directly.

Do not use ordinary git cleanup commands for Forest-managed worktrees.

## Folder Convention

Before writing any kickoff files, discover where the target repo already stores agent or planning artifacts.

Choose the first matching convention:

1. Explicit repo instructions in `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `CLAUDE.md`, contributing docs, planning guides, or existing templates.
2. Existing plan folders such as `docs/agent-plans/`, `docs/plans/`, `plans/`, `planning/`, or `agent-plans/`.
3. Existing agent workspace folders. Prefer whichever already exists in the target repo:
   - `.agents/`
   - `.agent/`
4. If both `.agents/` and `.agent/` exist, use the one that already contains planning, workflow, or task files. If unclear, ask the user before creating new files.
5. If no convention exists, ask before creating one. Suggest `.agent/kickoff/` as the conservative default because it is local, hidden, and clearly agent-owned.

Do not create `.agent/` or `.agents/` merely because this skill mentions them. Follow the target repo's existing convention first.

## Task Workspace

After selecting the folder convention and before writing the work brief, establish the task-workspace path used for temporary coordination artifacts.

- Prefer an existing per-task workspace convention when the repository has one.
- Otherwise use the directory selected for the work brief without inventing another nested convention.
- Keep the task workspace inside the kickoff-provided worktree.
- Record the exact path in the work brief and hand it to `ship-it`.
- Keep it available through planning, reviews, implementation, integration, and PR readiness. Let `ship-it` clean up only temporary artifacts it clearly owns; preserve durable plans and repository-required records.

## Intake

Classify the work as one of:

- `feature`: new user-facing or system capability.
- `bug`: broken, regressed, flaky, or incorrect behavior.
- `improvement`: measurable upgrade to UX, performance, reliability, cost, developer experience, or operability.
- `refactor`: internal restructuring where behavior should stay the same.
- `hotfix`: urgent production fix with compressed planning and validation.
- `investigation`: understand how something works, why behavior occurs, where logic lives, or what options exist before deciding whether to change code.
- `exploration`: spike, feasibility check, prototype, or unknown-scope research.

Ask for the smallest useful set of answers:

- Work name or short title.
- Work type if not obvious.
- Objective and reason this matters.
- Desired timeline or production target date, if any.
- Known constraints, owners, dependencies, and affected repos.
- Existing specs, tickets, docs, screenshots, logs, metrics, or links.
- Implementation delegation: `never`, `auto`, or `always`.
- Planning mode: `auto`, `full`, or `fast`.
- Worktree manager: `forest` recommended, or ordinary `git`.
- Branch/worktree name: user-provided name or `auto`.
Ask the user for initial input once, then proceed with sensible defaults unless a blocker or first-use worker prerequisite appears. Do not repeatedly pause for preferences that can be inferred safely.

Implementation delegation meanings:

- `never`: do not spawn implementation workers. This is the default when no explicit task choice or saved repository preference exists.
- `auto`: allow `ship-it` to decide from the accepted plan. Lean toward delegation when the work contains bounded independent tasks, but avoid it when coordination would cost more than it saves.
- `always`: require `ship-it` to delegate at least one bounded implementation task when the active harness supports workers.

Offer these choices during initial intake without making the user answer. If the user does not choose, resolve the current task from the saved repository preference and otherwise use `never`.

Accept `subagents` as a legacy alias for `always` and `solo` as a legacy alias for `never`, but record only the current names.

### Lasting Delegation Default

Recognize explicit durable instructions such as:

- "Always use subagents" -> save `always`.
- "Never use subagents" -> save `never`.
- "Choose subagents automatically" -> save `auto`.

Store the repository default only after such an explicit lasting instruction. Use the repo's discovered agent-workspace convention and write `kickoff.yaml` under that root, for example `.agents/kickoff.yaml` or `.agent/kickoff.yaml`:

```yaml
version: 1
implementation_delegation_default: "always"
```

This is the workflow's only repository-owned orchestration configuration file; harness-native worker definitions remain separate. The review skills may add harness-specific selectors under `plan_review.workers`, and `ship-it` may add implementation selectors under `ship_it.workers`, when those workers are actually used. Kickoff must preserve both sections when changing the lasting default.

Do not create `.agent/` or `.agents/` solely for this setting without following the Folder Convention rules. Do not add empty `plan_review` or `ship_it` sections before a worker is configured. A task-specific choice overrides the saved default without changing it.

Resolve the current task in this order: explicit task-specific choice, then saved repository default, then `never`.

Record both the resolved value and its source in the work brief. This preference controls only how `kickoff` hands implementation to `ship-it`; the review skills independently resolve their dedicated worker under `plan_review.workers`.

Planning mode meanings:

- `auto`: choose `fast` only when the work is small, clear, bounded, and low risk; otherwise choose `full`.
- `full`: create a Lavish-backed plan through `plan-it`, run both independent reviews, and ask the user to approve the reviewed plan.
- `fast`: create a concise Markdown plan, run both independent reviews, skip Lavish and the human plan-approval gate, then continue directly to `ship-it`.

Honor an explicit request for `fast` planning even when the work is larger, but state the risk and keep the internal plan and reviews proportional to the actual scope. Fast planning never bypasses approval for destructive actions, credentials, external side effects, unresolved product decisions, or other actions that require user authority.

## Work Brief

Create or update a markdown work brief after choosing the correct folder convention.

Use this filename pattern:

`<work-slug>.md`

Use this structure:

```markdown
# <Work Name>

## Status

- Type:
- Implementation delegation:
- Delegation source:
- Review worker:
- Planning mode:
- Worktree manager:
- Branch:
- Worktree path:
- Task workspace:
- Created:
- Target date:
- Current phase:

## Objective

## Context

## Requirements

## Acceptance Criteria

## Evidence And Sources

## Decisions

## Risks

## Open Questions

## Plan

## Execution Notes
```

For investigations, replace `Requirements` with `Questions To Answer` and replace `Acceptance Criteria` with `Done Criteria`.

Use absolute dates when discussing timeline feasibility. Compare any target date with the current date and state whether the timeline looks feasible, risky, or unrealistic based on known scope and validation needs.

## Type-Specific Questions

For `feature`, ask:

- Who is the user or system actor?
- What workflow should exist when this is done?
- What are the must-have requirements?
- What is explicitly out of scope?
- What permissions, states, edge cases, and failure modes matter?
- How should this be rolled out, measured, documented, or supported?
- What would make the feature unacceptable even if it technically works?

For `bug`, ask:

- What happened, and what should have happened instead?
- Who or what is affected?
- How severe is the impact?
- Can it be reproduced? If yes, what are the exact steps and environment?
- When was it first noticed?
- Are there logs, screenshots, traces, failing tests, or suspect commits?
- Is a small hotfix needed, or can this follow the normal planning flow?

For `improvement`, ask:

- What is the current pain or baseline?
- What metric, behavior, or experience should improve?
- What target outcome would count as success?
- How will before/after be measured?
- What tradeoffs are acceptable?
- Which areas are suspected to matter, and which areas are out of scope?

For `refactor`, ask:

- What code, boundary, or system needs to change?
- What behavior must remain unchanged?
- What is the payoff: maintainability, performance, testability, reliability, or future work?
- What tests or checks prove behavior is preserved?
- Are migrations, compatibility concerns, or rollout risks involved?
- What files or systems should not be touched?

For `hotfix`, ask:

- What is the production impact?
- How urgent is the fix, and what is the target release window?
- What is the smallest acceptable fix?
- Is there a rollback or mitigation available?
- What validation is required before release?
- Who needs to approve or be informed?

For `investigation`, ask:

- What question are we trying to answer?
- What prompted the investigation?
- What code paths, systems, docs, tickets, logs, or user reports may be relevant?
- What would count as a satisfactory answer?
- Should the output be an explanation, a recommendation, a diagram, a follow-up plan, or a proposed implementation?
- Is code change allowed, or is this read-only until the user decides?

For `exploration`, ask:

- What hypothesis or option are we testing?
- What is the timebox?
- What evidence is needed to decide?
- Is a prototype acceptable?
- What should happen after the spike: plan, implement, discard, or document?

## Planning Mode Selection

Choose the planning mode after inspecting enough repository evidence to understand the likely scope.

In `auto`, choose `fast` only when all of these are true:

- The expected behavior and acceptance criteria are clear.
- The change is bounded to a narrow area and can follow established repository patterns.
- No unresolved product, architecture, permission, security, data-migration, or compatibility decision exists.
- No broad refactor, public contract change, destructive operation, or cross-repo rollout is expected.
- Validation is concrete and rollback or reversion is straightforward.

Work type alone does not qualify a change for fast planning. A bug or performance improvement may still require the full path when its blast radius or solution is uncertain.

Record the selected mode and reason in the work brief. When `auto` selects `fast`, report the choice but do not pause for confirmation. Upgrade to `full` if later evidence invalidates the fast-path criteria.

## Planning Handoff

Once the brief has enough context, create the plan required by the selected mode.

### Full Planning

Invoke `plan-it` to create the Lavish-backed review artifact.

Pass `plan-it`:

- Work brief path.
- Task-workspace path.
- Work type and implementation-delegation preference.
- Source docs, specs, links, and evidence.
- Timeline constraints.
- Non-negotiables.
- Open questions that should appear as decision points.

### Fast Planning

Create a concise Markdown plan in the work brief's `Plan` section or a sibling plan file when the repository already has that convention. Do not create a Lavish artifact or invoke `plan-it` merely to produce HTML.

Include only:

- Objective and bounded scope.
- Simplest viable approach and why it fits repository conventions.
- Expected files or systems affected.
- Acceptance criteria.
- Focused validation commands or checks.
- Material risks, rollback, and unresolved decisions.

Mark it as an internal fast-path plan and continue directly into independent review without asking the user to review it.

Require the plan to include type-specific validation:

- Features need acceptance coverage, state coverage, and rollout notes.
- Bugs need reproduction, regression coverage where practical, and fix verification.
- Improvements need before/after measurement.
- Refactors need behavior-preservation checks and rollback notes.
- Hotfixes need minimized scope, release risk, validation, and rollback notes.
- Investigations need evidence sources, findings format, confidence level, and recommended next steps.
- Explorations need timebox, decision criteria, and follow-up paths.

For pure investigations, do not force full planning unless the investigation is large enough to need a reviewable plan. A concise investigation brief plus final findings may be enough.

## Adversarial Plan Review

Before simplicity review or user approval, invoke `adversarial-review` through its configured dedicated worker in a fresh session when the environment supports workers. Let the review skill resolve or bootstrap `plan_review.workers` for the active harness; kickoff must not choose a different worker or persist worker settings itself.

Pass only:

- The `adversarial-review` skill.
- The work brief path and contents.
- The plan artifact or plan text.
- Relevant source specs, tickets, logs, docs, screenshots, and code references.
- A short instruction to review the plan for readiness and return structured findings.
- The active harness, task-workspace path, and existing `kickoff.yaml` path when available, so the review skill can resolve its worker without relying on conversation history.

Do not pass expected findings, private conclusions, or the intended fix. The review must be independent.

Read the adversarial review output and resolve `Blocker` and `Major` findings before simplicity review. In full planning, feed accepted `Plan Feedback For Revision` back into `plan-it`. In fast planning, revise the Markdown plan directly. Update the work brief with each meaningful finding's accepted, rejected, or risk-accepted disposition and rationale.

If a fresh agent session is unavailable, run `adversarial-review` in the current session and clearly state that the review was not independent.

Check for:

- Missing or vague acceptance criteria.
- Requirements not represented in phases.
- Unrealistic timeline or sequencing.
- Missing reproduction or regression coverage for bugs.
- Missing baseline or measurement plan for improvements.
- Refactor scope that changes behavior without an explicit decision.
- Investigation outputs that do not answer the original question.
- Hidden dependencies, migrations, permissions, data integrity, rollout, or rollback risks.
- Validation commands that are absent, too broad, or too weak.

If meaningful gaps exist, revise the plan or ask targeted questions. Do not proceed to simplicity review until blocker and major findings are resolved, explicitly accepted as risk, or converted into tracked follow-up work.

## Simplicity Plan Review

After adversarial findings have been reconciled and the plan has been revised, invoke `simplicity-review` through the same configured `plan_review.workers` selector in a new fresh session when supported. The selector may match or differ from `ship_it.workers`, but both review stages use the same review entry by default.

Pass only:

- The `simplicity-review` skill.
- The original work brief and acceptance criteria.
- The revised plan artifact or Markdown plan.
- The complete adversarial-review output and the disposition of each meaningful finding.
- Relevant repository instructions, conventions, source documents, and code references.
- A short instruction to find unnecessary complexity while preserving every required outcome and accepted risk control.
- The active harness, task-workspace path, and existing `kickoff.yaml` path when available.

Do not pass expected simplifications or the calling agent's preferred architecture. The reviewer should independently trace proposed complexity to requirements, repository policy, demonstrated risk, or accepted adversarial concerns.

Read the simplicity review output and reconcile every `Simplify`, `Remove/Defer`, and `Conflict` finding. In full planning, feed accepted `Plan Feedback For Revision` back into `plan-it`. In fast planning, revise the Markdown plan directly. Record protected complexity and the rationale for rejected suggestions in the work brief.

The simplicity reviewer may replace an adversarial review's proposed remedy with a simpler one only when it preserves the same required safeguard. It must not silently remove the underlying concern.

If a material `Conflict` remains, ask only for the owner decision needed to resolve it. If a fresh session is unavailable, run `simplicity-review` in the current session and state that the review was not independent.

Re-run simplicity review only when revisions materially change architecture, scope, or risk controls. Avoid review loops over wording or optional polish.

## Plan Approval And Continuation

After both reviews are complete, continue according to the selected planning mode.

For full planning, ask the user to approve or revise the reviewed plan. This is the normal approval point before implementation.

If the user approves, immediately invoke `ship-it` and keep the workflow moving through implementation, local review, PR creation, and PR monitoring.

If the user requests revisions, update the brief and send the feedback through `plan-it` before asking for plan approval again.

For fast planning, do not ask the user to approve the internal Markdown plan. Record that both reviews passed, report that implementation is starting, and immediately invoke `ship-it`.

If the user asks to continue investigating, keep the workflow in investigation mode and update the brief with findings.

If the user asks to defer, stop and record the current state in the brief.

Do not add extra approval gates after full-path approval or fast-path internal review. Ask again only when required by a real blocker, destructive action, credential/auth issue, product decision, first-use review or implementation worker configuration selected by the user, or explicit user instruction.

## Execution Handoff

When the full-path plan is approved or the fast-path plan passes both reviews, invoke `ship-it` and provide:

- Accepted Lavish plan path or reviewed Markdown plan path.
- Work brief path.
- Adversarial and simplicity review decisions.
- Review-worker selector and configuration source when one was resolved.
- Worktree manager, branch, and worktree path.
- Implementation delegation and its source.
- Repository `kickoff.yaml` path when one exists.
- Planning mode.
- Target branch or base branch if known.
- Validation expectations.
- Known risks and open questions.

Let `ship-it` run the implementation loop to completion, including branch prep, Red/Green TDD, commits, validation, `code-review`, `create-pr`, pull request creation, a 5-minute review monitor, code review bot checks, CI checks, and review feedback fixes.

Kickoff is not complete when the PR is opened. It is complete only when `ship-it` reports that the PR is ready to merge, merged, explicitly canceled, or blocked by a concrete external condition.

## Output Back To The User

At each phase transition, report:

- Current phase.
- Work brief path.
- Planning mode and why it was selected.
- Implementation delegation and whether it came from the task, repository, or fallback default.
- Plan path when created, identifying it as Lavish or internal Markdown.
- Open decisions that need the user.
- Next skill being invoked and why.
