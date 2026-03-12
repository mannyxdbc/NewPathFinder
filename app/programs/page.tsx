'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function ProgramsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [compareList, setCompareList] = useState<string[]>([])

  useEffect(() => {
    async function fetchPrograms() {
      const supabase = createClient()

      let queryBuilder = supabase
        .from('programs')
        .select(`
          *,
          schools (name, city, state_province, country),
          tuition (total_tuition, currency),
          admission_requirements (gpa_average, gmat_average)
        `)
        .eq('is_published', true)

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
      }

      const { data, error } = await queryBuilder.limit(20)

      if (!error && data) {
        setPrograms(data)
      }
      setLoading(false)
    }

    fetchPrograms()
  }, [query])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'All Programs'}
            </h1>
            <p className="text-gray-600">
              Browse graduate programs from top universities
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No programs found</h3>
              <p className="mt-2 text-gray-600">
                {query ? `No programs match "${query}". Try a different search.` : 'No programs available yet. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {programs.map((program) => (
                <div key={program.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {program.name}
                      </h3>
                      <p className="text-gray-600">
                        {program.schools?.name} • {program.schools?.city}, {program.schools?.state_province}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {program.degree_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Format</p>
                      <p className="font-medium text-gray-900 capitalize">{program.format}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900">{program.duration_months} months</p>
                    </div>
                    {program.tuition && (
                      <div>
                        <p className="text-sm text-gray-500">Tuition</p>
                        <p className="font-medium text-gray-900">
                          ${program.tuition.total_tuition?.toLocaleString()} {program.tuition.currency}
                        </p>
                      </div>
                    )}
                    {program.admission_requirements?.gpa_average && (
                      <div>
                        <p className="text-sm text-gray-500">Avg GPA</p>
                        <p className="font-medium text-gray-900">{program.admission_requirements.gpa_average}</p>
                      </div>
                    )}
                  </div>

                  {program.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/programs/${program.slug}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm inline-block"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => {
                        const newList = compareList.includes(program.id)
                          ? compareList.filter(id => id !== program.id)
                          : [...compareList, program.id]
                        setCompareList(newList)
                        if (newList.length > 0) {
                          localStorage.setItem('compareList', JSON.stringify(newList))
                        }
                      }}
                      className={`px-4 py-2 border rounded-lg transition font-medium text-sm ${
                        compareList.includes(program.id)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {compareList.includes(program.id) ? '✓ Added' : 'Compare'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-indigo-600 text-white shadow-lg z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold">{compareList.length} program(s) selected</span>
                <button
                  onClick={() => setCompareList([])}
                  className="text-sm underline hover:no-underline"
                >
                  Clear all
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push(`/compare?programs=${compareList.join(',')}`)}
                  className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Compare Programs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
