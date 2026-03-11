#!/usr/bin/env tsx

import { runAllScrapers, importProgramsToDatabase } from '../lib/scrapers'

async function main() {
  console.log('🚀 Starting web scraping...\n')

  // Run all scrapers
  const programs = await runAllScrapers()
  console.log(`\n📊 Scraped ${programs.length} programs\n`)

  // Import to database
  console.log('💾 Importing to database...\n')
  await importProgramsToDatabase(programs)

  console.log('\n✅ Done!')
}

main().catch(console.error)
