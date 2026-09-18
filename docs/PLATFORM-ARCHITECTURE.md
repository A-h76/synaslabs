# Synas Labs platform architecture

Status: this repository is the Synas Labs public site, System Brief working session, Synas OS (internal CRM/delivery), and client portal.  
Date: 2026-09-18  
See `docs/LAUNCH-AUDIT.md` for the launch-quality review of what actually shipped.

The notes below remain the architectural contract. Section 1 is the current surface.

`Synas-Labs-Concept-Review.html` is **not in this GitHub repository**. The evaluation below uses the review’s arguments as supplied in the product brief, judged independently. It is not a rubber stamp of that review, and it does not invent a document that is not here.

---

## 1. What exists today

This repo is a **systems-company website plus an operating system**, not a public SaaS product catalog.

| Area | Finding |
| --- | --- |
| Framework | Next.js **16.3.5** App Router, React **19.2.8**, TypeScript 5, Tailwind CSS 4 |
| Runtime | Node `>=20.9.0` (pinned so Railway Nixpacks can build Next 16) |
| Hosting | Railway (`railway.json`, `next start --hostname 0.0.0.0`) |
| Public routes | `/`, `/solutions`, `/work`, `/approach`, `/brief`, `/about`, `/start`, `/contact` |
| Private routes | `/login`, `/admin/*`, `/portal/*` — fail closed when `AUTH_SECRET` or `DATABASE_URL` is missing |
| System Brief | `/brief`: describe → clarify → confirm → fictional sample → deterministic run → exception → brief → `/start` handoff |
| Operating system | Lead, company, contact, opportunity, discovery, system brief, proposal, project, task, document, portal |
| Design system | Tokens in `src/app/globals.css`: teal `#02d89c`, ink `#0a0a0a`, paper `#f4f7f4`, Geist Sans/Mono, Instrument Serif |
| SEO | Title/description, canonical, OG/Twitter, Organization + WebSite JSON-LD, `robots.ts`, static `sitemap.ts` |
| Sitemap | `src/app/sitemap.ts` → `https://synaslabs.com/sitemap.xml`. Local build is 200. Live production must be redeployed if it still 500s. |
| Robots | Allow `/`, disallow `/admin`, `/portal`, `/login`, sitemap URL |
| Assets | Pixel wordmark (`synas-wordmark.png`), arch mark for app/favicon, logo sheet. Alternate four-module mark is **not** the live header logo. |
| Lead Radar | Internal product, labeled as such on `/work`. Not a client case study. |
| Auth | HMAC-signed httpOnly session; roles re-read from the database on each request |
| Database | Drizzle + Postgres when `DATABASE_URL` is set |
| Env | `.gitignore` ignores `.env*`. `.env.example` lists required and optional keys |
| Intake | `/start` records a lead when the store is configured; otherwise opens mailto to `hello@synaslabs.com` |
| Integrations | Typed ports. Unconfigured providers return a configuration state. They do not fake success. |

Sibling folder `D:\Synas-Labs` (not this repo) contains prospect CSVs whose columns match a **market-research → CRM** workflow. That informed the domain model. It is not imported here.

**Do not commit operational credential spreadsheets into this repo.** Rotate anything that has lived in plaintext files.

---

## 2. Product judgment

### Positioning

Synas Labs is a **systems company**: AI automation + CRM + business software, sold as connected systems, not as a public SaaS catalog.

Lead Radar is an **internal** opportunity-intelligence + CRM + sales-assistance system. It is not a client case study. `/work` exists to say that plainly, and to leave client systems empty on purpose.

There is still no Insights page. Empty writing would make a new company look hollow.

### Concept review (System Brief / “Studio” / “Playground”)

The review’s core question is the right one: **how does a prospect see their messy process as a connected system without Synas shipping a marketing-SaaS?**

**Accepted from the review**

- A blank workflow builder on the public site is the wrong object. It asks the visitor to do our job, and it positions Synas as a canvas tool (n8n, Zapier, Make). That is the wrong category.
- Node canvases, generated CRMs, and generated business apps are theater. They are expensive, non-deterministic, and they train the market to judge Synas as a demo factory.
- Chat-to-graph puppeteering will fail in public, in real time, on first impression.
- The simulator must not be a gatekeeper. The site has to make sense if the visitor never clicks it.
- The useful spine is: capture → confirm → one fictional case → deterministic run → one exception → automated vs human → system brief → human conversation.

**Rejected or modified**

- **Rejected name:** “Studio” / “Playground.” Those names imply a product. The public object is a **System Brief**. URL: `/brief`. Optional, quiet, diagnostic.
- **Modified “one fictional case”:** the *structure* is the visitor’s confirmed workflow. The *facts* are fictional. A canned industry story that ignores what they typed is as dishonest as a generated CRM.
- **Modified conversion:** the run is not the product. The brief is the artifact. The CTA is a project conversation, not “export my app.”
- **Not every visitor:** home, solutions, and approach must explain Synas with static editorial pages. Brief is an enhancement.

**AI’s job:** interpret natural language into a **versioned workflow schema**, then stop.  
**Engine’s job:** run that schema deterministically.  
**Human’s job:** confirm the structure, then talk to Synas.

Out-of-scope or unknowable processes are a first-class result: say so, still offer intake, do not fake a run.

---

## 3. Proposed architecture

One Next.js application. Three surfaces. One domain. One database.

```
Public site          System Brief         Synas OS              Client portal
(synaslabs.com)      (/brief, optional)   (/admin)              (/portal)
        \                 |                    |                      |
         \                |                    |                      |
          \               v                    v                      v
           \---------> Lead → Opportunity → Discovery → Brief → Proposal → Project
                                        PostgreSQL (system of record)
                                        Data Access Layer (server-only)
                                        Integration ports (AI, mail, calendar, …)
```

- The website is the front door (and, later, intake).
- The System Brief is **intake with understanding**, not a separate app.
- `/admin` is the operating system (including Lead Radar as a module, not a sister product).
- `/portal` is the relationship/delivery layer, scoped to the client’s company and projects.

No second Next app. No Airtable as source of truth. No n8n-backed public simulator.

---

## 4. Route map

### Public (indexable when the page actually exists)

| Route | Purpose | Now |
| --- | --- | --- |
| `/` | What Synas is, the problem, what we build, how to start | Coming-soon (preserve) |
| `/solutions` | AI automation, CRM, business software as **systems we build** — not SKUs | Next prompt |
| `/approach` | Method: messy process → connected system. Makes the brief unnecessary for understanding | Next prompt |
| `/brief` | Optional System Brief experience | Next prompt (engine exists) |
| `/start` | Project intake; may attach a brief | Next prompt |
| `/about` | Sparse, honest, new company | Next prompt |
| `/contact` | Redirect or alias of `/start` plus `hello@synaslabs.com` | Do not duplicate forms |

**Intentionally not in IA until content exists:** `/work`, `/insights`, `/resources` as a blog, `/studio`, `/playground`, `/login` in the public nav.

### Internal OS (noindex)

`/admin`  
`/admin/leads`  
`/admin/contacts`  
`/admin/companies`  
`/admin/opportunities`  
`/admin/discovery`  
`/admin/system-briefs`  
`/admin/proposals`  
`/admin/projects`  
`/admin/documents`  
`/admin/tasks`  
`/admin/content`  
`/admin/resources`  
`/admin/activity`  
`/admin/settings`  

Lead Radar lives **inside** opportunities / companies / activity (signals, scores, follow-up). It does not get a public URL.

Foundation: `/admin` and `/admin/[module]` exist, are authorized server-side, and **404 when auth is not configured** so the coming-soon site does not advertise an empty OS.

### Client portal (noindex)

`/portal`  
`/portal/projects`  
`/portal/proposals`  
`/portal/documents`  
`/portal/tasks`  
`/portal/updates`  
`/portal/messages`  
`/portal/support`  
`/portal/account`  

Same fail-closed rule.

### Auth and API

| Route | Rule |
| --- | --- |
| `/login` | Exists in code; 404 until auth is actually configured |
| `src/proxy.ts` | Optimistic cookie check on `/admin`, `/portal`, `/login` only. **Not** the security boundary |
| `/api/*` | None public yet. Future brief interpret + intake POST go here, authorized or rate-limited as appropriate |

---

## 5. Domain model

IDs are UUIDs. Time is UTC.

### Identity and tenancy

This is **Synas’s operating system**, not a multi-tenant SaaS for arbitrary customers.

- **User** — identity (email, name, role).
- **Company** — a business Synas is researching, selling to, or delivering for. Not a separate “Organization” entity; isolation is `companyId` + membership.
- **Contact** — a person, optionally at a company.
- Team users (`ADMIN`, `TEAM_MEMBER`) have `companyId = null` and see Synas-wide data.
- Client users (`CLIENT`) have `companyId` set and see only that company’s permitted project records.

### Commercial spine

```
Signal (Lead Radar discovery)
    → Company + Contact
Inquiry or Signal
    → Lead
Lead (qualified)
    → Opportunity
Opportunity
    → Discovery
    → SystemBrief (also attachable from public /brief)
    → Proposal
Proposal (accepted)
    → Project
Project
    → Milestone, Document, Task, Message, Activity
```

| Entity | Role |
| --- | --- |
| **Lead** | Inbound or outbound interest. Can carry a System Brief id from `/brief` or `/start`. |
| **Opportunity** | Qualified commercial pursuit. Owns stage, score snapshots, next action, calendar-backed meetings. |
| **Activity** | Timeline: note, call, email, meeting, system, agent-run. **Note is an activity type, not a parallel entity.** |
| **Task** | Assignable work on a lead, opportunity, or project. |
| **Discovery** | Structured discovery on an opportunity. |
| **SystemBrief** | Versioned artifact: confirmed workflow + simulation summary + recommended conversation. Sources: `public_capture` \| `discovery`. |
| **Workflow** | Versioned schema (not an n8n graph). Steps, actors, systems, one exception definition. |
| **SimulationCase** | Fictional instance derived from a confirmed workflow. |
| **SimulationEvent** | Deterministic run log. |
| **Proposal** | Commercial document; may attach a brief. |
| **Project** | Delivery container. |
| **Milestone / Document / Message** | Project-scoped. |
| **Notification** | In-app (and later email) notice. |
| **Content / Resource** | CMS for future public writing and files. Unused until there is something true to publish. |
| **Signal** | Lead Radar: an observed company/opportunity in the wild (source, pain, evidence). |
| **ScoreSnapshot** | Lead Radar: point-in-time qualification score + rationale. |

### Lead Radar mapping (do not rewrite a product that is not in this repo)

Prospect CSV shape already used operationally:

`Company, City, Website, Decision Maker, Role, Phone, LinkedIn, Email, Last Gen Activity, Pain Signal, Source, Status, Notes`

Maps to **Company + Contact + Signal + Activity**. Status `New` is a lead/opportunity stage, not a separate database.

The five roles (Market Researcher, Opportunity Analyst, Sales Strategist, CRM & Follow-Up, Growth & Niche Strategist) are **agent playbooks** that write Activities and ScoreSnapshots. They are not public personas and not five products.

Calendar: `Activity` type `meeting` with `startsAt`, `endsAt`, `calendarEventId`. Integration port: `CalendarPort`. Do not drop this.

---

## 6. Permission model

Roles: `ADMIN` | `TEAM_MEMBER` | `CLIENT`.

Authorization is **server-side only** (Data Access Layer). Hiding nav is not access control. Proxy cookie checks are optimistic. Every page, Server Action, and route handler calls the DAL.

| Resource | ADMIN | TEAM_MEMBER | CLIENT |
| --- | --- | --- | --- |
| Settings / users | full | none | none |
| CRM (leads, contacts, companies, opportunities, signals) | full | full | none |
| Briefs, discoveries, proposals | full | full | own company’s **accepted/shared** proposals |
| Projects, documents, tasks, milestones, messages | full | full | own company’s **permitted** project records |
| Content / resources (CMS) | full | edit | none |
| Activity across companies | full | full | own project activity only |

Fail closed: no session → `notFound()` (do not confirm that `/admin` exists on a public coming-soon surface). Wrong role → `notFound()`. Cross-company client access → denied.

DTOs only leave the DAL. Do not pass raw table rows into Client Components.

---

## 7. System Brief architecture

**Schema name:** `WorkflowV1` (`version: 1`). Stored as JSON, validated with Zod, hashed for replay.

```
natural language (+ optional answers)
        → AiPort.interpretProcess()      // structure only; no UI generation
        → WorkflowV1                     // may be inScope: false
        → human confirmation / edit      // linear editorial list, not a node canvas
        → fictional SimulationCase       // generated from confirmed steps
        → runSimulation()                // pure, deterministic, no I/O
        → one exception at defined step
        → SystemBrief draft
        → /start intake → Lead
```

Actor on each step: `system` | `human` | `mixed`.  
The UI’s only job after confirmation is to **play back events** and show automated vs human.

**Intentionally excluded from v1**

- Blank builders, node editors, free-form graph puppeteering
- Generated CRMs / generated applications
- Live model calls during the run
- Forcing `/brief` in the primary nav as the only way to understand Synas
- Persisting real customer operational data inside the sample case (sample is always fictional)

---

## 8. Data flow

```
Public visitor
  → static pages (SEO)
  → optional /brief (interpret + confirm + deterministic run)
  → /start (Lead + optional systemBriefId)

Team
  → /admin (DAL)
  → Lead Radar playbooks write Signal / ScoreSnapshot / Activity
  → calendar port upserts meetings
  → proposal → project
  → grant CLIENT user on company/project

Client
  → /portal (DAL scoped by companyId + project membership)
```

Postgres is the system of record. External tools sync **through ports**, never the other way around.

---

## 9. Integration boundaries

All in `src/server/integrations`. Unconfigured ports throw `IntegrationNotConfiguredError`. They do not pretend to succeed.

| Port | Intended adapter | Notes |
| --- | --- | --- |
| `AiPort` | OpenAI (or compatible) | Interpret process → `WorkflowV1`. Qualify copy. Not UI generation. |
| `CrmSyncPort` | Airtable (optional) | One-way or explicit sync. Airtable is **not** the database. |
| `WorkflowRunnerPort` | n8n | Operational automations for Synas, not the public simulator. |
| `ExtractionPort` | Apify | Lead Radar source adapter. |
| `EmailPort` | provider TBD | Transactional + follow-up. |
| `CalendarPort` | Google / Microsoft | Meetings on opportunities and projects. |
| `DocumentPort` | later | Proposals, briefs as documents. |
| `NotificationPort` | in-app first | Email later via EmailPort. |

Credentials live in env. Only the DAL/integration layer reads `process.env` secrets (`src/lib/env.ts`).

---

## 10. Major risks

1. **Building a second product in public.** A clever brief experience that outgrows the company story. Mitigation: brief is optional; schema is tiny; no canvas.
2. **Lead Radar as a case study.** It is internal. Putting it on Work would be a fabrication of client proof.
3. **Airtable as accidental source of truth.** Mitigation: Postgres schema is canonical; Airtable is a port.
4. **Auth theater.** A login page that does not authenticate is worse than a 404. Fail closed until `AUTH_SECRET` + database + a real identity provider exist.
5. **SEO regression.** Homepage metadata, canonical trailing slash, robots allow `/`, Organization JSON-LD, and wordmark must survive. Sitemap is already 500 in production — fix without changing the public URL.
6. **Empty IA.** Shipping Solutions/About/Work with lorem or fake clients would damage trust more than coming-soon.
7. **Client IDOR.** Portal queries must always include `companyId` (and project membership) in the DAL, not in the UI.
8. **Next 16 proxy vs DAL.** `proxy.ts` is a cookie gate only. Authorization stays in `src/server/dal`.

---

## 11. Decisions

1. **Monolith.** One Next.js 16 app, three surfaces, one Postgres.
2. **Keep the coming-soon homepage until real public pages exist.** Foundation does not replace a precise live site with unfinished marketing.
3. **System Brief, not Studio/Playground.** Constrained, deterministic, optional.
4. **Linear confirmed workflow, not a node canvas.**
5. **Note ⊂ Activity.** No duplicate note table.
6. **Company, not Organization**, as the business entity. Role + `companyId` is tenancy.
7. **Lead Radar is an OS module**, mapped onto Signal / Company / Contact / Opportunity / Activity / Calendar.
8. **Postgres over Airtable** as system of record.
9. **DAL + DTOs** (`server-only`, `cache()`, per-action authorization) per Next.js 16 data-security guidance.
10. **`proxy.ts` (not deprecated `middleware.ts`)** for optimistic session cookies on private trees.
11. **Reuse the live wordmark and arch icons exactly.** Alternate four-module artwork is brand archive, not a second logo.
12. **Public IA is small:** Home, Solutions, Approach, Brief, Start, About. Nothing else until it is true.
13. **Unconfigured integrations fail loudly.** Unconfigured auth 404s. Unconfigured DB yields honest empty OS states for authorized users only.

---

## 12. Intentionally excluded (now)

- Fake clients, testimonials, metrics, logos, awards, team size, “our work”
- Public workflow builder / node editor / generated software
- Insights/blog, Work/case studies
- Billing, multi-tenant productization, customer self-serve CRM
- Chat widget, dark-theme marketing, stock photography
- Rewriting Lead Radar UI that is not in this repo
- A working identity provider (interface only until credentials and a user store exist)
- Importing prospect CSVs or any secrets from local operational folders

---

## 13. Foundation implemented in this pass

- Domain types, lifecycle, permissions
- `WorkflowV1` + deterministic simulator + tests
- Drizzle Postgres schema for the domain
- Env, DAL guards, integration ports
- Design tokens extended without changing the homepage
- Protected `/admin` and `/portal` trees (fail closed)
- SEO constants centralized; robots disallow private trees; sitemap remains homepage-only and static

**Next prompt should implement:** public editorial pages; `/brief` UI on top of the engine; `/start` intake; identity provider; Lead Radar import/playbooks against this schema; calendar adapter; sitemap 500 diagnosis on Railway.
