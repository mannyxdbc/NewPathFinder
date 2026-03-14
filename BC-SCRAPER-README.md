# BC University Scraper

## Overview

Automated web scraper for British Columbia universities and colleges to import complete, real program data into ScholarPath.

## Status: ✅ WORKING

Successfully tested and verified to scrape real graduate program data from BC universities.

## Coverage

### Universities Implemented:
- ✅ **University of British Columbia (UBC)** - 103+ graduate programs found
- ✅ **Simon Fraser University (SFU)** - Graduate programs
- ✅ **University of Victoria (UVic)** - Graduate programs

### Colleges (Coming Soon):
- 🔜 BC Institute of Technology (BCIT)
- 🔜 Langara College
- 🔜 Douglas College
- 🔜 Capilano University

## Usage

### Test Scraper (No Database Import):
```bash
npx tsx scripts/test-bc-scraper.ts
```

### Full Import to Database:
```bash
npm run import:bc
```

## How It Works

1. **Scrapes Program Catalog Pages**: Fetches main program listing pages from each university
2. **Extracts Program Links**: Parses HTML to find all graduate program URLs
3. **Scrapes Individual Programs**: Visits each program page to extract:
   - Program name
   - Degree type (MA, MSc, PhD, MBA, MEng, etc.)
   - Description
   - URL for more details

4. **Imports to Database**: Creates schools and programs in Supabase with proper relationships

## Data Quality

### What We Get:
- ✅ **Real program names** from official university websites
- ✅ **Accurate degree types** (PhD, MSc, MA, MBA, MEng, etc.)
- ✅ **Official program URLs** for user reference
- ✅ **Program descriptions** (when available)

### What We DON'T Get (Yet):
- ❌ Tuition (need to parse from different pages)
- ❌ Admission requirements (scattered across pages)
- ❌ Application deadlines (dynamically updated)
- ❌ Program duration (standardized)

These can be added with enhanced scraping or manual data entry.

## Technical Details

### Files:
- `lib/scrapers/bc-universities.ts` - Main scraper class
- `scripts/import-bc-universities.ts` - Database import script
- `scripts/test-bc-scraper.ts` - Test script (no database)

### Rate Limiting:
- 100ms delay between requests to be respectful
- Limited to 50 programs per university initially (can expand)

### Error Handling:
- Gracefully skips failed program pages
- Continues scraping even if some universities fail
- Detailed logging for debugging

## Test Results

```
🔍 Starting BC University scraping...

📚 Scraping UBC...
  Found 103 UBC program links
  ✓ Scraped 50 UBC programs

📚 Scraping SFU...
  ✓ Scraped 45 SFU programs

📚 Scraping UVic...
  ✓ Scraped 40 UVic programs

✅ Total programs scraped: 135+
```

## Next Steps

1. **Run Full Import**: Import BC programs to production database
2. **Add BC Colleges**: Expand to BCIT, Langara, Douglas, Capilano
3. **Enhance Data**: Scrape tuition and admission requirements
4. **Expand Geography**: Build scrapers for Ontario, Alberta, Quebec universities
5. **Maintenance**: Schedule periodic re-scraping to keep data fresh

## Advantages Over StatCan Data

| Feature | StatCan API | Web Scraping |
|---------|-------------|--------------|
| University-specific | ❌ Provincial aggregates only | ✅ Yes |
| Individual programs | ❌ Field-level only | ✅ Yes |
| Program names | ❌ Generic | ✅ Real names |
| Program URLs | ❌ No | ✅ Yes |
| Coverage | ❌ Limited fields | ✅ All programs |

## Roadmap

### Phase 1: BC Universities (Current) ✅
- UBC, SFU, UVic scrapers built and tested

### Phase 2: BC Colleges
- BCIT, Langara, Douglas, Capilano

### Phase 3: Ontario Universities
- UofT, UWaterloo, Western, Queen's, McMaster, York, Ottawa, Carleton

### Phase 4: Alberta & Beyond
- UofA, UofC, then expand to all provinces

### Phase 5: Enhanced Data
- Tuition scraping
- Admission requirements parsing
- Deadline tracking
- Program rankings integration

---

**Built for ScholarPath** - Making graduate program research accessible and comprehensive.
