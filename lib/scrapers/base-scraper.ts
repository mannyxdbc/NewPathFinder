import axios from 'axios'
import * as cheerio from 'cheerio'

export interface ProgramData {
  schoolName: string
  programName: string
  degreeType: string
  format?: string
  durationMonths?: number
  tuition?: number
  currency?: string
  gpaMin?: number
  gmatAverage?: number
  admissionsUrl?: string
  description?: string
}

export abstract class BaseScraper {
  protected schoolName: string
  protected baseUrl: string

  constructor(schoolName: string, baseUrl: string) {
    this.schoolName = schoolName
    this.baseUrl = baseUrl
  }

  protected async fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        },
        timeout: 10000
      })
      return cheerio.load(response.data)
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      throw error
    }
  }

  protected extractNumber(text: string): number | undefined {
    const match = text.match(/[\d,]+/)
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''))
    }
    return undefined
  }

  protected cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ')
  }

  abstract scrapePrograms(): Promise<ProgramData[]>
}
