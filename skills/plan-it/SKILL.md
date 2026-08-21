---
name: plan-it
description: Create or revise implementation plans through a configurable dedicated planning worker, producing full Lavish-backed artifacts or fast Markdown plans. Use when the user asks to plan, create a feature, technical, product, or phased plan, revise a reviewed plan, or when $kickoff delegates its planning stage before coding.
version: 0.1.0
---

# Plan It

Create a reviewable implementation plan through a dedicated planning worker. Full planning produces a complete Lavish HTML presentation and follows any repository requirement for a matching Markdown plan. Fast planning produces a concise Markdown artifact.

## Dedicated Planning Worker

Keep the calling task as the orchestrator. Read [references/delegation.md](references/delegation.md) completely before creating or revising a plan. Let that reference own planning-worker discovery, `kickoff.yaml` configuration, dispatch, artifact validation, and review-driven revision handoffs.

Use `plan_it.workers.<harness>` as the planning selector. Dispatch a fresh configured worker with durable task context and require it to inspect the repository before authoring the plan. Do not silently create the plan in the orchestrator when worker dispatch is expected.

## Simplicity Gate

Prefer the simplest elegant solution that fully satisfies the problem. Treat complexity as a cost, not a sign of thoroughness.

- Start with the minimum viable change: reuse existing patterns and components before introducing new abstractions, services, layers, dependencies, or phases.
- For every proposed piece of work, ask: does it directly satisfy a requirement, address a demonstrated risk, or preserve an important constraint? If not, leave it out.
- Do not design for speculative scale, future flexibility, hypothetical reuse, or edge cases without evidence that they matter now.
- Prefer a small number of coherent steps over exhaustive decomposition. Keep the plan proportional to the change.
- When alternatives are considered, recommend the simplest option that meets the acceptance criteria and briefly state why more elaborate options were rejected.
- Make complexity visible: call out any non-obvious mechanism, migration, abstraction, or cross-system coordination and justify its intrinsic value.

Before finalizing the plan, perform a simplicity pass: remove optional work, collapse redundant phases, and verify that each remaining item earns its place.

## Full-Plan Dependency Check

Before full planning, verify that the `lavish` skill is available. Skip this dependency for fast Markdown planning.

1. Check the active skill list and common local skill paths:
   - The active agent's configured skills directory
   - `~/.agents/skills/lavish`
   - `<workspace>/.agents/skills/lavish`
2. If `lavish` exists, read its `SKILL.md` and follow its workflow for creating, opening, polling, and ending the Lavish review session.
3. If `lavish` is missing, install or restore it before continuing when a known source is available. Prefer the user's local skill installer or configured skill repository. If no source is discoverable, tell the user Lavish is required and ask for the install source.
4. Use the configured forked Lavish package for every Lavish command. The default package is `github:Timmyy3000/lavish-axi#ft/lavish-viewer-reliability`; allow `LAVISH_AXI_PACKAGE` to override it when a different fork or branch is required. Resolve that value once before running commands and substitute it for `<lavish-package>` below; `<lavish-package>` is a placeholder, not a literal argument. Invoke it as `npx -y --package=<lavish-package> lavish-axi ...`; never silently fall back to the published `lavish-axi` package.

## Planning Workflow

The configured planning worker performs this workflow. The orchestrator validates its returned artifact and structured result.

1. Clarify only blocking ambiguity. Otherwise infer a practical scope from the repo, the request, and nearby docs.
2. Inspect the target project before writing the artifact:
   - Workspace or repo agent instructions: `AGENTS.md`, `.cursor/rules/`, `.agent/`, `.agents/`, `.github/copilot-instructions.md`, `CLAUDE.md`
   - Existing plan templates: files named like `PLAN_TEMPLATE.md`, `plan-template.md`, `implementation-planning-guide.md`, or templates under docs/planning folders
   - Existing plan folders: paths named like `plans`, `agent-plans`, `planning`, `docs/plans`, `docs/agent-plans`, or repo-specific equivalents
   - Frontend styling: Tailwind config, CSS variables, theme files, component library, shared layout components, brand assets, screenshots
   - Backend conventions: contributing guide, test commands, migrations guide, API docs, architecture docs
3. For full planning, if the target repo has a frontend design system, make the Lavish HTML artifact visually match it. Use the product's tokens, spacing, typography, component shapes, and color behavior where practical.
4. For full planning, fetch and read `https://vercel.com/design.md` before writing the artifact unless the user explicitly supplies another design authority. Use its composition, hierarchy, typography, spacing, color, evidence, responsive, and accessibility guidance. This is styling guidance, not permission to copy Vercel identity: remove the Vercel name, logo, triangle, wordmark, authorship shell, and branded copy while retaining the useful visual system.
5. For full planning, if no local design system is discoverable, use the Vercel report foundation and `vbg-*` primitives described by the design reference, plus page-owned `vbg-custom-*` composition hooks. Run `npx -y --package=<lavish-package> lavish-axi design` when needed, using the fork package resolved in the dependency check.
6. For full planning, open every Lavish playbook that matches the artifact content before writing HTML:
   - `plan` for implementation plans
   - `diagram` for architecture, flow, state, or sequence diagrams
   - `comparison` for options or current-vs-target behavior
   - `table` for dense work breakdowns, risks, or acceptance matrices
   - `input` when the artifact asks the user to choose scope, priority, or tradeoffs
   - `code` when showing files, APIs, schemas, or diffs
7. For full planning, create the artifact at `.lavish/<descriptive-plan-name>.html` unless the user requested another path.
   When the repository requires a Markdown companion, write the complete plan in
   Markdown first, then build the HTML from that final Markdown. Markdown is
   optimized for agent execution; HTML is optimized for human review. They are
   two complete presentations of the same plan, not a source plus a summary.
8. For full planning, run `npx -y --package=<lavish-package> lavish-axi <html-file>` to open the review session, then `npx -y --package=<lavish-package> lavish-axi poll <html-file>` to receive annotations and layout warnings.
9. For full planning, fix fresh error-severity layout warnings before asking the user to review. If warnings are persistent or low-severity, proceed with a short note.
10. For full planning, validate the HTML as a presentation, not only as a content container. Require actual semantic tables for dense mappings, Mermaid or equivalent diagrams for flows/architecture/lifecycle material, comparison structures for alternatives or scope boundaries, and a meaningful first viewport. Reject artifacts whose plan content is primarily literal Markdown table syntax or bullet text inside generic paragraphs/preformatted blocks.
11. For fast planning, create a concise Markdown plan in the brief or the repository's established sibling plan location. Include objective and scope, simplest viable approach, affected files or systems, acceptance criteria, focused validation, material risks, rollback, and unresolved decisions.
12. Route user feedback and review findings back through the planning worker. For full planning, revise the Markdown first when one exists, regenerate the HTML from the revised copy, verify content parity and presentation structure, then poll again with an agent reply while keeping the session open until acceptance.
13. After the user accepts a full plan, end the session with `npx -y --package=<lavish-package> lavish-axi end <html-file>`, then export or save a read-only HTML archival copy in the appropriate repo plan location. Do not archive the editable Lavish working file as the accepted plan.

## Full Plan Content Standard

Use the local plan template when one exists. Discover it from repo instructions first, then from conventional template names such as `PLAN_TEMPLATE.md`, `plan-template.md`, or `implementation-planning-guide.md`.

Every full plan artifact must include:

- Feature overview: problem, users, source docs, success outcome
- User stories
- Scope: in scope, out of scope, dependencies, assumptions
- Phases with goals, work items, impacted files/systems, and exit criteria
- Acceptance criteria
- Test plan with concrete commands where discoverable
- Risks, mitigations, and rollback/fallback notes

The HTML must preserve every claim, requirement, qualifier, contract, phase,
acceptance criterion, test, risk, and open decision from the final plan. It may
reorganize prose into diagrams, tables, comparisons, or disclosures, and it may
lead with a concise decision view, but it must not omit or weaken content. Before
review, compare the final Markdown and HTML section by section when both exist.

For backend work, include:

- Query optimization plan when data access changes
- N+1 prevention notes for relation-heavy endpoints
- Detailed unit test cases
- Migration plan, using the repo's migration-generation command when applicable
- Coverage target and command when the repo requires local coverage

For frontend work, include:

- Data path from user action to backend response and UI model
- State management and caching/invalidation approach
- Loading, error, retry, empty, and permission states
- Responsive behavior and accessibility checks
- Visual acceptance criteria tied to the target design system

For cross-repo work, include:

- Repo-by-repo phases
- Contract boundaries and sequencing
- Separate validation commands per repo
- Companion plan locations when the workspace requires self-contained repo plans

## Fast Plan Content Standard

Keep a fast plan concise and proportional. Include:

- Objective, scope, assumptions, and the simplest viable approach.
- A small number of coherent steps with affected files or systems and exit criteria.
- Acceptance criteria and focused validation commands where discoverable.
- Material risks, rollback or fallback, and unresolved decisions.
- Type-appropriate regression, measurement, preservation, migration, accessibility, or follow-up checks only when the brief or repository evidence requires them.

Do not require user stories, exhaustive phases, or every frontend/backend full-plan subsection when they add no execution value. Preserve the simplicity gate and enough evidence for implementation and review.

## Accepted Full-Plan Archive

When the user accepts the plan, store a read-only HTML version in the repository so it can be reviewed, shared, and committed without needing the Lavish editor session.

1. Create the archival file from the final accepted artifact. Prefer `npx -y --package=<lavish-package> lavish-axi export <html-file> --out <archive-path>` when available so local assets are inlined into a portable HTML file. If export is unavailable, write a standalone read-only HTML copy that removes editor/session affordances and keeps the final reviewed content.
2. Choose archive locations by inspecting repo instructions and existing folders:
   - First follow any explicit instruction in `AGENTS.md`, repo docs, contributing guides, or planning guides.
   - Then prefer an existing repo-local plan folder, such as `docs/agent-plans/`, `docs/plans/`, `plans/`, `.agent/plans/`, or another clearly named local equivalent.
   - In a multi-repo workspace, save a self-contained copy in each affected repo when that repo has a plan folder or explicit plan convention.
   - If a workspace-level coordination folder already exists, optionally save a second copy there only when local instructions or the user request call for workspace coordination.
   - If no plan folder or instruction exists, ask before creating a new convention. A conservative suggestion is `docs/plans/`.
3. Keep accepted archives self-contained. They must not merely link to workspace-only files or a local Lavish session, because repos may be reviewed independently or shared with teammates.
4. Name files with a stable, descriptive kebab-case slug, for example `<feature-name>-plan.html`.
5. After archiving, report every saved archive path and clearly distinguish the editable `.lavish/...html` working artifact from the read-only accepted archive file.

## Artifact Guidance

Make the HTML artifact a clear visual presentation of the complete plan. Lead
with the primary decision, evidence, scope, and phase map, then retain the full
implementation detail needed for review and execution.

- Put the primary decision, scope, and phase map near the top.
- Use tables for phase plans, acceptance criteria, risks, and validation commands.
- Use Mermaid for architecture, sequence, state, and data-flow diagrams unless a richer custom visual is necessary.
- Use side-by-side comparisons for options, current vs target behavior, or phased alternatives.
- Include file and system references in compact chips or tables.
- Avoid decorative-only visuals. Every visual section should clarify a decision, sequence, dependency, or risk.
- Prevent horizontal overflow with responsive grids, `minmax(0, 1fr)`, `min-width: 0`, wrapping, and truncation for long paths.
- Treat a referenced design guide as visual guidance, not permission to import
  its brand. The target project owns the artifact identity. Do not copy another
  organization's name, logo, wordmark, authorship shell, or branded copy unless
  the artifact is actually for that organization.

## Output Back To The Orchestrator

Return the structured planning result required by [references/delegation.md](references/delegation.md). For full planning, also report:

- The artifact path
- The design source used: explicit user style, target repo design system, or Lavish fallback
- Confirmation that `https://vercel.com/design.md` was fetched and read when it was the design authority, plus the Vercel primitives/foundations and page-owned composition hooks used
- The matching Lavish playbooks opened and the visual structures they produced
- Which local plan template or planning standard was followed
- Any blocking assumptions that need review in the artifact
