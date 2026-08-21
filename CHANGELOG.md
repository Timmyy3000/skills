# Changelog

This file records user-facing changes to the shared skills repository. Commit links preserve the history that predates this changelog.

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
