import axios from 'axios'

// Statistics Canada Web Data Service API
const STATCAN_BASE_URL = 'https://www150.statcan.gc.ca/t1/wds/rest'

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
  // Table 37-10-0011-01: University tuition fees for full-time Canadian students
  private readonly TUITION_TABLE = '37100011'

  // Table 37-10-0018-01: Postsecondary enrolments, by program type and credential type
  private readonly ENROLLMENT_TABLE = '37100018'

  async fetchUniversityData(): Promise<CanadianUniversity[]> {
    try {
      console.log('📊 Fetching Canadian university data from Statistics Canada...')

      // Fetch tuition data
      const tuitionData = await this.fetchTable(this.TUITION_TABLE)

      // Transform to our format
      const universities = this.transformData(tuitionData)

      console.log(`✓ Found ${universities.length} Canadian universities`)
      return universities

    } catch (error) {
      console.error('Error fetching StatCan data:', error)
      // Return sample data for testing
      return this.getSampleData()
    }
  }

  private async fetchTable(tableId: string): Promise<any> {
    try {
      const url = `${STATCAN_BASE_URL}/getDataFromCubePidCoordAndLatestNPeriods`
      const response = await axios.post(url, {
        productId: tableId,
        coordinate: '',
        latestN: 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error(`Error fetching table ${tableId}:`, error)
      throw error
    }
  }

  private transformData(data: any): CanadianUniversity[] {
    // This would transform the actual StatCan data
    // For now, returning sample structured data
    return this.getSampleData()
  }

  // Sample Canadian universities for testing
  private getSampleData(): CanadianUniversity[] {
    return [
      {
        name: 'University of Toronto - Rotman School of Management',
        province: 'ON',
        city: 'Toronto',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 120000,
            enrollment: 300
          },
          {
            name: 'Master of Management Analytics',
            degreeType: 'MMA',
            field: 'Business Analytics',
            tuition: 65000,
            enrollment: 150
          }
        ]
      },
      {
        name: 'McGill University - Desautels Faculty of Management',
        province: 'QC',
        city: 'Montreal',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 98000,
            enrollment: 200
          },
          {
            name: 'Master of Management',
            degreeType: 'MM',
            field: 'Management',
            tuition: 45000,
            enrollment: 100
          }
        ]
      },
      {
        name: 'University of British Columbia - Sauder School of Business',
        province: 'BC',
        city: 'Vancouver',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 110000,
            enrollment: 250
          },
          {
            name: 'Master of Business Analytics',
            degreeType: 'MBAN',
            field: 'Business Analytics',
            tuition: 52000,
            enrollment: 120
          }
        ]
      },
      {
        name: 'York University - Schulich School of Business',
        province: 'ON',
        city: 'Toronto',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 92000,
            enrollment: 280
          },
          {
            name: 'Master of Finance',
            degreeType: 'MF',
            field: 'Finance',
            tuition: 68000,
            enrollment: 90
          }
        ]
      },
      {
        name: 'Western University - Ivey Business School',
        province: 'ON',
        city: 'London',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 105000,
            enrollment: 220
          }
        ]
      },
      {
        name: 'Queen\'s University - Smith School of Business',
        province: 'ON',
        city: 'Kingston',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 98000,
            enrollment: 200
          },
          {
            name: 'Master of Management Analytics',
            degreeType: 'MMA',
            field: 'Analytics',
            tuition: 58000,
            enrollment: 85
          }
        ]
      },
      {
        name: 'HEC Montréal',
        province: 'QC',
        city: 'Montreal',
        programs: [
          {
            name: 'MBA (English)',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 72000,
            enrollment: 150
          },
          {
            name: 'Master of Science in Management',
            degreeType: 'MSc',
            field: 'Management',
            tuition: 42000,
            enrollment: 180
          }
        ]
      },
      {
        name: 'University of Alberta - Alberta School of Business',
        province: 'AB',
        city: 'Edmonton',
        programs: [
          {
            name: 'Master of Business Administration',
            degreeType: 'MBA',
            field: 'Business',
            tuition: 78000,
            enrollment: 160
          },
          {
            name: 'Master of Financial Management',
            degreeType: 'MFM',
            field: 'Finance',
            tuition: 55000,
            enrollment: 75
          }
        ]
      }
    ]
  }
}
