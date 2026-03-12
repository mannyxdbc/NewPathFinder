# ScholarPath Development Roadmap

## ✅ Completed (MVP v1.0)
- [x] Next.js application setup with TypeScript
- [x] Supabase database integration
- [x] Complete database schema (9 tables with RLS)
- [x] Homepage with search functionality
- [x] Programs listing page with filters
- [x] Program detail pages
- [x] Compare programs feature (side-by-side)
- [x] Navigation and routing
- [x] Sample data import (101 programs from 24 Canadian institutions)
- [x] Responsive UI design

## 📋 Upcoming Features

### Phase 1: Data Integration (Priority: High)

#### 1. Fix Statistics Canada API Integration
**Goal:** Pull real, comprehensive data from Statistics Canada

**Tasks:**
- [ ] Debug the StatCan API authentication issue (currently getting 406 errors)
- [ ] Correct the API endpoint and request format
- [ ] Implement proper data transformation from StatCan JSON to our schema
- [ ] Add error handling and retry logic
- [ ] Schedule automatic data updates (weekly/monthly)
- [ ] Verify data accuracy against university sources

**Resources:**
- Statistics Canada API docs: https://www.statcan.gc.ca/en/developers
- Table 37-10-0011-01: University tuition fees
- Table 37-10-0018-01: Postsecondary enrolments

**Estimated Time:** 3-5 days

---

#### 2. Add Web Scrapers for University Websites
**Goal:** Automatically collect program data from university websites

**Tasks:**
- [ ] Build base scraper framework using Cheerio/Puppeteer
- [ ] Create scrapers for top Canadian universities:
  - [ ] University of Toronto
  - [ ] McGill University
  - [ ] UBC
  - [ ] University of Waterloo
  - [ ] York University
  - [ ] McMaster University
- [ ] Create scrapers for top US universities:
  - [ ] Stanford University (already started)
  - [ ] MIT
  - [ ] Harvard
  - [ ] UC Berkeley
  - [ ] Carnegie Mellon
  - [ ] Georgia Tech
- [ ] Extract data fields:
  - Program name, degree type, description
  - Tuition and fees
  - Admission requirements (GPA, GRE/GMAT, etc.)
  - Application deadlines
  - Program duration
  - Faculty/advisors
- [ ] Implement data validation and cleaning
- [ ] Set up scheduled scraping (weekly)
- [ ] Add change detection and notifications

**Technical Considerations:**
- Rate limiting to avoid IP blocks
- User-agent rotation
- Proxy support if needed
- Error handling for changed HTML structures
- Data deduplication

**Estimated Time:** 2-3 weeks

---

### Phase 2: Enhanced Features (Priority: Medium)

#### 3. User Authentication & Accounts
- [ ] Supabase Auth integration
- [ ] User registration/login
- [ ] Social auth (Google, GitHub)
- [ ] User profile pages
- [ ] Password reset functionality

#### 4. Save & Favorite Programs
- [ ] Save programs to user account
- [ ] Create custom program lists
- [ ] Add notes to saved programs
- [ ] Export saved programs (PDF, CSV)

#### 5. Advanced Search & Filters
- [ ] Filter by:
  - Location (city, province/state, country)
  - Tuition range
  - Program level (undergrad, grad, diploma)
  - Degree type
  - Duration
  - GPA requirements
  - Test requirements (GRE/GMAT)
- [ ] Sort by relevance, tuition, GPA, etc.
- [ ] Save search preferences

#### 6. Application Tracking
- [ ] Track application status for each program
- [ ] Deadline reminders
- [ ] Document checklist (transcripts, LORs, SOP)
- [ ] Timeline view of applications

---

### Phase 3: Data Quality & Scale (Priority: Medium)

#### 7. Data Verification System
- [ ] Community reporting for incorrect data
- [ ] Admin dashboard for data review
- [ ] Change log tracking
- [ ] Data source attribution
- [ ] Last verified timestamps

#### 8. Expand Data Coverage
- [ ] Add all Canadian universities (~100)
- [ ] Add top 200 US universities
- [ ] Add UK universities
- [ ] Add Australian universities
- [ ] Professional programs (MBA, JD, MD)
- [ ] Certificate and diploma programs

---

### Phase 4: Community Features (Priority: Low)

#### 9. Reviews & Ratings
- [ ] Student reviews for programs
- [ ] Rating system (academics, career outcomes, etc.)
- [ ] Verified student badges
- [ ] Review moderation

#### 10. Discussion Forums
- [ ] Program-specific discussion boards
- [ ] Q&A for prospective students
- [ ] Alumni insights

#### 11. Career Outcomes
- [ ] Average starting salary by program
- [ ] Employment rate statistics
- [ ] Top employers
- [ ] Career paths

---

### Phase 5: Analytics & Insights (Priority: Low)

#### 12. Program Recommendations
- [ ] AI-powered program suggestions
- [ ] Based on profile (GPA, test scores, interests)
- [ ] Match percentage calculation

#### 13. Analytics Dashboard
- [ ] Acceptance rate trends
- [ ] Tuition trends over time
- [ ] Program popularity metrics
- [ ] Geographic insights

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive test coverage (Jest, React Testing Library)
- [ ] Set up CI/CD pipeline
- [ ] Add end-to-end tests (Playwright)
- [ ] Code documentation (JSDoc)
- [ ] Performance optimization
- [ ] SEO optimization

### Infrastructure
- [ ] Set up production deployment (Vercel)
- [ ] Configure custom domain
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] CDN for static assets
- [ ] Database backups and recovery

### Security
- [ ] Implement rate limiting
- [ ] Add CAPTCHA for forms
- [ ] Security audit
- [ ] GDPR compliance
- [ ] Privacy policy & Terms of Service

---

## Quick Wins (Can be done anytime)

- [ ] Add loading skeletons instead of spinners
- [ ] Improve mobile responsiveness
- [ ] Add dark mode toggle
- [ ] Program comparison export to PDF
- [ ] Email alerts for new programs
- [ ] Share program links (social media)
- [ ] Bookmark/favorite on detail page
- [ ] Print-friendly program pages
- [ ] Accessibility improvements (WCAG 2.1)

---

## Notes

**Current Stats:**
- 24 institutions
- 101 programs (mix of undergrad, grad, diplomas)
- Covers Canadian universities
- Sample data only (not real-time)

**Next Priority:**
Focus on Phase 1 (Data Integration) to get real, comprehensive data before adding more features.

**Data Sources to Explore:**
1. Statistics Canada API
2. IPEDS (US Department of Education)
3. Universities Canada database
4. Peterson's Graduate Programs
5. GradSchools.com API
6. Individual university APIs (if available)
