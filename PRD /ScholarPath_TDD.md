# SCHOLARPATH

Technical Design Document

v1.0 | March 2026 | Written for non-technical founders


> What this document covers
> 1. Tech Stack & Infrastructure — what tools to build with and why
> 2. Database Schema & Data Model — how your data is organised and stored
> 3. Data Collection Architecture — how to gather program data at every stage
> 4. Data Freshness & Staleness Detection — how to keep it accurate over time


> How to read this document
> Every technical concept is explained in plain English before the detail. If you are vibe coding with an AI assistant, you can paste sections of this document directly into your prompt as context — it will give you much better results than starting from scratch.


> SECTION 1
> Tech Stack & Infrastructure
> The tools you will build ScholarPath with, and why each one was chosen.


## 1. Tech Stack & Infrastructure
A tech stack is the collection of tools, frameworks, and services that work together to make your app run. Think of it like the materials list before building a house — choosing the right materials upfront saves you from tearing walls down later.

The choices below prioritise three things for a solo side project: speed of building, low maintenance burden, and a clear upgrade path if the project grows into a business.

### 1.1 The Recommended Stack at a Glance
**|                        |                                                    |**

```
------------------------|------------------------|----------------------------------------------------|------------------------------------------------------------------------------------------
 **Layer**              | **Tool**               | **What It Does**                                   | **Why This One**
 **Frontend**           | Next.js                | Builds the web pages users see                     | Most popular React framework. Huge community. AI tools know it extremely well.
 **Database**           | Supabase (PostgreSQL)  | Stores all your program data                       | Free tier, generous limits, no backend code needed to query data.
 **Authentication**     | Supabase Auth          | Handles user login / accounts                      | Built into Supabase. Do not build login from scratch — ever.
 **Styling**            | Tailwind CSS           | Makes the app look good                            | Faster than writing CSS by hand. Works seamlessly with Next.js.
 **Hosting**            | Vercel                 | Puts your app on the internet                      | Free for side projects. Deploys automatically when you push code.
 **Data entry (early)** | Airtable               | Spreadsheet-like tool for managing program records | No code required to add / edit programs. Replace with admin UI later.
 **Scraping (later)**   | Playwright + Firecrawl | Automatically reads school websites                | Playwright handles JavaScript-heavy pages. Firecrawl extracts clean text for AI parsing.
```
### 1.2 Why Next.js Over Other Frameworks
Next.js is a framework built on top of React — the most widely used tool for building web interfaces. The key advantage for ScholarPath specifically is server-side rendering: when Google visits your program pages, it sees real content instead of a blank page waiting for JavaScript to load. This is critical for SEO, because your long-term growth depends on ranking for searches like 'best part-time MBA programs Toronto'.

**Longevity check:** Next.js is maintained by Vercel, a well-funded company. React is maintained by Meta. Both have been growing for 8+ years and show no signs of being replaced. This is as future-proof as the JavaScript ecosystem gets.

### 1.3 Why Supabase Over Other Databases
Supabase gives you a full PostgreSQL database — the most proven and respected open-source database in the world — wrapped in a friendly interface with automatic APIs. This matters for three reasons:

- You do not need to write a separate backend server to read or write data. Supabase generates an API automatically from your database structure.

- PostgreSQL is used by companies from small startups to large enterprises. If ScholarPath grows, you never need to migrate to a 'more serious' database.

- The free tier handles up to 500MB of data and 50,000 monthly active users — more than enough for a side project to prove itself.


> On future-proofing:
> PostgreSQL has been actively developed since 1996 and is the default choice for serious applications. Supabase is essentially a managed layer on top of it — if Supabase ever closes (unlikely), your data is still plain PostgreSQL and can be moved to any other host.


### 1.4 Infrastructure Diagram — How It All Connects
****

```
----------------------------------------------------------------
 **ScholarPath System Architecture (Side Project Stage)**

 [ User's Browser ]

visits scholarpath.com
 v
 [ Vercel (Hosting) ] <── your Next.js code lives here

fetches program data
 v
 [ Supabase (Database) ] <── all program records stored here

(later) scheduled scraping jobs
 v
 [ School Websites ] <── source of raw data

 [ Airtable ] <── you manually enter / update records here
then sync to Supabase
 v
 [ Supabase (Database) ]

```
### 1.5 Cost at Side Project Scale
**|                  |**

```
-------------|------------------|----------------------------------------------------------
 **Service** | **Monthly Cost** | **Free Tier Limit**
 Vercel      | **$0**          | Unlimited personal projects, 100GB bandwidth/month
 Supabase    | **$0**          | 500MB database, 50K active users/month, 2GB file storage
 Airtable    | **$0**          | 1,000 records per base on free tier — enough for MVP
 Domain name | **~$12/yr**     | scholarpath.com or similar via Namecheap / Cloudflare
 Total (MVP) | **~$1/month**   | The stack costs almost nothing until you have real scale
```

> SECTION 2
> Database Schema & Data Model
> How ScholarPath organises and stores its data — explained without jargon.


## 2. Database Schema & Data Model
A database schema is a blueprint for how your data is organised. Think of it like designing the columns in a very structured spreadsheet before you start filling it in. Getting this right early saves painful restructuring later.

ScholarPath's database has nine tables. Each table stores one type of thing and they link to each other through IDs — like folders in a filing cabinet that reference each other. The diagram below shows how they connect.

### 2.1 Overview — All Nine Tables
****

```
---------------------------------------------------------------------------
 **Database Tables and Their Relationships**

 [ schools ]
 id, name, slug, website, city, state_province,
 country, accreditation, logo_url

one school has many programs
 v
 [ programs ] ──────────────────────────────────────────────────────────
 id, school_id, level_id, name, slug, description, | |
 degree_type, format, duration_months, duration_semesters, | |
 credit_hours, admissions_url, data_source, | |
 last_verified_at, is_published | |
| | | |
| | | |
 v v v | |
 [ program_advisors ] [ tuition ] [ admission_requirements ] | |
 id, program_id id, id, program_id, | |
 name, title, program_id, gpa_minimum, | |
 email, phone, semester_1, gmat_gre_required, | |
 office_hours, semester_2, gmat_gre_avg, | |
 response_days, total, work_exp_years, | |
 last_verified_at currency, lor_count, | |
 last_verified sop_required, | |
 english_test, | |
 english_min_score, | |
 notes | |
|
 [ program_levels ] <──────────────────────────────────────────── |
 id, name (undergraduate / graduate / professional) |

 [ data_change_log ] <────────────────────────────────────────────────
 id, program_id, table_name, field_name,
 old_value, new_value, change_source, changed_at

 [ users ]
 id, email, created_at

one user saves many programs
 v
 [ saved_programs ]
 id, user_id, program_id, notes, saved_at

```
### 2.2 Table: schools
One record per institution. The University of Toronto appears here once, even if it has 20 different programs. All programs link back to this table.

**|               |**

```
--------------------|---------------|------------------------------------------------------------------------------------------------------------------------------
 **Field Name**     | **Data Type** | **What It Stores**
 **id**             | UUID          | Unique identifier — auto-generated. Never changes even if the school name does.
 **name**           | Text          | Full official name — e.g. University of Michigan, Ross School of Business
 **slug**           | Text          | URL-safe version of the name — e.g. university-of-michigan-ross. Used in page URLs like /schools/university-of-michigan-ross
 **website**        | Text          | Root domain — e.g. https://umich.edu
 **city**           | Text          | City where the main campus is located
 **state_province** | Text          | US state or Canadian province abbreviation — e.g. MI, ON, BC
 **country**        | Text          | US or CA — the two countries in scope for MVP
 **accreditation**  | Text          | Primary accreditation body — e.g. AACSB for business, ABET for engineering, ABA for law
 **logo_url**       | Text          | URL to the school logo image — displayed on profile and search result cards
 **created_at**     | Timestamp     | When this school record was first added to the database
```
### 2.3 Table: program_levels
A small reference table that defines the level of study. Keeping this as its own table — rather than just a text field — means you can filter cleanly by level across thousands of programs without worrying about inconsistent text values like 'grad' vs 'graduate' vs 'Graduate'.

**|               |**

```
-----------------|---------------|------------------------------------------------------------------------------------------------------------------------------------
 **Field Name**  | **Data Type** | **What It Stores**
 **id**          | UUID          | Unique identifier
 **name**        | Text          | One of three values: undergraduate, graduate, or professional. Programs link to this table via level_id.
 **description** | Text          | Plain-English explanation shown to users — e.g. Graduate: Masters and doctoral programs requiring a completed undergraduate degree
```

> Why a separate levels table?
> It enforces consistency. Every program must pick from exactly three options. This makes filtering by level in search completely reliable — no edge cases, no mismatched strings. It also makes it trivial to add a fourth level later (e.g. certificate programs) without touching the programs table structure.


### 2.4 Table: programs
The central table. One record per program — an MBA and an MS Data Science at the same school are two separate records, both linked to the same school. Core identity and metadata lives here; tuition, admission requirements, and contacts each live in their own linked tables.

**|               |**

```
------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------
 **Field Name**         | **Data Type** | **What It Stores**
 **id**                 | UUID          | Unique identifier for this program
 **school_id**          | UUID          | Foreign key linking to the schools table — which institution offers this?
 **level_id**           | UUID          | Foreign key linking to program_levels — undergraduate, graduate, or professional
 **name**               | Text          | Full program name — e.g. Master of Business Administration (Evening & Weekend)
 **slug**               | Text          | URL-safe name — e.g. mba-evening-weekend. Combined with school slug to form the page URL.
 **description**        | Long Text     | Plain-text overview of the program — written by you, not copied from the school website. 100-300 words. Summarises focus, structure, and who it is for.
 **degree_type**        | Text          | Standardised degree abbreviation — MBA, MS, MEng, MPA, MFA, PhD, BBA, BSc, BA, etc.
 **format**             | Text          | One of: full-time, part-time, online, hybrid
 **duration_months**    | Number        | Total program length in months — e.g. 24 for a two-year MBA
 **duration_semesters** | Number        | Total number of semesters — e.g. 4 for a two-year program. Useful since tuition is per-semester.
 **credit_hours**       | Number        | Total credit hours required to graduate
 **admissions_url**     | Text          | Direct URL to the admissions or program overview page — shown as a verification link to users
 **data_source**        | Text          | How this record was created — one of: manual, ipeds, scraped, user_correction
 **last_verified_at**   | Timestamp     | When a human last confirmed all fields were accurate — drives the freshness indicator shown to users
 **is_published**       | Boolean       | True = visible to users. False = draft mode. Lets you enter incomplete records and publish only when ready.
 **created_at**         | Timestamp     | When this record was first created
 **updated_at**         | Timestamp     | Auto-updates whenever any field changes — used by staleness detection to know when to recheck
```
### 2.5 Table: program_advisors
Stores all advisor and admissions contacts for a program. Multiple rows can point to the same program — one for the general admissions office, one for the named program director, one for the financial aid contact. This is separated from the programs table so that contact info can be updated independently without touching program data, and so each contact can have its own verification timestamp.

**|               |**

```
------------------------|---------------|---------------------------------------------------------------------------------------------------------------------
 **Field Name**         | **Data Type** | **What It Stores**
 **id**                 | UUID          | Unique identifier for this contact record
 **program_id**         | UUID          | Foreign key — which program does this advisor belong to?
 **name**               | Text          | Full name of the contact — if publicly listed. Leave blank if only an office email is available.
 **title**              | Text          | Job title — e.g. Director of Admissions, Program Advisor, Financial Aid Counselor
 **role_type**          | Text          | Categorised role for filtering — one of: admissions_office, program_advisor, financial_aid, department_contact
 **email**              | Text          | Email address — only store publicly listed emails. Never scrape emails from contact forms or protected directories.
 **phone**              | Text          | Office phone number if publicly listed — optional
 **office_hours**       | Text          | Free text for listed availability — e.g. Mon-Fri 9am-5pm EST, or by appointment
 **response_time_days** | Number        | Crowd-sourced average response time in days — added in V2 when users can submit this
 **last_verified_at**   | Timestamp     | When this contact was last confirmed active. Contacts go stale faster than tuition — staff turn over.
 **created_at**         | Timestamp     | When this contact was first added
```
### 2.6 Table: tuition
One record per program, storing semester-by-semester and total tuition figures. Separated from the programs table because tuition changes annually and needs its own verification timestamp and change log — independent from the rest of the program data.

**|               |**

```
------------------------|---------------|-----------------------------------------------------------------------------------------------------------
 **Field Name**         | **Data Type** | **What It Stores**
 **id**                 | UUID          | Unique identifier
 **program_id**         | UUID          | Foreign key — which program does this tuition record belong to?
 **semester_1_tuition** | Number        | Cost of the first semester in local currency
 **semester_2_tuition** | Number        | Cost of the second semester — often the same as semester 1 but not always
 **per_semester_note**  | Text          | Free-text note for anything unusual — e.g. semester 3 and beyond billed at reduced rate
 **total_tuition**      | Number        | Full program tuition total — the figure most users care about for comparison
 **fees_per_semester**  | Number        | Mandatory fees charged each semester (student activity, technology, health, etc.) — separate from tuition
 **currency**           | Text          | USD or CAD — always store which currency so comparisons are honest
 **academic_year**      | Text          | The year these figures apply to — e.g. 2025-2026. Makes it clear to users what year they are looking at.
 **last_verified_at**   | Timestamp     | When this tuition record was last confirmed accurate against the school website
 **source_url**         | Text          | Direct URL to the tuition/fees page where this data was found — shown as a verification link
```
### 2.7 Table: admission_requirements
One record per program with all structured admission requirement fields. Every field you selected is stored here as a proper typed column — not buried in a notes field — so users can filter and compare programs by specific requirements.

**|               |**

```
---------------------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------
 **Field Name**            | **Data Type** | **What It Stores**
 **id**                    | UUID          | Unique identifier
 **program_id**            | UUID          | Foreign key — which program do these requirements belong to?
 **gpa_minimum**           | Decimal       | Minimum GPA required or recommended — e.g. 3.0. Null if the school does not publish one.
 **gpa_average**           | Decimal       | Average GPA of admitted students if published — e.g. 3.4. More useful than the minimum for realistic benchmarking.
 **gmat_gre_required**     | Text          | One of: required, optional, waivable, not_accepted. Stored as text, not a boolean, because waivable is a real and common third state.
 **gmat_average**          | Number        | Average GMAT score of admitted students if published — e.g. 680
 **gre_average**           | Number        | Average GRE score if published — store separately from GMAT since they are different tests
 **work_exp_years_min**    | Number        | Minimum years of professional work experience required or expected — e.g. 2. Null if not required (common for full-time programs).
 **work_exp_years_avg**    | Number        | Average years of work experience in the admitted cohort — more informative than the minimum
 **lor_count**             | Number        | Number of letters of recommendation required — typically 2 or 3
 **lor_notes**             | Text          | Any specific instructions — e.g. at least one must be from a direct supervisor
 **sop_required**          | Boolean       | True if a statement of purpose or personal essay is required
 **sop_word_limit**        | Number        | Word or character limit on the statement of purpose if specified
 **english_test_required** | Text          | One of: required, optional, waived_for_native_speakers, not_required
 **english_test_types**    | Text          | Which tests are accepted — e.g. TOEFL, IELTS, Duolingo. Comma-separated list.
 **english_min_score**     | Number        | Minimum test score required. For TOEFL this is typically 90-100; for IELTS typically 6.5-7.0.
 **other_requirements**    | Long Text     | Free-text overflow for anything that does not fit a structured field — e.g. portfolio required for design programs, prerequisite courses, interviews
 **last_verified_at**      | Timestamp     | When these requirements were last confirmed accurate — requirements change less often than tuition but do change
```
### 2.8 Table: data_change_log
Every time a field across any of the above tables changes, a record is written here automatically. This is your complete audit trail — you can trace every change back to its source, when it happened, and what the previous value was.

**|               |**

```
------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------
 **Field Name**         | **Data Type** | **What It Stores**
 **id**                 | UUID          | Unique identifier for this change event
 **program_id**         | UUID          | Which program was affected — even if the change was in tuition or admission_requirements, this links back to the parent program for easy lookup
 **table_name**         | Text          | Which table changed — programs, tuition, admission_requirements, or program_advisors
 **field_name**         | Text          | Which specific field changed — e.g. total_tuition, gmat_average, semester_1_tuition
 **old_value**          | Text          | The value before the change — always stored as text so any field type can be logged
 **new_value**          | Text          | The value after the change
 **change_source**      | Text          | What triggered the change — one of: admin_manual, ipeds_import, scraper_update, user_correction, user_flag
 **changed_by_user_id** | UUID          | If a logged-in user submitted a correction, their ID is stored here. Null for automated changes.
 **changed_at**         | Timestamp     | Exact timestamp of when the change occurred
```

> Why the change log matters:
> If a user asks why ScholarPath shows a different tuition than the school website, you can look up exactly when the tuition record was last updated, what it changed from, and whether it came from a scraper, IPEDS import, or a manual admin update. This is how you build credibility — and how you debug data quality issues without guessing.


### 2.9 Table: saved_programs
Tracks which programs each user has bookmarked. Simple join table between users and programs with a few extra fields for user utility.

**|               |**

```
----------------|---------------|------------------------------------------------------------------------------------------------------------
 **Field Name** | **Data Type** | **What It Stores**
 **id**         | UUID          | Unique identifier for this saved record
 **user_id**    | UUID          | Which user saved this program — links to the users table managed by Supabase Auth
 **program_id** | UUID          | Which program was saved — links to the programs table
 **notes**      | Text          | Optional private note from the user — e.g. Need to check scholarship deadline. Not visible to anyone else.
 **saved_at**   | Timestamp     | When the user bookmarked this program
```
### 2.10 Design Decisions Worth Noting

> Why tuition and admission requirements are separate tables, not columns in programs:
> Two reasons. First, they each need their own last_verified_at timestamp — tuition changes every August, requirements change less often, and you want to track their freshness independently. Second, it keeps the programs table clean and focused on identity fields. When you query for a list of programs in search results, you do not need to pull 20 tuition and requirements columns along with every result — you fetch those only when a user opens a specific program profile.


> Why program_levels is a separate table and not just a text column on programs:
> Consistency enforcement. A text column can hold any value — someone could type Graduate, grad, Grad, graduate, or GRADUATE and they all mean the same thing but break filtering. A foreign key to program_levels forces every program to use exactly one of three defined values. It also makes adding a new level later (like certificate or continuing education) a single row insert rather than a schema change.


> SECTION 3
> Data Collection Architecture
> How to gather program data — from manual entry through automated scraping.


## 3. Data Collection Architecture
This section explains exactly how data gets into your database at each stage of the product's life. There is no single solution — you combine methods, starting simple and adding automation only when it earns its complexity.

### 3.1 The Three Stages of Data Collection
**|                |                                                    |**

```
-------------|----------------|----------------------------------------------------|----------------------
 **Stage**   | **When**       | **Method**                                         | **Programs Covered**
 **Stage 1** | MVP — now      | Manual entry via Airtable + IPEDS public dataset   | 50–100 top programs
 **Stage 2** | After traction | Change-detection scraping + AI-assisted extraction | 100–500 programs
 **Stage 3** | At scale       | Full scraping pipeline + community corrections     | 500+ programs
```
### 3.2 Stage 1 — Manual Entry (What to Build Now)
**The IPEDS Free Dataset**

IPEDS stands for Integrated Postsecondary Education Data System. It is a free, public database maintained by the US Department of Education that covers every accredited US college and university. It gives you clean, structured data for institution-level fields — tuition costs, enrollment numbers, location, accreditation status.

**How to use it:** Download the IPEDS data files at nces.ed.gov/ipeds/datacenter. The files are CSVs you can open in Excel. Filter for the schools you want, extract the fields you need, and import them into Supabase. This fills roughly 40–50% of your fields automatically and legally.

**Canadian equivalent:** Statistics Canada PSIS (Postsecondary Student Information System) at statcan.gc.ca. Same concept, covers all accredited Canadian institutions.

**Airtable as Your Data Entry Interface**

For the fields IPEDS does not cover — program-specific details like GMAT averages, application deadlines, advisor emails — you manually visit each school's admissions page and fill in an Airtable base.

Airtable looks like a spreadsheet but is connected to your database. It is the right tool here because you do not need to write any code to add or edit records, and non-technical collaborators (or future you on a Tuesday evening) can update it without touching the database directly.

**|**

```
--------------------------------------------|---------------------------------------------------------------
 **Task**                                   | **How Long It Takes**
 Set up Airtable base with all fields       | 2–3 hours once
 Enter one program (all fields)             | 20–40 minutes per program depending on how buried the info is
 Enter 50 programs (MVP target)             | 2–3 focused weekends
 Annual refresh sweep (tuition + deadlines) | 1–2 weekends every August before application cycle
```

> The hidden value of manual entry:
> Manually entering 50 programs teaches you exactly which fields are always hard to find, which schools have the worst websites, and which fields are frequently missing entirely. This knowledge directly improves your product — you will know what to surface most prominently in your UI because you felt the pain yourself.


### 3.3 Stage 2 — Change Detection Scraping
Web scraping means writing code that automatically visits a website and extracts information from the page — like a robot reading and copying data so you do not have to.

The important distinction for ScholarPath is that you are not trying to scrape all data automatically. You are using scraping specifically to detect when data you already have might be wrong.

**How Change Detection Works**

****

```
-------------------------------------------------------------------------
 **Change Detection Flow**

 Every Sunday at 2am (scheduled job):

 For each program in your database:
 1. Fetch the admissions page URL stored in admissions_url
 2. Generate a 'fingerprint' (hash) of the page content
 3. Compare to the fingerprint stored from last week
 4. If fingerprint is SAME --> no action, move on
 5. If fingerprint is DIFFERENT --> flag this program for review
 \- Write a record to data_change_log: { change_source: 'scraper_flag' }
 \- Send yourself an email: 'Harvard MBA admissions page changed'
 \- You visit the page, see what changed, update the record manually

```
**What is a hash / fingerprint?** A hash is a short code generated from the full text of a webpage. If even one word on the page changes, the hash changes. You do not store the whole page — just the fingerprint. It is like a seal on an envelope: if the seal is broken, you know something inside changed.

**Tools for Scraping**

**|                                                  |**

```
-------------------|--------------------------------------------------|------------------------------------------------------------------------------
 **Tool**          | **What It Does**                                 | **When to Use It**
 **Playwright**    | Controls a real browser programmatically         | Pages that require JavaScript to load content (most modern university sites)
 **BeautifulSoup** | Parses simple HTML pages                         | Older or simpler school websites that load content in plain HTML
 **Firecrawl**     | Converts any webpage to clean text automatically | When you want to feed a school's admissions page to an AI for extraction
```
### 3.4 Stage 3 — AI-Assisted Extraction
Once you have a tool like Firecrawl converting messy school webpages into clean text, you can pass that text to an AI model (Claude, GPT-4) and ask it to extract structured fields. This is more reliable than trying to write precise scraping rules for every different school website layout.

****

```
-----------------------------------------------------------------
 **AI Extraction Pipeline (Stage 2+)**

 1. Fetch admissions page HTML --> Firecrawl
 2. Firecrawl converts to clean text --> AI model (Claude API)
 3. AI prompt: 'Extract the following fields from this text:
 tuition_total, application_deadline, avg_gmat,
 gmat_required, program_length_months'
 4. AI returns structured JSON: { tuition_total: 72000, ... }
 5. You review the output --> approve or correct
 6. Approved fields written to Supabase programs table
 7. Change logged to data_change_log

 Accuracy: ~85-90% on well-structured pages
 Still requires human review before publishing

```

> Important: AI extraction is not a replacement for human review.
> AI makes mistakes, especially on unusual page layouts or ambiguous wording. Always treat AI-extracted data as a draft that needs a human check before it goes live. The goal is to make data entry faster, not fully automatic.


### 3.5 Stage 3 — Community Corrections
As your user base grows, a percentage of users will naturally want to fix wrong data — especially if they just went through an application process and know the current numbers. This is the Wikipedia model applied to program data.

The mechanics are simple:

1.  User clicks 'Flag as outdated' or 'Suggest correction' on any field

2.  They submit a corrected value with an optional source URL

3.  You receive a notification and review the suggestion

4.  If correct, you approve it — the field updates and a change_log record is written

5.  The user who submitted the correction gets a 'Contributor' badge on their profile (V2 incentive)

This does not replace your maintenance work — it supplements it. At 1,000 users you might receive 10–20 corrections per month, most of them valid. That is 10–20 programs you did not have to manually re-verify.


> SECTION 4
> Data Freshness & Staleness Detection
> How to keep your data accurate over time — and how to be honest with users when it might not be.


## 4. Data Freshness & Staleness Detection
Stale data is the product killer for ScholarPath. A professional who finds out tuition was listed $8,000 lower than reality will not come back — and will tell others. Freshness is not a nice-to-have, it is core to your value proposition.

The strategy has two parts: being proactive about catching changes, and being transparent with users when data might be outdated.

### 4.1 The Freshness Model
Every program record has a last_verified_at timestamp. This drives everything:

**|            |**

```
-----------------|------------|------------------------------------------------------------------------------
 **Age of Data** | **Status** | **What Users See**
 < 3 months old | **Fresh**  | Green dot: 'Verified within the last 3 months'
 3–9 months old  | **Aging**  | Yellow dot: 'Last verified [date] — verify before applying'
 > 9 months old | **Stale**  | Red dot: 'This data may be outdated — check school website' with direct link
```

> Transparency builds more trust than false accuracy.
> Showing a red 'may be outdated' badge is better than pretending the data is current when it is not. Users will respect the honesty and still find the structured format useful even if they need to verify one or two fields.


### 4.2 Proactive Staleness Detection — The Weekly Job
A scheduled job is a piece of code that runs automatically on a timer — like a phone alarm, but for code. You set it up once and it runs every week without you doing anything.

****

```
--------------------------------------------------------------------
 **Weekly Staleness Check Job**

 Runs every Sunday at 3am

 Step 1: Query database for programs where
 last_verified_at < (today minus 80 days)

 Step 2: For each stale program:
 a\) Fetch the admissions_url
 b\) Generate new page fingerprint (hash)
 c\) Compare to stored fingerprint

 Step 3a: Fingerprint UNCHANGED
 --> Update last_verified_at to today
 --> Data is confirmed still accurate, freshness clock resets

 Step 3b: Fingerprint CHANGED
 --> Write flag to data_change_log
 --> Set program status to 'needs_review'
 --> Email yourself: 'MIT Sloan MBA page changed -- review needed'

 Step 4: Programs in 'needs_review' appear in your admin dashboard
 You review, update fields, set last_verified_at = today

```
**Where to run scheduled jobs**

At the side project stage, two free options work well:

- Vercel Cron Jobs — built into Vercel, free up to 2 jobs, simple to configure. Best starting point.

- Supabase Edge Functions with pg_cron — slightly more powerful, runs inside your database layer. Use this if your job needs to directly query and update records without going through an API.

### 4.3 Field-Level Freshness Priorities
Not all fields go stale at the same rate. Treating them the same wastes effort. Here is a realistic maintenance schedule:

**|                            |                  |**

```
----------------------------|----------------------------|------------------|-----------------------
 **Field**                  | **Change Frequency**       | **Review Cycle** | **Method**
 **application_deadline**   | Every cycle (annual)       | Every August     | Manual + scraper
 **tuition_total**          | Annual                     | Every August     | IPEDS + manual
 **tuition_per_credit**     | Annual                     | Every August     | Manual
 **gmat_required**          | Occasional (policy shifts) | Twice a year     | Scraper flag + manual
 **avg_gmat / avg_gpa**     | Annual (class profiles)    | Every October    | Manual
 **acceptance_rate**        | Annual                     | Every October    | Manual if published
 **format / length_months** | Rarely                     | Annually         | Scraper flag
 **contacts.email**         | Moderate (staff turnover)  | Every 6 months   | User flags + manual
```
### 4.4 The User Flagging System
The simplest and most underrated data freshness tool. A single button on every program profile.

****

```
------------------------------------------------------------
 **User Flag Flow**

 User sees data they believe is wrong

 v
 Clicks 'Flag as outdated' button on the field

 v
 Optional: they enter correct value + source URL

 v
 Record written to data_change_log:
 { change_source: 'user_flag', field_name: 'tuition_total',
 suggested_value: '74000', source_url: 'https://...' }

 v
 You receive email notification

 v
 You verify the suggestion:
 Correct --> update field, approve flag, thank user
 Wrong --> dismiss flag, optionally add a note

```
Build this in V1. It takes less than a day to implement and it starts working for you the moment your first real user encounters a wrong data point.

### 4.5 Admin Dashboard — What You Need to Monitor Data Health
You need a simple internal page (not visible to users) that shows you the health of your data at a glance. This does not need to be beautiful — it just needs to exist.

**|**

```
----------------------|---------------------------------------------------------------
 **Dashboard Panel**  | **What It Shows**
 Freshness overview   | Count of programs by freshness status: Fresh / Aging / Stale
 Needs review queue   | Programs flagged by scraper or users, waiting for your review
 Recent changes       | Last 20 records written to data_change_log
 Unpublished programs | Programs in draft state — incomplete or unreviewed records
 User flag inbox      | Open user-submitted corrections waiting for your decision
```

> Build the admin dashboard in V1 even if it's ugly.
> Flying blind on data quality is how you end up with 200 stale records and no idea which ones. Even a basic Supabase table view filtered by last_verified_at is better than nothing. Invest one day in a proper internal dashboard and it will save you hours of manual auditing.


> SECTION 5
> Search & Filtering Architecture
> How search works under the hood — and why the decision matters before you write a line of code.


## 5. Search & Filtering Architecture
Search is the front door of ScholarPath. Every user starts here. Getting the architecture right upfront prevents a painful rebuild later when the naive approach stops performing.

You have two realistic options. The decision between them affects your database schema, your query structure, and your hosting costs.

### 5.1 Option A — PostgreSQL Full-Text Search (Recommended for MVP)
PostgreSQL — the database powering Supabase — has built-in full-text search. It is not as sophisticated as dedicated search engines, but it is free, requires no extra service, and is powerful enough to handle ScholarPath at side-project scale and well beyond.

The way it works: PostgreSQL maintains a special indexed column called a tsvector on your programs table. This is a pre-processed, searchable version of your program name, description, degree type, and school name. When a user types into the search box, the query matches against this index rather than scanning every row — which keeps it fast even with thousands of programs.

****

```
------------------------------------------------------------------------
 **Full-Text Search Flow in Supabase/PostgreSQL**

 programs table has a generated column:
 search_vector tsvector GENERATED ALWAYS AS (
 to_tsvector('english',
 coalesce(name, '') || ' ' ||
 coalesce(degree_type, '') || ' ' ||
 coalesce(description, '') || ' ' ||
 coalesce(school.name, '') -- joined from schools table
 )
 ) STORED

 User types: 'part-time MBA Chicago'

 v
 Query: WHERE search_vector @@ plainto_tsquery('part-time MBA Chicago')
 AND format = 'part-time'
 AND schools.city = 'Chicago'
 AND programs.level_id = [graduate level UUID]

 v
 Results ranked by relevance (ts_rank)
 Returned as paginated JSON to the frontend

```

> Add a GIN index on the search_vector column.
> A GIN index is a special database index optimised for full-text search. Without it, PostgreSQL scans every row on every search — fine for 100 programs, unacceptably slow at 5,000. Add it once when you create the table: CREATE INDEX programs_search_idx ON programs USING GIN(search_vector). Supabase lets you run this in their SQL editor.


### 5.2 Option B — Algolia (Use Only If Full-Text Search Falls Short)
Algolia is a dedicated search-as-a-service product. It is significantly more powerful than PostgreSQL full-text search — typo tolerance, synonym handling, instant-as-you-type results, custom ranking. It is also a separate paid service ($0 on free tier up to 10,000 records and 10,000 searches/month).

The integration works by syncing your Supabase programs table to Algolia whenever a record changes. Your frontend queries Algolia directly for search, and Supabase for everything else.


> Do not start with Algolia.
> PostgreSQL full-text search handles tens of thousands of programs with sub-100ms response times. You will not hit its limits at side-project scale. Add Algolia only if you have a specific user experience problem — like typo tolerance or instant search — that PostgreSQL cannot deliver. Adding a third service unnecessarily creates sync complexity you do not need.


### 5.3 Filter Architecture
Filters are separate from full-text search. A user might search for 'MBA' and then filter by format, level, location, and tuition range. Filters operate as WHERE clauses on structured columns — not against the search vector.

**|                                               |**

```
-------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------
 **Filter**        | **Database Column**                           | **Implementation Note**
 Program level     | **programs.level_id**                         | Exact match against program_levels table. Dropdown with three options.
 Degree type       | **programs.degree_type**                      | Multi-select. Store as array of selected values, use WHERE degree_type = ANY(selected).
 Format            | **programs.format**                           | Multi-select: full-time, part-time, online, hybrid.
 Location          | **schools.state_province**                    | Join to schools table. Multi-select of US states and Canadian provinces.
 Duration          | **programs.duration_months**                  | Range filter: WHERE duration_months BETWEEN min AND max.
 Tuition total     | **tuition.total_tuition**                     | Range filter with join to tuition table. Filter by currency too — do not mix USD and CAD.
 GMAT/GRE required | **admission_requirements.gmat_gre_required**  | Single-select: required, optional, waivable, not_accepted.
 Work experience   | **admission_requirements.work_exp_years_min** | Range or dropdown: none required, 1-2 years, 3-5 years, 5+ years.
```
### 5.4 The Three Key Queries to Design Now
These are the queries that power the three most important pages in the product. Sketch them out before building the UI — the shape of the query tells you what data you need to fetch and how to structure your components.

**Query 1 — Search Results Page**

Returns a list of program cards. Needs: program name, degree type, format, duration, school name, school city/state, tuition total, GMAT required, last_verified_at. Does NOT need: full description, all admission requirements, contacts. Keep this query lean — it runs on every search.

**Query 2 — Program Profile Page**

Returns everything for one program. Runs four joined queries: program + school, tuition record, admission_requirements record, all program_advisors for this program. This query can be heavier — it only runs when a user clicks into a specific program.

**Query 3 — Comparison Table**

Returns the same standardised fields for 2–5 programs side by side. Identical shape to the profile query but for multiple programs. Use a WHERE program_id = ANY(selected_ids) clause. Cache the result client-side so switching which programs to compare does not re-fetch unnecessarily.


> SECTION 6
> Authentication & User Permissions
> Who can see what, and who can do what — defined before you build, not discovered mid-build.


## 6. Authentication & User Permissions
Authentication means confirming who a user is — are they logged in, and which account are they? Permissions mean what that user is allowed to do once identified. These two things need to be defined upfront because they affect almost every page and every database query in the product.

### 6.1 User Roles
ScholarPath has three types of users. Everything else follows from this.

**|                   |**

```
---------------------|-------------------|------------------------------------------------------------------------------------------------------
 **Role**            | **Who They Are**  | **What Defines Them**
 **Anonymous**       | Not logged in     | Any visitor who has not created an account. The majority of your traffic will be this.
 **Registered User** | Logged-in account | Has signed up with email. Can save programs, flag data, submit corrections.
 **Admin**           | You (the builder) | Has full read/write access to all data. Can publish, unpublish, edit any record. Only you initially.
```
### 6.2 Permission Matrix — What Each Role Can Do
**|                            |                          |**

```
---------------------------------|----------------------------|--------------------------|-------------------------------
 **Action**                      | **Anonymous**              | **Registered User**      | **Admin**
 Search and browse programs      | **Yes**                    | **Yes**                  | **Yes**
 View program profile pages      | **Yes**                    | **Yes**                  | **Yes**
 View comparison table           | **Yes**                    | **Yes**                  | **Yes**
 View advisor contact details    | **No — prompt to sign up** | **Yes**                  | **Yes**
 Save programs to list           | **No — prompt to sign up** | **Yes**                  | **Yes**
 Flag data as outdated           | **No**                     | **Yes**                  | **Yes**
 Submit data corrections         | **No**                     | **Yes — pending review** | **Yes — applied immediately**
 Create / edit / delete programs | **No**                     | **No**                   | **Yes**
 Publish / unpublish programs    | **No**                     | **No**                   | **Yes**
 Access admin dashboard          | **No**                     | **No**                   | **Yes**
```

> Gating advisor contacts behind login is your single best conversion lever.
> The contact directory is the highest-value feature for your beachhead user — a professional who wants to email an MBA advisor. Requiring an account to see emails gives you a reason for users to sign up without putting the core search and comparison features behind a wall. Do not gate search — that kills SEO and first impressions.


### 6.3 How Supabase Auth Works
Supabase Auth handles the entire authentication flow out of the box. You do not write login logic from scratch. Here is what it gives you:

- Email + password signup and login

- Magic link login (user enters email, receives a one-click login link — no password needed). Recommended for your audience.

- Google OAuth (sign in with Google) — easy to add, reduces friction significantly

- Session management — Supabase handles tokens, refresh, and expiry automatically

- A pre-built users table that links to your saved_programs and other user-related tables

The only thing you need to build is the UI — the signup form, login form, and the redirect logic. Supabase handles everything behind it.

### 6.4 Row-Level Security — Critical, Do Not Skip
Row-level security (RLS) is a Supabase/PostgreSQL feature that enforces permissions at the database level — not just in your application code. This is the most important security configuration in your entire stack.

Without RLS, anyone who finds your Supabase API key can read or write any row in any table — including your unpublished drafts, your data change log, and every user's saved programs. With RLS enabled, the database itself enforces who can read or modify each row, regardless of how the request arrives.

****

```
---------------------------------------------------------------------
 **RLS Policies for Each Table**

 Table: programs
 SELECT: allow if is_published = true (anonymous + registered users)
 SELECT: allow all rows if user is admin
 INSERT / UPDATE / DELETE: admin only

 Table: tuition
 SELECT: allow if linked program is_published = true
 INSERT / UPDATE / DELETE: admin only

 Table: admission_requirements
 SELECT: allow if linked program is_published = true
 INSERT / UPDATE / DELETE: admin only

 Table: program_advisors
 SELECT: allow if user is authenticated (registered or admin)
 INSERT / UPDATE / DELETE: admin only

 Table: saved_programs
 SELECT: allow if user_id = auth.uid() (users see only their own)
 INSERT: allow if user_id = auth.uid()
 DELETE: allow if user_id = auth.uid()

 Table: data_change_log
 SELECT: admin only
 INSERT: allow for authenticated users (for flags/corrections)
 UPDATE / DELETE: admin only

```

> Enable RLS on every table before you put any real data in.
> Supabase tables have RLS disabled by default. The moment you create a table, enable RLS immediately — even before you write the policies. A table with RLS enabled but no policies denies all access by default, which is safe. A table with RLS disabled is wide open. Get into the habit of enabling it first.


### 6.5 Identifying Admin Users
The simplest approach for a solo side project: store an is_admin boolean in a profiles table that extends Supabase's built-in users table. Only your email address gets is_admin = true. Your application checks this flag before rendering any admin UI or allowing any write operations.

****

```
--------------------------------------------------------------------------
 **Admin Check Flow**

 User logs in

 v
 App fetches profile: SELECT is_admin FROM profiles WHERE id = auth.uid()

 v
 is_admin = false --> regular user experience, no admin routes
 is_admin = true --> admin nav visible, write operations permitted

 RLS policy on any admin-only table:
 USING ( EXISTS (
 SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
 ))

```

> SECTION 7
> Security Basics
> What you must get right from day one — and what will get you into trouble if you ignore it.


## 7. Security Basics
Security does not need to be complicated at side-project scale. There are a small number of things that will genuinely cause harm if done wrong, and most of the rest is noise. This section covers only the ones that matter for ScholarPath.

### 7.1 API Keys — What They Are and Where They Must Never Go
Supabase gives you two keys. Understanding the difference is critical:

**|                                         |**

```
-------------------------------|-----------------------------------------|----------------------------------------------------------------------------------------------------------
 **Key**                       | **What It Does**                        | **Where It Lives**
 **anon key (public)**         | Read-only access, respects RLS policies | Safe to include in frontend code — this is intentional. RLS protects it.
 **service_role key (secret)** | Full admin access, bypasses all RLS     | Server-side ONLY. Never in frontend code. Never in a public GitHub repo. Store in environment variables.
```

> The service_role key bypasses every RLS policy you wrote.
> If this key ends up in your frontend JavaScript — even accidentally committed to a public GitHub repo for 10 minutes — you must rotate it immediately in Supabase. Treat it like a password to your entire database. It goes in a .env.local file that is listed in .gitignore and nowhere else.


### 7.2 Environment Variables — The Right Way to Handle Secrets
An environment variable is a value stored outside your code that your application reads at runtime. This means secrets never appear in your source code or git history.

****

```
---------------------------------------------------------------------
 **Environment Variable Setup for Next.js + Supabase**

 File: .env.local (never commit this file)
 ─────────────────────────────────────────
 NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
 NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... <- safe in frontend
 SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... <- server-side only

 File: .gitignore (tells git to never track these files)
 ─────────────────────────────────────────
 .env.local
 .env\*.local

 In Vercel dashboard: Settings > Environment Variables
 Add each variable here for production deployment.
 Vercel injects them at build time — they never appear in your code.

 Rule: NEXT_PUBLIC\_ prefix = visible in browser (safe for anon key)
 No prefix = server-side only (use for service_role key)

```
### 7.3 Input Validation — Protecting Against Malicious Data
Any time a user can submit data to your database — a correction, a flag, a saved program note — you need to validate what they submit before storing it. This prevents two classes of problem: accidentally broken data (someone submits a negative tuition value) and intentional abuse (someone tries to inject malicious content into your database).

The practical rules for ScholarPath:

- Maximum length limits on all text fields. A program name should not exceed 200 characters. A user note should not exceed 500 characters. Enforce this both in the UI (HTML maxlength) and in your database (column constraints).

- Numeric fields must be positive numbers. Tuition cannot be negative. Duration cannot be zero. Add CHECK constraints in PostgreSQL.

- Email fields must match an email format. Validate with a regex before storing.

- URLs must start with https://. Strip or reject anything else in admissions_url and source_url fields.

- User-submitted correction values should be stored as pending, not applied directly to live data. Never let a user directly overwrite a published field — route it through your review workflow.

### 7.4 Rate Limiting — Preventing Abuse of Your API
Without rate limiting, a single script can hammer your Supabase database with thousands of requests per minute, running up your usage and potentially taking the site down. Supabase has basic rate limiting built in, but you should add application-level limits on the endpoints that accept user input.

For MVP, the practical protection is simple: limit data flag submissions to 5 per user per day. This is one line of logic in your API route. Vercel also provides DDoS protection automatically on all deployments. You do not need to build elaborate rate limiting at side-project scale — just cover the obvious abuse vectors.

### 7.5 What You Do NOT Need to Worry About at MVP Scale
Security advice on the internet is written for companies with millions of users and dedicated infrastructure teams. At side-project scale, the following are real concerns for large apps but not worth your time right now:

- SOC 2 compliance, penetration testing, security audits — not needed until you have paying customers and a legal obligation to protect their data.

- Custom JWT handling — Supabase handles this entirely. Do not touch it.

- DDoS protection beyond Vercel's built-in layer — overkill until you have traffic worth attacking.

- Encrypted backups — Supabase handles automated backups on paid plans. The free tier has point-in-time recovery for 7 days.


> The security checklist that actually matters for MVP:
> 1. RLS enabled on every table before data goes in. 2. service_role key in environment variables only, never in code. 3. .env.local in .gitignore from day one. 4. User-submitted data goes through a review queue before touching live records. That is it for now.


> SECTION 8
> API Design
> How your frontend talks to your database — the key queries that power every important page.


## 8. API Design
An API (Application Programming Interface) is the layer between your frontend (what users see) and your database (where data lives). In a Next.js + Supabase stack, you mostly do not need to build a traditional API from scratch — Supabase auto-generates one from your database schema. But you still need to design the specific queries your pages will make, and where those queries run.

### 8.1 Where Queries Run — Server vs Client
Next.js can run code in two places: on the server (before the page is sent to the browser) or on the client (in the user's browser after the page loads). This distinction matters for performance, SEO, and security.

**|                             |**

```
----------------------|-----------------------------|---------------------------------------------------------------------------------
 **Query Type**       | **Run On Server?**          | **Reason**
 Search results page  | Yes — server-side rendering | Critical for SEO. Google must be able to crawl search result pages.
 Program profile page | Yes — server-side rendering | SEO. Every program page should be indexable by Google.
 Comparison table     | Client-side (browser)       | User selects programs interactively. No SEO value for dynamic comparisons.
 Saved programs list  | Client-side (browser)       | User-specific data. Cannot be server-rendered without knowing who is logged in.
 Data flag submission | Server-side API route       | Needs validation and auth check before touching the database.
 Admin data edits     | Server-side API route       | Must verify admin role server-side. Never trust client-side admin checks alone.
```
### 8.2 The Core API Endpoints
**GET /api/programs/search**

Powers the search results page. Accepts query parameters for search text and all filter values. Returns a paginated list of program cards.

****

```
----------------------------------------------------------------------
 **Search Endpoint — Input & Output**

 Input (query parameters):
 q=MBA -- full-text search term
 level=graduate -- filter by program level
 format=part-time,online -- comma-separated format filter
 state=CA,NY,ON -- comma-separated locations
 tuition_max=80000 -- max tuition filter
 gmat_required=optional -- GMAT requirement filter
 page=1&limit=20 -- pagination

 Output (JSON array of program cards):
 [
 {
 id, name, degree_type, format, duration_months,
 last_verified_at,
 school: { name, city, state_province, logo_url },
 tuition: { total_tuition, currency },
 admission: { gmat_gre_required }
 },
 ...
 ]

 Note: description, full advisor list, all requirements NOT included.
 Keep this payload lean -- it runs on every keystroke (debounced).

```
**GET /api/programs/[slug]**

Powers the program profile page. Fetches everything for one program in four joined queries: core program data, tuition record, admission requirements, and all advisors. Returns the full profile payload.

****

```
--------------------------------------------------------------
 **Profile Endpoint — Output Structure**

 Output:
 {
 program: { all fields from programs table },
 school: { all fields from schools table },
 level: { name, description from program_levels },
 tuition: { all fields from tuition table },
 requirements: { all fields from admission_requirements },
 advisors: [
 { id, name, title, role_type, email, phone, office_hours,
 response_time_days, last_verified_at },
 ... -- all advisors for this program
 ]
 }

 Note: advisors.email only included if user is authenticated.
 If anonymous: return advisors without the email field.
 Use Supabase RLS policy on program_advisors to enforce this.

```
**GET /api/programs/compare**

Powers the comparison table. Accepts a list of program IDs (2–5) and returns the same standardised fields for each, shaped as an array of full profiles.

****

```
-------------------------------------------------------------------------
 **Compare Endpoint — Input & Output**

 Input: ?ids=uuid1,uuid2,uuid3

 Output: Array of full program profiles (same shape as profile endpoint)
 [
 { program, school, level, tuition, requirements, advisors },
 { program, school, level, tuition, requirements, advisors },
 { program, school, level, tuition, requirements, advisors },
 ]

 Frontend renders these as columns in a comparison table.
 If a field is null for one program and has a value for another,
 show a dash and a 'Not published' note -- never hide the column.

```
**POST /api/flags**

Accepts a user-submitted data flag or correction. Requires authentication. Validates input, writes to data_change_log with change_source = user_flag, and sends an email notification to you.

**POST /api/saved-programs**

**DELETE /api/saved-programs/[id]**

Adds or removes a program from the authenticated user's saved list. Checks that the user_id in the request matches auth.uid() server-side — never trust a user_id sent from the browser.

### 8.3 Pagination Standard
All list endpoints use cursor-based pagination rather than offset pagination. The practical difference: offset pagination (page=1, page=2) breaks when new records are inserted between requests. Cursor pagination (after=last_seen_id) is stable. Use page size of 20 programs per request for search results.


> SECTION 9
> Project Structure & Environment Setup
> How the codebase is organised and how to get it running locally — so you can pick it back up after two weeks away.


## 9. Project Structure & Environment Setup
A consistent project structure means you always know where things live. This is especially important for a solo vibe-coded project — it is easy to create a mess of files that makes sense the day you write them and confuses you three weeks later.

### 9.1 Recommended Folder Structure
****

```
-------------------------------------------------------------------
 **Next.js + Supabase Project Structure**

 scholarpath/
 ├── .env.local <- secrets, never committed
 ├── .gitignore <- must include .env\*.local
 ├── package.json
 ├── next.config.js
 │
 ├── app/ <- Next.js App Router pages
 │ ├── page.jsx <- homepage / search
 │ ├── programs/
 │ │ └── [slug]/page.jsx <- program profile page
 │ ├── compare/page.jsx <- comparison table page
 │ ├── saved/page.jsx <- user saved programs
 │ ├── admin/ <- admin pages (protected)
 │ │ ├── page.jsx <- admin dashboard
 │ │ └── programs/
 │ │ ├── page.jsx <- program list with edit buttons
 │ │ ├── new/page.jsx <- create new program
 │ │ └── [id]/page.jsx <- edit existing program
 │ └── api/ <- API routes (server-side)
 │ ├── programs/
 │ │ ├── search/route.js <- search endpoint
 │ │ ├── [slug]/route.js <- profile endpoint
 │ │ └── compare/route.js <- comparison endpoint
 │ ├── flags/route.js <- data flag submission
 │ └── saved/route.js <- save/unsave programs
 │
 ├── components/ <- reusable UI components
 │ ├── ProgramCard.jsx <- card shown in search results
 │ ├── ProgramProfile.jsx <- full profile layout
 │ ├── ComparisonTable.jsx <- side-by-side comparison
 │ ├── SearchBar.jsx <- search input + filters
 │ ├── FreshnessIndicator.jsx <- green/yellow/red freshness badge
 │ ├── FlagButton.jsx <- flag outdated data button
 │ └── AdvisorCard.jsx <- contact card (gated behind auth)
 │
 ├── lib/ <- shared utilities and DB client
 │ ├── supabase/
 │ │ ├── client.js <- browser-side Supabase client
 │ │ └── server.js <- server-side Supabase client
 │ ├── queries/ <- all database queries in one place
 │ │ ├── programs.js <- search, profile, compare queries
 │ │ ├── tuition.js
 │ │ ├── requirements.js
 │ │ └── advisors.js
 │ └── utils/
 │ ├── freshness.js <- freshness status calculation
 │ └── format.js <- currency, date formatters
 │
 └── public/ <- static assets
 └── school-logos/ <- cached school logo images

```

> Keep all database queries in lib/queries/.
> The single biggest structural mistake in side projects is scattering database calls across random component files. When your schema changes — and it will — you want to update queries in one place, not hunt through 30 files. Every database call lives in lib/queries/. Components call functions from there. Nothing else touches Supabase directly.


### 9.2 Local Development Setup — Step by Step
Run these steps in order when setting up the project for the first time or on a new machine.

6.  Install Node.js (v18 or later) from nodejs.org. Verify with: node --version

7.  Install the project: npx create-next-app@latest scholarpath — select App Router, TypeScript optional, Tailwind CSS yes

8.  Install Supabase client: npm install @supabase/supabase-js @supabase/ssr

9.  Create a Supabase project at supabase.com. Free tier. Copy your project URL and anon key from Settings > API.

10. Create .env.local in the project root and add your Supabase URL and keys (see Section 7.2 for the exact format).

11. Run the database schema SQL in Supabase SQL Editor — create all nine tables, enable RLS on each, add the GIN index for search.

12. Start the local dev server: npm run dev. Visit http://localhost:3000.

13. Enter your first 5 programs manually via the Supabase table editor to confirm the schema works before building any UI.

### 9.3 Git Workflow for a Solo Project
You do not need a complex branching strategy. One rule matters: never commit directly to main with broken code.

- main branch — always deployable. Vercel auto-deploys from this branch.

- feature branches — create a new branch for each feature: git checkout -b feature/search-page. Merge to main when it works.

- Commit messages should say what changed and why — not just 'update' or 'fix'. You will read these messages six months from now when something breaks.

- .gitignore must include: .env.local, .env\*.local, node_modules/, .next/


> SECTION 10
> Deployment & CI Pipeline
> How code goes from your laptop to the live site — automatic, repeatable, and hard to break accidentally.


## 10. Deployment & CI Pipeline
Deployment is the process of taking code from your machine and making it live on the internet. A CI pipeline (Continuous Integration) is the set of automated checks that run every time you push code — catching broken builds before they reach real users.

For a Next.js + Vercel stack, most of this is handled automatically. Your job is to configure it correctly once and then let it run.

### 10.1 Deployment Flow
****

```
-------------------------------------------------------------------------
 **Code to Production — Full Flow**

 Your machine (local development)

git push origin main
 v
 GitHub repository

Vercel detects push via webhook (automatic)
 v
 Vercel build process:
 1. Installs dependencies (npm install)
 2. Runs build (npm run build)
 3. If build FAILS --> deployment blocked, you get an email
 4. If build SUCCEEDS --> deployed to scholarpath.com

 v
 Live at scholarpath.com
 Previous deployment kept as fallback (instant rollback available)

 For non-main branches (feature branches):
 Vercel creates a preview URL: scholarpath-git-feature-search.vercel.app
 Test your feature there before merging to main.

```
### 10.2 Environments
You will have three environments. Keep them strictly separate.

**|                      |**

```
-----------------|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------
 **Environment** | **Where It Runs**    | **Purpose & Rules**
 **Local**       | Your laptop          | Development and testing. Uses .env.local. Points to a separate Supabase project or a local Supabase instance.
 **Preview**     | Vercel (per branch)  | Testing features before they go live. Vercel creates these automatically for every non-main branch. Points to a staging Supabase project.
 **Production**  | Vercel (main branch) | The live site real users see. Points to your production Supabase project. Never test experimental changes here.
```

> Use two separate Supabase projects — one for development, one for production.
> This costs nothing (both on free tier). It means you can break things, run test migrations, and insert dummy data in development without any risk to your live data. When you are ready to apply a database change to production, you do it deliberately — not accidentally by running the wrong command.


### 10.3 Database Migrations
A migration is a versioned script that changes your database schema — adding a column, creating a table, modifying a constraint. Managing these properly prevents the nightmare scenario where your local database and production database have different structures.

Supabase has a built-in migration system accessible via their CLI. The basic workflow:

14. Make a schema change locally using the Supabase CLI: supabase migration new add_acceptance_rate_column

15. Write the SQL for the change in the generated migration file

16. Test it locally: supabase db reset

17. When ready, apply to production: supabase db push

For a side project, even a simpler approach works: keep a file called schema.sql in your repo that contains the complete CREATE TABLE statements for your entire schema. Update it whenever you change the structure. This gives you a single source of truth you can always use to recreate the database from scratch.

### 10.4 Monitoring — Knowing When Something Breaks
You need to know when your live site has an error before a user tells you. At side-project scale, two free tools cover this:

- Vercel Analytics — built in, shows you page load times, error rates, and traffic. Enable it in the Vercel dashboard in one click.

- Supabase Dashboard — shows database query performance, errors, and usage. Check it weekly when you are actively developing.

- Vercel error emails — Vercel will email you when a deployment fails. Make sure the email goes to an inbox you check.

You do not need Sentry, Datadog, or any dedicated monitoring tool at this stage. The built-in Vercel and Supabase dashboards are sufficient until you have real user traffic worth monitoring in detail.


> SECTION 11
> Admin Data Entry Workflow
> The practical day-to-day process for adding programs, updating data, and keeping everything accurate.


## 11. Admin Data Entry Workflow
This section documents the operational side of running ScholarPath — how you actually get data in, keep it current, and manage the product day to day. It is the least glamorous part of the TDD and the most important one for actually shipping.

### 11.1 Three Stages of Data Management
**|                                                  |**

```
------------------|--------------------------------------------------|------------------------------------------------------------------
 **Stage**        | **When**                                         | **Tooling**
 **Bootstrap**    | Before launch — entering first 50-100 programs   | Airtable as spreadsheet UI, then bulk import to Supabase via CSV
 **Ongoing**      | Weekly — adding new programs, fixing flags       | Custom admin pages in the app itself (/admin/programs)
 **Annual sweep** | Every August — full tuition and deadline refresh | Admin dashboard queue + manual school website visits
```
### 11.2 Bootstrap Phase — Airtable to Supabase
For the first 50–100 programs, use Airtable as your data entry interface. It is faster than building an admin UI before you know what you need, and it gives you a backup copy of all your data outside the database.

****

```
---------------------------------------------------------------------
 **Bootstrap Data Entry Flow**

 1. Create one Airtable base with tables mirroring your schema:
 Schools | Programs | Tuition | Requirements | Advisors

 2. For each program (working from US News top MBA/MS lists):
 a\) Find the school admissions page
 b\) Fill in all fields you can find (leave blanks for missing data)
 c\) Paste the admissions_url so you can re-verify later
 d\) Note which fields you could not find in a notes column

 3. When a table is complete, export as CSV from Airtable
 Import into Supabase via: Table Editor > Import CSV

 4. Set is_published = false on all imported records
 Review each one in the admin UI before publishing

 5. Once the admin UI is built, do all future edits there.
 Airtable becomes a backup reference only.

```

> Airtable tip — build a completion tracker column.
> Add a formula column in Airtable that counts how many required fields are filled in — e.g. IF(tuition_total, 1, 0) + IF(application_deadline, 1, 0) + ... This gives you an instant completeness score per program. Publish only programs that score above 80%. It takes 20 minutes to set up and saves you from publishing half-empty profiles.


### 11.3 The Admin Dashboard — What to Build
The admin dashboard is an internal-only section of the app (protected by the is_admin flag from Section 6). It does not need to be beautiful. It needs to be functional.

**|**

```
----------------------------|------------------------------------------------------------------------------------------------------------------------------------------
 **Admin Page**             | **What It Does**
 **/admin**                 | Dashboard home — freshness summary (Fresh/Aging/Stale counts), open user flags, programs needing review, recent data changes
 **/admin/programs**        | Full list of all programs (published and draft). Filter by status, level, school. Quick links to edit each.
 **/admin/programs/new**    | Form to create a new program record across all linked tables — program, tuition, requirements, advisors all in one flow.
 **/admin/programs/[id]** | Edit any field of an existing program. All changes auto-logged to data_change_log. Publish/unpublish toggle.
 **/admin/flags**           | Queue of user-submitted flags and corrections. Each shows old value, suggested new value, source URL. Approve or dismiss with one click.
 **/admin/stale**           | All programs where last_verified_at is older than 80 days, sorted by most stale. Your weekly review list.
```
### 11.4 The Annual Data Sweep — August Checklist
The US graduate admissions cycle starts in September. New application deadlines, updated tuition figures, and revised class profiles are published by schools in August. Every year, before the cycle starts, run through this checklist:

18. Export all programs from Supabase sorted by last_verified_at ascending (most stale first)

19. For each program in the top 50 by traffic (from Vercel Analytics), visit the school admissions page and verify: tuition figures, application deadlines for R1/R2/R3, GMAT/GRE policy, and class profile stats

20. Update any changed fields via the admin dashboard — changes are logged automatically

21. Reset last_verified_at to today for every program you reviewed, even if nothing changed

22. Check the IPEDS data release (usually published in October) and re-import institution-level tuition figures for US schools

23. Review the program_advisors table — email any contacts that have been in the system for 12+ months without a user correction to confirm they are still active


> Time estimate for the annual sweep:
> 50 programs at 15-20 minutes each = roughly 2-3 focused weekends. This is the ongoing cost of running a data product. Budget for it. If you skip it, data goes stale and users stop trusting the product.


> APPENDIX
> Reference: Data Sources & Legal Summary
> Quick reference for data sources and legal ground rules.


## Appendix A — Data Sources Reference
**|               |                       |**

```
------------------------------|---------------|-----------------------|----------------------------------------------------------------
 **Source**                   | **Geography** | **Access**            | **Best Used For**
 IPEDS — nces.ed.gov          | US            | Free download         | Institution-level tuition, enrollment, location, accreditation
 StatCan PSIS — statcan.gc.ca | Canada        | Free download         | Canadian institution equivalents of IPEDS fields
 School admissions pages      | Both          | Manual / scraping     | Program-specific fields: GMAT avg, deadlines, requirements
 US News rankings data        | US            | Partially free        | Acceptance rates, ranking context — supplement only
 Firecrawl API                | Both          | Paid API ($20–50/mo) | Converting messy school pages to clean text for AI extraction
 User corrections             | Both          | Built into product    | Ongoing accuracy maintenance at scale
```
## Appendix B — Legal Ground Rules (Plain English)
- Factual data is not copyrightable. Tuition amounts, deadlines, credit hours, and GMAT averages are facts. Facts cannot be owned. You can legally aggregate and publish them.

- Do not copy prose verbatim. If a school writes a paragraph describing their program culture, that paragraph is copyrighted. Summarise or paraphrase — never copy it word for word.

- Respect robots.txt. This is a file on every website that tells automated tools what they are not allowed to access. Ignoring it is not illegal but is bad practice and can get your IP address blocked.

- Do not scrape behind login walls. Only collect data from publicly accessible pages. Scraping content that requires a login crosses a clear legal line.

- The hiQ v. LinkedIn ruling (2022) established that scraping publicly accessible data does not violate the US Computer Fraud and Abuse Act. This is your primary legal precedent in the US.

- Canada follows a similar legal landscape for this use case. No major divergence for public data aggregation.

- Display a source and last-verified date on all data. This demonstrates good faith and protects you if data accuracy is ever questioned.

- Get a legal review before automating scraping at scale. One $500–1,000 conversation with a tech lawyer before you scale to 500+ programs is cheap insurance.
