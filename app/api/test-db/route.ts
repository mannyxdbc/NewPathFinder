import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key exists:', !!supabaseKey)

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test simple query
  const { data, error } = await supabase
    .from('programs')
    .select('id, name, degree_type, schools(name)')
    .eq('is_published', true)
    .limit(5)

  return NextResponse.json({
    success: !error,
    error: error?.message,
    count: data?.length || 0,
    sample: data?.slice(0, 3),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }
  })
}
