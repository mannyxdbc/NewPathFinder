#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { CanadaUniversityScraper } from '../lib/scrapers/canada-universities'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('🍁 COMPREHENSIVE CANADIAN UNIVERSITY IMPORT\n')

  try {
    // Scrape all programs
    const scraper = new CanadaUniversityScraper()
    const programs = await scraper.scrapeAll()

    console.log(`\n📥 Importing ${programs.length} programs to database...\n`)

    // Get program levels
    const { data: levels } = await supabase
      .from('program_levels')
      .select('id, name')

    const levelMap = new Map(levels?.map(l => [l.name, l.id]) || [])

    let schoolsCreated = 0
    let programsCreated = 0
    let programsSkipped = 0
    let errors = 0

    // Group by university
    const byUniversity = programs.reduce((acc, p) => {
      if (!acc[p.university]) acc[p.university] = []
      acc[p.university].push(p)
      return acc
    }, {} as Record<string, typeof programs>)

    for (const [universityName, universityPrograms] of Object.entries(byUniversity)) {
      const province = universityPrograms[0].province

      // Check/create school
      let { data: school } = await supabase
        .from('schools')
        .select('id')
        .eq('name', universityName)
        .single()

      if (!school) {
        const cityMap: Record<string, string> = {
          'University of British Columbia': 'Vancouver',
          'Simon Fraser University': 'Burnaby',
          'University of Victoria': 'Victoria',
          'University of Toronto': 'Toronto',
          'University of Waterloo': 'Waterloo',
          'Western University': 'London',
          'Queen\'s University': 'Kingston',
          'McMaster University': 'Hamilton'
        }

        const { data: newSchool, error } = await supabase
          .from('schools')
          .insert({
            name: universityName,
            slug: universityName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            city: cityMap[universityName] || 'Unknown',
            state_province: province,
            country: 'CA'
          })
          .select()
          .single()

        if (!error && newSchool) {
          school = newSchool
          schoolsCreated++
        } else {
          errors++
          continue
        }
      }

      // Import programs
      for (const program of universityPrograms) {
        const levelId = levelMap.get(program.level)
        if (!levelId) continue

        const slug = `${program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${universityName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.substring(0, 200)

        // Check if exists
        const { data: existing } = await supabase
          .from('programs')
          .select('id')
          .eq('slug', slug)
          .single()

        if (existing) {
          programsSkipped++
          continue
        }

        // Create program
        const { error } = await supabase
          .from('programs')
          .insert({
            school_id: school.id,
            level_id: levelId,
            name: program.name.substring(0, 200),
            slug,
            degree_type: program.degreeType,
            format: 'full-time',
            duration_months: program.degreeType === 'PhD' ? 60 : 24,
            credit_hours: program.degreeType === 'PhD' ? 90 : 60,
            is_published: true,
            description: program.description?.substring(0, 500) || `${program.name} at ${universityName}.`,
            admissions_url: program.url
          })

        if (!error) {
          programsCreated++
          process.stdout.write('.')
        } else {
          errors++
          process.stdout.write('x')
        }
      }
      console.log()
    }

    console.log('\n' + '='.repeat(70))
    console.log('\n📊 IMPORT SUMMARY:')
    console.log(`  Schools created: ${schoolsCreated}`)
    console.log(`  Programs created: ${programsCreated}`)
    console.log(`  Programs skipped (already exist): ${programsSkipped}`)
    console.log(`  Errors: ${errors}`)
    console.log('\n✅ Import complete!\n')

  } catch (error: any) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

main()
