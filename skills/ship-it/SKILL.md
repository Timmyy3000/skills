---
name: ship-it
description: End-to-end coding workflow for starting and shipping a defined product or engineering problem from plan to pull request readiness. Use when the user says "Ship it", asks the agent to start work on a problem, execute an agreed plan, create or review a missing plan, create a feature branch, implement with Red/Green TDD and frequent commits, open a PR using the create-pr skill, and monitor Enkii/code review feedback until the PR is ready to merge.
---

# Ship it

Use this skill when the user wants the agent to take a problem from kickoff through PR readiness.

## Workflow

1. Confirm the problem and plan source.
   - If the user references an agreed plan, find and read it.
   - If no plan exists, create one before implementation.
   - Create new plans as styled HTML artifacts, not plain markdown-only plans.
   - Use the existing repo plan templates for structure and required information, then express that structure as HTML.
   - Include visualizations, charts, diagrams, state maps, or lightweight interactions when they materially help explain architecture, data flow, rollout, tradeoffs, or implementation phases.
   - Keep visuals purposeful; do not add animation or interaction when a short section or table is clearer.
   - Review the plan for scope, acceptance criteria, affected repos, validation, rollout, and risks.
   - Do not start implementation until the plan is concrete enough to execute.

2. Prepare the repo.
   - Identify the affected repo or repos.
   - If the task was handed off from `kickoff` with a worktree path, continue inside that worktree.
   - If the handoff says Forest is managing the worktree, use Forest status/mark commands and do not remove or manually rewrite Forest worktree state.
   - Check current branch and working tree.
   - Preserve unrelated user changes.
   - Create a feature branch following repo conventions only when a suitable branch was not already created by the kickoff worktree setup.
   - For Docsyde repos, prefer `ft/<feature-name>`, `fix/<bug-name>`, or `hot/<urgent-fix>` unless the repo says otherwise.

3. Implement with Red/Green TDD.
   - Start each meaningful behavior change with a failing test when practical.
   - Red: write or update the smallest test that proves the missing behavior or regression.
   - Green: implement the smallest scoped change that makes the test pass.
   - Refactor: clean up only after the test is passing, keeping the diff focused.
   - If a test-first approach is impractical, state why and use the smallest equivalent validation before changing code.
   - Prefer regression tests for bugs and acceptance-path tests for features.

4. Implement in phases.
   - Maintain a short todo list.
   - Map each phase back to the plan.
   - After each meaningful phase:
     - verify changed files are still in scope;
     - run the smallest useful validation;
     - commit intentional changes only.
   - Commit frequently with clear messages.
   - Include the correct `Co-authored-by:` trailer when the agent materially contributed and the repo requires it.
   - When working in a Forest worktree, update activity with `forest mark --phase working --note "<current phase>"` at meaningful phase transitions when Forest is available.

5. Validate before PR.
   - Run repo-required checks.
   - For backend changes, run required formatting and targeted tests/coverage per repo guidance.
   - For frontend changes, run typecheck and relevant tests/build checks per repo guidance.
   - Note any validation that could not be run and why.

6. Open the PR.
   - Use the `create-pr` skill.
   - Target the repo’s normal integration branch, usually `dev`.
   - Write a PR summary that links implementation back to the plan.
   - Include tests run, risks, and rollout notes.

7. Monitor review.
   - Set up an automation/heartbeat to monitor the PR.
   - Watch Enkii/code review, security review, CI checks, mergeability, and human comments.
   - If actionable feedback appears:
     - inspect the review comment;
     - implement a scoped fix;
     - run relevant validation;
     - commit and push;
     - continue monitoring.
   - Do not merge the PR unless the user explicitly asks.

8. Finish only when ready.
   - Report PR URL, current status, validation, and any remaining blockers.
   - If review is clear and checks pass, report that the PR is ready to merge.
   - If blocked, state the exact blocker and what is needed.

## Rules

- Do not implement large feature work directly on `dev` or `main`.
- Do not abandon a kickoff-provided worktree to work in the main checkout.
- Do not skip planning when the task is substantial.
- Do not create substantial plans as plain text only; create previewable HTML plan artifacts using the repo's plan-template structure.
- Do not batch all work into one large commit.
- Do not stage unrelated files.
- Do not merge the PR without explicit user approval.
- Prefer Red/Green TDD for every behavior change where a meaningful local test can be written.
- Prefer evidence from repo files, tests, CI, and review comments over assumptions.

## Create-PR handoff

When ready to open the PR, invoke the local `create-pr` skill and follow its instructions completely.

## Automation handoff

- After PR creation, create or update a monitor automation for the PR.
- The monitor should inspect PR checks, Enkii review, security review, review comments, mergeability, and merge state.
- If actionable feedback appears, fix it on the PR branch, validate, commit, push, and continue monitoring.
- Stop monitoring when the PR is clear, ready, merged, or explicitly canceled.
- Never merge by itself.
