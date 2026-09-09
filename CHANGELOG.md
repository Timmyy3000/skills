# Changelog

This file records user-facing changes to the shared skills repository. Commit links preserve the history that predates this changelog.

## Unreleased

### Changed

- Tightened Forest closeout to enumerate ignored names, preserve relevant evidence/config at an authorized durable location with hash verification and no secret printing, record command path/version provenance, re-evaluate exact worktree ownership and retention decisions, hand off temporary-retention revisits, and verify Forest state, Git registration, and the exact disk path; partial or unverified closure retains ownership, content, branch, and monitoring as `closure-blocked`.
- Distinguished verified Git ancestry, patch/aggregate equivalence, and exact merged PR head evidence; a missing or deleted upstream tracking ref alone does not prove a commit was unpublished, and an unknown Forest base blocks closure until safely restored.
### Fixed

- Added a tested, provider-neutral Nabu collaborator connector that preflights
  secret storage before one-time invite redemption, persists and reloads the
  scoped profile, and verifies authenticated access without printing secrets.
- Hardened post-redemption recovery so a successful token remains available in
  a restricted recovery record until final profile promotion succeeds.
- Moved default profiles to Nabu-owned OS configuration storage and added hidden
  interactive input so secrets do not pass through shell variables.
- Fixed Nabu's Windows profile guidance: paths are joined correctly, the
  server-issued `space_` prefix is not duplicated, ACLs use `icacls.exe`
  instead of the unavailable static `System.IO.File.SetAccessControl` call,
  and resulting DACLs are audited to reject unapproved explicit allow entries.
- Bumped the Nabu skill to 0.2.2.


## 0.6.0 - 2026-09-05

### Changed

- Aligned workflow entrypoints with explicit scope, existing authorization, and
  read-only requests, including generated state and knowledge records.
- Made the recorded HTML requirement govern full planning, worker handoffs,
  acceptance, and archiving consistently.
- Allowed one combined simplicity/correctness review for tiny low-risk diffs;
  retained separate reviews and engineering safeguards for other changes.
- Preserved prior cleanup authorization across shipping and PR monitors and
  distinguished optional monitoring from a failed required monitor.
- Made implementation delegation default explicitly to auto, subject to user
  and harness restrictions, while preserving configured worker selections.
- Reused accepted UI requirements before asking design-to-code questions and
  allowed independent work to continue while a dependent design region is blocked.
- Released the seven delivery workflow skills at 0.6.0 and design-to-code,
  grill-to-spec, and task-master at 0.2.0; unchanged skills retain their individual versions.

## 0.5.0 - 2026-09-04

### Changed

- Reworked Kickoff around compact episode state, proportionate investigation/tiny/fast/full routes, durable correction handling, and recovery after context compaction.
- Made route selection domain-neutral across product experience, accessibility, compatibility, performance, data/security, delivery, and operations.
- Tightened Plan It and both independent plan reviews to avoid redundant discovery, revise by stable finding IDs, and match planning effort to demonstrated complexity.
- Strengthened Simplicity Review with explicit delete, reuse, and compress passes plus a measurable complexity delta and mandatory finding reconciliation.
- Required a dedicated Ponytail implementation-diff review before the separate correctness-focused Code Review.
- Made PR creation and five-minute monitoring one verified handoff, with explicit head/base checks, live monitor evidence, and terminal delivery states.
- Added post-merge Forest cleanup: ask once whether to close or retain the exact worktree, refuse unsafe closure, and verify successful `forest close` cleanup.
- Bumped `kickoff`, its six downstream workflow skills, and the repository release to 0.5.0.

## 0.4.0 - 2026-08-29

### Changed

- Made Nabu owner onboarding direct users to `${NABU_URL}/settings/agents` with concrete permission and connection-link steps, then require the agent to complete redemption, credential storage, MCP configuration, and verification.
- Added a bounded Nabu skill version preflight that offers a manager-owned update or reinstall when a newer version is available and remains usable offline.
- Aligned Kickoff's version metadata with the repository release so its version preflight does not repeatedly prompt after a bundle update.
- Accepted Artifact Viewer's stable published name as a compatibility alias during skill validation.
- Bumped `nabu` to 0.2.0 and the repository release to 0.4.0.

## 0.3.0 - 2026-08-21

### Changed

- Embedded Ponytail's YAGNI, reuse, native-platform, and minimum-machinery principles into the existing repository-aware simplicity review without adding another review agent.
- Made Kickoff's version preflight read the repository's one-line `VERSION` file instead of parsing non-standard skill frontmatter.
- Bumped `simplicity-review` to 0.2.0 and `kickoff` plus the repository release to 0.3.0 so installed workflows discover the update.

## 0.2.0 - 2026-08-21

### Added

- Added a bounded kickoff version preflight that asks before updating an outdated installation, updates the compatible repo-owned workflow set together, and remains usable offline.
- Added `ponytail` and `ponytail-review` as portable kickoff workflow dependencies.
- Added a dispositioned Ponytail review of the integrated diff before the normal correctness and security review.

### Changed

- Required every `ship-it` implementation executor, whether the orchestrator or a delegated worker, to use Ponytail Full without overriding accepted requirements or safeguards.
- Bumped `kickoff`, `ship-it`, and the repository release to 0.2.0.

## 0.1.0 - 2026-08-20

### Added

- Added the repository release version in [`VERSION`](VERSION).
- Added SemVer metadata to every published skill's `SKILL.md` frontmatter.
- Added explicit full-plan gates for the design reference, Lavish playbooks, semantic visual structures, and HTML presentation quality.
- Established SemVer for shared-skill repository releases; user-facing workflow changes continue to be recorded here.

## 2026-08-14

### Added

- Added configurable planning workers under `plan_it.workers.<harness>` in the shared `kickoff.yaml`.
- Added a durable planning packet, artifact result, validation, and review-revision contract for full Lavish and fast Markdown plans.
- Added this repository changelog, reconstructed from the existing push history.

### Changed

- Made the kickoff task a top-level orchestrator that delegates planning, independent reviews, implementation, and code review to stage-specific workers.
- Routed adversarial, simplicity, user-requested, and final-acceptance handoffs back through the configured planning worker, including Lavish closure and accepted-plan archival.
- Nudged `ship-it` toward multiple dependency-ready implementation workers for genuinely independent workstreams without forcing artificial decomposition.

## 2026-08-15

### Added

- Added `grill-to-spec`, a Matt Pocock-inspired, MIT-attributed product-definition interview that writes durable repository-owned specifications before implementation planning.

## 2026-08-10

- Updated Nabu owner-agent onboarding documentation ([`50b4fe0`](https://github.com/Timmyy3000/skills/commit/50b4fe0)).

## 2026-08-09

- Made Nabu MCP-first ([`ce3ee67`](https://github.com/Timmyy3000/skills/commit/ce3ee67)).
- Persisted scoped Nabu API sessions across chats ([`0dd4f2a`](https://github.com/Timmyy3000/skills/commit/0dd4f2a)).

## 2026-08-08

- Documented read-only Nabu shared-space links ([`8cf4d03`](https://github.com/Timmyy3000/skills/commit/8cf4d03)).

## 2026-08-07

- Deferred implementation-worker bootstrap until `auto` mode actually selects delegation ([`eec5805`](https://github.com/Timmyy3000/skills/commit/eec5805)).
- Required first-use kickoff worker configuration instead of silent fallback ([`955a556`](https://github.com/Timmyy3000/skills/commit/955a556)).

## 2026-08-05

- Added Task Master and configurable review workers shared by adversarial and simplicity review ([`4153c30`](https://github.com/Timmyy3000/skills/commit/4153c30)).

## 2026-08-02

- Fixed Nabu invite redemption endpoint derivation ([`6c0e237`](https://github.com/Timmyy3000/skills/commit/6c0e237)).
- Required verification of shared documents after Nabu invite redemption ([`65f4426`](https://github.com/Timmyy3000/skills/commit/65f4426)).
- Persisted Nabu shared-access tokens for follow-up sessions ([`9820e1d`](https://github.com/Timmyy3000/skills/commit/9820e1d)).
- Added Nabu invite redemption support ([`e4376df`](https://github.com/Timmyy3000/skills/commit/e4376df)).
- Expanded Nabu's universal self-hosted contract ([`7b5f21c`](https://github.com/Timmyy3000/skills/commit/7b5f21c)).
- Added harness-native named worker selectors ([`608be65`](https://github.com/Timmyy3000/skills/commit/608be65)).
- Made Nabu deployment-agnostic ([`e7a4a3e`](https://github.com/Timmyy3000/skills/commit/e7a4a3e)).
- Added the Nabu skill ([`8179835`](https://github.com/Timmyy3000/skills/commit/8179835)).
- Added the Better Docs editor ([`9bb94b0`](https://github.com/Timmyy3000/skills/commit/9bb94b0)).
- Removed duplicated Vercel skills ([`7d3085d`](https://github.com/Timmyy3000/skills/commit/7d3085d)).
- Added portable implementation delegation and repository-level worker configuration ([`bd38f17`](https://github.com/Timmyy3000/skills/commit/bd38f17)).

## 2026-08-01

- Added simplicity review and fast planning ([`3d0518c`](https://github.com/Timmyy3000/skills/commit/3d0518c)).

## 2026-07-31

- Routed Lavish workflows through the configured fork ([`a56c0e8`](https://github.com/Timmyy3000/skills/commit/a56c0e8)).

## 2026-07-27

- Added the simplest-elegant-solution gate to Plan It ([`8fa1850`](https://github.com/Timmyy3000/skills/commit/8fa1850)).

## 2026-07-09

- Tightened kickoff's end-to-end shipping and review-monitoring loop ([`5e0c946`](https://github.com/Timmyy3000/skills/commit/5e0c946)).

## 2026-07-04

- Added Forest worktree setup to kickoff ([`523c0be`](https://github.com/Timmyy3000/skills/commit/523c0be)).
- Added the independent adversarial-review workflow ([`adc564e`](https://github.com/Timmyy3000/skills/commit/adc564e)).
- Added the kickoff engineering workflow ([`362cb31`](https://github.com/Timmyy3000/skills/commit/362cb31)).

## 2026-07-03

- Created the shared Docsyde agent-skills repository ([`0e93591`](https://github.com/Timmyy3000/skills/commit/0e93591)).
