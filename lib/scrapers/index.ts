import { StanfordScraper } from './stanford-scraper'
import { ProgramData } from './base-scraper'
import { createClient } from '@/lib/supabase/client'

export async function runAllScrapers(): Promise<ProgramData[]> {
  const allPrograms: ProgramData[] = []

  const scrapers = [
    new StanfordScraper(),
    // Add more scrapers here as you build them
  ]

  for (const scraper of scrapers) {
    try {
      const programs = await scraper.scrapePrograms()
      allPrograms.push(...programs)
    } catch (error) {
      console.error(`Scraper failed:`, error)
    }
  }

  return allPrograms
}

export async function importProgramsToDatabase(programs: ProgramData[]) {
  const supabase = createClient()

  for (const program of programs) {
    try {
      // 1. Create or get school
      let { data: school } = await supabase
        .from('schools')
        .select('id')
        .eq('name', program.schoolName)
        .single()

      if (!school) {
        const { data: newSchool } = await supabase
          .from('schools')
          .insert({
            name: program.schoolName,
            slug: program.schoolName.toLowerCase().replace(/\s+/g, '-'),
            country: 'US'
          })
          .select()
          .single()

        school = newSchool
      }

      if (!school) continue

      // 2. Get program level (graduate)
      const { data: level } = await supabase
        .from('program_levels')
        .select('id')
        .eq('name', 'graduate')
        .single()

      if (!level) continue

      // 3. Create program
      const { data: newProgram } = await supabase
        .from('programs')
        .insert({
          school_id: school.id,
          level_id: level.id,
          name: program.programName,
          slug: program.programName.toLowerCase().replace(/\s+/g, '-'),
          description: program.description,
          degree_type: program.degreeType,
          format: program.format,
          duration_months: program.durationMonths,
          admissions_url: program.admissionsUrl,
          data_source: 'scraped',
          is_published: true
        })
        .select()
        .single()

      if (!newProgram) continue

      // 4. Add tuition if available
      if (program.tuition) {
        await supabase.from('tuition').insert({
          program_id: newProgram.id,
          total_tuition: program.tuition,
          currency: program.currency || 'USD'
        })
      }

      // 5. Add admission requirements if available
      if (program.gpaMin || program.gmatAverage) {
        await supabase.from('admission_requirements').insert({
          program_id: newProgram.id,
          gpa_minimum: program.gpaMin,
          gmat_average: program.gmatAverage
        })
      }

      console.log(`✓ Imported: ${program.programName}`)
    } catch (error) {
      console.error(`Failed to import ${program.programName}:`, error)
    }
  }
}
