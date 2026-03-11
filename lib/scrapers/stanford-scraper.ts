import { BaseScraper, ProgramData } from './base-scraper'

export class StanfordScraper extends BaseScraper {
  constructor() {
    super('Stanford Graduate School of Business', 'https://www.gsb.stanford.edu')
  }

  async scrapePrograms(): Promise<ProgramData[]> {
    const programs: ProgramData[] = []

    try {
      // Stanford MBA
      const $ = await this.fetchHTML(`${this.baseUrl}/programs/mba`)

      programs.push({
        schoolName: this.schoolName,
        programName: 'Master of Business Administration',
        degreeType: 'MBA',
        format: 'full-time',
        durationMonths: 24,
        tuition: 78000,
        currency: 'USD',
        gpaMin: 3.5,
        gmatAverage: 730,
        admissionsUrl: `${this.baseUrl}/programs/mba/admission`,
        description: this.cleanText($('meta[name="description"]').attr('content') || 'Stanford GSB\'s MBA program develops leaders who can create positive impact.')
      })

    } catch (error) {
      console.error('Error scraping Stanford:', error)
    }

    return programs
  }
}
