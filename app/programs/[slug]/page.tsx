import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ProgramDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const supabase = await createClient()
  const { slug } = await params

  // Fetch program with all related data
  const { data: program, error } = await supabase
    .from('programs')
    .select(`
      *,
      schools (
        id,
        name,
        city,
        state_province,
        country,
        website
      ),
      program_levels (
        name,
        description
      ),
      tuition (
        total_tuition,
        semester_1_tuition,
        semester_2_tuition,
        fees_per_semester,
        currency,
        academic_year
      ),
      admission_requirements (
        gpa_minimum,
        gpa_average,
        gmat_gre_required,
        gmat_average,
        gre_average,
        work_exp_years_min,
        work_exp_years_avg,
        lor_count,
        lor_notes,
        sop_required,
        sop_word_limit,
        english_test_required,
        english_test_types,
        english_min_score,
        other_requirements
      ),
      program_advisors (
        name,
        title,
        email,
        phone
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !program) {
    notFound()
  }

  // Handle tuition data (could be array or single object)
  const tuitionData = Array.isArray(program.tuition) ? program.tuition[0] : program.tuition
  const admissionReqs = Array.isArray(program.admission_requirements)
    ? program.admission_requirements[0]
    : program.admission_requirements
  const advisors = Array.isArray(program.program_advisors)
    ? program.program_advisors
    : program.program_advisors ? [program.program_advisors] : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/programs" className="hover:text-indigo-600">Programs</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{program.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
                {program.degree_type} • {program.program_levels.name}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{program.name}</h1>
              <div className="flex items-center gap-6 text-lg">
                <span className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {program.schools.name}
                </span>
                <span className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {program.schools.city}, {program.schools.state_province}
                </span>
              </div>
            </div>
            {tuitionData?.total_tuition && (
              <div className="hidden lg:block text-right">
                <p className="text-sm opacity-90 mb-1">Tuition</p>
                <p className="text-3xl font-bold">
                  ${tuitionData.total_tuition.toLocaleString()}
                </p>
                <p className="text-sm opacity-75">{tuitionData.currency || 'USD'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Overview */}
            {program.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Program Overview
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{program.description}</p>
              </div>
            )}

            {/* Key Highlights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Key Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {program.duration_months ? `${program.duration_months} months` : 'Varies'}
                    </p>
                    {program.duration_semesters && (
                      <p className="text-sm text-gray-600">{program.duration_semesters} semesters</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Format</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                      {program.format || 'Full-time'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Credit Hours</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {program.credit_hours || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Program Level</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">
                      {program.program_levels.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Program Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Program Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Program Level</p>
                  <p className="font-semibold text-gray-900 capitalize">{program.program_levels.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Format</p>
                  <p className="font-semibold text-gray-900 capitalize">{program.format || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                    {program.duration_semesters && ` (${program.duration_semesters} semesters)`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Credit Hours</p>
                  <p className="font-semibold text-gray-900">{program.credit_hours || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Admission Requirements */}
            {admissionReqs && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admission Requirements
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {admissionReqs.gpa_minimum && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Minimum GPA: {admissionReqs.gpa_minimum}</span>
                      </div>
                    )}
                    {admissionReqs.gpa_average && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Average GPA: {admissionReqs.gpa_average}</span>
                      </div>
                    )}
                    {admissionReqs.gmat_gre_required && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>GMAT/GRE Required</span>
                      </div>
                    )}
                    {admissionReqs.gmat_average && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Average GMAT: {admissionReqs.gmat_average}</span>
                      </div>
                    )}
                    {admissionReqs.gre_average && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Average GRE: {admissionReqs.gre_average}</span>
                      </div>
                    )}
                    {admissionReqs.work_exp_years_min && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Minimum Work Experience: {admissionReqs.work_exp_years_min} years</span>
                      </div>
                    )}
                    {admissionReqs.work_exp_years_avg && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Average Work Experience: {admissionReqs.work_exp_years_avg} years</span>
                      </div>
                    )}
                    {admissionReqs.english_test_required && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>English Test Required: {admissionReqs.english_test_types || 'TOEFL/IELTS'}</span>
                      </div>
                    )}
                    {admissionReqs.english_min_score && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Minimum Score: {admissionReqs.english_min_score}</span>
                      </div>
                    )}
                    {admissionReqs.lor_count && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{admissionReqs.lor_count} Letters of Recommendation</span>
                      </div>
                    )}
                    {admissionReqs.sop_required && (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Statement of Purpose Required{admissionReqs.sop_word_limit && ` (${admissionReqs.sop_word_limit} words)`}</span>
                      </div>
                    )}
                    {admissionReqs.other_requirements && (
                      <div className="col-span-2">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{admissionReqs.other_requirements}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Program Advisors */}
            {advisors && advisors.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Program Advisors
                </h2>
                <div className="space-y-4">
                  {advisors.map((advisor: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-indigo-500 pl-4">
                      <p className="font-semibold text-gray-900">{advisor.name}</p>
                      {advisor.title && <p className="text-sm text-gray-600">{advisor.title}</p>}
                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        {advisor.email && (
                          <a href={`mailto:${advisor.email}`} className="hover:text-indigo-600">
                            📧 {advisor.email}
                          </a>
                        )}
                        {advisor.phone && <span>📞 {advisor.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tuition Card */}
            {tuitionData && (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Tuition & Fees
                </h3>
                <div className="space-y-4">
                  {tuitionData.total_tuition && (
                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-600 mb-1">Total Program Cost</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        ${tuitionData.total_tuition.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{tuitionData.currency || 'USD'}</p>
                    </div>
                  )}
                  {tuitionData.semester_1_tuition && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Semester 1</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${tuitionData.semester_1_tuition.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {tuitionData.semester_2_tuition && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Semester 2</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${tuitionData.semester_2_tuition.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {tuitionData.fees_per_semester && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fees per Semester</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${tuitionData.fees_per_semester.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {tuitionData.academic_year && (
                    <p className="text-xs text-gray-500 pt-2 border-t">
                      Academic Year: {tuitionData.academic_year}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {program.admissions_url && (
                  <a
                    href={program.admissions_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700"
                  >
                    Apply Now
                  </a>
                )}
                {program.schools.website && (
                  <a
                    href={program.schools.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50"
                  >
                    Visit Website
                  </a>
                )}
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50">
                  Save Program
                </button>
                <Link
                  href={`/compare?programs=${program.id}`}
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50"
                >
                  Add to Compare
                </Link>
              </div>
            </div>

            {/* School Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">School Information</h3>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-900">{program.schools.name}</p>
                <p className="text-gray-600">
                  {program.schools.city}, {program.schools.state_province}
                  <br />
                  {program.schools.country === 'CA' ? 'Canada' : program.schools.country}
                </p>
                {program.schools.website && (
                  <a
                    href={program.schools.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Visit School Website →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
