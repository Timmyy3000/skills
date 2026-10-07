# Kickoff Episode State

Create one file per delivery episode. Keep it compact enough to read after every compaction.

```markdown
# <episode title>

## Identity
- Episode ID:
- Objective:
- Work type:
- Route: investigation | tiny | fast | full
- Route reason:
- Playbook:
- Grant: supervised | autonomous | land, and the user's exact words
- Harness and degraded primitives:
- Repositories:
- Worktree/branch:
- Intended base branch:
- Delivery path:
- Brief:
- Plan:
- HTML required and reason:
- Command path/version provenance (closure commands):

## Current State
- Phase: intake | planning | plan-review | approval | implementation | code-review | pr-creation | monitoring | closeout | terminal
- Status: active | needs-input | blocked | investigation-complete | ready-to-merge | merged | delivered-direct | canceled | blocked-external
- Last transition at:
- Next action:
- Blocking condition:

## Decisions
| ID | Decision | Source | Affected phases |
| --- | --- | --- | --- |

## User Corrections
| At | Category | Correction | Artifacts updated |
| --- | --- | --- | --- |

## Decision Trail
| At | Decision or default taken | Principle or evidence | Reversible by |
| --- | --- | --- | --- |

## Evidence Index
| Evidence | Path or URL | Why it matters |
| --- | --- | --- |

## Review Mode
- Combined or separate:
- Risk and policy basis:

## Review Findings
| ID | Review | Severity | Disposition | Plan revision |
| --- | --- | --- | --- | --- |

## Validation
| Command/check | Head SHA | Result | At |
| --- | --- | --- | --- |

## Delivery And Watch
- Delivery mode: not-applicable | pull-request | direct
- PR URL:
- Head/base:
- Head SHA:
- Remote target SHA:
- Watch: not-applicable | required | active | stopped | blocked
- Watch mechanism and ID:
- Babysit mode: drive | background | threads-only | check
- Watch terminal condition:
- Last verified checks/reviews:

## Closeout
- Deployment/promotion:
- Managed worktree (T3, Forest, or git): not-applicable | present | closed | retained | closure-blocked
- Cleanup authorization source:
- Exact worktree owner at closeout:
- Live-use check/result (owner task and associated terminals/processes):
- Temporary retention owner:
- Retention revisit trigger: review/testing complete | merge | other
- Retention revisit handoff: named owner/follow-up or authorized watch
- Post-merge worktree choice: not-applicable | pending | close | retain
- Worktree closure evidence (backend state, Git registration, exact disk path):
- Ignored evidence/config retained (authorized location, names, and verification hashes only):
- Worktree disposition:
- Temporary artifacts:
- Durable records reconciled:
- Terminal evidence:

## Metrics
- Phase timestamps:
- Planning worker runs:
- Adversarial review runs:
- Simplicity review runs:
- Implementation worker runs:
- Ponytail code-review runs:
- Correctness code-review runs:
- Context compactions observed:
- User correction count:
```

Rules:

- Store decisions and evidence pointers, not transcript summaries.
- Update a row instead of appending duplicate prose.
- Preserve relevant ignored evidence/config at an authorized durable location and record names, pointers, and verification hashes only; never include arbitrary ignored files, secrets, or raw sensitive output.
- A partial or unverified close is `closure-blocked`; retain the owner, content, branch, and watch and record the failed surface.
- An actively running worktree cannot close; record the temporary retention owner and revisit trigger.
- A handoff is invalid when this file contradicts the brief or accepted plan.
