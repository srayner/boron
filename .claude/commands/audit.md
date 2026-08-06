---
description: Regenerate audit/AUDIT.md from the current state of the repo, with section scores and a maturity category
---

Regenerate a full quality/security audit of this repository. The goal is an honest, current snapshot — never reuse findings from earlier in this conversation or from memory. Every run re-derives everything from scratch, even if you believe nothing has changed.

## 1. Research (always fresh)

Launch three Explore agents in parallel:

- **Code structure & security**: inventory `app/`, `actions/`, `components/`, `lib/`, `services/`, `schemas/`, `hooks/`, `types/`, `prisma/`, `middleware.ts`, `routes.ts`, `auth.ts`, `auth.config.ts`. Check: authn/authz coverage and gaps (route protection, RBAC, resource ownership), input validation consistency (zod usage), raw SQL / injection risk, secrets handling (`.env` gitignored? hardcoded secrets?), password hashing, XSS/CSRF surface (`dangerouslySetInnerHTML`), and any AI/LLM-driven endpoints that execute actions from model output. Also note linting/TS strictness and dependency staleness/risk.
- **Test quality & coverage**: inspect `vitest.config.ts`, `vitest.setup.ts`, `cypress.config.ts`. Inventory all unit and e2e test files. Estimate what fraction of files in `actions/`, `services/`, `lib/`, `hooks/`, `app/api/**`, and security-critical files (`auth.ts`, `auth.config.ts`, `middleware.ts`) have any test. Sample several tests for real assertions vs. trivial/snapshot-only, mocking hygiene, error-path coverage, skipped tests, and stale/misleading comments. Actually run `npm run test:unit -- --run` and report pass/fail counts.
- **Documentation**: assess `README.md` and any other docs (CONTRIBUTING, ARCHITECTURE, docs/, .github templates) for setup/env/deploy coverage and gaps. Sample in-code comments across non-trivial logic (state machines, auth callbacks, search/index building) for whether it's explained. Check API route documentation (or absence) and end-user-facing docs (or absence).

In parallel with the agents, run `npm audit --json` directly yourself and summarize vulnerability counts by severity, flagging any critical/high issues on direct dependencies or on packages that sit on the app's security boundary (auth, framework).

## 2. Score each section (0–100)

Score exactly these five sections, independently, using these anchor bands. Every score must be justified by findings actually reported in that section — no score without evidence, and no inflating scores to be encouraging. The purpose of scoring is to drive real improvement, so be honest even when it's unflattering.

- **90–100 Excellent** — no critical/high findings; comprehensive and internally consistent.
- **75–89 Good** — no critical findings; only minor/medium gaps.
- **55–74 Fair** — no critical findings, but multiple high-severity or systemic gaps.
- **30–54 Poor** — at least one critical finding, or a fundamental gap (e.g. near-zero test coverage, no authz checks at all).
- **0–29 Severe** — multiple critical findings, or the area is essentially absent.

The five sections, equally weighted (20% each):
1. Security — Application Code
2. Security — Third-Party (npm audit)
3. Test Quality & Coverage
4. Documentation
5. Code Structure & Standards

**Overall score** = round(mean of the 5 section scores).

**Maturity category**, derived from the overall score (constructive framing — never use dismissive language like "hobby project"):
- 0–39: **Early Stage**
- 40–59: **Developing**
- 60–79: **Solid Foundation**
- 80–100: **Production-Ready**

## 3. Rewrite audit/AUDIT.md (full overwrite, not a patch)

Overwrite `audit/AUDIT.md` entirely — do not incrementally edit the old one, since it may describe findings that no longer apply. Structure:

1. Title + today's date.
2. **Executive Summary** — 4-6 bullets, most serious concerns first.
3. **Scorecard** — a table with the 5 section scores, the overall score, and the maturity category, placed right after the summary so it's the first thing seen.
4. **Security — Application Code** — findings table/list, most serious first, with severity labels (Critical/High/Medium/Low) and file:line citations. Note genuine positives briefly too.
5. **Security — Third-Party (npm audit)** — vulnerability counts by severity, and specifics on any critical/high findings on direct or security-boundary dependencies.
6. **Test Quality & Coverage** — coverage estimate, what's untested (especially security-critical code), test quality issues, current pass/fail count.
7. **Documentation** — what exists, what's missing, in-code documentation quality.
8. **Code Structure & Standards** — consistency issues, validation/error-handling patterns, lint/TS config baseline.
9. **Suggested Priority Order** — a short numbered list of what to fix first.

Keep findings concise — most serious concerns only, not an exhaustive inventory. One-line summary of a minor issue is fine; don't write remediation essays.

## 4. Append to audit/AUDIT_HISTORY.md (never overwrite)

Append one row to `audit/AUDIT_HISTORY.md`, creating it with a header row if it doesn't exist yet:

```
| Date | Overall | Category | Security-App | Security-3rd Party | Tests | Docs | Structure |
|---|---|---|---|---|---|---|---|
```

This file is append-only — it's what makes progress visible over time even though `audit/AUDIT.md` itself is a fresh snapshot each run. Never delete or rewrite existing rows.

## 5. Report back

After writing both files, give a short summary: the overall score, category, and whether it moved up or down from the previous `audit/AUDIT_HISTORY.md` row (if one exists).
