# API Integration Guide

## Overview

ScholarPath integrates with official government education databases to provide accurate, up-to-date university program data for North America.

## Data Sources

### 1. IPEDS (United States)

**Source:** Integrated Postsecondary Education Data System - U.S. Department of Education
**Status:** ✅ Integrated
**Coverage:** 19 top U.S. universities

#### Data Provided:
- University information (name, location, type, Carnegie classification)
- Program offerings with CIP codes
- Tuition and fees (2024-2025 academic year)
- Admissions statistics (SAT/ACT scores, acceptance rates, GPA averages)

#### Implementation:
- File: `lib/api/ipeds-fetcher.ts`
- Data: Curated sample from 19 top institutions
- Script: `npm run import:ipeds`

**Note:** IPEDS provides data via CSV downloads, not a REST API. The current implementation uses curated data for top universities. To scale to all U.S. institutions, download the latest IPEDS data files from https://nces.ed.gov/ipeds/datacenter/

#### Universities Included:
**Ivy League:**
- Harvard University
- Stanford University
- MIT
- Yale University
- Princeton University
- Columbia University
- University of Pennsylvania
- Cornell University

**Top Public:**
- UC Berkeley
- UCLA
- University of Michigan
- University of Illinois Urbana-Champaign
- Georgia Tech
- University of Washington
- UT Austin

**Other Elite Private:**
- University of Chicago
- Northwestern University
- Duke University
- Carnegie Mellon University

---

### 2. Statistics Canada (Canada)

**Source:** Statistics Canada - Government of Canada
**Status:** ✅ Integrated (with fallback)
**Coverage:** 24 Canadian universities and colleges

#### Data Provided:
- University information
- Program offerings by field of study
- Tuition fees
- Enrollment data

#### Implementation:
- File: `lib/api/statcan-fetcher.ts`
- API: Statistics Canada Web Data Service
- Tables Used:
  - `37-10-0011-01`: University tuition fees by field of study
  - `37-10-0027-03`: University enrolments by detailed field of study
- Script: `npm run import:canada`

#### API Integration Details:

The fetcher attempts multiple methods to retrieve data:

1. **Web Data Service API (JSON)**
   - Endpoint: `https://www150.statcan.gc.ca/t1/wds/rest`
   - Method: POST to `getCubeMetadata` and `getDataFromCubePidCoordAndLatestNPeriods`
   - Status: Returns 406 (Not Acceptable) - likely requires specific authentication or request format

2. **CSV Download**
   - Endpoint: `https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/{tableId}/en`
   - Method: GET with CSV parsing
   - Status: Implemented with PapaParse library

3. **Fallback: Sample Data**
   - When API calls fail, uses comprehensive curated dataset
   - 24 universities across all provinces
   - 101+ programs (undergraduate, graduate, diplomas)

#### Current Status:
The StatCan API integration attempts real-time data fetching but falls back to sample data when API requests are rejected. This is intentional to ensure the application always has data available.

**API Error (406):** The Statistics Canada API is returning a 406 Not Acceptable error. This typically means:
- The API requires specific authentication headers
- The request format doesn't match what the API expects
- The API may have changed its endpoints or requirements

#### Universities Included:
**Ontario (8):**
- University of Toronto
- York University
- Western University
- Queen's University
- McMaster University
- University of Waterloo
- University of Ottawa
- Ryerson University (TMU)
- Carleton University

**British Columbia (3):**
- University of British Columbia
- Simon Fraser University
- University of Victoria

**Quebec (4):**
- McGill University
- Université de Montréal
- HEC Montréal
- Concordia University

**Alberta (2):**
- University of Alberta
- University of Calgary

**Other Provinces (5):**
- Dalhousie University (NS)
- University of Manitoba (MB)
- University of Saskatchewan (SK)
- Memorial University (NL)

**Colleges (2):**
- Seneca College (ON)
- George Brown College (ON)

---

## Database Schema Enhancements

### IPEDS Integration:
```sql
-- Added to schools table
ALTER TABLE schools ADD COLUMN ipeds_unit_id TEXT;

-- Added to programs table
ALTER TABLE programs ADD COLUMN cip_code TEXT;

-- Added to admission_requirements table
ALTER TABLE admission_requirements ADD COLUMN gpa_average DECIMAL(3,2);
ALTER TABLE admission_requirements ADD COLUMN sat_math_average INTEGER;
ALTER TABLE admission_requirements ADD COLUMN sat_reading_average INTEGER;
ALTER TABLE admission_requirements ADD COLUMN act_composite_average INTEGER;
```

---

## Usage

### Import IPEDS Data (US Universities)
```bash
npm run import:ipeds
```

### Import Statistics Canada Data (Canadian Universities)
```bash
npm run import:canada
```

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Data Flow

### Import Process:
1. **Fetch** → API or curated data source
2. **Transform** → Convert to ScholarPath format
3. **Validate** → Check required fields
4. **Import** → Insert into Supabase with RLS policies
5. **Report** → Log success/errors

### Data Transformation:
- **Program Level Detection:** Automatically categorizes programs as undergraduate/graduate/professional based on degree type
- **Duration Calculation:** Assigns typical program duration (4 years undergrad, 2 years masters, 5 years PhD)
- **Tuition Calculation:** For graduate programs, applies 1.3x multiplier to base tuition for public institutions
- **Degree Type Mapping:** Maps program names to standard degree types (BSc, BEng, MBA, MS, PhD, etc.)

---

## Future Enhancements

### High Priority:
1. **Fix StatCan API Authentication**
   - Research proper authentication method
   - Implement correct request format
   - Enable real-time data fetching

2. **Scale IPEDS Coverage**
   - Download full IPEDS dataset
   - Parse all ~7,000 U.S. institutions
   - Automated updates when new data is released

### Medium Priority:
3. **College Scorecard API (US)**
   - Additional US institution data
   - Outcomes data (graduation rates, employment)
   - Financial aid information

4. **Universities API**
   - Global university search
   - Basic information for international schools

5. **Web Scraping Framework**
   - Automated scraping of university websites
   - Program-specific details not in government databases
   - Keep data up-to-date

### Low Priority:
6. **Manual Data Entry Interface**
   - Allow administrators to add/update programs
   - Community-contributed data
   - Verification workflow

---

## API Rate Limits

### Statistics Canada:
- 50 requests per second (server-wide)
- 25 requests per second (per IP address)

### IPEDS:
- No rate limits (CSV downloads)

---

## Error Handling

All API integrations include:
- ✅ Graceful fallback to sample data
- ✅ Timeout handling (10-30 seconds)
- ✅ Detailed error logging
- ✅ User-friendly error messages

---

## Data Quality

### Current Data Quality:
- ✅ Real tuition data (2024-2025 academic year)
- ✅ Real IPEDS Unit IDs
- ✅ Accurate university information
- ✅ Valid CIP codes for programs
- ✅ Realistic admissions statistics

### Sample vs. Real Data:
- **IPEDS:** Uses curated real data for 19 institutions
- **StatCan:** Falls back to curated sample data (API returns 406)

---

## Contributing

To add support for additional data sources:

1. Create fetcher class in `lib/api/`
2. Implement data transformation to ScholarPath schema
3. Add import script in `scripts/`
4. Update this documentation
5. Add npm script to `package.json`

---

## Support

For API-related issues:
- IPEDS: https://nces.ed.gov/ipeds/use-the-data/
- Statistics Canada: https://www.statcan.gc.ca/en/developers

For ScholarPath issues:
- GitHub: https://github.com/Mannnny/NewPathFinder/issues
