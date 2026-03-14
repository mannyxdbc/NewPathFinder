#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { StatCanCSVFetcher } from '../lib/api/statcan-csv-fetcher'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🇨🇦 Importing Canadian University Data from Statistics Canada CSV\n')

  try {
    // Fetch data from CSV files
    const fetcher = new StatCanCSVFetcher()
    const universities = await fetcher.fetchUniversityData()

    console.log(`\n📊 Processing ${universities.length} universities...\n`)

    let schoolsCreated = 0
    let programsCreated = 0
    let errors = 0

    for (const university of universities) {
      try {
        // 1. Check if school already exists
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('id')
          .eq('name', university.name)
          .eq('country', 'CA')
          .single()

        let schoolId: string

        if (existingSchool) {
          console.log(`✓ School exists: ${university.name}`)
          schoolId = existingSchool.id
        } else {
          // 2. Create school
          const { data: newSchool, error: schoolError } = await supabase
            .from('schools')
            .insert({
              name: university.name,
              slug: university.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              city: university.city,
              state_province: university.province,
              country: 'CA',
              website: `https://www.${university.name.toLowerCase().replace(/[^a-z]/g, '')}.ca`
            })
            .select('id')
            .single()

          if (schoolError || !newSchool) {
            console.error(`  ✗ Error creating school ${university.name}:`, schoolError?.message)
            errors++
            continue
          }

          schoolId = newSchool.id
          schoolsCreated++
          console.log(`  ✓ Created: ${university.name}`)
        }

        // 3. Get all program levels once
        const { data: levels } = await supabase
          .from('program_levels')
          .select('id, name')

        if (!levels || levels.length === 0) {
          console.error(`  ✗ Program levels not found in database`)
          errors++
          continue
        }

        const levelMap = new Map(levels.map(l => [l.name, l.id]))

        // 4. Import programs
        for (const program of university.programs) {
          const isGraduate = ['MBA', 'EMBA', 'MEng', 'MCS', 'MM', 'MEd', 'MSc', 'MN', 'PhD'].includes(program.degreeType)
          const programLevel = isGraduate ? 'graduate' : 'undergraduate'
          const levelId = levelMap.get(programLevel)

          if (!levelId) {
            console.error(`    ✗ Missing program level ID for ${program.name} (${programLevel})`)
            continue
          }

          const slug = `${program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${university.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

          // Check if program exists
          const { data: existingProgram } = await supabase
            .from('programs')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existingProgram) {
            continue // Skip existing programs
          }

          // Create program
          const { data: newProgram, error: programError} = await supabase
            .from('programs')
            .insert({
              school_id: schoolId,
              level_id: levelId,
              name: program.name,
              slug: slug,
              degree_type: program.degreeType,
              format: 'full-time',
              duration_months: isGraduate ? 24 : 48,
              credit_hours: isGraduate ? 60 : 120,
              is_published: true,
              description: `${program.name} program at ${university.name}, specializing in ${program.field}.`
            })
            .select('id')
            .single()

          if (programError || !newProgram) {
            console.error(`    ✗ Error creating program ${program.name}:`, programError?.message)
            errors++
            continue
          }

          // Create tuition record
          if (program.tuition) {
            await supabase.from('tuition').insert({
              program_id: newProgram.id,
              total_tuition: program.tuition,
              currency: 'CAD',
              academic_year: '2024-2025'
            })
          }

          programsCreated++
        }

      } catch (error: any) {
        console.error(`  ✗ Error processing ${university.name}:`, error.message)
        errors++
      }
    }

    console.log('\n📊 Import Summary:')
    console.log(`  Schools created: ${schoolsCreated}`)
    console.log(`  Programs created: ${programsCreated}`)
    console.log(`  Errors: ${errors}`)
    console.log('\n✅ Canadian university data import complete!\n')

  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

main()
