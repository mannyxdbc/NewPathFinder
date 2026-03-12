import { IPEDSFetcher } from './ipeds-fetcher'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function importIPEDSUniversities() {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const fetcher = new IPEDSFetcher()

  console.log('🇺🇸 Starting IPEDS university import...\n')
  console.log('=' .repeat(60))

  try {
    // Fetch all data
    const institutions = await fetcher.fetchInstitutions()
    const tuitionData = await fetcher.fetchTuitionData(institutions.map(i => i.unitId))
    const programsData = await fetcher.fetchCompletionsData(institutions.map(i => i.unitId))
    const admissionsData = await fetcher.fetchAdmissionsData(institutions.map(i => i.unitId))

    // Get program levels
    const { data: levels } = await supabase
      .from('program_levels')
      .select('id, name')

    if (!levels || levels.length === 0) {
      console.error('❌ Program levels not found in database')
      return
    }

    const levelMap = new Map(levels.map(l => [l.name, l.id]))

    let totalSchools = 0
    let totalPrograms = 0

    for (const institution of institutions) {
      console.log(`\n🏛️  Processing: ${institution.name}`)

      // 1. Create or get school
      let { data: school } = await supabase
        .from('schools')
        .select('id')
        .eq('name', institution.name)
        .single()

      if (!school) {
        const { data: newSchool, error } = await supabase
          .from('schools')
          .insert({
            name: institution.name,
            slug: institution.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            city: institution.city,
            state_province: institution.state,
            country: 'US',
            website: institution.website,
            ipeds_unit_id: institution.unitId,
          })
          .select()
          .single()

        if (error) {
          console.error(`  ❌ Error creating school:`, error.message)
          continue
        }

        school = newSchool
        totalSchools++
        console.log(`  ✓ Created school: ${institution.name}`)
      } else {
        console.log(`  ✓ School exists: ${institution.name}`)
      }

      // 2. Get programs for this institution
      const institutionPrograms = programsData.filter(p => p.unitId === institution.unitId)
      const institutionTuition = tuitionData.find(t => t.unitId === institution.unitId)
      const institutionAdmissions = admissionsData.find(a => a.unitId === institution.unitId)

      // 3. Import programs
      for (const program of institutionPrograms) {
        try {
          // Check if program exists
          const { data: existingProgram } = await supabase
            .from('programs')
            .select('id')
            .eq('school_id', school.id)
            .eq('name', program.programName)
            .single()

          if (existingProgram) {
            console.log(`    • ${program.programName} (already exists)`)
            continue
          }

          // Determine program level
          let programLevel = 'graduate'
          if (program.awardLevel.includes('Bachelor')) {
            programLevel = 'undergraduate'
          } else if (program.awardLevel.includes('Doctor') || program.awardLevel.includes('PhD')) {
            programLevel = 'graduate'
          } else if (program.awardLevel.includes('Master')) {
            programLevel = 'graduate'
          }

          const levelId = levelMap.get(programLevel)
          if (!levelId) {
            console.error(`    ❌ Level not found for: ${programLevel}`)
            continue
          }

          // Determine duration and degree type
          let durationMonths = 48 // Default 4 years for undergrad
          let degreeType = program.awardLevel

          if (programLevel === 'graduate') {
            if (program.awardLevel.includes('Doctor') || program.awardLevel.includes('PhD')) {
              durationMonths = 60 // 5 years for PhD
              degreeType = 'PhD'
            } else {
              durationMonths = 24 // 2 years for Masters
              degreeType = 'MS' // Will be overridden by specific degrees

              // Map common programs to degree types
              if (program.programName.includes('Business Administration')) {
                degreeType = 'MBA'
              } else if (program.programName.includes('Engineering')) {
                degreeType = 'MEng'
              } else if (program.programName.includes('Computer Science') || program.programName.includes('Data Science')) {
                degreeType = 'MS'
              }
            }
          } else {
            degreeType = 'BS'
            if (program.programName.includes('Engineering')) {
              degreeType = 'BSE'
            } else if (program.programName.includes('Arts')) {
              degreeType = 'BA'
            }
          }

          // Create program
          const { data: newProgram, error: programError } = await supabase
            .from('programs')
            .insert({
              school_id: school.id,
              level_id: levelId,
              name: program.programName,
              slug: `${institution.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${program.programName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              description: `${program.programName} program at ${institution.name}. ${institution.control} university located in ${institution.city}, ${institution.state}.`,
              degree_type: degreeType,
              format: 'full-time',
              duration_months: durationMonths,
              credit_hours: programLevel === 'graduate' ? 36 : 120,
              data_source: 'ipeds',
              is_published: true,
              cip_code: program.cipCode,
            })
            .select()
            .single()

          if (programError) {
            console.error(`    ❌ Error creating program: ${programError.message}`)
            continue
          }

          // Add tuition if available
          if (institutionTuition && newProgram) {
            // For graduate programs, tuition is typically higher
            const baseTuition = institution.control === 'Public'
              ? institutionTuition.inStateTuition
              : institutionTuition.outOfStateTuition

            // Graduate tuition is usually 1.2-1.5x undergraduate
            const tuitionAmount = programLevel === 'graduate' ? baseTuition * 1.3 : baseTuition

            await supabase.from('tuition').insert({
              program_id: newProgram.id,
              total_tuition: tuitionAmount * (durationMonths / 12), // Total for entire program
              currency: 'USD',
              academic_year: institutionTuition.year,
              source_url: 'https://nces.ed.gov/ipeds',
            })
          }

          // Add basic admission requirements if available
          if (institutionAdmissions && newProgram && programLevel === 'graduate') {
            await supabase.from('admission_requirements').insert({
              program_id: newProgram.id,
              gpa_minimum: 3.0,
              gpa_average: institutionAdmissions.gpaAverage,
              sat_math_average: Math.round((institutionAdmissions.satMath25 + institutionAdmissions.satMath75) / 2),
              sat_reading_average: Math.round((institutionAdmissions.satReading25 + institutionAdmissions.satReading75) / 2),
              act_composite_average: Math.round((institutionAdmissions.actComposite25 + institutionAdmissions.actComposite75) / 2),
              lor_count: 3,
              sop_required: true,
              gre_required: degreeType !== 'MBA', // MBA programs often don't require GRE
              gmat_required: degreeType === 'MBA',
            })
          }

          const tuitionDisplay = institutionTuition
            ? `$${institutionTuition.inStateTuition?.toLocaleString()}/yr`
            : 'N/A'

          console.log(`    ✓ ${program.programName} (${degreeType}) - ${tuitionDisplay}`)
          totalPrograms++

        } catch (error: any) {
          console.error(`    ❌ Error importing program:`, error.message)
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`✅ Import complete!`)
    console.log(`   Created ${totalSchools} new schools`)
    console.log(`   Imported ${totalPrograms} programs from ${institutions.length} universities`)
    console.log(`   Total institutions processed: ${institutions.length}`)

  } catch (error) {
    console.error('\n❌ Import failed:', error)
    throw error
  }
}
