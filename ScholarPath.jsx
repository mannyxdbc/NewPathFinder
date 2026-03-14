import { useState, useMemo, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const PROGRAMS = [
  {
    id: "hbs-mba", logo: "HBS", school: "Harvard Business School",
    schoolShort: "Harvard", city: "Boston", state: "MA", country: "US",
    name: "Master of Business Administration", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 180,
    tuitionTotal: 146880, tuitionPerSemester: 36720, currency: "USD",
    gmatRequired: "Required", gmatAvg: 730, greAvg: null, gpaAvg: 3.7,
    acceptanceRate: 12, workExpYears: 5, workExpAvg: 5.1,
    deadline: "Jan 4, 2026", deadlineR2: "Jan 4, 2026",
    englishTest: "Required (non-native)", lorCount: 2, sopRequired: true,
    description: "The Harvard MBA develops outstanding business leaders through the case method — analyzing 500+ real-world cases over two years. First year: required curriculum across finance, marketing, operations. Second year: fully elective. Students have deep access to Harvard's broader university ecosystem including Law, Medicine, and Kennedy School.",
    advisorName: "HBS MBA Admissions", advisorEmail: "mba@hbs.edu", advisorPhone: "+1 617-495-6128",
    admissionsUrl: "https://www.hbs.edu/mba", lastVerified: "2025-11-01",
    tags: ["Top 5", "Case Method", "Alumni Network"],
    highlights: ["#1 MBA brand recognition globally", "500+ cases analyzed over 2 years", "Joint degrees with Harvard Law & Kennedy School"]
  },
  {
    id: "wharton-mba", logo: "WH", school: "The Wharton School, University of Pennsylvania",
    schoolShort: "Wharton", city: "Philadelphia", state: "PA", country: "US",
    name: "Master of Business Administration", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 190,
    tuitionTotal: 144010, tuitionPerSemester: 36002, currency: "USD",
    gmatRequired: "Required", gmatAvg: 733, greAvg: 325, gpaAvg: 3.6,
    acceptanceRate: 20, workExpYears: 5, workExpAvg: 5.3,
    deadline: "Jan 15, 2026", deadlineR2: "Jan 15, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 3, sopRequired: true,
    description: "Wharton's MBA is defined by its rigorous quantitative curriculum and remarkable breadth — finance, management, healthcare, entrepreneurship, and more. Dual-degree programs with Penn Law, Penn Medicine, Penn Engineering, and Lauder (international studies) are well-established. The program's strength in finance is reflected in Wall Street placement rates.",
    advisorName: "Wharton MBA Admissions", advisorEmail: "mba-admissions@wharton.upenn.edu", advisorPhone: "+1 215-898-6183",
    admissionsUrl: "https://mba.wharton.upenn.edu", lastVerified: "2025-10-15",
    tags: ["Finance", "Dual Degree", "Quantitative"],
    highlights: ["Highest GMAT average of M7", "Joint degrees with Penn Law & Medicine", "Strongest Wall Street placement in M7"]
  },
  {
    id: "booth-ft-mba", logo: "CB", school: "University of Chicago Booth School of Business",
    schoolShort: "Booth", city: "Chicago", state: "IL", country: "US",
    name: "Full-Time MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 21, creditHours: 104,
    tuitionTotal: 148980, tuitionPerSemester: 37245, currency: "USD",
    gmatRequired: "Required", gmatAvg: 726, greAvg: 323, gpaAvg: 3.6,
    acceptanceRate: 24, workExpYears: 4, workExpAvg: 4.7,
    deadline: "Jan 8, 2026", deadlineR2: "Jan 8, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "Chicago Booth's MBA stands apart for its radical curriculum flexibility — one of the most open in top business education. Students design programs from 180+ electives with only a handful of required courses. Booth is consistently ranked #1 or #2 for finance and economics. The alumni network is exceptionally strong in investment management and private equity.",
    advisorName: "Booth Admissions Office", advisorEmail: "admissions@chicagobooth.edu", advisorPhone: "+1 312-450-3860",
    admissionsUrl: "https://www.chicagobooth.edu/mba", lastVerified: "2025-11-10",
    tags: ["Flexible Curriculum", "Finance", "Economics"],
    highlights: ["180+ elective courses — most flexible M7 curriculum", "Top-ranked for Finance & Economics", "Strong PE/IM alumni network in Chicago & NYC"]
  },
  {
    id: "booth-evening-mba", logo: "CB", school: "University of Chicago Booth School of Business",
    schoolShort: "Booth", city: "Chicago", state: "IL", country: "US",
    name: "Evening MBA", degree: "MBA", level: "Graduate",
    format: "Part-time", durationMonths: 33, creditHours: 104,
    tuitionTotal: 148980, tuitionPerSemester: 37245, currency: "USD",
    gmatRequired: "Optional", gmatAvg: 680, greAvg: null, gpaAvg: 3.4,
    acceptanceRate: 35, workExpYears: 3, workExpAvg: 4.2,
    deadline: "Rolling", deadlineR2: "Rolling",
    englishTest: "Required (non-native)", lorCount: 2, sopRequired: true,
    description: "Booth's Evening MBA delivers the same curriculum and faculty as the full-time program. Classes run weekday evenings and select weekends. Students work full-time throughout, completing the degree in 2.5–5 years depending on load. All Booth resources — career services, networking, clubs — are available to evening students.",
    advisorName: "Evening/Weekend Admissions", advisorEmail: "eveningweekend@chicagobooth.edu", advisorPhone: "+1 312-450-3860",
    admissionsUrl: "https://www.chicagobooth.edu/mba/evening-weekend", lastVerified: "2025-09-20",
    tags: ["Part-time", "Working Professionals", "GMAT Optional"],
    highlights: ["Same curriculum and faculty as full-time", "2.5–5 year completion, designed around work", "Rolling admissions — apply year-round"]
  },
  {
    id: "kellogg-ft-mba", logo: "KL", school: "Northwestern University Kellogg School of Management",
    schoolShort: "Kellogg", city: "Evanston", state: "IL", country: "US",
    name: "Full-Time MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 156,
    tuitionTotal: 145350, tuitionPerSemester: 36337, currency: "USD",
    gmatRequired: "Required", gmatAvg: 727, greAvg: 323, gpaAvg: 3.7,
    acceptanceRate: 22, workExpYears: 5, workExpAvg: 5.0,
    deadline: "Jan 14, 2026", deadlineR2: "Jan 14, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "Kellogg is defined by its team-oriented, highly collaborative culture and exceptional strength in marketing and general management. Students regularly name the culture — not just the career outcomes — as their primary reason for choosing Kellogg. Leadership development extends far beyond academics through the extensive club and conference ecosystem.",
    advisorName: "Kellogg Admissions", advisorEmail: "kellogg-admissions@kellogg.northwestern.edu", advisorPhone: "+1 847-491-3308",
    admissionsUrl: "https://www.kellogg.northwestern.edu/programs/full-time-mba.aspx", lastVerified: "2025-10-30",
    tags: ["Marketing", "Collaborative", "Leadership"],
    highlights: ["#1 for Marketing consistently", "Most team-oriented culture in M7", "MMM joint degree with McCormick Engineering"]
  },
  {
    id: "mit-sloan-mba", logo: "MS", school: "MIT Sloan School of Management",
    schoolShort: "MIT Sloan", city: "Cambridge", state: "MA", country: "US",
    name: "Sloan MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 156,
    tuitionTotal: 149000, tuitionPerSemester: 37250, currency: "USD",
    gmatRequired: "Required", gmatAvg: 728, greAvg: 323, gpaAvg: 3.6,
    acceptanceRate: 15, workExpYears: 5, workExpAvg: 5.3,
    deadline: "Jan 22, 2026", deadlineR2: "Jan 22, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "MIT Sloan combines rigorous analytical thinking with the innovation ecosystem of MIT's broader campus. Action Learning labs are central — students tackle real challenges with real companies throughout the program. The proximity to MIT's engineering and research departments creates unique access to emerging technologies and entrepreneurial resources.",
    advisorName: "Sloan MBA Admissions", advisorEmail: "mbaadmissions@sloan.mit.edu", advisorPhone: "+1 617-258-5434",
    admissionsUrl: "https://mitsloan.mit.edu/mba", lastVerified: "2025-11-05",
    tags: ["Tech Focus", "Innovation", "Action Learning"],
    highlights: ["Action Learning labs with real companies", "Access to MIT's broader research ecosystem", "Strongest tech-sector MBA network in Boston"]
  },
  {
    id: "columbia-mba", logo: "CO", school: "Columbia Business School",
    schoolShort: "Columbia", city: "New York", state: "NY", country: "US",
    name: "MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 20, creditHours: 60,
    tuitionTotal: 152776, tuitionPerSemester: 38194, currency: "USD",
    gmatRequired: "Required", gmatAvg: 729, greAvg: 322, gpaAvg: 3.5,
    acceptanceRate: 28, workExpYears: 5, workExpAvg: 5.2,
    deadline: "Apr 1, 2026", deadlineR2: "Jan 27, 2026",
    englishTest: "Required (non-native)", lorCount: 2, sopRequired: true,
    description: "Columbia Business School offers unmatched access to New York City's finance, media, and technology industries. The accelerated two-year and traditional formats allow students to tailor pace and intensity. Columbia's Value Investing program — legacy of Benjamin Graham and Warren Buffett — is globally renowned.",
    advisorName: "CBS Admissions Office", advisorEmail: "apply@gsb.columbia.edu", advisorPhone: "+1 212-854-1961",
    admissionsUrl: "https://business.columbia.edu/mba", lastVerified: "2025-10-01",
    tags: ["NYC Location", "Finance", "Value Investing"],
    highlights: ["Heart of New York City — unmatched industry access", "Value Investing program traces back to Warren Buffett", "R3 deadline available — unusual for top programs"]
  },
  {
    id: "stanford-msx", logo: "SG", school: "Stanford Graduate School of Business",
    schoolShort: "Stanford GSB", city: "Stanford", state: "CA", country: "US",
    name: "MSx Program", degree: "MS", level: "Graduate",
    format: "Full-time", durationMonths: 10, creditHours: 65,
    tuitionTotal: 79860, tuitionPerSemester: 39930, currency: "USD",
    gmatRequired: "Required", gmatAvg: 720, greAvg: 330, gpaAvg: 3.6,
    acceptanceRate: 10, workExpYears: 8, workExpAvg: 11,
    deadline: "Apr 8, 2026", deadlineR2: "Apr 8, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 3, sopRequired: true,
    description: "The Stanford MSx is a 10-month intensive program for senior professionals with 8+ years of experience — not a truncated MBA. It is built for mid-career leaders who need to accelerate their trajectory or pivot without a two-year commitment. Cohort sizes are intimate (~90 students), and the Stanford GSB network is unmatched in Silicon Valley.",
    advisorName: "MSx Admissions", advisorEmail: "msx@gsb.stanford.edu", advisorPhone: "+1 650-723-2766",
    admissionsUrl: "https://www.gsb.stanford.edu/programs/msx", lastVerified: "2025-09-15",
    tags: ["Senior Leaders", "Intensive", "10 Months"],
    highlights: ["Exclusively for 8+ year professionals", "~90 person cohort — intensely intimate", "Silicon Valley network without peer"]
  },
  {
    id: "rotman-ft-mba", logo: "RT", school: "University of Toronto Rotman School of Management",
    schoolShort: "Rotman", city: "Toronto", state: "ON", country: "CA",
    name: "Full-Time MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 20, creditHours: 60,
    tuitionTotal: 113200, tuitionPerSemester: 28300, currency: "CAD",
    gmatRequired: "Required", gmatAvg: 665, greAvg: 315, gpaAvg: 3.4,
    acceptanceRate: 38, workExpYears: 4, workExpAvg: 4.5,
    deadline: "Mar 15, 2026", deadlineR2: "Feb 2, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "Canada's leading MBA program, Rotman is located in Toronto — Canada's financial and business capital. The program is built around integrative thinking, the framework developed by former dean Roger Martin. Strong industry ties in finance, consulting, and tech make it the top choice for professionals targeting Canadian career outcomes.",
    advisorName: "Rotman MBA Admissions", advisorEmail: "mba@rotman.utoronto.ca", advisorPhone: "+1 416-978-3499",
    admissionsUrl: "https://www.rotman.utoronto.ca/degrees/mba", lastVerified: "2025-10-20",
    tags: ["Canada #1", "Toronto", "Integrative Thinking"],
    highlights: ["Consistently Canada's top-ranked MBA", "Located in Toronto's financial core", "Integrative Thinking framework differentiates graduates"]
  },
  {
    id: "ivey-mba", logo: "IV", school: "Ivey Business School, Western University",
    schoolShort: "Ivey", city: "London", state: "ON", country: "CA",
    name: "MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 12, creditHours: 48,
    tuitionTotal: 59600, tuitionPerSemester: 29800, currency: "CAD",
    gmatRequired: "Required", gmatAvg: 643, greAvg: null, gpaAvg: 3.5,
    acceptanceRate: 45, workExpYears: 3, workExpAvg: 4.0,
    deadline: "Feb 28, 2026", deadlineR2: "Feb 28, 2026",
    englishTest: "Required (non-native)", lorCount: 2, sopRequired: true,
    description: "Ivey's one-year MBA is renowned across Canada for its intensive case-based approach — students analyze 300+ cases in a single year. Designed for career accelerators and changers who want an intensive experience without a two-year commitment. Ivey's alumni network is especially dense in Canadian consulting, banking, and corporate strategy.",
    advisorName: "Ivey MBA Admissions", advisorEmail: "mba@ivey.ca", advisorPhone: "+1 519-661-3212",
    admissionsUrl: "https://www.ivey.uwo.ca/mba", lastVerified: "2025-09-01",
    tags: ["1-Year", "Case Method", "Canada"],
    highlights: ["300+ cases in a single year", "Most affordable top-Canadian MBA", "Dense Canadian consulting & banking alumni base"]
  },
  {
    id: "mit-mfin", logo: "MS", school: "MIT Sloan School of Management",
    schoolShort: "MIT Sloan", city: "Cambridge", state: "MA", country: "US",
    name: "Master of Finance", degree: "MS", level: "Graduate",
    format: "Full-time", durationMonths: 12, creditHours: 66,
    tuitionTotal: 86400, tuitionPerSemester: 43200, currency: "USD",
    gmatRequired: "Required", gmatAvg: 740, greAvg: null, gpaAvg: 3.7,
    acceptanceRate: 8, workExpYears: 0, workExpAvg: 2,
    deadline: "Feb 15, 2026", deadlineR2: "Feb 15, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 3, sopRequired: true,
    description: "The MIT MFin is a highly quantitative one-year master's program for early-career professionals and exceptional recent graduates targeting investment management, corporate finance, or financial engineering. Strong mathematics and statistics background is not optional — it is required. Placement in top asset managers, banks, and quant funds is exceptional.",
    advisorName: "MFin Admissions", advisorEmail: "mfin-admissions@sloan.mit.edu", advisorPhone: "+1 617-258-5434",
    admissionsUrl: "https://mitsloan.mit.edu/master-of-finance", lastVerified: "2025-11-01",
    tags: ["Quantitative", "Finance", "1-Year"],
    highlights: ["Most selective MS Finance program in the US", "Designed for quant finance careers", "Near-100% placement in asset management & banking"]
  },
  {
    id: "cmu-mism", logo: "CM", school: "Carnegie Mellon University Heinz College",
    schoolShort: "CMU Heinz", city: "Pittsburgh", state: "PA", country: "US",
    name: "Master of Information Systems Management", degree: "MS", level: "Graduate",
    format: "Full-time", durationMonths: 16, creditHours: 96,
    tuitionTotal: 69200, tuitionPerSemester: 17300, currency: "USD",
    gmatRequired: "Optional", gmatAvg: null, greAvg: 320, gpaAvg: 3.5,
    acceptanceRate: 22, workExpYears: 2, workExpAvg: 3,
    deadline: "Mar 1, 2026", deadlineR2: "Mar 1, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 3, sopRequired: true,
    description: "CMU's MISM bridges technical depth and business fluency for professionals targeting product management, technology consulting, and digital transformation leadership. The program benefits from CMU's broader reputation in computer science and engineering. Heinz College's data-driven management philosophy is embedded throughout the curriculum.",
    advisorName: "Heinz College Admissions", advisorEmail: "heinz-admissions@andrew.cmu.edu", advisorPhone: "+1 412-268-2164",
    admissionsUrl: "https://www.heinz.cmu.edu/programs/information-systems-management-master", lastVerified: "2025-10-10",
    tags: ["Tech & Business", "Product Mgmt", "GMAT Optional"],
    highlights: ["Bridges CS depth with business leadership", "Strong placement in product management roles", "GMAT optional — GRE preferred"]
  },
  {
    id: "yale-som-mba", logo: "YS", school: "Yale School of Management",
    schoolShort: "Yale SOM", city: "New Haven", state: "CT", country: "US",
    name: "MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 72,
    tuitionTotal: 138900, tuitionPerSemester: 34725, currency: "USD",
    gmatRequired: "Required", gmatAvg: 720, greAvg: 324, gpaAvg: 3.7,
    acceptanceRate: 24, workExpYears: 5, workExpAvg: 5.1,
    deadline: "Jan 7, 2026", deadlineR2: "Jan 7, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "Yale SOM's MBA is distinctive for its integrated, cross-disciplinary first year — no traditional functional silos. The program is known for its commitment to social enterprise alongside mainstream careers. Joint degrees with Yale Law, Medicine, Forestry, and Architecture are especially popular. Cohort size (~350) creates a genuine community.",
    advisorName: "SOM Admissions Office", advisorEmail: "mba.admissions@yale.edu", advisorPhone: "+1 203-432-5635",
    admissionsUrl: "https://som.yale.edu/programs/mba", lastVerified: "2025-11-12",
    tags: ["Integrated Curriculum", "Social Enterprise", "Joint Degrees"],
    highlights: ["No functional silos in Year 1 — uniquely integrated", "Joint degrees with Yale Law, Medicine, Forestry", "Most diverse career outcomes in top MBA programs"]
  },
  {
    id: "mcgill-mba", logo: "MG", school: "McGill University Desautels Faculty of Management",
    schoolShort: "McGill", city: "Montreal", state: "QC", country: "CA",
    name: "MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 18, creditHours: 54,
    tuitionTotal: 62400, tuitionPerSemester: 15600, currency: "CAD",
    gmatRequired: "Required", gmatAvg: 646, greAvg: null, gpaAvg: 3.3,
    acceptanceRate: 42, workExpYears: 3, workExpAvg: 4.1,
    deadline: "Mar 31, 2026", deadlineR2: "Mar 31, 2026",
    englishTest: "Required (non-native)", lorCount: 2, sopRequired: true,
    description: "McGill's MBA leverages Montreal's bilingual, cosmopolitan identity and growing technology and life sciences industries. The program offers specialization tracks in entrepreneurship, sustainability, and international business. McGill's MBA is the most affordable among Canada's top-ranked programs and benefits from McGill's global academic reputation.",
    advisorName: "MBA Admissions", advisorEmail: "mba.management@mcgill.ca", advisorPhone: "+1 514-398-4066",
    admissionsUrl: "https://www.mcgill.ca/desautels/programs/mba", lastVerified: "2025-08-15",
    tags: ["Montreal", "Bilingual", "Affordable"],
    highlights: ["Bilingual environment (French & English)", "Most affordable among Canada's ranked MBA programs", "Strong life sciences and tech industry connections"]
  },
  {
    id: "haas-ft-mba", logo: "BH", school: "UC Berkeley Haas School of Business",
    schoolShort: "Berkeley Haas", city: "Berkeley", state: "CA", country: "US",
    name: "Full-Time MBA", degree: "MBA", level: "Graduate",
    format: "Full-time", durationMonths: 24, creditHours: 53,
    tuitionTotal: 134180, tuitionPerSemester: 33545, currency: "USD",
    gmatRequired: "Required", gmatAvg: 725, greAvg: 326, gpaAvg: 3.7,
    acceptanceRate: 23, workExpYears: 5, workExpAvg: 5.5,
    deadline: "Jan 7, 2026", deadlineR2: "Jan 7, 2026",
    englishTest: "Required (TOEFL/IELTS)", lorCount: 2, sopRequired: true,
    description: "Berkeley Haas is defined by its four principles: Question the Status Quo, Confidence Without Attitude, Students Always, Beyond Yourself. Located in the Bay Area, the program has unmatched VC and tech company access. The relatively small cohort (~280 students) creates an unusually tight-knit network. MBA/MEng dual degree with UC Berkeley Engineering available.",
    advisorName: "MBA Admissions", advisorEmail: "mbaadms@haas.berkeley.edu", advisorPhone: "+1 510-642-1405",
    admissionsUrl: "https://mba.haas.berkeley.edu", lastVerified: "2025-10-25",
    tags: ["Bay Area", "Tech & VC", "Small Cohort"],
    highlights: ["Best access to Bay Area VC ecosystem outside Stanford", "~280 person cohort — smallest among top 10 US MBAs", "MBA/MEng dual degree with UC Berkeley Engineering"]
  },
];

/* ─── Utilities ─────────────────────────────────────────────────────────────── */
function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr)) / 86400000);
}
function freshness(dateStr) {
  const d = daysSince(dateStr);
  if (d < 90) return { status: "fresh", label: "Verified", color: "#166534" };
  if (d < 270) return { status: "aging", label: "Aging", color: "#92400e" };
  return { status: "stale", label: "Stale", color: "#dc2626" };
}
function fmtCurrency(n, cur) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: cur === "CAD" ? "CAD" : "USD", maximumFractionDigits: 0
  }).format(n);
}
function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/* ─── DESIGN SYSTEM ─────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink:      #1a1a1a;
  --ink-2:    #2d2d2d;
  --ink-3:    #4a4a4a;
  --ink-4:    #5a5a5a;
  --paper:    #faf8f4;
  --paper-2:  #f3f0ea;
  --paper-3:  #ebe7de;
  --paper-4:  #ddd8cc;
  --rule:     #e0dbd2;
  --accent:   #1d4ed8;
  --accent-2: #3b6fe8;
  --accent-bg:#eff4ff;
  --green:    #166534;
  --green-bg: #f0fdf4;
  --amber:    #92400e;
  --amber-bg: #fffbeb;
  --red:      #dc2626;
  --red-bg:   #fef2f2;
  --teal:     #0f766e;
  --teal-bg:  #f0fdfa;
  --serif:    'Libre Baskerville', Georgia, serif;
  --mono:     'IBM Plex Mono', 'Courier New', monospace;
  --sans:     'Outfit', system-ui, sans-serif;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.09), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.05);
  --r: 6px;
  --r-lg: 10px;
  --ease: cubic-bezier(0.22,1,0.36,1);
}

html { scroll-behavior: smooth; }

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--paper-2); }
::-webkit-scrollbar-thumb { background: var(--paper-4); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--ink-4); }

/* ── TOPBAR ── */
.topbar {
  position: sticky; top: 0; z-index: 200;
  background: rgba(250,248,244,0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rule);
  height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem;
  gap: 1rem;
}
.topbar-logo {
  font-family: var(--serif);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}
.topbar-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
.topbar-nav { display: flex; align-items: center; gap: 4px; }
.topbar-btn {
  font-family: var(--mono); font-size: 0.8rem;
  font-weight: 400; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--ink-4);
  background: none; border: none; cursor: pointer;
  padding: 5px 10px; border-radius: var(--r);
  transition: color 0.15s, background 0.15s;
  display: flex; align-items: center; gap: 5px;
  white-space: nowrap;
}
.topbar-btn:hover { color: var(--ink); background: var(--paper-2); }
.topbar-btn.active { color: var(--accent); background: var(--accent-bg); }
.badge {
  background: var(--accent); color: white;
  font-size: 0.75rem; font-weight: 600;
  padding: 1px 5px; border-radius: 10px;
  min-width: 16px; text-align: center;
}
.badge-teal { background: var(--teal); }
.topbar-divider { width: 1px; height: 20px; background: var(--rule); margin: 0 6px; flex-shrink: 0; }

/* ── HERO ── */
.hero-wrap {
  min-height: calc(100vh - 56px);
  display: flex; flex-direction: column; justify-content: center;
  padding: 4rem 2rem;
  position: relative; overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 70% 60% at 75% 40%, rgba(29,78,216,0.055) 0%, transparent 70%),
    repeating-linear-gradient(0deg, transparent, transparent 59px, var(--rule) 59px, var(--rule) 60px),
    repeating-linear-gradient(90deg, transparent, transparent 59px, var(--rule) 59px, var(--rule) 60px);
}
.hero-content { max-width: 760px; margin: 0 auto; width: 100%; position: relative; z-index: 1; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--accent); background: var(--accent-bg);
  padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(29,78,216,0.18);
  margin-bottom: 1.75rem;
}
.hero-h1 {
  font-family: var(--serif);
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  font-weight: 700; line-height: 1.12;
  color: var(--ink); letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}
.hero-h1 em { font-style: italic; color: var(--accent); }
.hero-sub {
  font-size: 1.05rem; color: var(--ink-3); line-height: 1.75;
  max-width: 560px; margin-bottom: 2.5rem;
  font-weight: 300;
}
.hero-stats {
  display: flex; gap: 2rem; margin-bottom: 2.5rem;
  padding: 1.25rem 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
}
.hero-stat {}
.hero-stat-n {
  font-family: var(--serif); font-size: 2.25rem; font-weight: 700;
  color: var(--ink); line-height: 1;
}
.hero-stat-l {
  font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--ink-4); margin-top: 4px;
}
.hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  background: var(--accent); color: white;
  font-family: var(--sans); font-weight: 600; font-size: 0.875rem;
  padding: 0.75rem 1.5rem; border-radius: var(--r);
  border: none; cursor: pointer;
  transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
  letter-spacing: 0.01em;
}
.btn-primary:hover { background: var(--accent-2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(29,78,216,0.25); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 7px;
  background: transparent; color: var(--ink-3);
  font-family: var(--sans); font-weight: 500; font-size: 0.875rem;
  padding: 0.75rem 1.5rem; border-radius: var(--r);
  border: 1px solid var(--rule); cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover { border-color: var(--ink-4); color: var(--ink); background: var(--paper-2); }

/* how it works strip */
.how-strip {
  border-top: 1px solid var(--rule);
  padding: 3rem 2rem;
  background: var(--paper-2);
}
.how-inner { max-width: 900px; margin: 0 auto; }
.how-title {
  font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--ink-4); margin-bottom: 2rem; text-align: center;
}
.how-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
.how-step {}
.how-step-n {
  font-family: var(--serif); font-size: 1.5rem; font-weight: 700;
  color: var(--rule); margin-bottom: 0.5rem;
}
.how-step-t { font-weight: 600; font-size: 0.875rem; color: var(--ink); margin-bottom: 4px; }
.how-step-d { font-size: 0.8rem; color: var(--ink-4); line-height: 1.6; }

/* ── SEARCH PAGE ── */
.search-page { max-width: 1280px; margin: 0 auto; padding: 1.5rem 2rem; }
.search-header { margin-bottom: 1.25rem; }
.search-title { font-family: var(--serif); font-size: 1.4rem; font-weight: 700; color: var(--ink); }
.search-sub { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4); margin-top: 2px; letter-spacing: 0.04em; }

.searchbar {
  position: relative; margin-bottom: 1rem;
}
.searchbar-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  font-size: 0.9rem; color: var(--ink-4); pointer-events: none;
}
.searchbar input {
  width: 100%; background: white; border: 1px solid var(--rule);
  color: var(--ink); font-family: var(--sans); font-size: 0.9rem;
  padding: 0.75rem 1rem 0.75rem 2.4rem;
  border-radius: var(--r-lg); outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-shadow: var(--shadow-sm);
}
.searchbar input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }
.searchbar input::placeholder { color: var(--ink-4); }

.filters-row {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; margin-bottom: 1rem;
}
.filter-group { display: flex; flex-direction: column; gap: 3px; }
.filter-lbl {
  font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--ink-4);
}
.filter-sel {
  background: white; border: 1px solid var(--rule); color: var(--ink-3);
  font-family: var(--sans); font-size: 0.78rem;
  padding: 6px 28px 6px 10px; border-radius: var(--r);
  outline: none; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23717171'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s;
}
.filter-sel:focus, .filter-sel:hover { border-color: var(--ink-4); color: var(--ink); }
.filter-clear {
  font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4);
  background: none; border: none; cursor: pointer; padding: 6px 8px;
  transition: color 0.15s; align-self: flex-end; display: flex; align-items: center; gap: 4px;
}
.filter-clear:hover { color: var(--red); }

.results-meta {
  font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4);
  margin-bottom: 0.75rem; letter-spacing: 0.04em;
  display: flex; align-items: center; justify-content: space-between;
}
.results-meta strong { color: var(--ink-3); }

/* two-col layout */
.results-layout { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
@media (min-width: 960px) { .results-layout { grid-template-columns: 1fr 320px; align-items: start; } }

/* ── PROGRAM CARDS ── */
.card-list { display: flex; flex-direction: column; gap: 1px; }
.pcard {
  background: white;
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s var(--ease), border-color 0.2s;
  position: relative;
  margin-bottom: 8px;
}
.pcard:hover { box-shadow: var(--shadow-md); border-color: var(--paper-4); }
.pcard.in-compare { border-color: var(--teal); border-left: 3px solid var(--teal); }
.pcard-top { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 0.875rem; }
.pcard-logo {
  width: 38px; height: 38px; border-radius: 6px; flex-shrink: 0;
  background: var(--paper-2); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 0.75rem; font-weight: 500;
  color: var(--accent); letter-spacing: 0.05em;
}
.pcard-info { flex: 1; min-width: 0; }
.pcard-school { font-size: 0.8rem; color: var(--ink-4); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pcard-name { font-family: var(--serif); font-size: 1.05rem; font-weight: 700; color: var(--ink); line-height: 1.25; }
.pcard-btns { display: flex; gap: 5px; flex-shrink: 0; }
.pcard-btn {
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.04em;
  background: white; border: 1px solid var(--rule);
  color: var(--ink-4); padding: 4px 10px; border-radius: var(--r);
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.pcard-btn:hover { border-color: var(--ink-4); color: var(--ink); background: var(--paper-2); }
.pcard-btn.saved { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
.pcard-btn.compared { border-color: var(--teal); color: var(--teal); background: var(--teal-bg); }

.pcard-data { display: flex; flex-wrap: wrap; gap: 0 1.5rem; }
.pstat { display: flex; flex-direction: column; gap: 1px; min-width: 60px; }
.pstat-val { font-family: var(--mono); font-size: 0.82rem; font-weight: 500; color: var(--ink); }
.pstat-key { font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.09em; color: var(--ink-4); }

.pcard-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 0.875rem; padding-top: 0.875rem; border-top: 1px solid var(--rule); }
.pcard-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.ptag {
  font-family: var(--mono); font-size: 0.75rem; padding: 2px 8px;
  border-radius: 20px; background: var(--paper-2);
  color: var(--ink-3); border: 1px solid var(--rule); letter-spacing: 0.04em;
}
.freshness-pill {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 20px; flex-shrink: 0;
}
.freshness-pill .dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

/* ── SIDE PANEL ── */
.side-panel { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 72px; }
.panel {
  background: white; border: 1px solid var(--rule);
  border-radius: var(--r-lg); padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}
.panel-head {
  font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--ink-4); margin-bottom: 1rem;
  display: flex; align-items: center; justify-content: space-between;
}
.compare-slot {
  padding: 0.6rem 0.75rem; border-radius: var(--r);
  border: 1px dashed var(--rule); margin-bottom: 6px;
  display: flex; align-items: center; justify-content: space-between;
  min-height: 50px;
}
.compare-slot.filled { border-style: solid; border-color: var(--teal); background: var(--teal-bg); }
.slot-label { font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); }
.slot-name { font-size: 0.78rem; font-weight: 500; color: var(--ink); line-height: 1.3; }
.slot-school { font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); }
.slot-rm { background: none; border: none; color: var(--ink-4); cursor: pointer; font-size: 1rem; line-height: 1; padding: 2px; transition: color 0.15s; }
.slot-rm:hover { color: var(--red); }
.compare-go {
  width: 100%; padding: 0.65rem; border-radius: var(--r);
  font-weight: 600; font-size: 0.8rem; cursor: pointer; margin-top: 6px;
  transition: all 0.15s; letter-spacing: 0.02em;
  border: none; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.compare-go:not(:disabled) { background: var(--teal); color: white; }
.compare-go:not(:disabled):hover { background: #0d6660; box-shadow: 0 4px 12px rgba(15,118,110,0.25); }
.compare-go:disabled { background: var(--paper-3); color: var(--ink-4); cursor: not-allowed; }

.saved-item { display: flex; align-items: flex-start; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--rule); gap: 8px; }
.saved-item:last-child { border-bottom: none; }
.saved-item-name { font-size: 0.78rem; color: var(--accent); cursor: pointer; font-weight: 500; line-height: 1.3; }
.saved-item-name:hover { text-decoration: underline; }
.saved-item-school { font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); }

/* ── PROFILE PAGE ── */
.profile-wrap { max-width: 920px; margin: 0 auto; padding: 2rem; }
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--ink-4); background: none; border: none; cursor: pointer;
  padding: 0; margin-bottom: 1.75rem; transition: color 0.15s;
}
.back-btn:hover { color: var(--ink); }

.profile-hdr {
  display: flex; gap: 1.25rem; align-items: flex-start;
  padding-bottom: 1.75rem; border-bottom: 1px solid var(--rule); margin-bottom: 1.75rem;
}
.profile-logo {
  width: 60px; height: 60px; border-radius: 8px; flex-shrink: 0;
  background: var(--paper-2); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 0.8rem; font-weight: 500; color: var(--accent);
}
.profile-meta { flex: 1; }
.profile-school-name { font-size: 0.8rem; color: var(--ink-4); margin-bottom: 3px; }
.profile-prog-name { font-family: var(--serif); font-size: 1.8rem; font-weight: 700; line-height: 1.18; color: var(--ink); margin-bottom: 0.75rem; letter-spacing: -0.02em; }
.profile-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.ppill {
  font-family: var(--mono); font-size: 0.75rem; padding: 3px 10px;
  border-radius: 20px; border: 1px solid var(--rule);
  color: var(--ink-4); letter-spacing: 0.06em; background: var(--paper-2);
}
.ppill.accent { border-color: rgba(29,78,216,0.3); color: var(--accent); background: var(--accent-bg); }
.profile-actions { display: flex; gap: 8px; flex-shrink: 0; padding-top: 4px; }
.act-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--sans); font-weight: 600; font-size: 0.78rem;
  padding: 0.55rem 1rem; border-radius: var(--r);
  cursor: pointer; transition: all 0.15s; border: 1px solid;
  white-space: nowrap;
}
.act-primary { background: var(--accent); color: white; border-color: var(--accent); }
.act-primary:hover { background: var(--accent-2); }
.act-primary.saved { background: var(--ink); border-color: var(--ink); }
.act-outline { background: white; color: var(--ink-3); border-color: var(--rule); }
.act-outline:hover { border-color: var(--ink-4); color: var(--ink); }
.act-teal { background: var(--teal); color: white; border-color: var(--teal); }
.act-teal:hover { background: #0d6660; }
.act-ghost { background: transparent; color: var(--ink-4); border-color: var(--rule); font-size: 0.8rem; }
.act-ghost:hover { color: var(--red); border-color: var(--red); }

/* verified banner */
.verified-banner {
  display: flex; align-items: center; gap: 10px;
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: var(--r); padding: 0.6rem 1rem; margin-bottom: 1.75rem;
}
.verified-banner .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.verified-text { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4); flex: 1; }
.verified-text strong { color: var(--ink-3); }
.flag-btn {
  font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4);
  background: none; border: none; cursor: pointer;
  text-decoration: underline; transition: color 0.15s; white-space: nowrap;
}
.flag-btn:hover { color: var(--red); }

/* section layout */
.section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.75rem; }
@media (max-width: 640px) { .section-grid { grid-template-columns: 1fr; } }
.data-section {}
.data-section-title {
  font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--accent); margin-bottom: 0.875rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid var(--rule); display: flex;
  align-items: center; gap: 6px;
}
.data-row {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 0.45rem 0; border-bottom: 1px solid var(--rule); gap: 1rem;
}
.data-row:last-child { border-bottom: none; }
.dk { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4); flex-shrink: 0; }
.dv { font-family: var(--mono); font-size: 0.78rem; color: var(--ink); text-align: right; font-weight: 400; }
.dv.accent { color: var(--accent); font-weight: 500; }
.dv.green { color: var(--green); font-weight: 500; }
.dv.amber { color: var(--amber); }
.dv.red { color: var(--red); }

.description-box {
  background: var(--paper-2); border-left: 3px solid var(--accent);
  padding: 1.25rem 1.5rem; border-radius: 0 var(--r) var(--r) 0;
  margin-bottom: 1.75rem;
}
.description-text { font-size: 0.9rem; color: var(--ink-3); line-height: 1.85; font-weight: 300; }

.highlights-box { margin-bottom: 1.75rem; }
.highlight-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 0.75rem 0; border-bottom: 1px solid var(--rule);
}
.highlight-item:last-child { border-bottom: none; }
.highlight-icon { color: var(--accent); font-size: 0.75rem; margin-top: 3px; flex-shrink: 0; }
.highlight-text { font-size: 0.85rem; color: var(--ink-3); line-height: 1.5; }

/* advisor */
.advisor-card {
  background: var(--paper-2); border: 1px solid var(--rule);
  border-radius: var(--r-lg); padding: 1.25rem 1.5rem;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}
.advisor-left {}
.advisor-name { font-family: var(--serif); font-size: 1rem; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.advisor-role { font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
.advisor-contact { display: flex; flex-direction: column; gap: 4px; }
.advisor-email { font-family: var(--mono); font-size: 0.75rem; color: var(--teal); }
.advisor-phone { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4); }
.advisor-link { font-family: var(--mono); font-size: 0.8rem; color: var(--accent); text-decoration: none; }
.advisor-link:hover { text-decoration: underline; }

/* ── COMPARE PAGE ── */
.compare-wrap { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.compare-intro { margin-bottom: 1.5rem; }
.compare-intro h2 { font-family: var(--serif); font-size: 1.4rem; font-weight: 700; color: var(--ink); }
.compare-intro p { font-family: var(--mono); font-size: 0.8rem; color: var(--ink-4); margin-top: 3px; letter-spacing: 0.04em; }

.cmp-scroll { overflow-x: auto; }
.cmp-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.cmp-table th { background: var(--paper-2); padding: 1rem 1.25rem; border-bottom: 2px solid var(--rule); border-right: 1px solid var(--rule); text-align: left; }
.cmp-table th:first-child { width: 160px; background: var(--paper-3); border-right: 2px solid var(--rule); }
.cth-school { font-size: 0.8rem; color: var(--ink-4); font-weight: 400; margin-bottom: 3px; }
.cth-name { font-family: var(--serif); font-size: 0.95rem; font-weight: 700; color: var(--ink); line-height: 1.25; }
.cmp-rm { margin-top: 8px; font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); background: none; border: 1px solid var(--rule); padding: 2px 8px; border-radius: var(--r); cursor: pointer; transition: all 0.15s; }
.cmp-rm:hover { border-color: var(--red); color: var(--red); }
.cmp-table td { padding: 0.55rem 1.25rem; border-bottom: 1px solid var(--rule); border-right: 1px solid var(--rule); vertical-align: middle; }
.cmp-table td:first-child { font-family: var(--mono); font-size: 0.75rem; color: var(--ink-4); text-transform: uppercase; letter-spacing: 0.07em; background: var(--paper-2); border-right: 2px solid var(--rule); white-space: nowrap; font-weight: 400; }
.cmp-table tr:hover td { background: var(--paper); }
.cmp-table tr:hover td:first-child { background: var(--paper-2); }
.cmp-val { font-family: var(--mono); font-size: 0.8rem; color: var(--ink); }
.cmp-val.best { color: var(--green); font-weight: 600; }
.cmp-section-row td { background: var(--paper-2) !important; font-family: var(--mono); font-size: 0.75rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.12em; padding: 0.35rem 1.25rem; font-weight: 500; }
.cmp-badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 0.75rem; font-family: var(--mono); }
.cmp-badge.green { background: var(--green-bg); color: var(--green); }
.cmp-badge.amber { background: var(--amber-bg); color: var(--amber); }
.cmp-badge.red { background: var(--red-bg); color: var(--red); }

/* ── FLAG MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(26,26,26,0.5); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1.5rem; backdrop-filter: blur(3px); }
.modal { background: white; border-radius: var(--r-lg); padding: 2rem; max-width: 440px; width: 100%; box-shadow: var(--shadow-lg); border: 1px solid var(--rule); animation: modal-in 0.2s var(--ease); }
@keyframes modal-in { from { transform: scale(0.96) translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-title { font-family: var(--serif); font-size: 1.25rem; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.modal-sub { font-size: 0.82rem; color: var(--ink-4); line-height: 1.65; margin-bottom: 1.25rem; }
.modal-label { font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-4); margin-bottom: 5px; display: block; }
.modal-textarea {
  width: 100%; background: var(--paper-2); border: 1px solid var(--rule);
  color: var(--ink); font-family: var(--sans); font-size: 0.85rem;
  padding: 0.75rem; border-radius: var(--r); outline: none; resize: vertical; min-height: 90px;
  margin-bottom: 1.25rem; transition: border-color 0.15s;
}
.modal-textarea:focus { border-color: var(--accent); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 600;
  background: var(--ink); color: white;
  padding: 0.65rem 1.25rem; border-radius: var(--r-lg);
  font-size: 0.82rem; font-weight: 400;
  box-shadow: var(--shadow-lg);
  animation: toast-in 0.2s var(--ease);
  display: flex; align-items: center; gap: 8px;
  max-width: 320px;
}
@keyframes toast-in { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }

/* ── EMPTY ── */
.empty { text-align: center; padding: 5rem 2rem; }
.empty-icon { font-size: 2rem; margin-bottom: 0.75rem; opacity: 0.35; }
.empty-t { font-family: var(--serif); font-size: 1.05rem; color: var(--ink-3); margin-bottom: 5px; }
.empty-s { font-size: 0.8rem; color: var(--ink-4); }


/* ── ACCESSIBILITY ── */
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.skip-link {
  position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden;
  background: var(--accent); color: white; font-weight: 600; font-size: 0.875rem;
  padding: 0.5rem 1rem; z-index: 9999; border-radius: 0 0 var(--r) 0;
}
.skip-link:focus {
  position: fixed; left: 0; top: 0; width: auto; height: auto; overflow: visible;
  outline: 3px solid white; outline-offset: 2px;
}

/* Visible focus ring for keyboard nav */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}
button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Minimum touch target 44x44px for interactive elements */
.pcard-btn, .topbar-btn, .pcard-btn, .slot-rm { min-height: 44px; min-width: 44px; }
.pcard-btns .pcard-btn { min-height: 36px; padding: 0 12px; display: inline-flex; align-items: center; }
.topbar-btn { min-height: 36px; }

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

`;

/* ─────────────────────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────────────────────── */

function FreshnessPill({ date }) {
  const f = freshness(date);
  return (
    <span className="freshness-pill" style={{ background: f.color + "15", color: f.color, border: `1px solid ${f.color}30` }}>
      <span className="dot" style={{ background: f.color }} />
      {f.label}
    </span>
  );
}

function ProgramCard({ p, onView, onSave, onCompare, isSaved, isCompared }) {
  return (
    <li className={`pcard ${isCompared ? "in-compare" : ""}`}
      onClick={() => onView(p)}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onView(p)}
      aria-label={`View ${p.name} at ${p.schoolShort}`}>
      <div className="pcard-top">
        <div className="pcard-logo">{p.logo}</div>
        <div className="pcard-info">
          <div className="pcard-school">{p.school} · {p.city}, {p.state} {p.country === "CA" ? "🇨🇦" : ""}</div>
          <div className="pcard-name">{p.name}</div>
        </div>
        <div className="pcard-btns" onClick={e => e.stopPropagation()}>
          <button className={`pcard-btn ${isSaved ? "saved" : ""}`} onClick={() => onSave(p)} aria-pressed={isSaved} aria-label={isSaved ? `Remove ${p.schoolShort} ${p.degree} from saved` : `Save ${p.schoolShort} ${p.degree}`}>
            {isSaved ? "✓ Saved" : "Save"}
          </button>
          <button className={`pcard-btn ${isCompared ? "compared" : ""}`} onClick={() => onCompare(p)} aria-pressed={isCompared} aria-label={isCompared ? `Remove ${p.schoolShort} ${p.degree} from comparison` : `Add ${p.schoolShort} ${p.degree} to comparison`}>
            {isCompared ? "✓ Comparing" : "+ Compare"}
          </button>
        </div>
      </div>

      <div className="pcard-data">
        {[
          { val: p.degree, key: "Degree" },
          { val: p.format, key: "Format" },
          { val: `${Math.round(p.durationMonths / 12 * 10) / 10} yr`, key: "Duration" },
          { val: fmtCurrency(p.tuitionTotal, p.currency), key: "Total Tuition" },
          { val: `${p.acceptanceRate}%`, key: "Acceptance" },
          { val: p.gmatAvg ?? "—", key: "Avg GMAT" },
          { val: p.gpaAvg, key: "Avg GPA" },
        ].map(s => (
          <div key={s.key} className="pstat">
            <div className="pstat-val">{s.val}</div>
            <div className="pstat-key">{s.key}</div>
          </div>
        ))}
      </div>

      <div className="pcard-foot">
        <div className="pcard-tags">
          {p.tags.map(t => <span key={t} className="ptag">{t}</span>)}
        </div>
        <FreshnessPill date={p.lastVerified} />
      </div>
    </li>
  );
}

function ProfileView({ p, onBack, onSave, onCompare, isSaved, isCompared, onFlag }) {
  const f = freshness(p.lastVerified);
  const acceptColor = p.acceptanceRate < 15 ? "red" : p.acceptanceRate < 30 ? "amber" : "green";

  return (
    <div className="profile-wrap">
      <button className="back-btn" onClick={onBack}>← Back to programs</button>

      <div className="profile-hdr">
        <div className="profile-logo">{p.logo}</div>
        <div className="profile-meta">
          <div className="profile-school-name">{p.school} · {p.city}, {p.state}, {p.country}</div>
          <div className="profile-prog-name">{p.name}</div>
          <div className="profile-pills">
            <span className="ppill accent">{p.degree}</span>
            <span className="ppill">{p.format}</span>
            <span className="ppill">{p.durationMonths} months</span>
            <span className="ppill">{p.level}</span>
            <span className="ppill">{p.currency}</span>
          </div>
        </div>
        <div className="profile-actions">
          <button className={`act-btn act-primary ${isSaved ? "saved" : ""}`} onClick={() => onSave(p)} aria-pressed={isSaved} aria-label={isSaved ? "Remove from saved programs" : "Save this program"}>
            {isSaved ? "✓ Saved" : "Save"}
          </button>
          <button className={`act-btn ${isCompared ? "act-teal" : "act-outline"}`} onClick={() => onCompare(p)} aria-pressed={isCompared} aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}>
            {isCompared ? "✓ Comparing" : "Compare"}
          </button>
        </div>
      </div>

      {/* Freshness banner */}
      <div className="verified-banner">
        <span className="dot" style={{ background: f.color, width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
        <span className="verified-text">
          <strong>{f.label}</strong> — last verified {fmtDate(p.lastVerified)}. All data sourced from official school websites.
        </span>
        <button className="flag-btn" onClick={() => onFlag(p)}>Flag outdated data</button>
      </div>

      {/* Description */}
      <div className="description-box">
        <p className="description-text">{p.description}</p>
      </div>

      {/* Highlights */}
      <div className="data-section" style={{ marginBottom: "1.75rem" }}>
        <div className="data-section-title">Program Highlights</div>
        <div className="highlights-box">
          {p.highlights.map((h, i) => (
            <div key={i} className="highlight-item">
              <span className="highlight-icon">▸</span>
              <span className="highlight-text">{h}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-grid">
        <div className="data-section">
          <div className="data-section-title">Program Basics</div>
          <div className="data-row"><span className="dk">Degree Type</span><span className="dv accent">{p.degree}</span></div>
          <div className="data-row"><span className="dk">Format</span><span className="dv">{p.format}</span></div>
          <div className="data-row"><span className="dk">Duration</span><span className="dv">{p.durationMonths} months</span></div>
          <div className="data-row"><span className="dk">Credit Hours</span><span className="dv">{p.creditHours}</span></div>
          <div className="data-row"><span className="dk">Level</span><span className="dv">{p.level}</span></div>
          <div className="data-row"><span className="dk">Location</span><span className="dv">{p.city}, {p.state}</span></div>
        </div>
        <div className="data-section">
          <div className="data-section-title">Tuition & Fees</div>
          <div className="data-row"><span className="dk">Total Tuition</span><span className="dv accent">{fmtCurrency(p.tuitionTotal, p.currency)}</span></div>
          <div className="data-row"><span className="dk">Per Semester</span><span className="dv">{fmtCurrency(p.tuitionPerSemester, p.currency)}</span></div>
          <div className="data-row"><span className="dk">Currency</span><span className="dv">{p.currency}</span></div>
          <div className="data-row"><span className="dk">No. of Semesters</span><span className="dv">{Math.round(p.tuitionTotal / p.tuitionPerSemester)}</span></div>
        </div>
      </div>

      <div className="section-grid">
        <div className="data-section">
          <div className="data-section-title">Admission Stats</div>
          <div className="data-row"><span className="dk">Avg GPA</span><span className="dv">{p.gpaAvg}</span></div>
          <div className="data-row"><span className="dk">GMAT / GRE</span><span className="dv">{p.gmatRequired}</span></div>
          <div className="data-row"><span className="dk">Avg GMAT</span><span className="dv">{p.gmatAvg ?? "Not published"}</span></div>
          <div className="data-row"><span className="dk">Avg GRE</span><span className="dv">{p.greAvg ?? "Not published"}</span></div>
          <div className="data-row"><span className="dk">Acceptance Rate</span><span className={`dv ${acceptColor}`}>{p.acceptanceRate}%</span></div>
          <div className="data-row"><span className="dk">Work Experience</span><span className="dv">{p.workExpYears > 0 ? `${p.workExpYears}+ yrs (avg ${p.workExpAvg})` : "Not required"}</span></div>
        </div>
        <div className="data-section">
          <div className="data-section-title">Application Requirements</div>
          <div className="data-row"><span className="dk">App. Deadline (R2)</span><span className="dv accent">{p.deadlineR2}</span></div>
          <div className="data-row"><span className="dk">Letters of Rec.</span><span className="dv">{p.lorCount} required</span></div>
          <div className="data-row"><span className="dk">Statement of Purpose</span><span className="dv">{p.sopRequired ? "Required" : "Optional"}</span></div>
          <div className="data-row"><span className="dk">English Test</span><span className="dv">{p.englishTest}</span></div>
        </div>
      </div>

      {/* Advisor */}
      <div className="data-section" style={{ marginBottom: "1.75rem" }}>
        <div className="data-section-title">Admissions Contact</div>
        <div className="advisor-card">
          <div className="advisor-left">
            <div className="advisor-name">{p.advisorName}</div>
            <div className="advisor-role">Admissions Office</div>
            <div className="advisor-contact">
              <span className="advisor-email">✉ {p.advisorEmail}</span>
              <span className="advisor-phone">☎ {p.advisorPhone}</span>
            </div>
          </div>
          <a href={p.admissionsUrl} target="_blank" rel="noopener noreferrer" className="advisor-link" onClick={e => e.stopPropagation()}>
            Visit official page ↗
          </a>
        </div>
      </div>

      {/* Tags */}
      <div className="data-section">
        <div className="data-section-title">Tags</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", paddingTop: "0.5rem" }}>
          {p.tags.map(t => <span key={t} className="ptag" style={{ fontSize: "0.72rem" }}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}

function ComparePage({ programs, onBack, onRemove }) {
  if (programs.length < 2) {
    return (
      <div className="compare-wrap">
        <button className="back-btn" onClick={onBack}>← Back to programs</button>
        <div className="empty">
          <div className="empty-icon">⚖</div>
          <div className="empty-t">Select 2–3 programs to compare</div>
          <div className="empty-s">Use the "+ Compare" button on any program card, then return here.</div>
        </div>
      </div>
    );
  }

  // Find best value for numeric rows
  function bestIdx(getter, higherIsBetter = false) {
    const vals = programs.map(p => {
      const v = getter(p);
      return v === null || v === undefined || v === "N/A" ? null : parseFloat(String(v).replace(/[^0-9.]/g, ""));
    });
    if (vals.every(v => v === null)) return -1;
    const nonNull = vals.filter(v => v !== null);
    const target = higherIsBetter ? Math.max(...nonNull) : Math.min(...nonNull);
    return vals.indexOf(target);
  }

  const sections = [
    { label: "BASICS", rows: [
      { key: "Degree", get: p => p.degree },
      { key: "School", get: p => p.schoolShort },
      { key: "Format", get: p => p.format },
      { key: "Duration", get: p => `${p.durationMonths} mo`, numeric: p => p.durationMonths, best: "lower" },
      { key: "Credit Hours", get: p => p.creditHours, numeric: p => p.creditHours, best: "lower" },
      { key: "Location", get: p => `${p.city}, ${p.state}` },
    ]},
    { label: "TUITION", rows: [
      { key: "Total Tuition", get: p => fmtCurrency(p.tuitionTotal, p.currency), numeric: p => p.tuitionTotal, best: "lower" },
      { key: "Per Semester", get: p => fmtCurrency(p.tuitionPerSemester, p.currency), numeric: p => p.tuitionPerSemester, best: "lower" },
      { key: "Currency", get: p => p.currency },
    ]},
    { label: "ADMISSIONS", rows: [
      { key: "Avg GPA", get: p => p.gpaAvg, numeric: p => p.gpaAvg, best: "higher" },
      { key: "GMAT Required", get: p => p.gmatRequired },
      { key: "Avg GMAT", get: p => p.gmatAvg ?? "N/A", numeric: p => p.gmatAvg, best: "higher" },
      { key: "Acceptance Rate", get: p => `${p.acceptanceRate}%`, numeric: p => p.acceptanceRate, best: "lower" },
      { key: "Work Exp. Req.", get: p => p.workExpYears > 0 ? `${p.workExpYears}+ yrs` : "None" },
      { key: "Avg Work Exp.", get: p => `${p.workExpAvg} yrs` },
    ]},
    { label: "APPLICATION", rows: [
      { key: "R2 Deadline", get: p => p.deadlineR2 },
      { key: "Letters of Rec.", get: p => `${p.lorCount} required` },
      { key: "Statement of Purpose", get: p => p.sopRequired ? "Required" : "Optional" },
      { key: "English Test", get: p => p.englishTest },
    ]},
    { label: "DATA", rows: [
      { key: "Last Verified", get: p => fmtDate(p.lastVerified) },
      { key: "Data Status", get: p => freshness(p.lastVerified).label,
        render: p => {
          const f = freshness(p.lastVerified);
          const cls = f.status === "fresh" ? "green" : f.status === "aging" ? "amber" : "red";
          return <span className={`cmp-badge ${cls}`}>{f.label}</span>;
        }
      },
    ]},
  ];

  return (
    <div className="compare-wrap">
      <button className="back-btn" onClick={onBack}>← Back to programs</button>
      <div className="compare-intro">
        <h2>Side-by-Side Comparison</h2>
        <p>Comparing {programs.length} programs · Green values indicate best in category</p>
      </div>
      <div className="cmp-scroll">
        <table className="cmp-table" aria-label="Program comparison table">
          <thead>
            <tr>
              <th scope="col"></th>
              {programs.map(p => (
                <th key={p.id} scope="col">
                  <div className="cth-school">{p.school}</div>
                  <div className="cth-name">{p.name}</div>
                  <button className="cmp-rm" onClick={() => onRemove(p)}>Remove ×</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map(section => [
              <tr key={`sec-${section.label}`} className="cmp-section-row">
                <td colSpan={programs.length + 1}>{section.label}</td>
              </tr>,
              ...section.rows.map((row, ri) => {
                const bi = row.numeric ? bestIdx(row.numeric, row.best === "higher") : -1;
                return (
                  <tr key={`${section.label}-${ri}`}>
                    <th scope="row">{row.key}</th>
                    {programs.map((p, pi) => (
                      <td key={p.id}>
                        {row.render ? row.render(p) : (
                          <span className={`cmp-val ${bi !== -1 && pi === bi ? "best" : ""}`}>
                            {row.get(p)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlagModal({ prog, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="flag-modal-title">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title" id="flag-modal-title">Flag Outdated Data</div>
        <div className="modal-sub">
          You're flagging: <strong>{prog.name}</strong> at {prog.schoolShort}.<br />
          Describe what's wrong or out of date. All flags are reviewed within 48 hours.
        </div>
        <label className="modal-label">Your note</label>
        <textarea
          className="modal-textarea"
          placeholder="e.g. Tuition for 2025–26 is now $152,000. Source: https://..."
          value={note}
          onChange={e => setNote(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button className="act-btn act-outline" onClick={onClose}>Cancel</button>
          <button
            className="act-btn act-primary"
            onClick={() => onSubmit(note)}
            disabled={!note.trim()}
            style={{ opacity: note.trim() ? 1 : 0.5 }}
          >
            Submit Flag
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, icon = "✓" }) {
  return <div className="toast"><span>{icon}</span>{msg}</div>;
}

function HeroPage({ onSearch }) {
  return (
    <>
      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-tag">
            <span>●</span> Graduate Program Research — US & Canada
          </div>
          <h1 className="hero-h1">
            Research grad programs<br />
            without the <em>noise.</em>
          </h1>
          <p className="hero-sub">
            ScholarPath centralises tuition, admissions data, deadlines, and advisor contacts for graduate programs across the US and Canada — so you can compare programs in minutes, not hours.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-n">15</div>
              <div className="hero-stat-l">Programs (MVP)</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">12</div>
              <div className="hero-stat-l">Schools</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">3</div>
              <div className="hero-stat-l">Programs compared at once</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">US+CA</div>
              <div className="hero-stat-l">Geography (MVP)</div>
            </div>
          </div>
          <div className="hero-actions">
            <button className="btn-primary" onClick={onSearch}>
              Browse Programs →
            </button>
            <button className="btn-secondary" onClick={onSearch}>
              See how it works
            </button>
          </div>
        </div>
      </div>

      <div className="how-strip">
        <div className="how-inner">
          <div className="how-title">How ScholarPath Works</div>
          <div className="how-steps">
            {[
              { n: "01", t: "Search & Filter", d: "Filter by degree, format, location, tuition, and GMAT requirement in seconds." },
              { n: "02", t: "Read Profiles", d: "Every program has the same standardised fields — no more hunting through school websites." },
              { n: "03", t: "Compare Side-by-Side", d: "Select up to 3 programs and compare every field in a structured table." },
              { n: "04", t: "Save & Decide", d: "Save programs to your list. Flag outdated data to help keep it accurate." },
            ].map(s => (
              <div key={s.n} className="how-step">
                <div className="how-step-n">{s.n}</div>
                <div className="how-step-t">{s.t}</div>
                <div className="how-step-d">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────────────────────── */
const LOCS = ["All Locations", "CA", "IL", "MA", "NY", "PA", "CT", "ON", "QC"];
const DEGS = ["All Degrees", "MBA", "MS"];
const FMTS = ["All Formats", "Full-time", "Part-time"];
const GMATS = ["Any", "Required", "Optional"];
const SORTS = ["Default", "Tuition ↑", "Tuition ↓", "Acceptance ↑", "Acceptance ↓", "GMAT ↑"];

export default function App() {
  const [view, setView] = useState("hero");
  const [selectedProg, setSelectedProg] = useState(null);
  const [saved, setSaved] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [toast, setToast] = useState(null);
  const [flagTarget, setFlagTarget] = useState(null);
  const toastTimer = useRef(null);

  // Filters
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("All Locations");
  const [deg, setDeg] = useState("All Degrees");
  const [fmt, setFmt] = useState("All Formats");
  const [gmat, setGmat] = useState("Any");
  const [sort, setSort] = useState("Default");

  function showToast(msg, icon) {
    clearTimeout(toastTimer.current);
    setToast({ msg, icon });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }

  function toggleSave(p) {
    setSaved(prev => {
      if (prev.find(x => x.id === p.id)) {
        showToast(`Removed from saved`, "✗");
        return prev.filter(x => x.id !== p.id);
      }
      showToast(`Saved ${p.schoolShort} ${p.degree}`, "✓");
      return [...prev, p];
    });
  }

  function toggleCompare(p) {
    setCompareList(prev => {
      if (prev.find(x => x.id === p.id)) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 3) { showToast("Max 3 programs for comparison", "⚠"); return prev; }
      showToast(`Added to compare (${prev.length + 1}/3)`, "+");
      return [...prev, p];
    });
  }

  function goToProfile(p) {
    setSelectedProg(p);
    setView("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const hasFilters = q || loc !== "All Locations" || deg !== "All Degrees" || fmt !== "All Formats" || gmat !== "Any";

  const filtered = useMemo(() => {
    let list = PROGRAMS.filter(p => {
      const text = q.toLowerCase();
      const matchQ = !text || [p.name, p.school, p.degree, p.city, p.state].some(v => v.toLowerCase().includes(text));
      const matchL = loc === "All Locations" || p.state === loc;
      const matchD = deg === "All Degrees" || p.degree === deg;
      const matchF = fmt === "All Formats" || p.format === fmt;
      const matchG = gmat === "Any" || p.gmatRequired === gmat;
      return matchQ && matchL && matchD && matchF && matchG;
    });

    if (sort === "Tuition ↑") list = [...list].sort((a, b) => a.tuitionTotal - b.tuitionTotal);
    else if (sort === "Tuition ↓") list = [...list].sort((a, b) => b.tuitionTotal - a.tuitionTotal);
    else if (sort === "Acceptance ↑") list = [...list].sort((a, b) => a.acceptanceRate - b.acceptanceRate);
    else if (sort === "Acceptance ↓") list = [...list].sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    else if (sort === "GMAT ↑") list = [...list].sort((a, b) => (b.gmatAvg ?? 0) - (a.gmatAvg ?? 0));

    return list;
  }, [q, loc, deg, fmt, gmat, sort]);

  return (
    <>
      <style>{STYLES}</style>

      {/* ── TOP BAR ── */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <nav className="topbar" aria-label="Main navigation">
        <button className="topbar-logo" onClick={() => setView("hero")} aria-label="ScholarPath home">
          <div className="topbar-logo-dot" />
          ScholarPath
        </button>
        <div className="topbar-nav" role="list">
          <button className={`topbar-btn ${view === "search" ? "active" : ""}`} onClick={() => setView("search")} aria-current={view === "search" ? "page" : undefined}>
            Programs
          </button>
          <div className="topbar-divider" />
          <button className={`topbar-btn ${view === "compare" ? "active" : ""}`} onClick={() => setView("compare")} aria-current={view === "compare" ? "page" : undefined}>
            Compare
            {compareList.length > 0 && <span className="badge badge-teal">{compareList.length}</span>}
          </button>
          <div className="topbar-divider" />
          <button className="topbar-btn" onClick={() => {}}>
            Saved
            {saved.length > 0 && <span className="badge">{saved.length}</span>}
          </button>
        </div>
      </nav>

      <main id="main-content">
      {/* ── HERO ── */}
      {view === "hero" && <HeroPage onSearch={() => setView("search")} />}

      {/* ── SEARCH ── */}
      {view === "search" && (
        <div className="search-page">
          <div className="search-header">
            <div className="search-title">Graduate Programs</div>
            <div className="search-sub">US & Canada · {PROGRAMS.length} programs across {new Set(PROGRAMS.map(p => p.school)).size} schools</div>
          </div>

          <div className="searchbar">
            <label htmlFor="program-search" className="visually-hidden">Search programs</label>
            <span className="searchbar-icon" aria-hidden="true" role="presentation">🔍</span>
            <input
              id="program-search"
              type="search"
              placeholder="Search program, school, degree, city..."
              value={q}
              onChange={e => setQ(e.target.value)}
              autoFocus
              aria-label="Search programs"
            />
          </div>

          <div className="filters-row">
            {[
              { label: "Location", id: "filter-loc", val: loc, set: setLoc, opts: LOCS },
              { label: "Degree", id: "filter-deg", val: deg, set: setDeg, opts: DEGS },
              { label: "Format", id: "filter-fmt", val: fmt, set: setFmt, opts: FMTS },
              { label: "GMAT/GRE", id: "filter-gmat", val: gmat, set: setGmat, opts: GMATS },
              { label: "Sort by", id: "filter-sort", val: sort, set: setSort, opts: SORTS },
            ].map(f => (
              <div key={f.label} className="filter-group">
                <label htmlFor={f.id} className="filter-lbl">{f.label}</label>
                <select id={f.id} className="filter-sel" value={f.val} onChange={e => f.set(e.target.value)} aria-label={f.label}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {hasFilters && (
              <button className="filter-clear" onClick={() => { setQ(""); setLoc("All Locations"); setDeg("All Degrees"); setFmt("All Formats"); setGmat("Any"); }}>
                Clear ×
              </button>
            )}
          </div>

          <div className="results-meta">
            <span>Showing <strong>{filtered.length}</strong> of {PROGRAMS.length} programs</span>
            {filtered.length !== PROGRAMS.length && <span style={{ color: "var(--accent)", fontSize: "0.65rem" }}>Filters active</span>}
          </div>

          <div className="results-layout">
            {/* Program list */}
            <div>
              {filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>
                  <div className="empty-t">No programs match</div>
                  <div className="empty-s">Try adjusting your filters</div>
                </div>
              ) : (
                <ul className="card-list" role="list" aria-label="Program results">
                  {filtered.map(p => (
                    <ProgramCard
                      key={p.id}
                      p={p}
                      onView={goToProfile}
                      onSave={toggleSave}
                      onCompare={toggleCompare}
                      isSaved={!!saved.find(x => x.id === p.id)}
                      isCompared={!!compareList.find(x => x.id === p.id)}
                    />
                  ))}
                </ul>
              )}
            </div>

            {/* Side panel */}
            <div className="side-panel">
              <div className="panel">
                <div className="panel-head">
                  Compare Tray
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--ink-4)" }}>{compareList.length}/3</span>
                </div>
                {[0, 1, 2].map(i => {
                  const p = compareList[i];
                  return p ? (
                    <div key={i} className="compare-slot filled">
                      <div>
                        <div className="slot-school">{p.schoolShort}</div>
                        <div className="slot-name">{p.name}</div>
                      </div>
                      <button className="slot-rm" onClick={() => toggleCompare(p)}>×</button>
                    </div>
                  ) : (
                    <div key={i} className="compare-slot">
                      <span className="slot-label">Slot {i + 1} — add a program</span>
                    </div>
                  );
                })}
                <button
                  className="compare-go"
                  disabled={compareList.length < 2}
                  onClick={() => setView("compare")}
                >
                  {compareList.length < 2 ? `Need ${2 - compareList.length} more` : `Compare ${compareList.length} Programs →`}
                </button>
              </div>

              {saved.length > 0 && (
                <div className="panel">
                  <div className="panel-head">Saved Programs <span className="badge" style={{ fontSize: "0.58rem" }}>{saved.length}</span></div>
                  {saved.map(p => (
                    <div key={p.id} className="saved-item">
                      <div>
                        <div className="saved-item-name" onClick={() => goToProfile(p)}>{p.name}</div>
                        <div className="saved-item-school">{p.schoolShort} · {p.degree}</div>
                      </div>
                      <button className="slot-rm" onClick={() => toggleSave(p)}>×</button>
                    </div>
                  ))}
                </ul>
              )}

              <div className="panel" style={{ fontSize: "0.75rem", color: "var(--ink-4)", lineHeight: 1.7 }}>
                <div className="panel-head">About the data</div>
                All data is sourced from official school admissions pages and verified manually. Tuition figures reflect published rates — fees may add 5–15%. Freshness indicators show how recently each record was reviewed.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE ── */}
      {view === "profile" && selectedProg && (
        <ProfileView
          p={selectedProg}
          onBack={() => setView("search")}
          onSave={toggleSave}
          onCompare={toggleCompare}
          isSaved={!!saved.find(x => x.id === selectedProg.id)}
          isCompared={!!compareList.find(x => x.id === selectedProg.id)}
          onFlag={setFlagTarget}
        />
      )}

      {/* ── COMPARE ── */}
      {view === "compare" && (
        <ComparePage
          programs={compareList}
          onBack={() => setView("search")}
          onRemove={toggleCompare}
        />
      )}

      </main>
      {/* ── FLAG MODAL ── */}
      {flagTarget && (
        <FlagModal
          prog={flagTarget}
          onClose={() => setFlagTarget(null)}
          onSubmit={() => {
            setFlagTarget(null);
            showToast("Flag submitted — thank you! We'll review within 48 hours.", "🚩");
          }}
        />
      )}

      {/* ── TOAST ── */}
      {toast && <Toast msg={toast.msg} icon={toast.icon} />}
    </>
  );
}
