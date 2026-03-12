import { StatCanFetcher } from './statcan-fetcher'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function importCanadianUniversities() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const fetcher = new StatCanFetcher()

  console.log('🍁 Starting Canadian university import...\n')

  // Fetch data
  const universities = await fetcher.fetchUniversityData()

  // Get all program levels
  const { data: levels } = await supabase
    .from('program_levels')
    .select('id, name')

  if (!levels || levels.length === 0) {
    console.error('❌ Program levels not found in database')
    return
  }

  const levelMap = new Map(levels.map(l => [l.name, l.id]))

  let totalImported = 0

  for (const university of universities) {
    console.log(`\n📚 Processing: ${university.name}`)

    // 1. Create or get school
    let { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('name', university.name)
      .single()

    if (!school) {
      const { data: newSchool, error } = await supabase
        .from('schools')
        .insert({
          name: university.name,
          slug: university.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          city: university.city,
          state_province: university.province,
          country: 'CA',
          website: `https://${university.name.toLowerCase().replace(/\s+/g, '')}.ca`
        })
        .select()
        .single()

      if (error) {
        console.error(`  ❌ Error creating school:`, error.message)
        continue
      }

      school = newSchool
      console.log(`  ✓ Created school: ${university.name}`)
    } else {
      console.log(`  ✓ School exists: ${university.name}`)
    }

    // 2. Import programs
    for (const program of university.programs) {
      try {
        // Check if program exists
        const { data: existingProgram } = await supabase
          .from('programs')
          .select('id')
          .eq('school_id', school.id)
          .eq('name', program.name)
          .single()

        if (existingProgram) {
          console.log(`    • ${program.name} (already exists)`)
          continue
        }

        // Determine program level based on degree type
        let programLevel = 'undergraduate'
        const degreeType = program.degreeType.toUpperCase()

        if (degreeType.startsWith('M') || degreeType.includes('MASTER') || degreeType === 'MBA' || degreeType === 'PHD') {
          programLevel = 'graduate'
        } else if (degreeType === 'MBA' || degreeType === 'JD' || degreeType === 'MD') {
          programLevel = 'professional'
        } else if (degreeType === 'DIPLOMA' || degreeType === 'CERTIFICATE') {
          programLevel = 'undergraduate' // Diplomas mapped to undergraduate for now
        }

        const levelId = levelMap.get(programLevel)
        if (!levelId) {
          console.error(`    ❌ Level not found for: ${programLevel}`)
          continue
        }

        // Determine duration based on program type
        let durationMonths = 48 // Default 4 years for undergrad
        if (programLevel === 'graduate') {
          if (degreeType === 'PHD') {
            durationMonths = 60 // 5 years for PhD
          } else {
            durationMonths = 24 // 2 years for Masters
          }
        } else if (degreeType === 'DIPLOMA' || degreeType === 'CERTIFICATE') {
          durationMonths = 12 // 1 year for diploma
        }

        // Create program
        const { data: newProgram, error: programError } = await supabase
          .from('programs')
          .insert({
            school_id: school.id,
            level_id: levelId,
            name: program.name,
            slug: program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: `${program.name} program at ${university.name}, specializing in ${program.field}.`,
            degree_type: program.degreeType,
            format: 'full-time',
            duration_months: durationMonths,
            credit_hours: programLevel === 'graduate' ? 60 : 120,
            data_source: 'scraped',
            is_published: true
          })
          .select()
          .single()

        if (programError) {
          console.error(`    ❌ Error creating program: ${programError.message}`)
          continue
        }

        // Add tuition
        if (program.tuition && newProgram) {
          await supabase.from('tuition').insert({
            program_id: newProgram.id,
            total_tuition: program.tuition,
            currency: 'CAD',
            academic_year: '2024-2025',
            source_url: 'https://www.statcan.gc.ca'
          })
        }

        // Add basic admission requirements
        if (newProgram) {
          await supabase.from('admission_requirements').insert({
            program_id: newProgram.id,
            gpa_minimum: 3.0,
            lor_count: 2,
            sop_required: true
          })
        }

        console.log(`    ✓ ${program.name} - $${program.tuition?.toLocaleString()} CAD`)
        totalImported++

      } catch (error: any) {
        console.error(`    ❌ Error importing program:`, error.message)
      }
    }
  }

  console.log(`\n✅ Import complete! Imported ${totalImported} programs from ${universities.length} universities`)
}
