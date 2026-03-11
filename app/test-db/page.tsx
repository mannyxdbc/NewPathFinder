'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDB() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [programs, setPrograms] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()

        // Test 1: Check connection
        const { data: levels, error: levelError } = await supabase
          .from('program_levels')
          .select('*')

        if (levelError) {
          setError(`Error: ${levelError.message}`)
          setStatus('❌ Database connection failed')
          return
        }

        // Test 2: Fetch sample programs
        const { data: programData, error: programError } = await supabase
          .from('programs')
          .select(`
            *,
            schools (name, city, state_province),
            tuition (total_tuition, currency)
          `)
          .eq('is_published', true)
          .limit(5)

        if (programError) {
          setError(`Error fetching programs: ${programError.message}`)
        } else {
          setPrograms(programData || [])
        }

        setStatus('✅ Database connected successfully!')
      } catch (err: any) {
        setError(err.message)
        setStatus('❌ Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Database Connection Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Connection Status:</h2>
          <p className="text-lg text-gray-700">{status}</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>Error Details:</strong> {error}
            </div>
          )}
        </div>

        {programs.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Sample Programs ({programs.length} found):
            </h2>
            <div className="space-y-4">
              {programs.map((program: any) => (
                <div key={program.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">{program.name}</h3>
                  <p className="text-sm text-gray-600">
                    {program.schools?.name} • {program.schools?.city}, {program.schools?.state_province}
                  </p>
                  <p className="text-sm text-gray-600">
                    Format: {program.format} • Degree: {program.degree_type}
                  </p>
                  {program.tuition && (
                    <p className="text-sm font-semibold text-indigo-600">
                      Tuition: ${program.tuition.total_tuition?.toLocaleString()} {program.tuition.currency}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {programs.length === 0 && !error && status.includes('✅') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              No Programs Found
            </h2>
            <p className="text-yellow-800">
              The database is connected, but no published programs were found.
              This is normal if you just ran the schema - it includes 1 sample Stanford MBA program.
            </p>
            <p className="text-yellow-800 mt-2">
              Check that:
            </p>
            <ol className="list-decimal ml-6 mt-2 text-yellow-800">
              <li>You ran the complete SQL schema in Supabase SQL Editor</li>
              <li>The sample data at the end of the schema was included</li>
              <li>The program's <code>is_published</code> field is set to <code>true</code></li>
            </ol>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
