import { BCUniversityScraper } from './bc-universities'
import { OntarioUniversityScraper } from './ontario-universities'

export interface CanadianProgram {
  university: string
  name: string
  degreeType: string
  level: 'undergraduate' | 'graduate' | 'professional'
  url: string
  province: string
  description?: string
}

/**
 * Comprehensive Canadian University Scraper
 * Aggregates all regional scrapers
 */
export class CanadaUniversityScraper {

  async scrapeAll(): Promise<CanadianProgram[]> {
    console.log('🍁 Starting Comprehensive Canadian University Scraping\n')
    console.log('='.repeat(70))

    const allPrograms: CanadianProgram[] = []

    // BC Universities
    console.log('\n🌲 BRITISH COLUMBIA')
    console.log('-'.repeat(70))
    const bcScraper = new BCUniversityScraper()
    const bcPrograms = await bcScraper.scrapeAll()
    allPrograms.push(...bcPrograms.map(p => ({ ...p, province: 'BC' })))

    // Ontario Universities
    console.log('\n🏙️  ONTARIO')
    console.log('-'.repeat(70))
    const ontarioScraper = new OntarioUniversityScraper()
    const ontarioPrograms = await ontarioScraper.scrapeAll()
    allPrograms.push(...ontarioPrograms.map(p => ({ ...p, province: 'ON' })))

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('\n📊 NATIONAL SUMMARY')
    console.log('-'.repeat(70))

    const byProvince = allPrograms.reduce((acc, p) => {
      acc[p.province] = (acc[p.province] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byUniversity = allPrograms.reduce((acc, p) => {
      acc[p.university] = (acc[p.university] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    console.log('\nBy Province:')
    Object.entries(byProvince).forEach(([prov, count]) => {
      console.log(`  ${prov}: ${count} programs`)
    })

    console.log('\nBy University:')
    Object.entries(byUniversity).sort((a, b) => b[1] - a[1]).forEach(([uni, count]) => {
      console.log(`  ${uni}: ${count} programs`)
    })

    console.log(`\n✅ TOTAL PROGRAMS SCRAPED: ${allPrograms.length}`)
    console.log('='.repeat(70) + '\n')

    return allPrograms
  }
}
