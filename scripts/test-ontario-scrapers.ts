#!/usr/bin/env tsx

import { OntarioUniversityScraper } from '../lib/scrapers/ontario-universities'

async function test() {
  console.log('🧪 Testing Updated Ontario Scrapers\n')
  console.log('='.repeat(70))

  const scraper = new OntarioUniversityScraper()

  // Test Waterloo
  console.log('\n📚 Testing Waterloo...')
  const waterlooPrograms = await scraper.scrapeWaterloo()
  console.log(`   Found: ${waterlooPrograms.length} programs`)
  console.log('   Sample programs:')
  waterlooPrograms.slice(0, 5).forEach(p => console.log(`   - ${p.name} (${p.degreeType})`))

  // Test Queen's
  console.log('\n📚 Testing Queen\'s...')
  const queensPrograms = await scraper.scrapeQueens()
  console.log(`   Found: ${queensPrograms.length} programs`)
  console.log('   Sample programs:')
  queensPrograms.slice(0, 5).forEach(p => console.log(`   - ${p.name} (${p.degreeType})`))

  console.log('\n' + '='.repeat(70))
  console.log(`\n✅ Total scraped: ${waterlooPrograms.length + queensPrograms.length} programs`)
}

test()
