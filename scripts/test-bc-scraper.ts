#!/usr/bin/env tsx

import { BCUniversityScraper } from '../lib/scrapers/bc-universities'

async function main() {
  console.log('🧪 Testing BC University Scraper\n')

  try {
    const scraper = new BCUniversityScraper()
    const programs = await scraper.scrapeAll()

    console.log(`\n\n📊 RESULTS:`)
    console.log(`Total programs: ${programs.length}\n`)

    // Group by university
    const byUniversity = programs.reduce((acc, p) => {
      acc[p.university] = (acc[p.university] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('By University:')
    for (const [uni, count] of Object.entries(byUniversity)) {
      console.log(`  ${uni}: ${count} programs`)
    }

    console.log('\nSample programs:')
    programs.slice(0, 10).forEach(p => {
      console.log(`  • ${p.name} (${p.degreeType}) - ${p.university}`)
    })

    console.log('\n✅ Scraping test complete!')

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

main()
