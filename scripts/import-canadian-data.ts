#!/usr/bin/env tsx

import 'dotenv/config'
import { importCanadianUniversities } from '../lib/api/import-canadian-data'

async function main() {
  console.log('🍁 ScholarPath - Canadian University Data Import\n')
  console.log('=' .repeat(60))

  try {
    await importCanadianUniversities()
    console.log('\n' + '='.repeat(60))
    console.log('✅ All done! Check your database.')
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  }
}

main()
