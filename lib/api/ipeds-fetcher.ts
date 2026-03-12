import axios from 'axios'

// IPEDS API endpoints
const IPEDS_BASE_URL = 'https://nces.ed.gov/ipeds'
const IPEDS_DATA_URL = 'https://nces.ed.gov/ipeds/datacenter/data'

export interface IPEDSInstitution {
  unitId: string
  name: string
  city: string
  state: string
  zip: string
  website: string
  control: 'Public' | 'Private nonprofit' | 'Private for-profit'
  level: string // 4-year, 2-year, etc.
  carnegieClassification: string
}

export interface IPEDSProgram {
  unitId: string
  cipCode: string // Classification of Instructional Programs code
  programName: string
  awardLevel: string // Bachelor's, Master's, Doctoral, etc.
  completions: number
}

export interface IPEDSTuition {
  unitId: string
  year: string
  inStateTuition: number
  outOfStateTuition: number
  inDistrictTuition?: number
  programYear?: string
  feeType?: string
}

export interface IPEDSAdmissions {
  unitId: string
  year: string
  applicants: number
  admitted: number
  enrolled: number
  admissionRate: number
  yieldRate: number
  satMath25: number
  satMath75: number
  satReading25: number
  satReading75: number
  actComposite25: number
  actComposite75: number
  gpaAverage?: number
}

export class IPEDSFetcher {
  // CIP codes for common graduate programs
  private readonly GRADUATE_CIP_CODES = {
    'Computer Science': '11.0701',
    'Business Administration': '52.0201',
    'Engineering': '14.0000',
    'Data Science': '11.0104',
    'Education': '13.0000',
    'Public Health': '51.2201',
    'Psychology': '42.0101',
    'Law': '22.0101',
    'Medicine': '51.1201',
  }

  /**
   * Fetch institutions from IPEDS
   * Since IPEDS doesn't have a real-time REST API, we'll use CSV downloads
   */
  async fetchInstitutions(): Promise<IPEDSInstitution[]> {
    try {
      console.log('📊 Fetching IPEDS institution data...')

      // IPEDS provides data via CSV downloads
      // For a real implementation, you would:
      // 1. Download the latest HD (Directory) file
      // 2. Parse the CSV
      // 3. Transform to our format

      // For now, returning curated data for top universities
      return this.getTopUSUniversities()
    } catch (error) {
      console.error('Error fetching IPEDS institutions:', error)
      return this.getTopUSUniversities()
    }
  }

  /**
   * Fetch tuition data from IPEDS
   */
  async fetchTuitionData(unitIds: string[]): Promise<IPEDSTuition[]> {
    try {
      console.log('💰 Fetching IPEDS tuition data...')

      // IPEDS tuition data comes from IC (Institutional Characteristics) survey
      // Would download and parse CSV in production

      return this.getSampleTuitionData()
    } catch (error) {
      console.error('Error fetching IPEDS tuition:', error)
      return []
    }
  }

  /**
   * Fetch completions (programs) data from IPEDS
   */
  async fetchCompletionsData(unitIds: string[]): Promise<IPEDSProgram[]> {
    try {
      console.log('🎓 Fetching IPEDS completions data...')

      // IPEDS completions data comes from C (Completions) survey
      // Shows what programs/degrees are offered

      return this.getSampleProgramData()
    } catch (error) {
      console.error('Error fetching IPEDS completions:', error)
      return []
    }
  }

  /**
   * Fetch admissions data from IPEDS
   */
  async fetchAdmissionsData(unitIds: string[]): Promise<IPEDSAdmissions[]> {
    try {
      console.log('📈 Fetching IPEDS admissions data...')

      // IPEDS admissions data comes from ADM (Admissions) survey

      return this.getSampleAdmissionsData()
    } catch (error) {
      console.error('Error fetching IPEDS admissions:', error)
      return []
    }
  }

  /**
   * Get comprehensive data for an institution
   */
  async getInstitutionData(unitId: string) {
    const [institution] = await this.fetchInstitutions()
    const tuition = await this.fetchTuitionData([unitId])
    const programs = await this.fetchCompletionsData([unitId])
    const admissions = await this.fetchAdmissionsData([unitId])

    return {
      institution,
      tuition: tuition[0],
      programs,
      admissions: admissions[0],
    }
  }

  // ===========================================================================
  // SAMPLE DATA - Replace with real CSV parsing in production
  // ===========================================================================

  private getTopUSUniversities(): IPEDSInstitution[] {
    return [
      // Ivy League
      {
        unitId: '166027',
        name: 'Harvard University',
        city: 'Cambridge',
        state: 'MA',
        zip: '02138',
        website: 'https://www.harvard.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '190150',
        name: 'Stanford University',
        city: 'Stanford',
        state: 'CA',
        zip: '94305',
        website: 'https://www.stanford.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '164988',
        name: 'Massachusetts Institute of Technology',
        city: 'Cambridge',
        state: 'MA',
        zip: '02139',
        website: 'https://www.mit.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '216339',
        name: 'Yale University',
        city: 'New Haven',
        state: 'CT',
        zip: '06520',
        website: 'https://www.yale.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '215062',
        name: 'Princeton University',
        city: 'Princeton',
        state: 'NJ',
        zip: '08544',
        website: 'https://www.princeton.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '190415',
        name: 'Columbia University',
        city: 'New York',
        state: 'NY',
        zip: '10027',
        website: 'https://www.columbia.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '215293',
        name: 'University of Pennsylvania',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19104',
        website: 'https://www.upenn.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '182670',
        name: 'Cornell University',
        city: 'Ithaca',
        state: 'NY',
        zip: '14853',
        website: 'https://www.cornell.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },

      // Top Public Universities
      {
        unitId: '110635',
        name: 'University of California-Berkeley',
        city: 'Berkeley',
        state: 'CA',
        zip: '94720',
        website: 'https://www.berkeley.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '110662',
        name: 'University of California-Los Angeles',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90095',
        website: 'https://www.ucla.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '170976',
        name: 'University of Michigan-Ann Arbor',
        city: 'Ann Arbor',
        state: 'MI',
        zip: '48109',
        website: 'https://www.umich.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '145637',
        name: 'University of Illinois Urbana-Champaign',
        city: 'Champaign',
        state: 'IL',
        zip: '61820',
        website: 'https://illinois.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '163286',
        name: 'Georgia Institute of Technology',
        city: 'Atlanta',
        state: 'GA',
        zip: '30332',
        website: 'https://www.gatech.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '236948',
        name: 'University of Washington-Seattle Campus',
        city: 'Seattle',
        state: 'WA',
        zip: '98195',
        website: 'https://www.washington.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '228778',
        name: 'University of Texas at Austin',
        city: 'Austin',
        state: 'TX',
        zip: '78712',
        website: 'https://www.utexas.edu',
        control: 'Public',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },

      // Top Private Universities
      {
        unitId: '144050',
        name: 'University of Chicago',
        city: 'Chicago',
        state: 'IL',
        zip: '60637',
        website: 'https://www.uchicago.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '181464',
        name: 'Northwestern University',
        city: 'Evanston',
        state: 'IL',
        zip: '60208',
        website: 'https://www.northwestern.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '155317',
        name: 'Duke University',
        city: 'Durham',
        state: 'NC',
        zip: '27708',
        website: 'https://www.duke.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
      {
        unitId: '243744',
        name: 'Carnegie Mellon University',
        city: 'Pittsburgh',
        state: 'PA',
        zip: '15213',
        website: 'https://www.cmu.edu',
        control: 'Private nonprofit',
        level: '4-year',
        carnegieClassification: 'R1: Doctoral Universities – Very high research activity',
      },
    ]
  }

  private getSampleTuitionData(): IPEDSTuition[] {
    return [
      { unitId: '166027', year: '2024-2025', inStateTuition: 54269, outOfStateTuition: 54269 }, // Harvard
      { unitId: '190150', year: '2024-2025', inStateTuition: 62484, outOfStateTuition: 62484 }, // Stanford
      { unitId: '164988', year: '2024-2025', inStateTuition: 60156, outOfStateTuition: 60156 }, // MIT
      { unitId: '216339', year: '2024-2025', inStateTuition: 64700, outOfStateTuition: 64700 }, // Yale
      { unitId: '215062', year: '2024-2025', inStateTuition: 59710, outOfStateTuition: 59710 }, // Princeton
      { unitId: '190415', year: '2024-2025', inStateTuition: 66139, outOfStateTuition: 66139 }, // Columbia
      { unitId: '215293', year: '2024-2025', inStateTuition: 63452, outOfStateTuition: 63452 }, // UPenn
      { unitId: '182670', year: '2024-2025', inStateTuition: 63200, outOfStateTuition: 63200 }, // Cornell
      { unitId: '110635', year: '2024-2025', inStateTuition: 14226, outOfStateTuition: 46326 }, // UC Berkeley
      { unitId: '110662', year: '2024-2025', inStateTuition: 13752, outOfStateTuition: 45852 }, // UCLA
      { unitId: '170976', year: '2024-2025', inStateTuition: 17786, outOfStateTuition: 57273 }, // UMich
      { unitId: '145637', year: '2024-2025', inStateTuition: 17572, outOfStateTuition: 36068 }, // UIUC
      { unitId: '163286', year: '2024-2025', inStateTuition: 12682, outOfStateTuition: 33794 }, // Georgia Tech
      { unitId: '236948', year: '2024-2025', inStateTuition: 12076, outOfStateTuition: 40740 }, // UW
      { unitId: '228778', year: '2024-2025', inStateTuition: 11698, outOfStateTuition: 40996 }, // UT Austin
      { unitId: '144050', year: '2024-2025', inStateTuition: 63801, outOfStateTuition: 63801 }, // UChicago
      { unitId: '181464', year: '2024-2025', inStateTuition: 64887, outOfStateTuition: 64887 }, // Northwestern
      { unitId: '155317', year: '2024-2025', inStateTuition: 63054, outOfStateTuition: 63054 }, // Duke
      { unitId: '243744', year: '2024-2025', inStateTuition: 62260, outOfStateTuition: 62260 }, // CMU
    ]
  }

  private getSampleProgramData(): IPEDSProgram[] {
    const programs: IPEDSProgram[] = []
    const institutions = this.getTopUSUniversities()

    // Common graduate programs for each institution
    const commonPrograms = [
      { cipCode: '11.0701', name: 'Computer Science', level: "Master's degree", completions: 150 },
      { cipCode: '14.0801', name: 'Civil Engineering', level: "Master's degree", completions: 80 },
      { cipCode: '52.0201', name: 'Business Administration and Management', level: "Master's degree", completions: 300 },
      { cipCode: '11.0104', name: 'Data Science', level: "Master's degree", completions: 120 },
      { cipCode: '14.0901', name: 'Computer Engineering', level: "Master's degree", completions: 100 },
    ]

    institutions.forEach(inst => {
      commonPrograms.forEach(prog => {
        programs.push({
          unitId: inst.unitId,
          cipCode: prog.cipCode,
          programName: prog.name,
          awardLevel: prog.level,
          completions: prog.completions + Math.floor(Math.random() * 50),
        })
      })
    })

    return programs
  }

  private getSampleAdmissionsData(): IPEDSAdmissions[] {
    return [
      {
        unitId: '166027', year: '2024', applicants: 61220, admitted: 2320, enrolled: 1968,
        admissionRate: 3.79, yieldRate: 84.8, satMath25: 750, satMath75: 800,
        satReading25: 730, satReading75: 790, actComposite25: 34, actComposite75: 36, gpaAverage: 4.18
      },
      {
        unitId: '190150', year: '2024', applicants: 56378, admitted: 2075, enrolled: 1736,
        admissionRate: 3.68, yieldRate: 83.7, satMath25: 760, satMath75: 800,
        satReading25: 720, satReading75: 780, actComposite25: 34, actComposite75: 36, gpaAverage: 3.95
      },
      {
        unitId: '164988', year: '2024', applicants: 28426, admitted: 1291, enrolled: 1115,
        admissionRate: 4.54, yieldRate: 86.4, satMath25: 790, satMath75: 800,
        satReading25: 730, satReading75: 780, actComposite25: 35, actComposite75: 36, gpaAverage: 4.17
      },
    ]
  }
}
