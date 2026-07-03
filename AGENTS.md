# Agents

This repository contains shareable agent skills.

## Rules

- Keep every skill portable across repositories and teammates.
- Do not hardcode local machine paths or Docsyde workspace-only paths in reusable skills.
- Put repo-specific behavior behind discovery: read local instructions, templates, and existing folders from the target repo.
- Validate changed skills before committing.
- If a skill bundles third-party content, preserve attribution and license notes.

## Validation

Use:

```powershell
.\scripts\validate-skills.ps1
npx skills add . --list
```

## Install Testing

Use local install tests before telling the team to update:

```powershell
npx skills add . --skill plan-it --agent codex
npx skills add . --skill plan-it --agent claude-code
```
