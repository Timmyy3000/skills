# Docsyde Skills

Shared agent skills for Docsyde engineering workflows.

This repository is the source of truth for team-maintained skills. Install from here instead of copying skills into individual product repositories.

## Skills

| Skill | Purpose |
| --- | --- |
| `kickoff` | Start a guided IC engineering workflow from intake through accepted plan and execution handoff. |
| `adversarial-review` | Independently critique plans, briefs, and investigation outputs before execution. |
| `plan-it` | Create Lavish-backed interactive implementation plans and archive accepted plans as read-only HTML. |
| `ship-it` | Execute a planned change from kickoff through PR readiness. |
| `code-review` | Review local branch changes before opening or updating a PR. |
| `create-pr` | Prepare and create a GitHub pull request from local changes. |
| `vercel-react-best-practices` | Review React and Next.js code against Vercel performance guidance. |
| `web-design-guidelines` | Review UI code for accessibility, UX, and web interface best practices. |

## Install

Install all skills with the Skills CLI:

```powershell
npx skills add Timmyy3000/skills
```

Install the full kickoff workflow:

```powershell
npx skills add Timmyy3000/skills --skill kickoff --skill adversarial-review --skill plan-it --skill ship-it --skill code-review --skill create-pr
```

Install selected skills:

```powershell
npx skills add Timmyy3000/skills --skill kickoff
npx skills add Timmyy3000/skills --skill adversarial-review
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
npx skills add . --skill kickoff --skill adversarial-review --skill plan-it --skill ship-it --skill code-review --skill create-pr --agent <agent-name>
npx skills add . --skill plan-it --agent <agent-name>
```

The helper script wraps the same CLI:

```powershell
.\scripts\install-local.ps1 -Skills kickoff,adversarial-review,plan-it,ship-it,code-review,create-pr -Agents <agent-name>,claude-code -Global
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

## Attribution

`vercel-react-best-practices` and `web-design-guidelines` are based on skills from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills), which is MIT licensed.
