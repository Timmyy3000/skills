# Iteration log template

Use one row per comparison pass:

| Pass | Region / node | Mismatch class | Evidence | Change | Result | Remaining blocker |
| --- | --- | --- | --- | --- | --- | --- |
| 0 |  |  |  |  |  |  |

## User-provided UI flow and design brief

- User’s page-purpose explanation:
- User goal:
- User-described inputs and initial state:
- User-described controls and effects:
- User-described navigation and destinations:
- User-described validation, loading, error, and completion states:
- User-stated design requirements and non-negotiables:
- Unresolved behavior requiring clarification:

Before accepting a pass, check:

- [ ] Signature assets and distinctive illustration details match, or a missing-asset question is recorded.
- [ ] Implemented interactions match the accepted UI flow contract.
- [ ] Major geometry and alignment match at the reference viewport.
- [ ] CTA/text placement, font metrics, and wrapping match.
- [ ] Colors, borders, radii, and effects match.
- [ ] Excluded device chrome uses an explicit crop/coordinate convention.

Use `missing asset`, `MCP truncation`, `conflicting record`, or `user decision` for a blocker. A blank blocker means the region is accepted for the current pass.
