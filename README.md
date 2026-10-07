# Docsyde Skills

Shared agent skills for Docsyde engineering workflows.

This repository is the source of truth for team-maintained skills. Install from here instead of copying skills into individual product repositories.

The current repository release is recorded in [`VERSION`](VERSION). Releases use
Semantic Versioning; user-facing changes belong in [`CHANGELOG.md`](CHANGELOG.md).

## Skills

| Skill | Purpose |
| --- | --- |
| `kickoff` | Drive engineering work autonomously: route and playbook selection, principles, cross-model delegation, review, watched PRs, landing when granted, and verified closeout. |
| `kickoff-setup` | Optionally map models to kickoff roles per harness in `kickoff.yaml`. |
| `kickoff-help` | Route questions about kickoff, its skills, playbooks, and principles. |
| `task-master` | Turn roadmaps into executable, verifiable delivery tickets and coordinate their progress. |
| `adversarial-review` | Independently critique plans, briefs, and investigation outputs before execution. |
| `simplicity-review` | Force plans through delete, reuse, and compress passes while preserving required outcomes and safeguards. |
| `plan-it` | Create proportionate, evidence-backed plans inline for tiny work or through a planning worker for fast/full work. |
| `ship-it` | Execute accepted plans through validation, proportionate simplicity/correctness review, authorized delivery, and closeout. |
| `code-review` | Review correctness, with a combined simplicity check for tiny policy-permitted diffs. |
| `create-pr` | Verify the intended target, create or update the PR, and arm its review watch. |
| `better-docs` | Make product-document drafts clearer and easier to review without changing their meaning. |
| `grill-to-spec` | Interview ambiguous product ideas into durable, implementation-agnostic specifications. |
| `design-to-code` | Implement and refine interfaces from Aphrodite evidence through project audit, clarification, and render/compare iteration. |

## Engineering layer

Kickoff 1.0 merges the delivery workflow with [pstack](https://github.com/cursor/plugins/tree/main/pstack)'s engineering discipline, through its T3 Code port [p3-stack](https://github.com/uzairansaruzi/p3-stack). See [NOTICE.md](NOTICE.md).

- **Playbooks** live in `skills/kickoff/playbooks/`: investigation, bug fix, perf, hillclimb, forensics, feature, refactoring, prototype, visual parity, skill authoring, eval, babysit, shipping, autonomous run, orchestrate, autopilot, session pickup, pause safely, multi-phase plan, worktree cleanup, and opening a PR.
- **Principles** are the `principle-*` skills. Kickoff reads the ones a decision applies and cites them in its reply.
- **Situational skills**: `architect`, `arena`, `automate-me`, `benchmark-checklist`, `blast-radius`, `bro`, `correct`, `create-verification-skill`, `figure-it-out`, `how`, `interrogate`, `maintain-verification-skill`, `make-bot-ui`, `no-comments`, `recall`, `reflect`, `show-me-your-work`, `swarm`, `tdd`, `teach`, `technical-writing`, `typescript-best-practices`, `unslop`, and `why`.

Kickoff names T3 Code's tools and maps them to Claude Code, Codex, or an inline fallback through `skills/kickoff/references/harness.md`. No setup is required: a role without a `kickoff.yaml` entry runs as a fresh child on the parent's model.

## Install

Install all skills with the Skills CLI:

```powershell
npx skills add Timmyy3000/skills
npx skills add DietrichGebert/ponytail --skill ponytail --skill ponytail-review
```

Install the full kickoff workflow:

```powershell
npx skills add Timmyy3000/skills --skill grill-to-spec --skill kickoff --skill task-master --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr
```

The Ponytail command in the primary install block supplies two dependencies for
the kickoff execution loop. A host plugin that already exposes `ponytail` and
`ponytail-review` satisfies them without another installation.

Install selected skills:

```powershell
npx skills add Timmyy3000/skills --skill kickoff
npx skills add Timmyy3000/skills --skill task-master
npx skills add Timmyy3000/skills --skill adversarial-review
npx skills add Timmyy3000/skills --skill simplicity-review
npx skills add Timmyy3000/skills --skill plan-it --skill code-review
npx skills add Timmyy3000/skills --skill better-docs
npx skills add Timmyy3000/skills --skill grill-to-spec
npx skills add Timmyy3000/skills --skill design-to-code
```

At the beginning of each kickoff run, the skill compares its installed SemVer
with the canonical version and asks before running a scoped update. Declining or
being offline does not block the workflow.

Install to specific agents:

```powershell
npx skills add Timmyy3000/skills --agent <agent-name>
npx skills add Timmyy3000/skills --agent claude-code
npx skills add Timmyy3000/skills --agent antigravity
```

Install globally:

```powershell
npx skills add Timmyy3000/skills --global
```

For a private clone or local testing:

```powershell
npx skills add .
npx skills add . --skill grill-to-spec --skill kickoff --skill task-master --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr --agent <agent-name>
npx skills add . --skill plan-it --agent <agent-name>
```

The helper script wraps the same CLI:

```powershell
.\scripts\install-local.ps1 -Skills grill-to-spec,kickoff,task-master,adversarial-review,simplicity-review,plan-it,ship-it,code-review,create-pr -Agents <agent-name>,claude-code -Global
```

To inspect the versions of skills installed for Codex on Windows:

```powershell
Get-ChildItem "$HOME\.agents\skills" -Directory | ForEach-Object {
  $frontmatter = Get-Content (Join-Path $_.FullName "SKILL.md") -Raw
  if ($frontmatter -match "(?m)^version:\s*(.+)$") {
    "{0}: {1}" -f $_.Name, $Matches[1].Trim()
  }
}
```

## Validate

Run:

```powershell
.\scripts\validate-skills.ps1
npx skills add . --list
```

Each skill folder must contain a valid `SKILL.md`. The `name` in frontmatter
should match the folder name, except for explicit compatibility aliases in the
validator, and every published skill must expose a SemVer `version` in
frontmatter so users can identify the installed revision.

## Maintaining Skills

- Record user-facing workflow changes in [CHANGELOG.md](CHANGELOG.md).
- Keep skills repo-agnostic. Discover local repo conventions from `AGENTS.md`, contributing guides, templates, and existing folders.
- Avoid machine-specific paths.
- Keep `SKILL.md` concise; move large details into `references/`, `scripts/`, or `assets/` when needed.
- Validate every changed skill before pushing.
- Prefer pull requests for changes that affect team workflow.
