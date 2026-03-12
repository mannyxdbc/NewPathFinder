#!/usr/bin/env tsx

import 'dotenv/config'
import { importIPEDSUniversities } from '../lib/api/import-ipeds-data'

async function main() {
  console.log('🇺🇸 ScholarPath - IPEDS Data Import\n')
  console.log('=' .repeat(60))
  console.log('Importing US university data from IPEDS')
  console.log('=' .repeat(60))

  try {
    await importIPEDSUniversities()
    console.log('\n✅ All done! Check your database.')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Import failed:', error)
    process.exit(1)
  }
}

main()
