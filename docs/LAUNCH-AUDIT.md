# Synas Labs launch audit

Date: 2026-09-18  
Scope: public site, System Brief, Start a project, Synas OS, client portal, SEO, security, accessibility, performance.  
Method: code review, domain tests, lint/typecheck/build, local browser pass (320–1440), fetch of live `https://synaslabs.com/sitemap.xml` and `robots.txt`.  
Admin and portal were fail-closed locally (no `AUTH_SECRET` / `DATABASE_URL` in the running process). They were not click-tested as signed-in surfaces.

This is a review of what the repository actually does, not a list of intended features.

---

## 1. Product assessment

**Yes — with the current pages, Synas reads as a systems company, not as a software agency with a decorative site.**

The homepage now leads with how work moves, not with a catalogue of services. The hero is the brand line. The body is a sequence: work already has a path → the path lives in pieces → the problem is often connection, not missing software → Synas designs around the real path → a small example → an optional System Brief → a project conversation.

That is the right category.

What makes it convincing is not the number of pages. It is that:

- The visitor can understand Synas without becoming a workflow engineer.
- System Brief is optional. Contact, Work, Solutions, Approach, and Start a project all work without it.
- Work does not invent clients. Lead Radar is labeled **Internal product / Synas Labs**.
- The brief ends in a document a business owner can read, not a generated app.
- Unconfigured integrations fail closed. They do not pretend to have executed.

The remaining product risk is not tone. It is **production deploy**: live `sitemap.xml` still 500s on the current host, and the live `robots.txt` is the older allow-all file. The repository is ahead of production.

---

## 2. UX issues found

| Persona | Issue | Severity |
| --- | --- | --- |
| Non-technical owner | Early drafts asked industry / size / goals. That tested the visitor instead of helping them. | High — fixed |
| Operations manager | Exception was injected as decoration, or mixed into the happy path. | High — fixed |
| Technical founder | Interpret ran in the browser and could invent systems. | High — fixed |
| Sales / marketing | Work could be read as a case-study page. | High — fixed |
| Executive | Title/description sounded like keyword SEO (“AI Automation, CRM & Business Software”). | Medium — fixed |
| Spec-ready buyer | Brief fields were incomplete; Title was repeated; tools and integrations were prefilled with the same string. | Medium — fixed |
| All | Contact was only in the footer. On a long mobile page that is easy to miss. | Medium — fixed |
| All | 404 used the homepage title. Unauthenticated `/admin` titled “Synas Labs — Synas Labs”. | Low — fixed |
| All | Session storage accepted any JSON as a System Brief. | Medium — fixed |
| All | Signed-in role lived only in the cookie. A role change would not take effect until expiry. | Medium — fixed |

Journey shape: the product brief listed ten named beats (Describe → … → Start conversation). Shipping a ten-step wizard would have felt like a test. The live session uses six labeled stages and folds inspect/understand into the run. That is intentional.

---

## 3. Fixes made

### System Brief

- Server-side interpret with optional OpenAI, then Zod parse + `sanitizeWorkflow`. Unknown tools become `UNKNOWN` or `OUT_OF_SCOPE`.
- Clarification questions are operational only (“What happens immediately after the payment is received?”). Industry, size, and goals are not asked.
- Deterministic simulator with an explicit happy path, then a separate exception path (`REQUEST_NEW_PROOF` → `HUMAN_REVIEW` → `CONTINUE` pattern).
- Fictional sample case is editable. The required warning is shown on describe and sample:
  “Use sample or fictional data. Do not enter passwords, payment credentials, private customer information, or confidential business data.”
- Brief fields: Title (as heading), Process, Business Context, Inputs, Workflow, Automated Steps, Human Steps, Exceptions, Required Connections, Open Questions, Simulation Summary.
- CTA: “Want to build the real system?” → Start a project. Brief is stored in `sessionStorage` and attached to intake. Server validates with `parsePublicBrief` before persist.
- Rate limit on interpret/simulate. Rate limit on inquiry.

### Site and conversion

- Hero copy states the work, not a service list.
- Dual CTAs on home: System Brief (optional) and Start a project. No urgency, no fake social proof.
- Contact added to primary navigation.
- Work: empty client systems on purpose; Lead Radar labeled internal.
- Metadata title aligned to “Systems that move businesses.”
- 404 has its own title. Login / OS / portal titles no longer double the site name.

### Platform

- Inquiry matching uses targeted company lookup, not a full table scan.
- Open inbound leads are updated rather than duplicated.
- System Brief is attached to lead + opportunity + workflow + simulation run when present.
- Document bytes are served only through authorized routes; unconfigured object storage returns 503, not a guessed URL.
- `getCurrentActor` re-reads the user row. Cookie role is no longer the source of truth after login.
- Architecture doc §1 updated so it describes the current product, not the old coming-soon site.

### Hardening

- Security headers: nosniff, frame deny, referrer, permissions, COOP, HSTS, CSP (still allows inline/eval for Next.js — see §4).
- Client brief storage now runs `parsePublicBrief`.

---

## 4. Security findings

### Pass (fail closed)

- `/admin`, `/portal`, `/login` 404 when auth is not configured. They do not advertise an empty OS.
- Page layouts require a session and the correct role. Wrong role is `notFound()`, not a 403 body that confirms the surface.
- DAL `authorize()` / `assertCompanyScope()` sit on reads and writes. Client document and proposal access is visibility/status scoped.
- File routes call `requireTeamActor` / `requireClientActor` then `getDocument` (which authorizes). No “hide the button” access control.
- Sessions: HMAC-SHA256, httpOnly, SameSite=lax, Secure in production, 12-hour TTL, open redirect blocked on `next`.
- Passwords hashed. Login errors are generic.
- Public AI output is schema-validated and sanitized. Prompts are server-only. Narrative is delimited as untrusted data. Model is instructed to ignore embedded instructions.
- Inquiry honeypot + in-process rate limits.
- No public workflow export, n8n dump, prompt reveal, or downloadable clone.

### Remaining / residual

| Finding | Risk | Notes |
| --- | --- | --- |
| CSP allows `'unsafe-inline'` and `'unsafe-eval'` | Medium | Required for current Next.js inline runtime + JSON-LD. Tighten with nonces after a dedicated CSP pass. |
| Rate limits are in-memory | Medium | Per instance. Not shared across Railway replicas. Fine at low traffic; not an abuse ceiling. |
| `x-forwarded-for` as client key | Low–medium | Trust only if the platform proxy overwrites it. |
| Document `uri` is stored | Low | Object storage port must never fetch arbitrary URLs. Current unconfigured port does not. |
| Bootstrap admin uses string equality on first user | Low | One-time empty-table path. Rotate `BOOTSTRAP_ADMIN_PASSWORD` after first login. |
| Calendar / email / Airtable / n8n / Apify | Info | Ports exist. Unconfigured ≠ success. Do not wire them by faking callbacks. |
| Public brief lives in `sessionStorage` | Info | Tab-scoped, not a server secret. Users can still paste sensitive text; the UI warns them not to. |

No public production access to source, keys, or internal scoring was found in the public routes.

---

## 5. Performance findings

Measured by architecture and build, not by a production RUM profile.

| Area | Finding |
| --- | --- |
| Dependencies | Small: Next, React, Drizzle, postgres, Zod. No analytics SDK, no workflow canvas library, no UI kit. |
| System Brief | Client bundle loads `brief-session` via `next/dynamic`. Interpret/simulate are server actions. |
| Fonts | `next/font` (Geist, Geist Mono, Instrument Serif), `display: swap` on serif. |
| Images | Local PNGs via `next/image`. Wordmark is the live header mark. |
| AI tokens | Only when `OPENAI_API_KEY` is set. Timeout 12s, temperature 0.1, JSON object, 4k narrative cap. Fallback is free and deterministic. |
| Sitemap | `force-static` + fixed `SITE_UPDATED_AT` so production does not 500 on runtime `Date` issues. |
| Bundle | Do not add a node graph, generated CRM, or client-side model to look more “AI.” |

Blind optimization was not done. The expensive thing to avoid is still a public canvas, not another kilobyte of CSS.

---

## 6. SEO findings

### In this repository

- `metadataBase` is `https://synaslabs.com`.
- Home title: “Synas Labs — Systems that move businesses.”
- Per-page title, description, canonical, Open Graph, Twitter.
- Organization + WebSite JSON-LD.
- `robots.ts`: allow `/`, disallow `/admin`, `/portal`, `/login`, sitemap URL.
- `sitemap.ts`: `/`, `/solutions`, `/work`, `/approach`, `/brief`, `/about`, `/start`, `/contact`.
- One H1 per public page. Internal links in header/footer.
- 404 is a real not-found document, now with its own title and `noindex`.
- Admin/portal/login are `noindex`.

### Live host (2026-09-18)

| URL | Result |
| --- | --- |
| `https://synaslabs.com/robots.txt` | 200. Allow `/`, sitemap line. **Does not yet disallow private paths** — old production file. |
| `https://synaslabs.com/sitemap.xml` | **500.** This is the same production defect noted before. Local `next start` sitemap is 200. |

Launch action: deploy this build, then confirm both URLs on the live host. Do not change the sitemap URL shape.

---

## 7. Accessibility findings

| Area | Status |
| --- | --- |
| Language | `html lang="en"` |
| Skip link | Present on public layout; visible on focus |
| Semantics | Page H1s, labeled fields, `dl` for contact and brief, `ol` for approach and simulation |
| Keyboard | Header menu, skip link, form fields, 44px-class controls (`min-h-11`) |
| Focus | `:focus-visible` outline on the document; fields keep a visible ring |
| Labels | Brief textarea has an sr-only label; intake fields wrap visible labels |
| Errors | `role="alert"` on brief and intake errors; `aria-invalid` on intake |
| Reduced motion | CSS animations/transitions cut; simulation reveal dumps all events immediately |
| Contrast | Ink on paper. Teal is used as a rule, not as small text. Error red `#8a1f1f` on paper is readable |
| Screen reader | Simulation log is `aria-live="polite"`. Menu has `aria-expanded` / `aria-controls` / `aria-label` |
| Mobile | Overflow checked at 320px on home and brief (no horizontal scroll). Menu replaces desktop nav below `lg` |

Not a WCAG certification. Residual: OS nav on small screens is a wrapping link row, not a drawer — acceptable for a private tool, not as considered as the public header.

---

## 8. Architecture findings

The platform is one Next.js app, three surfaces, one domain, one database.

```
Public site  →  System Brief (optional)  →  Start a project
                                              ↓
                                    Company / Contact / Lead
                                              ↓
                                         Opportunity
                                              ↓
                                    Discovery / System Brief
                                              ↓
                                         Proposal
                                              ↓
                                      Project / Tasks / Documents
                                              ↓
                                         Client portal
```

What holds:

- WorkflowV1 is the versioned IR. AI may draft; Zod + sanitizer decide.
- Simulator is pure. Same schema + path → same event log.
- Integrations are ports. Missing credentials → `IntegrationNotConfiguredError` → honest UI/503.
- Public never receives prompts, n8n workflows, or production architecture.
- Intake matching is by website host, then name. Open leads are reused.

What was wrong and is no longer the contract:

- Architecture §1 still describing a coming-soon homepage. Updated.
- Interpret on the client. Moved to the server.
- Cookie as durable authorization. Actor is reloaded from `users`.

---

## 9. System Brief assessment

The experience now matches the product principle: **the visitor explains how the business works; Synas shows it as a system.**

| Beat | How it ships |
| --- | --- |
| Describe | One textarea. Optional starters (not case studies). Sensitive-data warning. |
| Clarify | At most four operational questions. “Not sure” is valid. |
| Confirm | Editable step titles and actors. Exception named in plain language. |
| Edit sample | Fictional facts, labeled Fictional. No uploads. |
| Run | Deterministic happy path. Codes, why, performer, automated vs human. |
| Exception | Separate run. Operational break, then human recovery, then continue. |
| Inspect / Understand | Same screen, after the log. No animated node graph. |
| Generate brief | Structured document, not prose fluff. |
| Start conversation | “Want to build the real system?” → `/start` with brief attached. |

AI may interpret, extract, ask, fictionalize sample data, suggest a supported template, and write the brief.

AI must not invent integrations, APIs, prices, timelines, production architecture, or live execution. Sanitizer + copy (“Simulation · no live system”) enforce that.

Without `OPENAI_API_KEY`, the deterministic interpreter still runs. Quality is lower on messy prose (steps can read mixed or clipped). That is acceptable. It is worse to fake a smarter model.

---

## 10. Remaining risks

1. **Production is not this commit.** Live sitemap 500 and old robots.txt until deploy.
2. **No signed-in browser pass** of admin/portal in this audit (local auth unconfigured). DAL tests cover permission rules; click-through of OS on a phone was not done.
3. **In-memory rate limits** will not hold across multiple Node processes.
4. **CSP is not nonce-based yet.**
5. **Deterministic interpret** is a senior-analyst sketch, not a process-mining product. Out-of-scope handling exists; some vague narratives will still produce a thin path.
6. **Object storage is not connected.** Documents can be recorded; bytes return 503 until a real `documents` port is configured.
7. **Email/calendar/Airtable/n8n/Apify** are complete as architecture, not as live operations.
8. **HSTS preload** is set in headers. Only keep preload if `synaslabs.com` will remain HTTPS on this name.
9. **No client portfolio.** That is honest. Do not fill `/work` later with unnamed “case studies.”

None of these are reasons to add more public features.

---

## 11. Production environment requirements

Required for a coherent launch of the public site:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin. Production: `https://synaslabs.com` |
| Node 20.9+ | Next 16 |

Required to open Synas OS / portal (otherwise those routes 404):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres for Drizzle |
| `AUTH_SECRET` | Session HMAC (long random string) |
| `BOOTSTRAP_ADMIN_EMAIL` | First admin, only when `users` is empty |
| `BOOTSTRAP_ADMIN_PASSWORD` | First admin password; rotate after bootstrap |

Optional. Ports already exist; leaving them empty is a valid configuration state:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | Better System Brief interpretation. Default model `gpt-4o-mini` |
| `RESEND_API_KEY` | Transactional email. Without it, intake still records + mailto |
| `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` | External CRM sync, if used |
| `N8N_WEBHOOK_URL` | Internal automation handoff. Never expose n8n to the public site |
| `APIFY_TOKEN` | Lead Radar research jobs. Internal only |
| `CALENDAR_PROVIDER` | `google` or `microsoft` when calendar OAuth is wired |

After deploy, verify:

- [ ] `https://synaslabs.com/sitemap.xml` returns 200 and the eight public URLs
- [ ] `https://synaslabs.com/robots.txt` disallows `/admin`, `/portal`, `/login`
- [ ] Homepage title is “Synas Labs — Systems that move businesses.”
- [ ] `/work` still says Lead Radar is internal
- [ ] `/brief` → `/start` still carries the brief
- [ ] `/admin` without a session does not leak the OS (404 or login, never a data view)
- [ ] Unconfigured integrations still do not report success

Do not ship a public “coming soon” inside this site. If a provider is missing, show that it is missing.
