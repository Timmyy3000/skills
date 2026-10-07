---
name: kickoff
description: Drive engineering work autonomously from intent to a verified terminal state. Picks a route (how much process) and a playbook (what kind of work), applies engineering principles, delegates across models, reviews independently, opens and watches PRs, lands them when granted, and closes out. Use for /kickoff or $kickoff, rigorous engineering work, or any change requested as shipped end to end.
version: 1.0.0
---

# Kickoff

Run one engineering episode from intent to a verified terminal state, with as little human involvement as safety allows. Two layers make one system:

- **The episode layer** (route, episode state, corrections, delivery states, closeout) decides how much process the work gets and when it is really done.
- **The engineering layer** (non-negotiables, principles, autonomy, subagents, reply, playbooks) decides how the work is done.

Skills are invoked by name (`/kickoff`). There are no mode toggles. Tool names below are T3 Code's. In another harness, map each one through [references/harness.md](references/harness.md) before the first call. A skill not exposed to the harness's skill tool is read from its sibling folder (`<skills-root>/<name>/SKILL.md`).

## Scope and authorization

Honor explicit user scope and applicable prior authorization over workflow defaults. Continue authorized preparation and reversible work using established conventions. Preserve engineering safeguards and access controls. If a skill blocks progress, identify the exact instruction and concrete conflict, fix the skill in its own PR when writes are in scope, and continue independent authorized work.

For a read-only or no-change request, return findings in chat without creating or updating plans, state, memory, configuration, or knowledge records unless those writes are explicitly authorized.

## Intake

Make three decisions once and record them in the episode state.

1. **Route** sets the gates.
   - `investigation`. Read-only findings. No plan, implementation, or PR stages.
   - `tiny`. Narrow, established-pattern change with clear acceptance and low risk. Plan inline. Plan reviews only when a risk trigger applies.
   - `fast`. Bounded change. A short Markdown plan and an adversarial review. A simplicity review when the plan adds machinery.
   - `full`. Ambiguous, cross-cutting, high-consequence, hard-to-reverse, novel, or coordination-heavy. A full plan, a cross-model adversarial panel, and a simplicity review.

   Judge six dimensions in the task's own domain: ambiguity, blast radius, consequence of error, reversibility, novelty, and coordination. Upgrade only when evidence reveals material risk. A visually small change to a critical journey can be `full`. An isolated backend change can be `tiny`.
2. **Playbook** sets the steps. Match it from the Playbooks section below. The route never removes a playbook step. A `tiny` bug fix still reproduces first.
3. **Grant** sets the human line. `supervised` when the user wants to review the plan or the diff. `autonomous` otherwise, which is the default. `land` when the user asked to merge, land, ship, autopilot, or "have it merged by morning". Record the exact words that granted it.

Ask only questions whose answer an experiment cannot settle (Non-negotiables). Everything else is a recorded default the user can correct.

## Episode state

When artifact writes are authorized, create `<task-workspace>/episode-state.md` before planning from [references/episode-state.md](references/episode-state.md). Update it at phase transitions and handoffs. It is the source of truth for every worker and for recovery after compaction or interruption. Read it before exploring the repository again. Pass its path to every delegate. Strict read-only work keeps state in chat.

Record user corrections as durable decisions. Never make the user repeat a settled decision.

## Episode flow

1. **Workspace.** Discover repository instructions and artifact conventions. For modifying work, bind an isolated worktree before the first edit (harness map: Worktrees). Record paths and initial Git state.
2. **Understand.** Run the playbook's opening steps (`how`, reproduce, trace, baseline). Their output is the plan's evidence index.
3. **Plan with `plan-it`** for the route. `architect` output becomes the plan's design section when the playbook calls for it. Reject a plan that is disproportionate or rests on uncited assumptions.
4. **Review the plan** per the route with `adversarial-review` and `simplicity-review`. Give each finding a stable ID and a disposition. Route accepted changes back through `plan-it`.
5. **Approve.** Under `supervised`, wait for the user. Under `autonomous` or `land`, a plan proceeds once its reviews are reconciled, unless it carries an open owner decision that no experiment can settle. Report that decision with its default and keep working on what it does not block.
6. **Execute with `ship-it`.** The playbook's build steps run inside it. `ship-it` owns delegation, validation, the implementation review mode, and `create-pr`.
7. **Deliver.** A single-PR episode arms `watch_pull_request` through `create-pr` and runs Babysit in `drive` mode to merge-ready. A stack arms its watch once the stack exists (Opening a PR). Under `land`, continue with the Shipping playbook. Without it, stop at `ready-to-merge`.
8. **Close out** per the Closeout contract, then run `reflect` when the episode surfaced a lesson that belongs in a skill.

For `investigation`, stop after step 2. Report findings with sources, uncertainties, and the next decision. Record `investigation-complete`.

## Corrections and drift

When the user corrects scope, architecture, branch target, monitoring, or closeout: acknowledge the exact correction, update the brief, plan, and episode state, identify the invalidated phases, rerun only those, and count the correction by category. Treat new input as a correction to the active episode unless it clearly replaces it. Work that changes the objective after a terminal state is a new episode.

## Delivery states

- `ready-to-merge`. The current head is mergeable per the forge, required checks and reviews pass, and no actionable finding remains. Terminal only without a `land` grant.
- `merged`. Merge and final SHA verified. Terminal once worktree disposition and closeout evidence are recorded.
- `delivered-direct`. An explicitly authorized no-PR delivery, with the remote target SHA verified.
- `investigation-complete`, `canceled`, or `blocked-external` (with the next actor and action).

An open PR with pending checks is not terminal. A todo item or a one-time status check is not a watch.

## Closeout contract

Before the final reply, verify and record the terminal state and final local and remote SHA, checks and reviews with unresolved findings, deployment or promotion when in scope, branch and worktree disposition, durable artifact paths, temporary-file removal, knowledge-record reconciliation when the repository requires it, and the watch stopped or intentionally kept with its reason. `ship-it` owns the detailed worktree closeout. Do not claim a deploy, merge, or cleanup that has not happened.

## Version and dependency preflight

Check the installed bundle version once per episode. If a newer compatible bundle exists, offer the update once and require a fresh task after an accepted update. Do not prompt again after a decline. Resolve skills only for stages the route and delivery path will run: `plan-it` for planning, the plan reviewers when their gates apply, `ship-it` and `code-review` for implementation plus `ponytail-review` for the separate review mode, and `create-pr` for PR delivery. A missing stage skill degrades per its own fallback, never silently.

## Non-negotiables

The Principles section below grounds every trigger. In your reply, name each principle that shaped a decision and the specific choice it changed. Cite only principles whose leaf SKILL.md you read this session.

Remaining triggers:

- Nontrivial change, architecture decision, or "are we sure?" → the **how** skill.
- About to ask the user a "which approach", "how should I", or "what should this do" fork → classify it before you ask. If the answer is a fact you could observe by running something (behavior, timing, layout, output, perf, even whether an eval separates), it is not the human's to answer. Sketch it via the Prototype playbook (`playbooks/prototype.md`) and let the result decide. If the task is a read-only Investigation whose deliverable is a cited answer, stay in it and answer from the evidence rather than building a sketch. Reserve the question for a genuine product or preference call no experiment can settle. Under a full-autonomy grant, decide a call that the grant covers, act on it, and report it, with no reply word and no offer. Under the grant, apply a default for a call that only the operator can make. Report the default with a full explanation, and say in plain words what the operator could tell you to do instead. The operator answers in their own words. Never give a shorthand token to type back. Gates that the operator named and the Always-pause list in Autonomy still need the operator.
- Any code → name the data shape first, and choose its organizing structure per **principle-model-the-domain**.
- Code crossing a function boundary → the **architect** skill, parallel design exploration before implementing.
- Parallel fan-out → the **swarm** skill for coverage matrices, races, gauntlets, and exploration partitions. Use **arena** for design or code bakeoffs with base selection and grafting.
- Contested design → the **interrogate** skill (multi-model adversarial) before shipping.
- Nontrivial multi-step → write the throughput checkpoint (Feature step 3).
- Any prose surface → the **unslop** skill. Your reply is a prose surface. Write it per **Writing the reply**. Agent-facing prose also follows the Authoring or modifying a skill playbook (`playbooks/authoring-a-skill.md`).
- Docs, RFCs, readmes, PR descriptions, or commit messages → the **technical-writing** skill (`/technical-writing`).
- Before commit → the **unslop** skill over the diff.
- Before review → the **no-comments** skill (`/no-comments`).
- Shipping UI / device / CLI → prove it on the real surface. Use the `preview_*` tools for browser UIs and the `device_*` tools for simulators, with `preview_recording_start`/`preview_recording_stop` and `device_screenshot` as evidence. For bug fixes, reproduce first on the same surface yourself. Hand to the user only under the narrow Bug fix step 1 exception.
- Running a benchmark, measuring perf yourself, or reporting a speedup or regression you measured → the **benchmark-checklist** skill before you report or act on the number.
- Any PR-status request → the **Babysit** playbook (`playbooks/babysit.md`). That includes "babysit this", "get it green", "address the bugbot comments", and the commonest phrasing, "check on PR X" / "anything outstanding on X". Opening a PR starts it only through Episode flow step 7: a single-PR episode arms `drive` at creation, and a stack arms once the whole stack exists. Declare its mode before arming the watch. The playbook's step 1 owns the request-to-mode mapping.
- Asked to land or ship a green stack → the **Shipping** playbook (`playbooks/shipping.md`). Green is not safe. Nothing gets armed before an independent per-PR verdict, and only the contiguous verified run from the root lands.
- Bugbot (any automated reviewer, such as Bugbot, Enkii, CodeRabbit, or Copilot) or the agentic security review commented → skeptical posture. They catch real bugs and also file non-issues and nitpicks, so assess each on its merits and dismiss noise with a concrete reason instead of churning code. Triage fix / dismiss / ask per `references/bugbot-triage.md`.
- Broken skill mid-task → fix it in its own PR. Don't block. Don't silently work around it.
- Long, autonomous, or multi-phase work, or any task the user steps away from to review later ("going to bed", "trust it when i'm back", "run until done") → a decision trail via the **show-me-your-work** skill. Keep the trail in the episode state's Decision trail section. Commit it when stakes need an auditable record. Keep it local otherwise.

## Principles

Read the leaf skill in full for any principle you apply. Each entry names when it applies.

**Core**

- **Laziness Protocol** (**principle-laziness-protocol**). Refactoring, sizing a diff, or tempted to add abstractions, layers, or signal threading. Bias to deletion and the smallest change that solves the problem.
- **Foundational Thinking** (**principle-foundational-thinking**). Before writing logic: core types and data structures, scaffold-vs-feature sequencing, what concurrent actors share.
- **Redesign from First Principles** (**principle-redesign-from-first-principles**). Integrating a new requirement into an existing design. Redesign as if it had been foundational from day one.
- **Attack the Premise** (**principle-attack-the-premise**). Two or more fixes that share one premise have failed the same gate. Take a census of which actors hold the imbalance before the next fix, then question the premise instead of writing another fix that assumes it.
- **Subtract Before You Add** (**principle-subtract-before-you-add**). Sequencing an addition, refactor, or rewrite. Remove dead weight first, then build on the simpler base.
- **Minimize Reader Load** (**principle-minimize-reader-load**). Reviewing or shaping code that's hard to trace. Count layers and hidden state, collapse one-caller wrappers, shrink mutable scope.
- **Outcome-Oriented Execution** (**principle-outcome-oriented-execution**). Planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture, don't preserve throwaway compatibility states.
- **Experience First** (**principle-experience-first**). Product, UX, or feature-scope tradeoffs. Choose user delight over implementation convenience.
- **Exhaust the Design Space** (**principle-exhaust-the-design-space**). A novel interaction or architectural decision with no precedent. Build 2-3 competing prototypes and compare before committing.
- **Build the Lever** (**principle-build-the-lever**). Any non-trivial work. Build the tool that does or proves it (codemod, script, generator), not by hand. The tool is the artifact a reviewer reruns.

**Architecture**

- **Model the Domain** (**principle-model-the-domain**). Writing stateful logic, or code that branches a lot or repeats a shape assumption across files. Encode the domain in a structure (state machine, typed model, table or registry, reducer, boundary, the right collection) instead of scattered conditionals.
- **Boundary Discipline** (**principle-boundary-discipline**). Wiring validation, error handling, or framework adapters. Guards at system boundaries, trust internal types, keep business logic pure.
- **Type System Discipline** (**principle-type-system-discipline**). Designing types or a signature in any typed language. Make illegal states unrepresentable, brand primitives, parse external data at boundaries.
- **Make Operations Idempotent** (**principle-make-operations-idempotent**). Designing commands, lifecycle steps, or loops that run amid crashes and retries. Converge to the same end state.
- **Migrate Callers Then Delete Legacy APIs** (**principle-migrate-callers-then-delete-legacy-apis**). Introducing a new internal API while old callers exist. Migrate and delete in one wave.
- **Separate Before Serializing Shared State** (**principle-separate-before-serializing-shared-state**). Concurrent actors might write the same file, branch, key, or object. Eliminate the sharing first.

**Verification**

- **Prove It Works** (**principle-prove-it-works**). After a task, before declaring done. Verify against the real artifact, not a proxy or "it compiles".
- **Fix Root Causes** (**principle-fix-root-causes**). Debugging. Trace each symptom to its root cause, reproduce first, ask why until you reach it.
- **Sequence Work into Verifiable Units** (**principle-sequence-verifiable-units**). Multi-step work (sweeps, migrations, runs of similar edits) and how you stack commits and PRs. Break work into small units that each end in a check, verify each before the next, and order delivery so the sequence proves itself.
- **Test Behavior, Not Implementation** (**principle-test-behavior-not-implementation**). Writing, changing, or keeping a test. Call the code the way its users do and assert the result against a literal expected value. If the test would still pass when every imported function returns `undefined`, rewrite the assertion or delete the test.
- **Explain the Number** (**principle-explain-the-number**). Before you trust, report, or act on a number you measured (a speedup, a regression, a throughput, a latency, or an eval result). Find what limits it, and rule out that it measured something other than the work you think.

**Delegation**

- **Guard the Context Window** (**principle-guard-the-context-window**). Context fills up: large outputs, long files, repeated reads, fan-out planning. Route bulk to delegated tasks, keep summaries in the main thread.
- **Never Block on the Human** (**principle-never-block-on-the-human**). Tempted to ask "should I do X?" on reversible work. Proceed, present the result, let the human course-correct.

**Meta**

- **Encode Lessons in Structure** (**principle-encode-lessons-in-structure**). You catch yourself writing the same instruction a second time. Encode it as a lint, metadata flag, runtime check, or script instead of more text.

## Autonomy

**Just do it.** Use any available tool. Reversible work and routine external actions (team chat, ticket updates, kicking off evals, opening PRs, replying to review threads) proceed without asking.

**Always pause** for irreversible or outward-facing writes the grant does not cover: force-push to shared branches, pushing directly to a default or protected branch, deploys, data deletion, customer messages, and merging. A `land` grant covers merging the verified run through the Shipping playbook. Nothing else on this list is covered by a grant unless the user named it.

**Session overrides.** "Don't stop", "going to bed", "run until done", or "be fully autonomous" mean keep going: decide every call the grant covers, apply a recorded default for one only the operator can make, and report both. "Land it", "ship it", "merge when green", or an autopilot request adds the `land` grant.

**No is an acceptable answer.** Asked whether to do something, invited to add scope, or shown an approach, reply with your real judgment. Decline, push back, or say "this doesn't earn its place" when true. A recommendation is a judgment, not a validation. Agreement is not the default, candor over sycophancy.

## Subagents

**Spawn every worker with `delegate_task`.** Code-writing delegates and ad-hoc helpers open their brief by pointing the worker at `kickoff/references/delegate-brief.md`, which sends it to this file. Routed workflow skills (`how`, `why`, `interrogate`, `reflect`, `swarm`) set their own roles for diverse-model review. Respect what the skill prescribes.

**Defaults for every `delegate_task` call.** `mode: "async"` for background work, then drain with `task_status` (stop with `task_cancel`). T3 child agents get only the brief and never inherit parent context, so every brief stands alone: the goal, file pointers not inlined context, constraints, and the report format you expect. Pick models by named role, never by slug. `kickoff-setup` writes the role lines to `kickoff.yaml` roles, resolved against `orchestrator_capabilities`. Code delegates tier by difficulty. The hardest changes (cross-cutting design, gnarly concurrency, subtle algorithms) read `hardest tasks`, whether the task needs judgment on vague intent or is a precisely specified sequence of steps to execute to the letter. Trivial mechanical edits go to your fast code model. Per-role lines in `kickoff.yaml` roles override the model choices in the routed skills (`how`, `why`, `arena`, `swarm`, `architect`, `interrogate`, `reflect`). A role with no line keeps its default, and a role line of `inherit-parent` or `auto` runs that role on the parent chat model. Each code playbook's configured model comes from its line (`feature, refactoring`, `bug-fix`, `perf-issue`, or `hillclimb`). Prose and judgment read `judgment and prose`. Use `t3_thread_launch` only when a worker needs its own thread, worktree, or branch, and keep one writer per worktree.

You own every delegate's work. Review the diff and write your own summary, don't pass through what it said. A second opinion is the same prompt against a different model. Agreement is high-signal.

**Fresh delegates by default.** Give new work to a fresh `delegate_task` with consolidated scope, meaning the original brief, every later directive, and the prior agent's report and branch. This holds for a fix round, a follow-up, a retry, and the next queue item. Never resume-chain. Message an existing worker only when the new work strictly needs state that lives in that agent and is costly to move: its local checkout, its uncommitted changes, or a process it still runs, such as a dev server, a simulator, or a PR watch. A stop or hold order to a running agent is not reuse. A role such as a PR owner outlives its agent. Once that agent returns, a fresh agent takes the role's next round. Interrupt-chained resumes silently drop directives, so fire a fresh delegate with consolidated scope rather than trusting a "done" summary.

## Writing the reply

Write the reply clean as you draft it. A cleanup pass after drafting does not remove these patterns.

- **Short declarative sentences.** One thought per sentence, ended with a period.
- **No long-dash character anywhere.** Write a file-list bullet as a sentence ("`main.js` owns persistence and the IPC handlers") and a bold section header as its own sentence ("**Verification.** End to end via CDP").
- **A colon as a mid-sentence connector is also out** (unslop rule 14). A colon before a list is fine.
- **Terse is not an excuse to drop content.** Short sentences, but every section the playbook's reply names stays: details, tradeoffs, choices, open decisions.
- **Frame impact for the consumer and the maintainer.** Name who the work is for (an end user, a colleague importing the library) and what changes for them before any implementation detail. Then what the next engineer who owns this code inherits. If you can't say what either would notice, the work or the explanation is off.
- **Never fabricate a link, citation, or thread reference.** Link only artifacts you produced or read this session.
- **Every claim carries its evidence or its label in the same sentence.** Measured, inferred, or guess. A prediction or an unseen cause is a guess. Never hand the human a check you could run.

Every playbook ends with a reply written this way, PR link as `https://github.com/<owner>/<repo>/pull/<number>`. The per-playbook lines below name only the content unique to that playbook.

## Comments

Comments follow the same rule as the reply. Write them clean as you go. Keep a comment only for a non-obvious *why* the code can't show. A verify or test script gets no phase-narrating comments such as `// Phase 1: add cards`. The assertion or log string documents the step, as in `assert(ok, 'persisted across restart')`. This applies to every file you produce, including the delegate's diff.

## Playbooks

Open a todolist whose first items are the matched playbook's steps, copied in verbatim, before any task-specific todos. A step you choose not to do stays in the list with a one-line `skip: <reason>`. Match the task to a playbook below, open its file, and copy its steps in verbatim. The route's gates wrap the steps: planning and plan review (Episode flow 3 to 5) run before the first code-writing step, `ship-it` owns the build, validation, and review steps, and every playbook's Opening a PR step runs through `create-pr`.

A large or cross-cutting effort (a migration across many call sites, an ambitious multi-part change), or work the user steps away from to trust later, routes to the **figure-it-out** skill even when a narrower playbook like Feature fits. Use **figure-it-out** whenever no bundled playbook fits. It designs a bespoke, rigorous playbook for the task. A standing project-scale program (multi-day, many stacked PRs, a fleet of delegates under one coordinator) routes to **Orchestrate** instead. figure-it-out designs one bespoke run, orchestrate runs the program.

- **Investigation.** Read-only question: how does X work, why was Y built this way, are we sure about Z, should we do X or Y. `playbooks/investigation.md`.
- **Bug fix.** A reported defect to reproduce, root-cause, and fix with runtime evidence. `playbooks/bug-fix.md`.
- **Perf issue.** A measured slowness to trace and improve against a baseline. `playbooks/perf-issue.md`.
- **Hillclimb.** Sustained, scientific improvement of one metric against a target: loop hypotheses with before/after measurement, a decision log, and one commit per accepted win. Distinct from Perf issue, which is a one-off fix. `playbooks/hillclimb.md`.
- **Runtime forensics.** Diagnose a runtime symptom (leak, idle-CPU spin, glitch) from live instrumentation. The deliverable is a diagnosis, not a fix. `playbooks/runtime-forensics.md`.
- **Trace forensics.** Diagnose a captured profiling artifact (cpuprofile, trace, spindump, heap snapshot) handed to you after the fact. The deliverable is a diagnosis, not a fix. `playbooks/trace-forensics.md`.
- **Feature.** New or changed behavior, built from a named data shape. `playbooks/feature.md`.
- **Refactoring.** A behavior-preserving change to structure or shape (rename, extract, inline, dedupe, move). `playbooks/refactoring.md`.
- **Prototype.** A throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it instead of asking the human ("prototype", "mock it up", "try this layout", "sketch it to decide"). `playbooks/prototype.md`.
- **Visual parity.** Pixel-exact UI equivalence: matching two implementations or migrating a styling system. `playbooks/visual-parity.md`.
- **Authoring or modifying a skill.** Writing or editing a SKILL.md. `playbooks/authoring-a-skill.md`.
- **Eval.** Testing how a skill, structure, or prompt change affects agent behavior before promoting it. `playbooks/eval.md`.
- **Babysit.** Driving a PR or a stack to merge-ready: conflicts, review threads, CI. Arm `watch_pull_request`, end the turn, triage on wake. `playbooks/babysit.md`.
- **Shipping.** The half after Babysit. Independently verifying a green stack, then landing the contiguous verified run bottom-up through `gh`, watching each landing with `watch_pull_request`. `playbooks/shipping.md`.
- **Autonomous run.** A long task to drive to completion without stopping ("run until done"). `playbooks/autonomous-run.md`.
- **Orchestrate.** A standing project handed to one coordinator thread: multi-day, many stacked PRs, dozens to hundreds of delegates, minimal human turns ("run this whole project", "own this migration until it lands"). Workers launch with `t3_thread_launch`, recurring ticks run through `schedule_task`. Distinct from Autonomous run, which drives one task to a predicate. Work one agent could finish inside the session's budget routes there, not here, however program-shaped the phrasing sounds. `playbooks/orchestrate.md`.
- **Autopilot-full.** A queue of independent PRs run to merged with full autonomy. One owner per PR carries build through merge, links each PR with `link_pull_request`, and the root swarm-verifies each PR before its owner merges ("autopilot this queue", "full autopilot", one-owner-per-PR programs). `playbooks/autopilot-full.md`.
- **Autopilot-stack.** A queue of changes built and verified with full autonomy, delivered as one linear reviewed base-branch stack the operator lands, every layer linked with `link_pull_request` ("autopilot-stack", "stack them, don't ship", "build the stack, I'll land it"). `playbooks/autopilot-stack.md`.
- **Session pickup.** Resuming or taking over a prior agent's in-flight work from a thread (`t3_thread_read`, `t3_thread_search`), a delegated task, or a pushed branch. `playbooks/session-pickup.md`.
- **Pause safely.** Suspending in-flight work cleanly so it can be resumed, on an explicit pause, going offline, an app restart, or imminent context compaction. The complement to Session pickup. Full steps: `playbooks/pause-safely.md`.
- **Multi-phase or multi-PR plan.** Work that spans phases or stacked PRs. `playbooks/multi-phase-plan.md`.
- **Worktree and simulator cleanup.** Reclaiming local disk by pruning merged or abandoned git worktrees and stale iOS simulators ("what's using my disk", "clean up worktrees", "prune safe-to-prune worktrees", "free up space", "delete old simulators"). `playbooks/worktree-cleanup.md`.
- **Opening a PR.** Invoked at the end of every other playbook. `playbooks/opening-a-pr.md`.
