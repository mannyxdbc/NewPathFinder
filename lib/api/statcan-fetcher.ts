import axios from 'axios'
import Papa from 'papaparse'

// Statistics Canada Web Data Service API
const STATCAN_BASE_URL = 'https://www150.statcan.gc.ca/t1/wds/rest'
const STATCAN_TABLE_URL = 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action'

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

export class StatCanFetcher {
  // Table 37-10-0011-01: University tuition fees for full-time Canadian students, by field of study
  private readonly TUITION_TABLE = '3710001101'

  // Table 37-10-0027-03: University enrolments by detailed field of study, institution, and student characteristics
  private readonly ENROLLMENT_TABLE = '3710002703'

  async fetchUniversityData(): Promise<CanadianUniversity[]> {
    try {
      console.log('📊 Fetching Canadian university data from Statistics Canada...')

      // Try to fetch real data from StatCan API
      const realData = await this.fetchRealData()

      if (realData && realData.length > 0) {
        console.log(`✓ Successfully fetched ${realData.length} universities from StatCan`)
        return realData
      }

      console.log('⚠️  Using sample data instead')
      return this.getSampleData()

    } catch (error: any) {
      console.error('Error fetching StatCan data:', error.message)
      console.log('⚠️  Using sample data instead')
      return this.getSampleData()
    }
  }

  /**
   * Fetch real data from Statistics Canada
   */
  private async fetchRealData(): Promise<CanadianUniversity[]> {
    try {
      console.log('🔍 Attempting to fetch from StatCan Web Data Service...')

      // Method 1: Try Web Data Service API (JSON)
      const apiData = await this.fetchViaWebDataService()
      if (apiData && apiData.length > 0) {
        return apiData
      }

      // Method 2: Try CSV download
      const csvData = await this.fetchViaCSVDownload()
      if (csvData && csvData.length > 0) {
        return csvData
      }

      return []
    } catch (error: any) {
      console.log(`  Error: ${error.message}`)
      return []
    }
  }

  /**
   * Fetch data using Statistics Canada Web Data Service API
   */
  private async fetchViaWebDataService(): Promise<CanadianUniversity[]> {
    try {
      // Get cube metadata first
      const metadataUrl = `${STATCAN_BASE_URL}/getCubeMetadata`

      console.log('  Fetching tuition data metadata...')
      const metadataResponse = await axios.post(
        metadataUrl,
        [{ productId: this.TUITION_TABLE }],
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ScholarPath/1.0 (Educational Research Platform)'
          },
          timeout: 15000
        }
      )

      if (metadataResponse.data && metadataResponse.data[0]) {
        const metadata = metadataResponse.data[0].object
        console.log(`  ✓ Received metadata for table ${this.TUITION_TABLE}`)

        // Now fetch actual data
        return await this.fetchTableData(metadata)
      }

      return []
    } catch (error: any) {
      if (error.response) {
        console.log(`  API returned ${error.response.status}: ${error.response.statusText}`)
      }
      throw error
    }
  }

  /**
   * Fetch data from a specific table
   */
  private async fetchTableData(metadata: any): Promise<CanadianUniversity[]> {
    try {
      const dataUrl = `${STATCAN_BASE_URL}/getDataFromCubePidCoordAndLatestNPeriods`

      console.log('  Fetching latest tuition data...')
      const response = await axios.post(
        dataUrl,
        [{
          productId: this.TUITION_TABLE,
          coordinate: '',
          latestN: 1
        }],
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ScholarPath/1.0 (Educational Research Platform)'
          },
          timeout: 15000
        }
      )

      if (response.data && response.data[0]) {
        console.log('  ✓ Received data from StatCan API')
        return this.transformAPIData(response.data[0].object)
      }

      return []
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetch data via CSV download
   */
  private async fetchViaCSVDownload(): Promise<CanadianUniversity[]> {
    try {
      console.log('  Trying CSV download method...')

      const csvUrl = `${STATCAN_BASE_URL}/getFullTableDownloadCSV/${this.TUITION_TABLE}/en`

      const response = await axios.get(csvUrl, {
        headers: {
          'User-Agent': 'ScholarPath/1.0 (Educational Research Platform)',
          'Accept': 'text/csv'
        },
        timeout: 30000,
        responseType: 'text'
      })

      if (response.data) {
        console.log('  ✓ Downloaded CSV data')
        return this.parseCSVData(response.data)
      }

      return []
    } catch (error: any) {
      if (error.response) {
        console.log(`  CSV download returned ${error.response.status}`)
      }
      throw error
    }
  }

  /**
   * Transform API JSON data to our format
   */
  private transformAPIData(data: any): CanadianUniversity[] {
    // Parse the StatCan API response structure
    // This will vary based on the actual API response format
    const universities = new Map<string, CanadianUniversity>()

    // Extract university and program data from the response
    // Note: Actual implementation depends on API response structure

    return Array.from(universities.values())
  }

  /**
   * Parse CSV data from StatCan
   */
  private parseCSVData(csvText: string): CanadianUniversity[] {
    const universities = new Map<string, CanadianUniversity>()

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })

    console.log(`  Processing ${parsed.data.length} rows from CSV...`)

    // Parse CSV rows
    parsed.data.forEach((row: any) => {
      try {
        // StatCan CSV columns typically include:
        // REF_DATE, GEO, Field of study, VALUE, etc.

        const institution = row['Institution'] || row['GEO']
        const fieldOfStudy = row['Field of study']
        const tuition = parseFloat(row['VALUE'])
        const province = this.extractProvince(institution)

        if (!institution || !fieldOfStudy || isNaN(tuition)) {
          return
        }

        // Get or create university entry
        if (!universities.has(institution)) {
          universities.set(institution, {
            name: institution,
            province: province,
            city: this.getCityForUniversity(institution),
            programs: []
          })
        }

        const university = universities.get(institution)!

        // Add program
        university.programs.push({
          name: fieldOfStudy,
          degreeType: this.inferDegreeType(fieldOfStudy),
          field: fieldOfStudy,
          tuition: tuition
        })
      } catch (err) {
        // Skip malformed rows
      }
    })

    return Array.from(universities.values())
  }

  /**
   * Extract province from institution name or GEO field
   */
  private extractProvince(institution: string): string {
    const provinceMap: { [key: string]: string } = {
      'Alberta': 'AB',
      'British Columbia': 'BC',
      'Manitoba': 'MB',
      'New Brunswick': 'NB',
      'Newfoundland and Labrador': 'NL',
      'Nova Scotia': 'NS',
      'Ontario': 'ON',
      'Prince Edward Island': 'PE',
      'Quebec': 'QC',
      'Saskatchewan': 'SK'
    }

    for (const [province, code] of Object.entries(provinceMap)) {
      if (institution.includes(province)) {
        return code
      }
    }

    // Try to infer from university name
    if (institution.includes('Toronto') || institution.includes('Waterloo') ||
        institution.includes('Ottawa') || institution.includes('Queen')) return 'ON'
    if (institution.includes('British Columbia') || institution.includes('Vancouver')) return 'BC'
    if (institution.includes('Montreal') || institution.includes('McGill') ||
        institution.includes('Laval')) return 'QC'
    if (institution.includes('Alberta') || institution.includes('Calgary')) return 'AB'

    return 'ON' // Default
  }

  /**
   * Get city for a university
   */
  private getCityForUniversity(name: string): string {
    const cityMap: { [key: string]: string } = {
      'Toronto': 'Toronto',
      'McGill': 'Montreal',
      'British Columbia': 'Vancouver',
      'Alberta': 'Edmonton',
      'Calgary': 'Calgary',
      'Waterloo': 'Waterloo',
      'Ottawa': 'Ottawa',
      'Queen': 'Kingston',
      'McMaster': 'Hamilton',
      'Western': 'London',
      'York': 'Toronto',
      'Montreal': 'Montreal',
      'Concordia': 'Montreal',
      'Simon Fraser': 'Burnaby',
      'Victoria': 'Victoria',
      'Manitoba': 'Winnipeg',
      'Saskatchewan': 'Saskatoon',
      'Dalhousie': 'Halifax',
      'Memorial': 'St. John\'s',
      'Carleton': 'Ottawa'
    }

    for (const [key, city] of Object.entries(cityMap)) {
      if (name.includes(key)) {
        return city
      }
    }

    return 'Unknown'
  }

  /**
   * Infer degree type from field of study name
   */
  private inferDegreeType(field: string): string {
    if (field.includes('Bachelor') || field.includes('Undergraduate')) {
      if (field.includes('Engineering')) return 'BEng'
      if (field.includes('Science')) return 'BSc'
      if (field.includes('Arts')) return 'BA'
      if (field.includes('Commerce') || field.includes('Business')) return 'BCom'
      return 'BA'
    }

    if (field.includes('Master')) {
      if (field.includes('Business Administration') || field.includes('MBA')) return 'MBA'
      if (field.includes('Engineering')) return 'MEng'
      if (field.includes('Science')) return 'MSc'
      return 'MA'
    }

    if (field.includes('Doctoral') || field.includes('PhD')) {
      return 'PhD'
    }

    if (field.includes('Diploma')) {
      return 'Diploma'
    }

    return 'BSc' // Default
  }

  // Sample Canadian universities for testing - Comprehensive data
  private getSampleData(): CanadianUniversity[] {
    return [
      // Ontario Universities
      {
        name: 'University of Toronto',
        province: 'ON',
        city: 'Toronto',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 58160 },
          { name: 'Engineering Science', degreeType: 'BASc', field: 'Engineering', tuition: 61010 },
          { name: 'Business Administration', degreeType: 'BCom', field: 'Business', tuition: 57020 },
          { name: 'Life Sciences', degreeType: 'BSc', field: 'Biology', tuition: 56810 },
          { name: 'Master of Computer Science', degreeType: 'MScAC', field: 'Computer Science', tuition: 48500 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 120000 },
          { name: 'Master of Engineering', degreeType: 'MEng', field: 'Engineering', tuition: 42500 },
          { name: 'PhD in Computer Science', degreeType: 'PhD', field: 'Computer Science', tuition: 8960 }
        ]
      },
      {
        name: 'York University',
        province: 'ON',
        city: 'Toronto',
        programs: [
          { name: 'Business Administration', degreeType: 'BBA', field: 'Business', tuition: 28420 },
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 28420 },
          { name: 'Nursing', degreeType: 'BScN', field: 'Nursing', tuition: 28420 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 92000 },
          { name: 'Master of Finance', degreeType: 'MF', field: 'Finance', tuition: 68000 }
        ]
      },
      {
        name: 'Western University',
        province: 'ON',
        city: 'London',
        programs: [
          { name: 'Engineering', degreeType: 'BESc', field: 'Engineering', tuition: 48500 },
          { name: 'Business Administration (HBA)', degreeType: 'HBA', field: 'Business', tuition: 33000 },
          { name: 'Health Sciences', degreeType: 'BHSc', field: 'Health Sciences', tuition: 28420 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 105000 },
          { name: 'Master of Data Analytics', degreeType: 'MDA', field: 'Data Science', tuition: 42000 }
        ]
      },
      {
        name: 'Queen\'s University',
        province: 'ON',
        city: 'Kingston',
        programs: [
          { name: 'Commerce', degreeType: 'BCom', field: 'Business', tuition: 52000 },
          { name: 'Engineering', degreeType: 'BASc', field: 'Engineering', tuition: 54500 },
          { name: 'Computing', degreeType: 'BSc', field: 'Computer Science', tuition: 48000 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 98000 },
          { name: 'Master of Management Analytics', degreeType: 'MMA', field: 'Analytics', tuition: 58000 }
        ]
      },
      {
        name: 'McMaster University',
        province: 'ON',
        city: 'Hamilton',
        programs: [
          { name: 'Health Sciences', degreeType: 'BHSc', field: 'Health Sciences', tuition: 35000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 54500 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 31000 },
          { name: 'Master of Engineering', degreeType: 'MEng', field: 'Engineering', tuition: 28000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 85000 }
        ]
      },
      {
        name: 'University of Waterloo',
        province: 'ON',
        city: 'Waterloo',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 52000 },
          { name: 'Software Engineering', degreeType: 'BASc', field: 'Engineering', tuition: 61500 },
          { name: 'Mathematics', degreeType: 'BMath', field: 'Mathematics', tuition: 35000 },
          { name: 'Master of Computer Science', degreeType: 'MCS', field: 'Computer Science', tuition: 42000 },
          { name: 'Master of Data Science', degreeType: 'MDS', field: 'Data Science', tuition: 38000 }
        ]
      },
      {
        name: 'University of Ottawa',
        province: 'ON',
        city: 'Ottawa',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 37500 },
          { name: 'Engineering', degreeType: 'BASc', field: 'Engineering', tuition: 42000 },
          { name: 'Business Administration', degreeType: 'BCom', field: 'Business', tuition: 32000 },
          { name: 'Master of Computer Science', degreeType: 'MCS', field: 'Computer Science', tuition: 24000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 48000 }
        ]
      },
      {
        name: 'Ryerson University (Toronto Metropolitan University)',
        province: 'ON',
        city: 'Toronto',
        programs: [
          { name: 'Business Technology Management', degreeType: 'BCom', field: 'Business', tuition: 30000 },
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 30000 },
          { name: 'Nursing', degreeType: 'BScN', field: 'Nursing', tuition: 28000 },
          { name: 'Digital Media', degreeType: 'Certificate', field: 'Media', tuition: 12000 }
        ]
      },

      // British Columbia Universities
      {
        name: 'University of British Columbia',
        province: 'BC',
        city: 'Vancouver',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 48000 },
          { name: 'Engineering', degreeType: 'BASc', field: 'Engineering', tuition: 52500 },
          { name: 'Commerce', degreeType: 'BCom', field: 'Business', tuition: 56000 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 110000 },
          { name: 'Master of Business Analytics', degreeType: 'MBAN', field: 'Business Analytics', tuition: 52000 },
          { name: 'Master of Data Science', degreeType: 'MDS', field: 'Data Science', tuition: 46000 }
        ]
      },
      {
        name: 'Simon Fraser University',
        province: 'BC',
        city: 'Burnaby',
        programs: [
          { name: 'Computing Science', degreeType: 'BSc', field: 'Computer Science', tuition: 28000 },
          { name: 'Business Administration', degreeType: 'BBA', field: 'Business', tuition: 30000 },
          { name: 'Engineering Science', degreeType: 'BASc', field: 'Engineering', tuition: 35000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 72000 }
        ]
      },
      {
        name: 'University of Victoria',
        province: 'BC',
        city: 'Victoria',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 26000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 32000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 28000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 58000 }
        ]
      },

      // Quebec Universities
      {
        name: 'McGill University',
        province: 'QC',
        city: 'Montreal',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 42000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 48000 },
          { name: 'Commerce', degreeType: 'BCom', field: 'Business', tuition: 44000 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 98000 },
          { name: 'Master of Management', degreeType: 'MM', field: 'Management', tuition: 45000 }
        ]
      },
      {
        name: 'Université de Montréal',
        province: 'QC',
        city: 'Montreal',
        programs: [
          { name: 'Informatique', degreeType: 'BSc', field: 'Computer Science', tuition: 8500 },
          { name: 'Génie', degreeType: 'BEng', field: 'Engineering', tuition: 9500 },
          { name: 'Sciences de la santé', degreeType: 'BSc', field: 'Health Sciences', tuition: 8500 }
        ]
      },
      {
        name: 'HEC Montréal',
        province: 'QC',
        city: 'Montreal',
        programs: [
          { name: 'Business Administration (BBA)', degreeType: 'BBA', field: 'Business', tuition: 9000 },
          { name: 'MBA (English)', degreeType: 'MBA', field: 'Business', tuition: 72000 },
          { name: 'Master of Science in Management', degreeType: 'MSc', field: 'Management', tuition: 42000 }
        ]
      },
      {
        name: 'Concordia University',
        province: 'QC',
        city: 'Montreal',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 28000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 32000 },
          { name: 'Business Administration', degreeType: 'BCom', field: 'Business', tuition: 30000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 65000 }
        ]
      },

      // Alberta Universities
      {
        name: 'University of Alberta',
        province: 'AB',
        city: 'Edmonton',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 30000 },
          { name: 'Engineering', degreeType: 'BSc', field: 'Engineering', tuition: 36000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 32000 },
          { name: 'Master of Business Administration', degreeType: 'MBA', field: 'Business', tuition: 78000 },
          { name: 'Master of Financial Management', degreeType: 'MFM', field: 'Finance', tuition: 55000 }
        ]
      },
      {
        name: 'University of Calgary',
        province: 'AB',
        city: 'Calgary',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 28000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 34000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 30000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 72000 }
        ]
      },

      // Other provinces
      {
        name: 'Dalhousie University',
        province: 'NS',
        city: 'Halifax',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 24000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 28000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 26000 },
          { name: 'MBA', degreeType: 'MBA', field: 'Business', tuition: 52000 }
        ]
      },
      {
        name: 'University of Manitoba',
        province: 'MB',
        city: 'Winnipeg',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 18000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 22000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 19000 }
        ]
      },
      {
        name: 'University of Saskatchewan',
        province: 'SK',
        city: 'Saskatoon',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 19000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 23000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 20000 }
        ]
      },
      {
        name: 'Memorial University of Newfoundland',
        province: 'NL',
        city: 'St. John\'s',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 11460 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 11460 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 11460 }
        ]
      },
      {
        name: 'Carleton University',
        province: 'ON',
        city: 'Ottawa',
        programs: [
          { name: 'Computer Science', degreeType: 'BSc', field: 'Computer Science', tuition: 33000 },
          { name: 'Engineering', degreeType: 'BEng', field: 'Engineering', tuition: 38000 },
          { name: 'Business', degreeType: 'BCom', field: 'Business', tuition: 30000 },
          { name: 'Data Science Diploma', degreeType: 'Diploma', field: 'Data Science', tuition: 15000 }
        ]
      },
      {
        name: 'Seneca College',
        province: 'ON',
        city: 'Toronto',
        programs: [
          { name: 'Computer Programming', degreeType: 'Diploma', field: 'Computer Science', tuition: 15000 },
          { name: 'Business Administration', degreeType: 'Diploma', field: 'Business', tuition: 14500 },
          { name: 'Practical Nursing', degreeType: 'Diploma', field: 'Nursing', tuition: 16000 }
        ]
      },
      {
        name: 'George Brown College',
        province: 'ON',
        city: 'Toronto',
        programs: [
          { name: 'Business - Accounting', degreeType: 'Diploma', field: 'Business', tuition: 15500 },
          { name: 'Culinary Management', degreeType: 'Diploma', field: 'Culinary Arts', tuition: 16000 },
          { name: 'Graphic Design', degreeType: 'Diploma', field: 'Design', tuition: 15800 }
        ]
      }
    ]
  }
}
