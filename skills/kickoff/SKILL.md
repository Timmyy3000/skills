---
name: kickoff
description: Start an IC engineering workflow from initial intent through plan approval, implementation, pull request creation, and review monitoring. Use when the user invokes /kickoff or $kickoff, wants to start feature work, bug fixing, improvements, refactors, hotfixes, investigations, explorations, or asks for a guided workflow that creates a work brief, gathers requirements, routes to $plan-it, reviews the plan adversarially, then continues through $ship-it after plan approval.
---

# Kickoff

Guide an engineer from an initial work idea to a clear brief, accepted plan, implementation, pull request, and monitored review loop.

Keep this skill thin. Own intake, context capture, routing, and plan approval. Do not duplicate `plan-it`, `adversarial-review`, `ship-it`, `code-review`, or `create-pr`.

## Rules

- Treat `/kickoff` as the user-facing invocation.
- Verify required workflow skills before routing work to them.
- Set up or select an isolated task worktree before writing planning artifacts when the user wants parallel workflow support.
- Create durable context before planning, implementation, or investigation.
- Ask only for information that materially changes scope, risk, priority, or execution.
- Prefer repo evidence over assumptions. Read local instructions, templates, docs, tickets, specs, and nearby code when relevant.
- Treat plan approval as the normal user approval point. After the user approves the plan, continue through implementation, PR creation, and review monitoring without stopping for routine confirmations.
- Do not start implementation until the user approves the plan or explicitly asks to fast-track a small change.
- Keep the work brief updated as decisions are made.
- If the work is tiny and low risk, offer a fast path instead of forcing the full workflow.
- Stop after plan approval only for real blockers: missing credentials, unavailable required systems, destructive actions, broad scope changes, unresolved product decisions, failed external authentication, or explicit user pause.

## Dependency Check

Before starting intake, verify that the required workflow skills are available:

- `plan-it`
- `adversarial-review`
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
2. Do not proceed into the full kickoff workflow until the missing dependency is installed, unless the user explicitly asks for a partial intake only.
3. Suggest installing the full workflow bundle:

```powershell
npx skills add Timmyy3000/skills --skill kickoff --skill adversarial-review --skill plan-it --skill ship-it --skill code-review --skill create-pr
```

For local testing from this repository, suggest:

```powershell
npx skills add . --skill kickoff --skill adversarial-review --skill plan-it --skill ship-it --skill code-review --skill create-pr --agent <agent-name>
```

If the user only wants an investigation that will not plan, implement, review, or create a PR, `kickoff` may continue without all delivery dependencies after clearly stating the missing skills and limiting the workflow to read-only investigation.

## Worktree Setup

Before creating the work brief, ask for worktree and branch preferences:

- Worktree manager: `forest` or `git`. Recommend `forest` and default to it when the user does not choose.
- Branch/worktree name: ask what the user wants to name the branch or worktree. Default to `auto`, where the agent creates a slug and branch from the work type, title, and repo conventions.
- Base branch or ref, if different from the repo default.

Use one isolated worktree per kickoff effort. Run `plan-it`, `adversarial-review`, and `ship-it` from that same worktree so multiple kickoff efforts can happen in parallel without colliding.

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
- Execution mode: `auto`, `subagents`, or `solo`.
- Worktree manager: `forest` recommended, or ordinary `git`.
- Branch/worktree name: user-provided name or `auto`.
Ask the user for initial input once, then proceed with sensible defaults unless a blocker appears. Do not repeatedly pause for preferences that can be inferred safely.

Execution mode meanings:

- `auto`: decide whether subagents are useful based on scope, uncertainty, and risk.
- `subagents`: use subagents where available for independent planning, review, or validation.
- `solo`: keep the workflow single-agent unless blocked.

Default execution mode to `auto` when the user does not choose.

## Work Brief

Create or update a markdown work brief after choosing the correct folder convention.

Use this filename pattern:

`<work-slug>.md`

Use this structure:

```markdown
# <Work Name>

## Status

- Type:
- Execution mode:
- Worktree manager:
- Branch:
- Worktree path:
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

## Planning Handoff

Invoke `plan-it` once the brief has enough context to produce a useful plan.

Pass `plan-it`:

- Work brief path.
- Work type and execution mode.
- Source docs, specs, links, and evidence.
- Timeline constraints.
- Non-negotiables.
- Open questions that should appear as decision points.

Require the plan to include type-specific validation:

- Features need acceptance coverage, state coverage, and rollout notes.
- Bugs need reproduction, regression coverage where practical, and fix verification.
- Improvements need before/after measurement.
- Refactors need behavior-preservation checks and rollback notes.
- Hotfixes need minimized scope, release risk, validation, and rollback notes.
- Investigations need evidence sources, findings format, confidence level, and recommended next steps.
- Explorations need timebox, decision criteria, and follow-up paths.

For pure investigations, do not force `plan-it` unless the investigation is large enough to need a reviewable plan. A concise investigation brief plus final findings may be enough.

## Adversarial Plan Review

Before presenting the plan as ready, invoke `adversarial-review` in a fresh agent session when the environment supports fresh sessions.

Pass only:

- The `adversarial-review` skill.
- The work brief path and contents.
- The plan artifact or plan text.
- Relevant source specs, tickets, logs, docs, screenshots, and code references.
- A short instruction to review the plan for readiness and return structured findings.

Do not pass expected findings, private conclusions, or the intended fix. The review must be independent.

Read the adversarial review output and feed its `Plan Feedback For Revision` back into `plan-it` when findings are `Blocker` or `Major`. Update the work brief with accepted findings, decisions, and unresolved risks.

If a fresh agent session is unavailable, run `adversarial-review` in the current session and clearly state that the review was not independent.

The review should challenge:

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

If meaningful gaps exist, revise the plan or ask targeted questions. Do not ask the user to approve execution until blocker and major plan-review findings are resolved, explicitly accepted as risk, or converted into tracked follow-up work.

## Plan Approval And Continuation

After planning or investigation review, ask the user to approve or revise the plan. This is the normal approval point before implementation.

If the user approves, immediately invoke `ship-it` and keep the workflow moving through implementation, local review, PR creation, and PR monitoring.

If the user requests revisions, update the brief and send the feedback through `plan-it` before asking for plan approval again.

If the user asks to continue investigating, keep the workflow in investigation mode and update the brief with findings.

If the user asks to defer, stop and record the current state in the brief.

Do not add extra approval gates after plan approval. Ask again only when required by a real blocker, destructive action, credential/auth issue, product decision, or explicit user instruction.

## Execution Handoff

When the user approves the plan, invoke `ship-it` and provide:

- Accepted plan path or Lavish artifact path.
- Work brief path.
- Worktree manager, branch, and worktree path.
- Execution mode.
- Target branch or base branch if known.
- Validation expectations.
- Known risks and open questions.

Let `ship-it` run the implementation loop to completion, including branch prep, Red/Green TDD, commits, validation, `code-review`, `create-pr`, pull request creation, a 5-minute review monitor, code review bot checks, CI checks, and review feedback fixes.

Kickoff is not complete when the PR is opened. It is complete only when `ship-it` reports that the PR is ready to merge, merged, explicitly canceled, or blocked by a concrete external condition.

## Output Back To The User

At each phase transition, report:

- Current phase.
- Work brief path.
- Plan path when created.
- Open decisions that need the user.
- Next skill being invoked and why.
