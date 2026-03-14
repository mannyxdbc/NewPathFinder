import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
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
    <>
      <Navigation />
      <main>
        <div className="profile-wrap">
          <Link href="/programs" className="back-btn" aria-label="Back to Programs">
            ← Back to Programs
          </Link>

          <div className="verified-banner">
            <span className="verified-icon" aria-hidden="true">✓</span>
            <span className="verified-text">Verified Program</span>
            <span className="freshness-pill" style={{background: '#16653415', color: '#166534', border: '1px solid #16653430'}}>
              <span className="dot" style={{background: '#166534'}} />
              Fresh
            </span>
          </div>

          <div className="profile-hdr">
            <div className="profile-logo">
              {program.schools.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-meta">
              <div className="profile-school-name">{program.schools.name}</div>
              <h1 className="profile-prog-name">{program.name}</h1>
              <div className="profile-pills">
                <span className="ppill">{program.degree_type}</span>
                <span className="ppill">{program.program_levels.name}</span>
                <span className="ppill accent">
                  {program.schools.city}, {program.schools.state_province}
                </span>
                {program.duration_months && (
                  <span className="ppill">{program.duration_months} months</span>
                )}
                {tuitionData?.currency && (
                  <span className="ppill">{tuitionData.currency}</span>
                )}
              </div>
            </div>
            <div className="profile-actions">
              {tuitionData?.total_tuition && (
                <button className="act-btn act-outline" aria-label={`Total tuition: ${tuitionData.total_tuition.toLocaleString()} ${tuitionData.currency || 'USD'}`}>
                  ${tuitionData.total_tuition.toLocaleString()}
                </button>
              )}
              <button className="act-btn act-primary" aria-label="Save program">Save</button>
              <Link href={`/compare?programs=${program.id}`} className="act-btn act-teal" aria-label="Compare this program">
                Compare
              </Link>
            </div>
          </div>

          {program.description && (
            <div className="description-box">
              <p className="description-text">{program.description}</p>
            </div>
          )}

          <div className="highlights-box">
            <div className="data-section-title">Program Highlights</div>
            <div className="highlight-item">
              <span className="highlight-icon">📚</span>
              <span className="highlight-text">
                <strong>Duration:</strong> {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                {program.duration_semesters && ` (${program.duration_semesters} semesters)`}
              </span>
            </div>
            {program.format && (
              <div className="highlight-item">
                <span className="highlight-icon">💻</span>
                <span className="highlight-text">
                  <strong>Format:</strong> {program.format}
                </span>
              </div>
            )}
            {program.credit_hours && (
              <div className="highlight-item">
                <span className="highlight-icon">🎓</span>
                <span className="highlight-text">
                  <strong>Credit Hours:</strong> {program.credit_hours}
                </span>
              </div>
            )}
            {tuitionData?.total_tuition && (
              <div className="highlight-item">
                <span className="highlight-icon">💰</span>
                <span className="highlight-text">
                  <strong>Total Tuition:</strong> ${tuitionData.total_tuition.toLocaleString()} {tuitionData.currency || 'USD'}
                </span>
              </div>
            )}
          </div>

          <div className="section-grid">
            <div className="data-section">
              <div className="data-section-title">Program Basics</div>
              <div className="data-row">
                <span className="dk">Duration</span>
                <span className="dv">
                  {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                </span>
              </div>
              <div className="data-row">
                <span className="dk">Semesters</span>
                <span className="dv">{program.duration_semesters || 'N/A'}</span>
              </div>
              <div className="data-row">
                <span className="dk">Format</span>
                <span className="dv">{program.format || 'N/A'}</span>
              </div>
              <div className="data-row">
                <span className="dk">Credit Hours</span>
                <span className="dv">{program.credit_hours || 'N/A'}</span>
              </div>
            </div>

            {tuitionData && (
              <div className="data-section">
                <div className="data-section-title">Tuition & Fees</div>
                {tuitionData.total_tuition && (
                  <div className="data-row">
                    <span className="dk">Total Cost</span>
                    <span className="dv accent">
                      ${tuitionData.total_tuition.toLocaleString()} {tuitionData.currency || 'USD'}
                    </span>
                  </div>
                )}
                {tuitionData.semester_1_tuition && (
                  <div className="data-row">
                    <span className="dk">Semester 1</span>
                    <span className="dv">${tuitionData.semester_1_tuition.toLocaleString()}</span>
                  </div>
                )}
                {tuitionData.semester_2_tuition && (
                  <div className="data-row">
                    <span className="dk">Semester 2</span>
                    <span className="dv">${tuitionData.semester_2_tuition.toLocaleString()}</span>
                  </div>
                )}
                {tuitionData.fees_per_semester && (
                  <div className="data-row">
                    <span className="dk">Fees/Semester</span>
                    <span className="dv">${tuitionData.fees_per_semester.toLocaleString()}</span>
                  </div>
                )}
                {tuitionData.academic_year && (
                  <div className="data-row">
                    <span className="dk">Academic Year</span>
                    <span className="dv">{tuitionData.academic_year}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="section-grid">
            {admissionReqs && (
              <div className="data-section">
                <div className="data-section-title">Admission Stats</div>
                {admissionReqs.gpa_average && (
                  <div className="data-row">
                    <span className="dk">Average GPA</span>
                    <span className="dv">{admissionReqs.gpa_average}</span>
                  </div>
                )}
                {admissionReqs.gmat_average && (
                  <div className="data-row">
                    <span className="dk">Average GMAT</span>
                    <span className="dv">{admissionReqs.gmat_average}</span>
                  </div>
                )}
                {admissionReqs.gre_average && (
                  <div className="data-row">
                    <span className="dk">Average GRE</span>
                    <span className="dv">{admissionReqs.gre_average}</span>
                  </div>
                )}
                {admissionReqs.work_exp_years_avg && (
                  <div className="data-row">
                    <span className="dk">Avg Work Experience</span>
                    <span className="dv">{admissionReqs.work_exp_years_avg} years</span>
                  </div>
                )}
              </div>
            )}

            {admissionReqs && (
              <div className="data-section">
                <div className="data-section-title">Application Requirements</div>
                {admissionReqs.gpa_minimum && (
                  <div className="data-row">
                    <span className="dk">Minimum GPA</span>
                    <span className="dv">{admissionReqs.gpa_minimum}</span>
                  </div>
                )}
                {admissionReqs.gmat_gre_required && (
                  <div className="data-row">
                    <span className="dk">GMAT/GRE</span>
                    <span className="dv">Required</span>
                  </div>
                )}
                {admissionReqs.work_exp_years_min && (
                  <div className="data-row">
                    <span className="dk">Min Work Exp</span>
                    <span className="dv">{admissionReqs.work_exp_years_min} years</span>
                  </div>
                )}
                {admissionReqs.english_test_required && (
                  <div className="data-row">
                    <span className="dk">English Test</span>
                    <span className="dv">{admissionReqs.english_test_types || 'TOEFL/IELTS'}</span>
                  </div>
                )}
                {admissionReqs.english_min_score && (
                  <div className="data-row">
                    <span className="dk">Min Score</span>
                    <span className="dv">{admissionReqs.english_min_score}</span>
                  </div>
                )}
                {admissionReqs.lor_count && (
                  <div className="data-row">
                    <span className="dk">Letters of Rec</span>
                    <span className="dv">{admissionReqs.lor_count}</span>
                  </div>
                )}
                {admissionReqs.sop_required && (
                  <div className="data-row">
                    <span className="dk">Statement of Purpose</span>
                    <span className="dv">
                      Required{admissionReqs.sop_word_limit && ` (${admissionReqs.sop_word_limit} words)`}
                    </span>
                  </div>
                )}
                {admissionReqs.other_requirements && (
                  <div className="data-row">
                    <span className="dk">Other</span>
                    <span className="dv">{admissionReqs.other_requirements}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {advisors && advisors.length > 0 && (
            <>
              <div className="data-section-title" style={{marginTop: '2rem'}}>Admissions Contact</div>
              {advisors.map((advisor: any, idx: number) => (
                <div key={idx} className="advisor-card">
                  <div className="advisor-left">
                    <div className="advisor-name">{advisor.name}</div>
                    <div className="advisor-role">{advisor.title || 'Program Advisor'}</div>
                    <div className="advisor-contact">
                      {advisor.email && (
                        <a href={`mailto:${advisor.email}`} className="advisor-email" aria-label={`Email ${advisor.name}`}>
                          {advisor.email}
                        </a>
                      )}
                      {advisor.phone && <div className="advisor-phone">{advisor.phone}</div>}
                    </div>
                  </div>
                  {program.admissions_url && (
                    <a
                      href={program.admissions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="advisor-link"
                      aria-label="Apply to this program"
                    >
                      Apply Now →
                    </a>
                  )}
                </div>
              ))}
            </>
          )}

          {program.schools.website && (
            <div className="advisor-card">
              <div className="advisor-left">
                <div className="advisor-name">School Information</div>
                <div className="advisor-role">{program.schools.name}</div>
                <div className="advisor-contact">
                  <div className="advisor-phone">
                    {program.schools.city}, {program.schools.state_province}
                    {' • '}
                    {program.schools.country === 'CA' ? 'Canada' : program.schools.country}
                  </div>
                </div>
              </div>
              <a
                href={program.schools.website}
                target="_blank"
                rel="noopener noreferrer"
                className="advisor-link"
                aria-label={`Visit ${program.schools.name} website`}
              >
                Visit Website →
              </a>
            </div>
          )}

          <div className="data-section" style={{marginTop: '2rem'}}>
            <div className="data-section-title">Tags</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem'}}>
              {program.degree_type && <span className="ptag">{program.degree_type}</span>}
              {program.program_levels?.name && <span className="ptag">{program.program_levels.name}</span>}
              {program.format && <span className="ptag">{program.format}</span>}
              {program.schools.country && (
                <span className="ptag">
                  {program.schools.country === 'CA' ? 'Canada' : program.schools.country}
                </span>
              )}
              {program.schools.state_province && (
                <span className="ptag">{program.schools.state_province}</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
