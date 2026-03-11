# SCHOLARPATH

Product Requirements Document

v2.0 | March 2026 | Side Project Edition


> PART 1
> Side Project
> Build it. Ship it. Learn.
> PART 2
> Future Business
> If it gets traction.


**|**

```
-------------------|-----------------------------------------------------
 **Beachhead:**    | Professionals researching graduate / MBA programs
 **Geography:**    | US + Canada (MVP)
 **Current mode:** | Solo side project — vibe coded, no funding, no team
```

> PART 1
> Side Project Build Plan
> Solo builder. No funding. Ship fast, stay honest about scope.


## 1. The Problem
The grad school research process is broken in three specific ways:

**Fragmented research across school websites**

A professional researching 10 programs visits 10 different websites — each with a different information architecture, different terminology, different levels of detail. Finding the same data point (say, tuition per credit) takes a different number of clicks on every site. This is death by a thousand cuts for someone doing this after work hours.

**School websites are genuinely terrible for comparison**

University sites are built for current students, not prospective ones. Critical information — tuition, application deadlines, advisor contact, program length — is routinely buried 4–5 levels deep or split across multiple pages. Schools have no incentive to fix this for their competitors' benefit.

**No structured community layer exists**

People end up on Reddit (r/MBA, r/gradadmissions) and GMAT Club piecing together anecdotes. High noise, low signal, no connection to program data. There is nowhere to read a data sheet about a program and see real student discussion in the same place.


> Why professionals specifically?
> They are time-poor, making high-stakes decisions, and the existing tools (Common App, College Confidential, Naviance) are built for 18-year-olds. The professional audience is genuinely underserved.


## 2. What You Are Building
A web app that centralizes structured graduate program data so professionals can research and compare programs without bouncing between terrible school websites.

Two layers — but you are only building Layer 1 first:

**|           |                                                                      |**

```
-----------|-----------|----------------------------------------------------------------------|---------------------
 **Layer** | **Name**  | **What It Is**                                                       | **When**
 1         | Data      | Structured, searchable program profiles you can compare side by side | Build now
 2         | Community | Per-program discussion boards where students share real experience   | V2 — after traction
```

> Do not build the community on day one.
> Empty forums are worse than no forums. They signal a dead product. Get real users on the data layer first, then give them somewhere to talk.


## 3. MVP Features

> Scope rule:
> If a feature does not directly help a user compare two programs faster than visiting school websites, it does not belong in V1.


### 3.1 In Scope — Build These
**F1: Program Search + Filtering**

A fast search page. Filters for: program type (MBA, MS, MEng, MPA), US state or Canadian province, format (full-time, part-time, online, hybrid), program length, GRE/GMAT required. Results show as cards with key stats visible without clicking.

**F2: Standardized Program Profile Page**

Every program gets the same fields regardless of source. No exceptions — consistency is the whole product. Required fields:

- Basics: degree type, program length, credit hours, delivery format

- Cost: total tuition estimate, cost per credit hour, fees

- Admissions: avg GPA, avg GMAT/GRE, acceptance rate (if public), deadlines, requirements checklist

- Contact: admissions office email, program advisor email where findable

- Last verified date on every field — non-negotiable for trust

**F3: Side-by-Side Comparison**

User selects 2–3 programs and sees them in a comparison table. All standardized fields, parallel columns. This is the core value prop — do not cut this from V1.

**F4: User Accounts + Saved Programs**

Basic auth (use something like Clerk or Supabase Auth — do not build this yourself). Users can save programs to a list. That is it. No profiles, no public-facing anything.

**F5: Flag Outdated Data**

A simple button on every profile: 'This looks outdated.' Sends you an email or writes to a database. Costs you 30 minutes to build, saves your data quality over time.

### 3.2 Explicitly Out of Scope — Do Not Build
**|**

```
---------------------------------|------------------------------------------------------------
 **Feature**                     | **Why Not Now**
 Community / discussion boards   | Cold start problem. V2 after you have real users.
 Mobile app                      | Professionals research on laptops. Responsive web is fine.
 Application deadline tracker    | Adds complexity, not differentiated.
 AI essay review / writing tools | Completely different product.
 International schools           | Data quality will suffer. Prove US+CA first.
 Scholarship aggregation         | Separate problem, separate user job.
 Undergrad programs              | Different user entirely. Do not dilute.
```
## 4. Data Strategy
This is the hardest part of the product. Be honest with yourself about what is sustainable solo.

### 4.1 Start Small and Manual — Seriously
For the MVP, manually enter 50–100 programs. That is it. Focus on the US News top 50 MBA programs plus the top professional masters programs (MS Computer Science, MS Data Science, MPA, MEng) at those same schools. This is a few weekends of work, not a data pipeline problem.


> Why manual first?
> Manual data entry forces you to understand exactly what fields are hard to find, which schools have terrible websites, and what information is actually missing. This is user research disguised as grunt work. Do it before you automate anything.


### 4.2 Realistic Data Sources
**|                            |**

```
------------------------------|----------------------------|------------------------------------------------------------------
 **Source**                   | **Use For**                | **Notes**
 School websites (manual)     | Most fields                | Primary source for MVP. Slow but accurate.
 IPEDS (US Dept of Education) | Tuition, enrollment stats  | Free, public, updated annually. Use for institution-level data.
 StatCan (Canada)             | Canadian school data       | Free equivalent of IPEDS for Canadian institutions.
 Web scraping (later)         | Deadline + tuition updates | Useful for staleness detection once you have scale. Not for MVP.
 User corrections             | Ongoing accuracy           | Build the flag button in V1. Crowd-source corrections over time.
```
### 4.3 Legal — Quick Version
Aggregating publicly available factual data (tuition, deadlines, credit hours) is legal in the US and Canada. Factual information is not copyrightable. Do not copy prose descriptions from school websites verbatim — extract structured fields only. Show a 'Last verified' date so you are not implying the data is live. If you ever add scraping at scale, read the ToS of each school's site first.

### 4.4 The Maintenance Problem
The biggest risk for a solo side project is data going stale 6 months in. Tuition changes annually. Deadlines change every cycle. Solve this before it kills your reputation:

- Show 'Last verified' dates on every field from day one

- Build the user flagging button in V1 — takes 30 minutes, saves you constantly

- Set a personal reminder every August (US admission cycle starts) to do a tuition/deadline sweep of your top 50 programs

- Do not expand your program count faster than you can maintain data quality

## 5. Suggested Tech Stack for Solo Vibe Coding

> Philosophy:
> Use boring, well-documented tools with huge communities. You will be Googling and prompting your way through this — pick tools where every error message has 50 Stack Overflow answers.


**|                               |**

```
------------|-------------------------------|---------------------------------------------------------------------------------------------
 **Layer**  | **Recommendation**            | **Why**
 Frontend   | Next.js (React)               | Server-side rendering helps SEO. Huge ecosystem. AI tools know it extremely well.
 Database   | Supabase (Postgres)           | Free tier is generous. Gives you auth, database, and API out of the box. No backend needed.
 Auth       | Supabase Auth or Clerk        | Do not build auth yourself. Ever.
 Styling    | Tailwind CSS                  | Fast to write, hard to make ugly. Good pairing with AI-assisted coding.
 Hosting    | Vercel                        | Free for side projects. One-click deploys from GitHub.
 Data entry | Airtable (early) or direct DB | Airtable is fast for manually entering 50–100 records. Sync to Supabase or replace later.
```
### 5.1 Build Order
Do these in order. Do not jump ahead.

1.  Set up Next.js + Supabase. Get a basic page rendering data from your database.

2.  Manually enter 10 programs into your database. Just 10.

3.  Build the search page with basic filtering. Get it working.

4.  Build the program profile page. Make it look good.

5.  Build the comparison table. 2 programs side by side.

6.  Add basic auth and saved programs list.

7.  Add the 'flag outdated data' button.

8.  Expand to 50–100 programs. Then show people.


> Do not build in parallel.
> Building search + profiles + comparison + auth simultaneously is how side projects die. Finish each step before starting the next.


## 6. What Success Looks Like as a Side Project
Not MAU targets, not conversion rates. Here is what actually matters at this stage:

**|**

```
---------------------------------------|---------------------------------------------------------------------------------
 **Milestone**                         | **What It Tells You**
 You ship V1 with 50 programs          | You can finish things. Most side projects never ship.
 5 people you don't know use it        | There is some organic pull. The problem is real to others.
 Someone bookmarks it and comes back   | The data is good enough to be useful, not just interesting.
 Someone flags outdated data           | Real users care enough to help. Good sign.
 You get unsolicited feedback          | People are invested enough to tell you what is missing.
 Steady organic traffic after 3 months | SEO is working. This is the inflection point for deciding whether to go bigger.
```

> The real test at 6 months:
> Would you personally use this the next time you were researching a program? If yes, it is worth keeping. If not, that is important information too.


> PART 2
> If It Gets Traction: The Business Path
> Only read this if Part 1 is working. Not before.


> When to read this section:
> You have consistent organic traffic, returning users, and people are telling others about it. You are starting to feel the limits of the side project scope. Not before.


## 7. Market Opportunity
### 7.1 The Gap Is Real
No product currently does all three: structured grad program data + professional focus + community. The closest players all have meaningful gaps:

**|                           |**

```
----------------|---------------------------|------------------------------------------------------------------
 **Competitor** | **What They Do**          | **The Gap You Fill**
 GMAT Club      | MBA community, dated UX   | No structured data comparison, no professional master's coverage
 The Grad Cafe  | Crowd-sourced acceptances | No program data, narrow, terrible UX
 Niche.com      | SEO-heavy, broad data     | Generic, not built for professionals or comparison
 Reddit / Blind | Authentic discussion      | No data layer, no structure, no search
```
### 7.2 Market Size (US + Canada)
- ~2.3M graduate applicants per year across US and Canada (NCES + StatCan)

- ~600K–800K of those are working professionals targeting MBA or professional masters

- If 15–20% would pay for a research tool, that is 90K–160K potential paying users annually

- At $10–15/month or a $30–50 seasonal pass, the revenue potential is real before you need enterprise customers

## 8. Expanded Feature Roadmap
This is what the product looks like if the side project grows into something more. Each phase builds on proven traction from the previous one.

**|                                  |**

```
-----------|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------
 **Phase** | **Trigger to Start**             | **What to Build**
 V1 (Now)  | You are here                     | Search, profiles (50–100 programs), comparison, basic auth, data flagging
 V2        | 500+ MAU, users returning        | Community discussion boards per program, user profiles, expand to 300+ programs, user-submitted data corrections with moderation
 V3        | Community active, word of mouth  | Paywall test on comparison + contact directory, advisor response time crowd-sourcing, email alerts for deadline changes, expand to undergrad (validate separately)
 V4+       | Paying users, clear monetization | UK + Australia school data, mobile PWA, B2B school profiles / lead gen, API for partners
```

> Community is your long-term moat.
> Structured data alone can be copied by a well-funded competitor. A community of real students sharing real experience is what makes the product defensible. That is why it matters — but only after you have an audience worth talking to each other.


## 9. Monetization Options
Do not think about this until you have consistent organic traffic and returning users. Monetizing too early poisons growth. That said, here are your realistic options in priority order:

### 9.1 Option A — Freemium B2C (Recommended First Test)
Keep search and basic profiles free. Charge for the features that professionals actually value when they are deep in the research process:

- Full contact directory access with advisor emails

- Comparison export to PDF

- Application deadline email alerts

- Priority access to community Q&A features

Test pricing: $9–15/month or a one-time $29–49 'application season' pass. The seasonal pass framing works well for this audience — they only need the product intensively for 3–6 months.

### 9.2 Option B — B2B School Listings
Schools pay for enhanced profiles, lead generation, and analytics on prospective students viewing their programs. This is an existing budget line at every admissions office. The catch: sales cycles are 6–12 months, procurement is painful, and you need proof of traffic volume before anyone takes a meeting. Do not pursue this before 10K+ MAU.

### 9.3 Option C — Lead Generation / Referral
Earn a referral fee when a user applies through ScholarPath. Aligned with user success. Compliance complexity is real and schools need to agree to the arrangement. Not realistic until you have meaningful scale and a legal budget.

**|                       |                       |**

```
---------------------|-----------------------|-----------------------|---------------------------------------------------------
 **Model**           | **When to Try**       | **Revenue Potential** | **Risk**
 Freemium B2C        | V3 — 1K+ MAU          | Medium                | Low — worst case is users stay on free tier
 B2B school listings | V4 — 10K+ MAU         | High                  | High — long cycles, conflicts with editorial neutrality
 Lead gen / referral | V4+ with legal review | High                  | Medium — compliance and school buy-in required
```
## 10. Data Scaling Strategy
Once the side project has traction, the data problem becomes a data operations problem. Here is how to think about scaling it responsibly:

### 10.1 From Manual to Semi-Automated
- Phase 1 (now): 50–100 programs, fully manual. Use Airtable or a simple CMS so you do not need a developer to update a record.

- Phase 2 (traction): Lightweight scraping for ~500 programs, targeting fields that change frequently (tuition, deadlines). Build staleness detection that flags pages changed since last scrape.

- Phase 3 (scale): Community-contributed data. Users can suggest corrections. Build a lightweight moderation workflow. Incentivize contributions with reputation or access.

### 10.2 Legal Considerations at Scale
Factual data is not copyrightable in the US or Canada. Web scraping of publicly accessible data is not inherently illegal (hiQ v. LinkedIn, 2022 is the relevant US precedent). The practical risks at scale are ToS violations on individual school sites and cease-and-desist letters — not criminal liability. Mitigate by: respecting robots.txt, only extracting structured fields not prose, crediting sources, and getting a legal review before any automated scraping at scale. Budget $2–5K for this when you get there.

### 10.3 Hiring for Data
When the side project becomes a business, data quality requires dedicated headcount. One part-time data researcher can maintain 200–300 programs on an ongoing basis. At 1,000+ programs you need a small team plus automation. Do not try to scale program count beyond what you can maintain — stale data destroys trust faster than limited coverage.

## 11. Risks If This Becomes a Business
**|              |**

```
--------------------------------------------------------|--------------|---------------------------------------------------------------------------------------------------------------------------------
 **Risk**                                               | **Severity** | **Mitigation**
 Well-funded competitor copies the product              | High         | Move fast. Community data is your moat — structured data alone can be replicated. Build the community before a competitor does.
 Legal challenge from schools for scraping              | Medium       | Legal review before scaling scraping. Use IPEDS and StatCan as primary sources. Respect ToS.
 Community quality degrades over time                   | Medium       | Moderation from day one. Require real accounts. Do not allow anonymous posts. Reputation system.
 B2B school revenue conflicts with editorial neutrality | Medium       | Clearly label paid placements. Never allow schools to edit or suppress community discussion.
 Data maintenance costs grow faster than revenue        | High         | Automate early. Do not let manual maintenance headcount outpace monetization.
```
## 12. Go-to-Market at Scale
SEO is the long-term engine. Target long-tail keywords that professionals actually search: 'best part-time MBA programs Chicago', 'MS Computer Science requirements Harvard vs MIT', 'MBA programs no GMAT required 2026'. These have real search volume and low competition. Build program pages that answer these queries directly.

Before SEO kicks in (takes 12+ months), the short-term channels are:

- Direct outreach to professional communities on LinkedIn, GMAT Club, and Reddit (r/MBA, r/gradadmissions) — as a contributor, not a spammer

- Content marketing: posts on 'how to research MBA programs', 'what MBA admissions offices don't tell you' — drives traffic and signals authority

- Product Hunt launch once V2 is solid

- Partnership with GMAT/GRE prep companies who have the exact audience you need

What you are not doing at scale: paid acquisition until you have a proven conversion funnel. Paid traffic to a product without validated monetization is just burning money.
