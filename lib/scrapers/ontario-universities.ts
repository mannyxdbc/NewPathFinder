import axios from 'axios'
import * as cheerio from 'cheerio'

export interface OntarioProgram {
  university: string
  name: string
  degreeType: string
  level: 'undergraduate' | 'graduate' | 'professional'
  url: string
  description?: string
  duration?: string
  tuition?: number
}

/**
 * Ontario University Program Scraper
 * Scrapes graduate programs from major Ontario universities
 */
export class OntarioUniversityScraper {

  /**
   * Scrape all Ontario university programs
   */
  async scrapeAll(): Promise<OntarioProgram[]> {
    console.log('🔍 Starting Ontario University scraping...\n')

    const programs: OntarioProgram[] = []

    try {
      // Scrape each university
      const uoftPrograms = await this.scrapeUofT()
      programs.push(...uoftPrograms)

      const waterlooPrograms = await this.scrapeWaterloo()
      programs.push(...waterlooPrograms)

      const westernPrograms = await this.scrapeWestern()
      programs.push(...westernPrograms)

      const queensPrograms = await this.scrapeQueens()
      programs.push(...queensPrograms)

      const mcmasterPrograms = await this.scrapeMcMaster()
      programs.push(...mcmasterPrograms)

      console.log(`\n✅ Total Ontario programs scraped: ${programs.length}`)
      return programs

    } catch (error: any) {
      console.error('❌ Ontario scraping failed:', error.message)
      throw error
    }
  }

  /**
   * Scrape University of Toronto
   */
  async scrapeUofT(): Promise<OntarioProgram[]> {
    console.log('📚 Scraping University of Toronto...')
    const programs: OntarioProgram[] = []

    try {
      const url = 'https://www.sgs.utoronto.ca/programs/'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('a[href*="program"]').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200 && !name.toLowerCase().includes('search')) {
          let degreeType = this.inferDegreeType(name)

          programs.push({
            university: 'University of Toronto',
            name,
            degreeType,
            level: 'graduate',
            url: href?.startsWith('http') ? href : `https://www.sgs.utoronto.ca${href || ''}`
          })
        }
      })

      console.log(`  ✓ Scraped ${programs.length} UofT programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ UofT scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape University of Waterloo
   */
  async scrapeWaterloo(): Promise<OntarioProgram[]> {
    console.log('📚 Scraping University of Waterloo...')
    const programs: OntarioProgram[] = []

    try {
      const faculties = ['arts', 'engineering', 'environment', 'health', 'mathematics', 'science']

      for (const faculty of faculties) {
        const url = `https://uwaterloo.ca/future-graduate-students/programs/by-faculty/${faculty}`

        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        })

        const $ = cheerio.load(response.data)

        // Find program links - they have pattern like "/future-graduate-students/programs/by-faculty/..."
        $('a[href*="/future-graduate-students/programs/by-faculty/"]').each((_, element) => {
          const name = $(element).text().trim()
          const href = $(element).attr('href')

          if (name && name.length > 10 && name.length < 200 && href && !href.endsWith(`/${faculty}`)) {
            let degreeType = this.inferDegreeType(name)

            // Check if already exists
            if (!programs.find(p => p.name === name)) {
              programs.push({
                university: 'University of Waterloo',
                name,
                degreeType,
                level: 'graduate',
                url: href?.startsWith('http') ? href : `https://uwaterloo.ca${href || ''}`
              })
            }
          }
        })

        await this.sleep(200) // Rate limiting
      }

      console.log(`  ✓ Scraped ${programs.length} Waterloo programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Waterloo scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape Western University
   */
  async scrapeWestern(): Promise<OntarioProgram[]> {
    console.log('📚 Scraping Western University...')
    const programs: OntarioProgram[] = []

    try {
      const url = 'https://grad.uwo.ca/programs/index.html'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('.program-list a, table a').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = this.inferDegreeType(name)

          programs.push({
            university: 'Western University',
            name,
            degreeType,
            level: 'graduate',
            url: href?.startsWith('http') ? href : `https://grad.uwo.ca${href || ''}`
          })
        }
      })

      console.log(`  ✓ Scraped ${programs.length} Western programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Western scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape Queen's University
   */
  async scrapeQueens(): Promise<OntarioProgram[]> {
    console.log('📚 Scraping Queen\'s University...')
    const programs: OntarioProgram[] = []

    try {
      const url = 'https://www.queensu.ca/grad-postdoc/grad-studies/programs-degrees'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links - Queen's has them in paragraph tags with external links
      $('p a').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        // Filter for actual program names (longer than 5 chars, not navigation links)
        const excludeTerms = ['Contact', 'Calendar', 'Apply', 'View', 'website', 'Here', 'Click', 'More', 'Read']
        const shouldExclude = excludeTerms.some(term => name.includes(term))

        if (name && name.length > 10 && name.length < 200 && !shouldExclude && href && href.startsWith('http')) {
          // Get the degree info from next sibling paragraph if available
          const $nextP = $(element).parent().next('p')
          const degreeInfo = $nextP.text().trim()

          let degreeType = this.inferDegreeType(name + ' ' + degreeInfo)

          // Check if already exists
          if (!programs.find(p => p.name === name)) {
            programs.push({
              university: 'Queen\'s University',
              name,
              degreeType,
              level: 'graduate',
              url: href || ''
            })
          }
        }
      })

      console.log(`  ✓ Scraped ${programs.length} Queen's programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Queen's scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape McMaster University
   */
  async scrapeMcMaster(): Promise<OntarioProgram[]> {
    console.log('📚 Scraping McMaster University...')
    const programs: OntarioProgram[] = []

    try {
      const url = 'https://gs.mcmaster.ca/programs/'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('.program-list a, table a').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = this.inferDegreeType(name)

          programs.push({
            university: 'McMaster University',
            name,
            degreeType,
            level: 'graduate',
            url: href?.startsWith('http') ? href : `https://gs.mcmaster.ca${href || ''}`
          })
        }
      })

      console.log(`  ✓ Scraped ${programs.length} McMaster programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ McMaster scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Infer degree type from program name
   */
  private inferDegreeType(name: string): string {
    const upper = name.toUpperCase()

    if (upper.includes('PHD') || upper.includes('DOCTOR')) return 'PhD'
    if (upper.includes('MASTER OF SCIENCE') || upper.includes('MSC') || upper.includes('M.SC')) return 'MSc'
    if (upper.includes('MASTER OF ARTS') || upper.includes('MA') && !upper.includes('MBA')) return 'MA'
    if (upper.includes('MBA') || upper.includes('MASTER OF BUSINESS')) return 'MBA'
    if (upper.includes('MENG') || upper.includes('MASTER OF ENGINEERING')) return 'MEng'
    if (upper.includes('LLM') || upper.includes('MASTER OF LAW')) return 'LLM'
    if (upper.includes('MED') || upper.includes('MASTER OF EDUCATION')) return 'MEd'
    if (upper.includes('MASTER OF')) {
      // Extract the Master of X part
      const match = name.match(/Master of ([A-Z][a-zA-Z\s]+)/)
      if (match) {
        return 'M' + match[1].split(' ').map(w => w[0]).join('')
      }
    }

    return 'MA' // Default
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
