---
name: grill-to-spec
description: Turn an ambiguous product or feature idea into a durable, repository-owned product specification through a decision-tree interview. Use when feature work lacks an approved spec, when a product owner needs a handoff artifact for engineers, or when kickoff must resolve product ambiguity before planning. Do not use for clear small bugs or refactors that already have precise behavior and acceptance criteria.
version: 0.1.0
---

# Grill to Spec

Turn the user's product intent into an approved specification. Own the **what** and **why**; do not create an implementation plan, modify product code, create implementation tickets, or begin execution.

## Route the request

1. Check whether the user supplied an approved spec or whether the repository already contains one for this work.
2. If an approved, current spec exists, do not grill by default. Report the spec path and hand off to `kickoff`/`plan-it` for implementation planning. If the user asks to change the product behavior, treat the existing spec as a draft and grill only the changed decisions.
3. If no spec exists and the request is a feature, product improvement, or ambiguous behavior change, continue with this skill.
4. If the request is a clear bug, refactor, or hotfix with precise expected behavior and acceptance criteria, use a brief or the existing kickoff intake instead of forcing a full product grill.
5. If the effort is too large or too foggy to hold in one session, recommend a decision map/wayfinder phase first. The map resolves decisions; this skill still produces the spec that engineers consume.

## Establish the durable workspace

Before interviewing:

1. Read applicable repository instructions, existing specs, domain glossary/context, relevant ADRs, and nearby product documentation.
2. Locate the repository's spec template. Prefer, in order:
   - a path named by repository instructions or the user;
   - an existing template in a documented docs/specs or planning convention;
   - common names such as `SPEC_TEMPLATE.md`, `spec-template.md`, `docs/templates/spec-template.md`, `docs/specs/SPEC_TEMPLATE.md`, or `.agent/templates/spec-template.md`.
3. Search the repository rather than guessing. Use `rg --files` when available, then read every candidate that could govern this spec.
4. If multiple templates conflict, ask the owner which one governs. Do not silently merge templates.
5. If a repository has no template, use `references/spec-template.md` as the proposed fallback. In a real repository, state that the fallback should be promoted to a repository-owned template; ask before creating a new repository convention unless kickoff has already authorized that convention.
6. Choose the durable output path from repository convention. If none exists, propose `docs/specs/<feature-slug>.md` and ask before creating the folder. Never overwrite an existing non-draft spec; create a revision or ask the owner.
7. Create or update the draft spec before deep questioning when practical. Mark it `Draft - grilling` and record the template source and output path.

The draft is durable working memory, not a transcript. Keep it updated as material decisions crystallize so a resumed session can continue without reconstructing the conversation.

## Grill the product decisions

Build a decision tree for the product problem. Work from settled prerequisites toward dependent decisions. Ask only questions the user must answer; inspect the repository and use tools for facts the environment can answer.

For each question:

```text
Q<n> - <short decision title>: <the product decision that must be made>
Recommendation: <your recommended answer and the reason it best fits the stated outcome>
```

Rules:

- Ask one question at a time and wait for the answer. Do not dump a questionnaire.
- Keep questions about user value, observable behavior, scope, constraints, and acceptance—not implementation mechanics.
- Give a recommendation, but make the user's decision explicit. Do not treat silence as approval.
- Let each answer reshape the next questions. Do not ask downstream questions whose prerequisites are unresolved.
- Verify facts from the repository, tools, and primary sources yourself. Do not ask the user to supply facts that can be looked up.
- Surface contradictions, overloaded terms, hidden actors, missing states, permission boundaries, failure modes, and out-of-scope requests.
- If a decision is fundamentally visual or experiential, use a small prototype or other concrete artifact when available instead of asking the user to imagine it from prose. Record the resulting product decision in the spec; do not turn the prototype into production code.
- Keep implementation freedom visible. If a technical detail is not a product constraint, leave it for the implementation plan.

After each meaningful answer, update the relevant spec sections. Preserve rejected alternatives only when the reason will prevent future re-litigation.

## Write the specification

Use the selected template exactly. Preserve its headings, ordering, and local vocabulary. Do not replace the repository template with the bundled fallback.

The finished spec should make the following unambiguous, using the template's equivalent sections:

- the problem and intended outcome;
- who acts and who benefits;
- user journeys and observable behavior;
- requirements, states, edge cases, permissions, and failure behavior;
- acceptance criteria that can be checked from outside the implementation;
- scope, non-goals, constraints, dependencies, risks, and assumptions;
- product decisions and unresolved questions;
- success measures when they matter.

Keep the spec implementation-agnostic. Do not add implementation phases, file paths, module designs, API internals, migration commands, worker choices, test commands, or a plan. A technical constraint belongs in the spec only when it is externally required or explicitly agreed as a product constraint.

Do not automatically publish the spec to an issue tracker. The durable repository artifact is the source for kickoff; publishing or ticket breakdown belongs to a later workflow unless the repository's template explicitly requires publication.

## Confirm and hand off

The grill is complete only when:

1. Every material product decision is settled, or the user explicitly accepts the remaining uncertainty as a documented risk.
2. Requirements, acceptance criteria, scope, and non-goals are specific enough for an engineer to plan without re-interviewing the product owner.
3. The user confirms the shared understanding and approves the spec for planning.

On confirmation:

- change the spec status to `Ready for Plan`;
- record the product-owner confirmation and date if the template supports it;
- list any accepted risks or deferred questions;
- return the absolute spec path, template source, status, and the next step: `kickoff`/`plan-it`.

If the user has not confirmed, leave the artifact as `Draft - grilling` or `Draft - awaiting product confirmation`. Do not plan, implement, create tickets, or claim that the work is ready.

## Handoff contract for kickoff

When invoked by `kickoff`, return:

```text
Spec status: <Draft - grilling | Draft - awaiting confirmation | Ready for Plan>
Spec path: <absolute path>
Template source: <absolute path or bundled fallback>
Product-owner confirmation: <yes/no/date if known>
Open product decisions: <none or concise list>
Accepted risks: <none or concise list>
Next step: <continue grilling | obtain confirmation | kickoff planning>
```

`Ready for Plan` means the product contract is clear. It does not mean the implementation approach is chosen.

## Bundled reference

Use [references/spec-template.md](references/spec-template.md) only when the consuming repository has no governing template and the fallback is accepted for the session.

## Attribution (non-operational)

This skill is an independent adaptation of the grilling approach from Matt Pocock's MIT-licensed [`mattpocock/skills`](https://github.com/mattpocock/skills) repository. See its [MIT license](https://github.com/mattpocock/skills/blob/main/LICENSE). This section is attribution only; do not invoke or inspect external skills because of these links. Follow the workflow in this file.
