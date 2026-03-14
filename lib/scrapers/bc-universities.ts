import axios from 'axios'
import * as cheerio from 'cheerio'

export interface BCProgram {
  university: string
  name: string
  degreeType: string
  level: 'undergraduate' | 'graduate' | 'professional'
  url: string
  description?: string
  duration?: string
  tuition?: number
  admissionRequirements?: string
}

/**
 * BC University Program Scraper
 * Scrapes graduate programs from major BC universities
 */
export class BCUniversityScraper {

  /**
   * Scrape all BC university and college programs
   */
  async scrapeAll(): Promise<BCProgram[]> {
    console.log('🔍 Starting BC University and College scraping...\n')

    const programs: BCProgram[] = []

    try {
      // Scrape universities
      const ubcPrograms = await this.scrapeUBC()
      programs.push(...ubcPrograms)

      const sfuPrograms = await this.scrapeSFU()
      programs.push(...sfuPrograms)

      const uvicPrograms = await this.scrapeUVic()
      programs.push(...uvicPrograms)

      // Scrape colleges
      const bcitPrograms = await this.scrapeBCIT()
      programs.push(...bcitPrograms)

      const langaraPrograms = await this.scrapeLangara()
      programs.push(...langaraPrograms)

      const douglasPrograms = await this.scrapeDouglas()
      programs.push(...douglasPrograms)

      const capiPrograms = await this.scrapeCapilano()
      programs.push(...capiPrograms)

      console.log(`\n✅ Total programs scraped: ${programs.length}`)
      return programs

    } catch (error: any) {
      console.error('❌ Scraping failed:', error.message)
      throw error
    }
  }

  /**
   * Scrape UBC Graduate Programs
   */
  async scrapeUBC(): Promise<BCProgram[]> {
    console.log('📚 Scraping UBC...')
    const programs: BCProgram[] = []

    try {
      const baseUrl = 'https://www.grad.ubc.ca'
      const listUrl = `${baseUrl}/prospective-students/graduate-degree-programs`

      const response = await axios.get(listUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find all program links
      const programLinks: string[] = []
      $('a[href*="/graduate-degree-programs/"]').each((_, element) => {
        const href = $(element).attr('href')
        if (href && href !== '/prospective-students/graduate-degree-programs' &&
            !href.includes('/unit') && !href.includes('/specialization')) {
          const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`
          if (!programLinks.includes(fullUrl)) {
            programLinks.push(fullUrl)
          }
        }
      })

      console.log(`  Found ${programLinks.length} UBC program links`)

      // Scrape ALL programs
      for (const url of programLinks) {
        try {
          const program = await this.scrapeUBCProgram(url)
          if (program) {
            programs.push(program)
            process.stdout.write('.')
          }
        } catch (error) {
          // Skip failed programs
          process.stdout.write('x')
        }
        // Rate limit
        await this.sleep(100)
      }

      console.log(`\n  ✓ Scraped ${programs.length} UBC programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ UBC scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape individual UBC program page
   */
  private async scrapeUBCProgram(url: string): Promise<BCProgram | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      })

      const $ = cheerio.load(response.data)

      // Extract program name from URL or title
      const title = $('h1').first().text().trim() ||
                    $('.page-title').text().trim() ||
                    $('title').text().split('|')[0].trim()

      if (!title) return null

      // Determine degree type from title
      let degreeType = 'MA'
      let level: 'graduate' | 'undergraduate' | 'professional' = 'graduate'

      if (title.includes('PhD') || title.includes('Doctor')) {
        degreeType = 'PhD'
      } else if (title.includes('Master of Science') || title.includes('MSc')) {
        degreeType = 'MSc'
      } else if (title.includes('Master of Arts') || title.includes('MA')) {
        degreeType = 'MA'
      } else if (title.includes('Master of Business') || title.includes('MBA')) {
        degreeType = 'MBA'
      } else if (title.includes('Master of Engineering') || title.includes('MEng')) {
        degreeType = 'MEng'
      } else if (title.includes('Master of')) {
        degreeType = title.match(/Master of ([A-Z][a-z]+)/)?.[0]?.replace('Master of ', 'M') || 'MA'
      } else if (title.includes('Graduate Certificate')) {
        degreeType = 'Graduate Certificate'
      }

      // Extract description
      const description = $('.field--name-field-program-overview').text().trim() ||
                         $('.program-description').first().text().trim() ||
                         $('meta[name="description"]').attr('content') || ''

      return {
        university: 'University of British Columbia',
        name: title,
        degreeType,
        level,
        url,
        description: description.substring(0, 500)
      }

    } catch (error) {
      return null
    }
  }

  /**
   * Scrape SFU Graduate Programs
   */
  async scrapeSFU(): Promise<BCProgram[]> {
    console.log('📚 Scraping SFU...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://www.sfu.ca/gradstudies/apply/programs.html'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program listings
      $('.program-list li, .program-listing li, table tr').each((_, element) => {
        const text = $(element).text().trim()
        const link = $(element).find('a').attr('href')

        if (text && text.length > 5 && text.length < 200) {
          let degreeType = 'MA'

          if (text.includes('PhD') || text.includes('Doctor')) {
            degreeType = 'PhD'
          } else if (text.includes('MSc') || text.includes('M.Sc')) {
            degreeType = 'MSc'
          } else if (text.includes('MBA')) {
            degreeType = 'MBA'
          } else if (text.includes('MEng')) {
            degreeType = 'MEng'
          } else if (text.includes('MA') || text.includes('M.A')) {
            degreeType = 'MA'
          }

          programs.push({
            university: 'Simon Fraser University',
            name: text.replace(/\s+/g, ' '),
            degreeType,
            level: 'graduate',
            url: link && link.startsWith('http') ? link : `https://www.sfu.ca${link || ''}`
          })
        }
      })

      console.log(`  ✓ Scraped ${programs.length} SFU programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ SFU scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape UVic Graduate Programs
   */
  async scrapeUVic(): Promise<BCProgram[]> {
    console.log('📚 Scraping UVic...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://www.uvic.ca/graduate/programs/index.php'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program listings
      $('.program-list a, .programs a, table a').each((_, element) => {
        const name = $(element).text().trim()
        const link = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = 'MA'

          if (name.includes('PhD') || name.includes('Doctor')) {
            degreeType = 'PhD'
          } else if (name.includes('MSc')) {
            degreeType = 'MSc'
          } else if (name.includes('MBA')) {
            degreeType = 'MBA'
          } else if (name.includes('MEng')) {
            degreeType = 'MEng'
          }

          programs.push({
            university: 'University of Victoria',
            name,
            degreeType,
            level: 'graduate',
            url: link && link.startsWith('http') ? link : `https://www.uvic.ca${link || ''}`
          })
        }
      })

      console.log(`  ✓ Scraped ${programs.length} UVic programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ UVic scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape BCIT Programs
   */
  async scrapeBCIT(): Promise<BCProgram[]> {
    console.log('📚 Scraping BCIT...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://www.bcit.ca/study/'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('a[href*="/programs/"]').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200 && href && !href.includes('/study/')) {
          let degreeType = 'Certificate'
          let level: 'undergraduate' | 'graduate' | 'professional' = 'undergraduate'

          if (name.includes('Diploma')) {
            degreeType = 'Diploma'
          } else if (name.includes('Certificate')) {
            degreeType = 'Certificate'
          } else if (name.includes('Bachelor')) {
            degreeType = 'Bachelor'
          } else if (name.includes('Master')) {
            degreeType = 'Master'
            level = 'graduate'
          }

          if (!programs.find(p => p.name === name)) {
            programs.push({
              university: 'British Columbia Institute of Technology',
              name,
              degreeType,
              level,
              url: href.startsWith('http') ? href : `https://www.bcit.ca${href}`
            })
          }
        }
      })

      console.log(`  ✓ Scraped ${programs.length} BCIT programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ BCIT scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape Langara College Programs
   */
  async scrapeLangara(): Promise<BCProgram[]> {
    console.log('📚 Scraping Langara College...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://langara.ca/programs-courses'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('a[href*="/programs/"]').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = 'Certificate'
          let level: 'undergraduate' | 'graduate' | 'professional' = 'undergraduate'

          if (name.includes('Diploma')) {
            degreeType = 'Diploma'
          } else if (name.includes('Certificate')) {
            degreeType = 'Certificate'
          } else if (name.includes('Degree') || name.includes('Bachelor')) {
            degreeType = 'Bachelor'
          }

          if (!programs.find(p => p.name === name)) {
            programs.push({
              university: 'Langara College',
              name,
              degreeType,
              level,
              url: href && href.startsWith('http') ? href : `https://langara.ca${href || ''}`
            })
          }
        }
      })

      console.log(`  ✓ Scraped ${programs.length} Langara programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Langara scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape Douglas College Programs
   */
  async scrapeDouglas(): Promise<BCProgram[]> {
    console.log('📚 Scraping Douglas College...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://www.douglascollege.ca/programs'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('a[href*="/programs/"]').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = 'Certificate'
          let level: 'undergraduate' | 'graduate' | 'professional' = 'undergraduate'

          if (name.includes('Diploma')) {
            degreeType = 'Diploma'
          } else if (name.includes('Certificate')) {
            degreeType = 'Certificate'
          } else if (name.includes('Degree') || name.includes('Bachelor')) {
            degreeType = 'Bachelor'
          } else if (name.includes('Post-Degree')) {
            degreeType = 'Post-Degree Diploma'
            level = 'graduate'
          }

          if (!programs.find(p => p.name === name)) {
            programs.push({
              university: 'Douglas College',
              name,
              degreeType,
              level,
              url: href && href.startsWith('http') ? href : `https://www.douglascollege.ca${href || ''}`
            })
          }
        }
      })

      console.log(`  ✓ Scraped ${programs.length} Douglas College programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Douglas College scraping error:`, error.message)
      return programs
    }
  }

  /**
   * Scrape Capilano University Programs
   */
  async scrapeCapilano(): Promise<BCProgram[]> {
    console.log('📚 Scraping Capilano University...')
    const programs: BCProgram[] = []

    try {
      const url = 'https://www.capilanou.ca/programs--courses/'

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      })

      const $ = cheerio.load(response.data)

      // Find program links
      $('a[href*="/programs/"]').each((_, element) => {
        const name = $(element).text().trim()
        const href = $(element).attr('href')

        if (name && name.length > 5 && name.length < 200) {
          let degreeType = 'Certificate'
          let level: 'undergraduate' | 'graduate' | 'professional' = 'undergraduate'

          if (name.includes('Diploma')) {
            degreeType = 'Diploma'
          } else if (name.includes('Certificate')) {
            degreeType = 'Certificate'
          } else if (name.includes('Degree') || name.includes('Bachelor')) {
            degreeType = 'Bachelor'
          } else if (name.includes('Post-Baccalaureate')) {
            degreeType = 'Post-Baccalaureate'
            level = 'graduate'
          }

          if (!programs.find(p => p.name === name)) {
            programs.push({
              university: 'Capilano University',
              name,
              degreeType,
              level,
              url: href && href.startsWith('http') ? href : `https://www.capilanou.ca${href || ''}`
            })
          }
        }
      })

      console.log(`  ✓ Scraped ${programs.length} Capilano programs`)
      return programs

    } catch (error: any) {
      console.error(`  ✗ Capilano scraping error:`, error.message)
      return programs
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
