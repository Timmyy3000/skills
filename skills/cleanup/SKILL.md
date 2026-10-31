---
name: cleanup
description: Remove what this session or thread left behind when its task is done - worktrees, branches, processes it started, temp files, build junk, PR watches - and report disk reclaimed plus anything resource-heavy it saw but does not own. Use at the end of every task, as kickoff's last closeout step, or when the user says $cleanup or /cleanup. Session-scoped only; never touches other sessions' work. For a whole-machine disk audit use kickoff's worktree-cleanup playbook instead.
version: 1.0.0
---

# Cleanup

Undo this session's footprint so the machine is as it was before the task, plus the delivered work.

## The one rule

**Touch only what this session can prove it created.** Proof is evidence from this session: a command you ran, a path you wrote, a PR you opened, a process you started. Machines are shared. Other sessions and threads work in the same checkouts, `/tmp`, and caches, so "it looks stale" or "it is big" is not proof. Anything you did not create goes in the report, not the trash.

When ownership is unclear, keep the item and report it.

## 1. Inventory

Build the list from your own session history before you touch anything:

- Worktrees and checkouts you added (`git worktree add`, harness worktree tools, clones).
- Branches you created, local and remote, with their PR numbers.
- Processes you started: dev servers, watchers, test runners, tunnels, containers (`docker run`), background shell tasks.
- Files and directories you wrote outside the repository: temp dirs, logs, env files, scripts, downloads, extracted archives.
- Build and test output inside repositories you touched: `__pycache__`, `.pytest_cache`, coverage files, `htmlcov`, test reports, local build dirs.
- PR watches, monitors, schedules, and background tasks you armed.

Record `df -h` for the affected filesystems before you start.

## 2. Remove, with a gate per item

| Item | Remove when | Keep and report when |
|---|---|---|
| Worktree | Clean and its commits are pushed or merged | Uncommitted changes, unpushed commits, or a live process inside it |
| Local branch | Its PR is merged or closed, or its commits are on the remote | An open PR or unpushed commits |
| Remote branch | Its PR is merged or closed and you created the branch | An open PR, or someone else pushed to it |
| Process | You started it and the task no longer needs it | You cannot tie it to your own command |
| Temp file or dir | You wrote it and nothing durable points at it | Another session may use it, or it holds the only copy of evidence the user may want |
| Build and test output | Untracked and ignored by git, in a repo you touched | Tracked, or not ignored |
| Watch or monitor | Its PR or job reached a terminal state | The user asked to keep watching |

How to remove:

- Worktree: remove it through the backend that created it (`git worktree remove <path>`, or the harness tool), then `git worktree prune`. If a managed-worktree closeout skill (for example `ship-it`) already closed it, verify that and move on.
- Branch: `git branch -D <name>` after the gate passes, then `git push origin --delete <name>` for a remote you own. Never delete a protected or long-lived branch (`main`, `master`, `dev`, `develop`, `staging`, `prod`, `release/*`).
- Process: stop it with `kill <pid>`, wait, then `kill -9` only if it survives. Stop containers with `docker stop`. Match by the PID you recorded, or by working directory and command line. Never by name alone.
- Files: delete exact paths. Never run `rm -rf` on a glob over a shared directory such as `/tmp`.
- Never discard uncommitted work. Show the diff and ask first.

## 3. Shared caches: report only

Package and tool caches serve every session: npm and npx, bun, pnpm, yarn, uv, pip, Playwright browsers, compile caches. Do not clear them. Report their size when they are large (over about 1 GB) so the user can decide. Clear one only when the user asks explicitly.

## 4. Look for resource hogs

Before you finish, check for things that eat resources because of this task, and report the ones you do not own:

- Processes still running from your working directories, including ones whose directory was deleted (`/proc/<pid>/cwd` ends in `(deleted)`).
- High CPU or memory consumers started during the session (`ps -eo pid,etime,pcpu,pmem,cmd --sort=-pcpu`).
- Ports you opened that are still listening.
- Large files or directories you created (`du -sh`).
- Containers, tunnels, or watchers still running.

## 5. Verify and report

Re-run `df -h` and re-list worktrees, branches, and your processes to confirm each removal. Do not claim a removal you did not verify.

Reply with a short report:

- **Removed:** worktrees, branches, processes, files, and watches, one line each.
- **Disk:** before, after, and reclaimed.
- **Kept:** each item with a one-line reason (uncommitted work, open PR, in use by another session, ownership unclear).
- **For you to decide:** large shared caches and resource hogs you do not own, with size or usage.

If there was nothing to clean, say so in one line.
