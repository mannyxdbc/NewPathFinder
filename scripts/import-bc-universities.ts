#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { BCUniversityScraper } from '../lib/scrapers/bc-universities'
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
  console.log('🌲 Importing BC University Programs\n')
  console.log('=' .repeat(60))

  try {
    // Scrape programs
    const scraper = new BCUniversityScraper()
    const programs = await scraper.scrapeAll()

    console.log(`\n${'='.repeat(60)}`)
    console.log(`\n📊 Processing ${programs.length} programs...\n`)

    // Get program levels
    const { data: levels } = await supabase
      .from('program_levels')
      .select('id, name')

    if (!levels || levels.length === 0) {
      console.error('❌ Program levels not found in database')
      return
    }

    const levelMap = new Map(levels.map(l => [l.name, l.id]))

    let schoolsCreated = 0
    let programsCreated = 0
    let errors = 0

    // Group by university
    const programsByUniversity = programs.reduce((acc, program) => {
      if (!acc[program.university]) {
        acc[program.university] = []
      }
      acc[program.university].push(program)
      return acc
    }, {} as Record<string, typeof programs>)

    // Process each university
    for (const [universityName, universityPrograms] of Object.entries(programsByUniversity)) {
      console.log(`\n📚 ${universityName}`)

      // Check if school exists
      let { data: school } = await supabase
        .from('schools')
        .select('id')
        .eq('name', universityName)
        .single()

      if (!school) {
        // Create school
        const city = universityName.includes('British Columbia') ? 'Vancouver' :
                     universityName.includes('Simon Fraser') ? 'Burnaby' :
                     universityName.includes('Victoria') ? 'Victoria' : 'Vancouver'

        const { data: newSchool, error } = await supabase
          .from('schools')
          .insert({
            name: universityName,
            slug: universityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            city: city,
            state_province: 'BC',
            country: 'CA',
            website: `https://www.${universityName.toLowerCase().replace(/[^a-z]/g, '')}.ca`
          })
          .select()
          .single()

        if (error || !newSchool) {
          console.error(`  ✗ Error creating school: ${error?.message}`)
          errors++
          continue
        }

        school = newSchool
        schoolsCreated++
        console.log(`  ✓ Created school`)
      } else {
        console.log(`  ✓ School exists`)
      }

      // Import programs
      for (const program of universityPrograms) {
        try {
          const levelId = levelMap.get(program.level)
          if (!levelId) {
            continue
          }

          const slug = `${program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${universityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

          // Check if program exists
          const { data: existingProgram } = await supabase
            .from('programs')
            .select('id')
            .eq('slug', slug)
            .single()

          if (existingProgram) {
            continue
          }

          // Create program
          const { data: newProgram, error: programError } = await supabase
            .from('programs')
            .insert({
              school_id: school.id,
              level_id: levelId,
              name: program.name,
              slug: slug,
              degree_type: program.degreeType,
              format: 'full-time',
              duration_months: program.degreeType === 'PhD' ? 60 : 24,
              credit_hours: program.degreeType === 'PhD' ? 90 : 60,
              is_published: true,
              description: program.description || `${program.name} program at ${universityName}.`,
              admissions_url: program.url
            })
            .select('id')
            .single()

          if (programError || !newProgram) {
            errors++
            continue
          }

          programsCreated++
          process.stdout.write('.')

        } catch (error: any) {
          errors++
        }
      }

      console.log(`\n  ✓ Programs imported: ${universityPrograms.length}`)
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('\n📊 Import Summary:')
    console.log(`  Schools created: ${schoolsCreated}`)
    console.log(`  Programs created: ${programsCreated}`)
    console.log(`  Errors: ${errors}`)
    console.log('\n✅ BC university import complete!\n')

  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

main()
