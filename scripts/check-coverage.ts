#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCoverage() {
  // Total programs
  const { count: totalPrograms } = await supabase.from('programs').select('*', { count: 'exact', head: true })
  console.log('📊 DATABASE COVERAGE\n')
  console.log('Total programs:', totalPrograms)

  // Canadian schools
  const { data: canadianSchools } = await supabase.from('schools').select('name, state_province, country').eq('country', 'CA')
  console.log('\n🍁 Canadian schools:', canadianSchools?.length)
  canadianSchools?.forEach(s => console.log('  -', s.name, '(' + s.state_province + ')'))

  // Canadian programs by school
  if (canadianSchools && canadianSchools.length > 0) {
    console.log('\n📚 Programs by Canadian school:')
    for (const school of canadianSchools) {
      const { data: schoolData } = await supabase.from('schools').select('id').eq('name', school.name).single()
      if (schoolData) {
        const { count } = await supabase
          .from('programs')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolData.id)
        console.log(`  - ${school.name}: ${count} programs`)
      }
    }

    const { data: schools } = await supabase.from('schools').select('id').eq('country', 'CA')
    const schoolIds = schools?.map(s => s.id) || []
    const { count: canadianPrograms } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .in('school_id', schoolIds)
    console.log('\n✅ Total Canadian programs:', canadianPrograms)
  }

  // US programs for comparison
  const { data: usSchools } = await supabase.from('schools').select('id').eq('country', 'US')
  if (usSchools && usSchools.length > 0) {
    const { count: usPrograms } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .in('school_id', usSchools.map(s => s.id))
    console.log('\n🇺🇸 Total US programs:', usPrograms)
  }
}

checkCoverage()
