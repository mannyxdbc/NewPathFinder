'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ComparePage() {
  const searchParams = useSearchParams()
  const programIds = searchParams.get('programs')?.split(',') || []
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      if (programIds.length === 0) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('programs')
        .select(`
          *,
          schools (name, city, state_province, country, website),
          program_levels (name),
          tuition (total_tuition, semester_1_tuition, semester_2_tuition, currency),
          admission_requirements (*)
        `)
        .in('id', programIds)

      if (!error && data) {
        setPrograms(data)
      }
      setLoading(false)
    }

    fetchPrograms()
  }, [programIds.join(',')])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      </div>
    )
  }

  if (programs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-xl font-bold text-gray-900">ScholarPath</Link>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Compare Programs</h1>

          <div className="mt-8 bg-white p-12 rounded-lg text-center shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No programs selected for comparison</p>
            <Link
              href="/programs"
              className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Browse Programs
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">ScholarPath</Link>
            <Link href="/programs" className="text-indigo-600 hover:text-indigo-800">
              ← Back to Programs
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Comparing {programs.length} Program{programs.length > 1 ? 's' : ''}
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-sm rounded-lg">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 w-48">
                  Criteria
                </th>
                {programs.map((program) => (
                  <th key={program.id} className="px-6 py-4 text-left">
                    <div>
                      <Link
                        href={`/programs/${program.slug}`}
                        className="text-base font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        {program.name}
                      </Link>
                      <p className="text-sm font-normal text-gray-600 mt-1">
                        {program.schools.name}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Degree Type */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Degree Type</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {program.degree_type}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Location</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700">
                    {program.schools.city}, {program.schools.state_province}
                    <br />
                    <span className="text-sm text-gray-500">
                      {program.schools.country === 'CA' ? 'Canada' : program.schools.country}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Total Tuition */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Total Tuition</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4">
                    {program.tuition ? (
                      <span className="text-lg font-bold text-indigo-600">
                        ${program.tuition.total_tuition?.toLocaleString()} {program.tuition.currency}
                      </span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Duration */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Duration</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700">
                    {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Format */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Format</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700 capitalize">
                    {program.format || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Credit Hours */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Credit Hours</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700">
                    {program.credit_hours || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Minimum GPA */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Minimum GPA</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700">
                    {program.admission_requirements?.gpa_minimum || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* GRE Required */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">GRE Required</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4">
                    {program.admission_requirements?.gre_required ? (
                      <span className="text-green-600">✓ Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* GMAT Required */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">GMAT Required</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4">
                    {program.admission_requirements?.gmat_required ? (
                      <span className="text-green-600">✓ Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Letters of Recommendation */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Letters of Rec.</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4 text-gray-700">
                    {program.admission_requirements?.lor_count || 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Website */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">Website</td>
                {programs.map((program) => (
                  <td key={program.id} className="px-6 py-4">
                    {program.schools.website ? (
                      <a
                        href={program.schools.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Visit →
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/programs"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Browse More Programs
          </Link>
        </div>
      </main>
    </div>
  )
}
