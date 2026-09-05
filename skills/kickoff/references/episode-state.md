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

## Delivery And Monitor
- Delivery mode: not-applicable | pull-request | direct
- PR URL:
- Head/base:
- Head SHA:
- Remote target SHA:
- Monitor status: not-applicable | required | active | stopped | blocked
- Monitor ID:
- Monitor terminal condition:
- Last verified checks/reviews:

## Closeout
- Deployment/promotion:
- Forest worktree: not-applicable | present | closed | retained | closure-blocked
- Cleanup authorization source:
- Exact worktree owner at closeout:
- Temporary retention owner:
- Retention revisit trigger: review/testing complete | merge | other
- Retention revisit handoff: named owner/follow-up or authorized monitor
- Post-merge worktree choice: not-applicable | pending | close | retain
- Forest closure evidence (Forest state, Git registration, exact disk path):
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
- A partial or unverified close is `closure-blocked`; retain the owner, content, branch, and monitor and record the failed surface.
- An actively running worktree cannot close; record the temporary retention owner and revisit trigger.
- A handoff is invalid when this file contradicts the brief or accepted plan.
