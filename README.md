# Docsyde Skills

Shared agent skills for Docsyde engineering workflows.

This repository is the source of truth for team-maintained skills. Install from here instead of copying skills into individual product repositories.

## Skills

| Skill | Purpose |
| --- | --- |
| `kickoff` | Start a full human-reviewed or fast agent-reviewed engineering workflow. |
| `adversarial-review` | Independently critique plans, briefs, and investigation outputs before execution. |
| `simplicity-review` | Independently challenge unnecessary plan complexity while preserving required safeguards. |
| `plan-it` | Create Lavish-backed interactive implementation plans and archive accepted plans as read-only HTML. |
| `ship-it` | Execute a reviewed plan through PR readiness, with optional harness-agnostic worker delegation. |
| `code-review` | Review local branch changes before opening or updating a PR. |
| `create-pr` | Prepare and create a GitHub pull request from local changes. |

## Install

Install all skills with the Skills CLI:

```powershell
npx skills add Timmyy3000/skills
```

Install the full kickoff workflow:

```powershell
npx skills add Timmyy3000/skills --skill kickoff --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr
```

Install selected skills:

```powershell
npx skills add Timmyy3000/skills --skill kickoff
npx skills add Timmyy3000/skills --skill adversarial-review
npx skills add Timmyy3000/skills --skill simplicity-review
npx skills add Timmyy3000/skills --skill plan-it --skill code-review
```

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
npx skills add . --skill kickoff --skill adversarial-review --skill simplicity-review --skill plan-it --skill ship-it --skill code-review --skill create-pr --agent <agent-name>
npx skills add . --skill plan-it --agent <agent-name>
```

The helper script wraps the same CLI:

```powershell
.\scripts\install-local.ps1 -Skills kickoff,adversarial-review,simplicity-review,plan-it,ship-it,code-review,create-pr -Agents <agent-name>,claude-code -Global
```

## Validate

Run:

```powershell
.\scripts\validate-skills.ps1
npx skills add . --list
```

Each skill folder must contain a valid `SKILL.md`. The `name` in frontmatter should match the folder name.

## Maintaining Skills

- Keep skills repo-agnostic. Discover local repo conventions from `AGENTS.md`, contributing guides, templates, and existing folders.
- Avoid machine-specific paths.
- Keep `SKILL.md` concise; move large details into `references/`, `scripts/`, or `assets/` when needed.
- Validate every changed skill before pushing.
- Prefer pull requests for changes that affect team workflow.
