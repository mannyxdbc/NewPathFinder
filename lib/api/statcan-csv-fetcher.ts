import Papa from 'papaparse'
import fs from 'fs'
import path from 'path'

export interface CanadianUniversity {
  name: string
  province: string
  city: string
  programs: CanadianProgram[]
}

export interface CanadianProgram {
  name: string
  degreeType: string
  field: string
  tuition?: number
  enrollment?: number
}

interface TuitionRow {
  REF_DATE: string
  GEO: string
  'Field of study': string
  VALUE: string
}

/**
 * Statistics Canada CSV Data Fetcher
 * Reads pre-downloaded CSV files from data/ directory
 * Data source: Statistics Canada Tables 37-10-0003-01 (undergrad) and 37-10-0004-01 (grad)
 */
export class StatCanCSVFetcher {
  private readonly DATA_DIR = path.join(process.cwd(), 'data')
  private readonly UNDERGRAD_FILE = '37100003.csv'
  private readonly GRAD_FILE = '37100004.csv'

  // Comprehensive list of Canadian universities
  private readonly UNIVERSITIES = [
    // Ontario (17 universities)
    { name: 'University of Toronto', city: 'Toronto', province: 'ON' },
    { name: 'York University', city: 'Toronto', province: 'ON' },
    { name: 'Ryerson University', city: 'Toronto', province: 'ON' },
    { name: 'Toronto Metropolitan University', city: 'Toronto', province: 'ON' },
    { name: 'Western University', city: 'London', province: 'ON' },
    { name: 'Queen\'s University', city: 'Kingston', province: 'ON' },
    { name: 'McMaster University', city: 'Hamilton', province: 'ON' },
    { name: 'University of Waterloo', city: 'Waterloo', province: 'ON' },
    { name: 'University of Ottawa', city: 'Ottawa', province: 'ON' },
    { name: 'Carleton University', city: 'Ottawa', province: 'ON' },
    { name: 'University of Guelph', city: 'Guelph', province: 'ON' },
    { name: 'Brock University', city: 'St. Catharines', province: 'ON' },
    { name: 'Lakehead University', city: 'Thunder Bay', province: 'ON' },
    { name: 'Laurentian University', city: 'Sudbury', province: 'ON' },
    { name: 'Nipissing University', city: 'North Bay', province: 'ON' },
    { name: 'Ontario Tech University', city: 'Oshawa', province: 'ON' },
    { name: 'Trent University', city: 'Peterborough', province: 'ON' },
    { name: 'University of Windsor', city: 'Windsor', province: 'ON' },
    { name: 'Wilfrid Laurier University', city: 'Waterloo', province: 'ON' },

    // British Columbia (5 universities)
    { name: 'University of British Columbia', city: 'Vancouver', province: 'BC' },
    { name: 'Simon Fraser University', city: 'Burnaby', province: 'BC' },
    { name: 'University of Victoria', city: 'Victoria', province: 'BC' },
    { name: 'Thompson Rivers University', city: 'Kamloops', province: 'BC' },
    { name: 'University of Northern British Columbia', city: 'Prince George', province: 'BC' },

    // Quebec (5 universities)
    { name: 'McGill University', city: 'Montreal', province: 'QC' },
    { name: 'Université de Montréal', city: 'Montreal', province: 'QC' },
    { name: 'Concordia University', city: 'Montreal', province: 'QC' },
    { name: 'Université Laval', city: 'Quebec City', province: 'QC' },
    { name: 'Université de Sherbrooke', city: 'Sherbrooke', province: 'QC' },

    // Alberta (4 universities)
    { name: 'University of Alberta', city: 'Edmonton', province: 'AB' },
    { name: 'University of Calgary', city: 'Calgary', province: 'AB' },
    { name: 'University of Lethbridge', city: 'Lethbridge', province: 'AB' },
    { name: 'Athabasca University', city: 'Athabasca', province: 'AB' },

    // Nova Scotia (4 universities)
    { name: 'Dalhousie University', city: 'Halifax', province: 'NS' },
    { name: 'Saint Mary\'s University', city: 'Halifax', province: 'NS' },
    { name: 'Acadia University', city: 'Wolfville', province: 'NS' },
    { name: 'Cape Breton University', city: 'Sydney', province: 'NS' },

    // Manitoba (3 universities)
    { name: 'University of Manitoba', city: 'Winnipeg', province: 'MB' },
    { name: 'University of Winnipeg', city: 'Winnipeg', province: 'MB' },
    { name: 'Brandon University', city: 'Brandon', province: 'MB' },

    // Saskatchewan (2 universities)
    { name: 'University of Saskatchewan', city: 'Saskatoon', province: 'SK' },
    { name: 'University of Regina', city: 'Regina', province: 'SK' },

    // New Brunswick (3 universities)
    { name: 'University of New Brunswick', city: 'Fredericton', province: 'NB' },
    { name: 'Mount Allison University', city: 'Sackville', province: 'NB' },
    { name: 'St. Thomas University', city: 'Fredericton', province: 'NB' },

    // Newfoundland and Labrador (1 university)
    { name: 'Memorial University of Newfoundland', city: 'St. John\'s', province: 'NL' },

    // Prince Edward Island (1 university)
    { name: 'University of Prince Edward Island', city: 'Charlottetown', province: 'PE' },
  ]

  async fetchUniversityData(): Promise<CanadianUniversity[]> {
    try {
      console.log('📊 Fetching Canadian university data from StatCan CSV files...')

      // Load tuition data from CSV files
      const undergradTuition = await this.loadTuitionData(this.UNDERGRAD_FILE, false)
      const gradTuition = await this.loadTuitionData(this.GRAD_FILE, true)

      // Combine tuition data
      const allTuition = { ...undergradTuition, ...gradTuition }

      // Generate programs for each university using StatCan data
      const universities: CanadianUniversity[] = this.UNIVERSITIES.map(uni => ({
        ...uni,
        programs: this.generatePrograms(uni.province, allTuition)
      }))

      console.log(`✓ Generated data for ${universities.length} Canadian universities`)
      console.log(`✓ Total programs: ${universities.reduce((sum, u) => sum + u.programs.length, 0)}`)

      return universities

    } catch (error: any) {
      console.error('Error fetching StatCan CSV data:', error.message)
      throw error
    }
  }

  /**
   * Load tuition data from CSV file
   */
  private async loadTuitionData(filename: string, isGrad: boolean): Promise<Record<string, number>> {
    const filePath = path.join(this.DATA_DIR, filename)

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  CSV file not found: ${filename}`)
      return {}
    }

    console.log(`  Reading ${filename}...`)
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    const parsed = Papa.parse<TuitionRow>(fileContent, {
      header: true,
      skipEmptyLines: true
    })

    const tuitionMap: Record<string, number> = {}

    // Filter for latest year (2024/2025) and Canada-wide averages
    parsed.data.forEach((row: TuitionRow) => {
      if (row.REF_DATE === '2024/2025' && row.GEO === 'Canada' && row.VALUE && row.VALUE !== '..') {
        const field = row['Field of study']
        const value = parseFloat(row.VALUE)

        if (!isNaN(value) && field) {
          tuitionMap[field] = value
        }
      }
    })

    console.log(`  ✓ Loaded ${Object.keys(tuitionMap).length} tuition values from ${filename}`)
    return tuitionMap
  }

  /**
   * Generate programs for a university based on StatCan tuition data
   */
  private generatePrograms(province: string, tuitionData: Record<string, number>): CanadianProgram[] {
    const programs: CanadianProgram[] = []

    // Map StatCan field names to program definitions
    const programMap: Array<{field: string, name: string, degreeType: string, isGrad: boolean}> = [
      // Undergraduate programs
      { field: 'Engineering', name: 'Engineering', degreeType: 'BEng', isGrad: false },
      { field: 'Mathematics, computer and information sciences', name: 'Computer Science', degreeType: 'BSc', isGrad: false },
      { field: 'Business, management and public administration', name: 'Business Administration', degreeType: 'BCom', isGrad: false },
      { field: 'Nursing', name: 'Nursing', degreeType: 'BScN', isGrad: false },
      { field: 'Physical and life sciences and technologies', name: 'Life Sciences', degreeType: 'BSc', isGrad: false },
      { field: 'Social and behavioural sciences, and legal studies', name: 'Psychology', degreeType: 'BA', isGrad: false },
      { field: 'Humanities', name: 'Humanities', degreeType: 'BA', isGrad: false },
      { field: 'Education', name: 'Education', degreeType: 'BEd', isGrad: false },
      { field: 'Visual and performing arts, and communications technologies', name: 'Fine Arts', degreeType: 'BFA', isGrad: false },
      { field: 'Architecture', name: 'Architecture', degreeType: 'BArch', isGrad: false },

      // Graduate programs
      { field: 'Regular MBA', name: 'Master of Business Administration', degreeType: 'MBA', isGrad: true },
      { field: 'Executive MBA', name: 'Executive MBA', degreeType: 'EMBA', isGrad: true },
      { field: 'Engineering', name: 'Master of Engineering', degreeType: 'MEng', isGrad: true },
      { field: 'Mathematics, computer and information sciences', name: 'Master of Computer Science', degreeType: 'MCS', isGrad: true },
      { field: 'Business, management and public administration', name: 'Master of Management', degreeType: 'MM', isGrad: true },
      { field: 'Education', name: 'Master of Education', degreeType: 'MEd', isGrad: true },
      { field: 'Physical and life sciences and technologies', name: 'Master of Science', degreeType: 'MSc', isGrad: true },
      { field: 'Nursing', name: 'Master of Nursing', degreeType: 'MN', isGrad: true },
    ]

    // Generate programs based on available tuition data
    programMap.forEach(({ field, name, degreeType, isGrad }) => {
      const tuition = tuitionData[field]
      if (tuition) {
        programs.push({
          name,
          degreeType,
          field,
          tuition: Math.round(tuition)
        })
      }
    })

    return programs
  }
}
