'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
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
      <>
        <Navigation />
        <main>
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <div className="empty-t">Loading programs...</div>
          </div>
        </main>
      </>
    )
  }

  if (programs.length === 0) {
    return (
      <>
        <Navigation />
        <main>
          <div className="compare-wrap">
            <Link href="/programs" className="back-btn">
              ← Back to Programs
            </Link>
            <div className="compare-intro">
              <h2>Compare Programs</h2>
              <p>No programs selected for comparison</p>
            </div>
            <div className="empty">
              <div className="empty-icon">📊</div>
              <div className="empty-t">No programs selected</div>
              <div className="empty-s">Add programs from the search page to compare them side-by-side</div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main>
        <div className="compare-wrap">
      <Link href="/programs" className="back-btn" aria-label="Back to Programs">
        ← Back to Programs
      </Link>

      <div className="compare-intro">
        <h2>Compare Programs</h2>
        <p>Comparing {programs.length} program{programs.length > 1 ? 's' : ''} side-by-side</p>
      </div>

      <div className="cmp-scroll">
        <table className="cmp-table" role="table" aria-label="Program comparison table">
          <thead>
            <tr>
              <th scope="col">Criteria</th>
              {programs.map((program) => (
                <th key={program.id} scope="col">
                  <div className="cth-school">{program.schools.name}</div>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="cth-name"
                    aria-label={`View ${program.name} details`}
                  >
                    {program.name}
                  </Link>
                  <button
                    className="cmp-rm"
                    aria-label={`Remove ${program.name} from comparison`}
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="cmp-section-row">
              <td colSpan={programs.length + 1}>BASICS</td>
            </tr>

            <tr>
              <td>Degree Type</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">{program.degree_type || 'N/A'}</span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Program Level</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">{program.program_levels?.name || 'N/A'}</span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Location</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">
                    {program.schools.city}, {program.schools.state_province}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Duration</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">
                    {program.duration_months ? `${program.duration_months} months` : 'N/A'}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Format</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">{program.format || 'N/A'}</span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Credit Hours</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="cmp-val">{program.credit_hours || 'N/A'}</span>
                </td>
              ))}
            </tr>

            <tr className="cmp-section-row">
              <td colSpan={programs.length + 1}>TUITION</td>
            </tr>

            <tr>
              <td>Total Tuition</td>
              {programs.map((program) => {
                const tuition = Array.isArray(program.tuition) ? program.tuition[0] : program.tuition
                const allTuitions = programs
                  .map(p => (Array.isArray(p.tuition) ? p.tuition[0] : p.tuition)?.total_tuition)
                  .filter(Boolean)
                const minTuition = allTuitions.length > 0 ? Math.min(...allTuitions) : null
                const isBest = tuition?.total_tuition === minTuition && minTuition !== null

                return (
                  <td key={program.id}>
                    {tuition?.total_tuition ? (
                      <span className={`cmp-val ${isBest ? 'best' : ''}`}>
                        ${tuition.total_tuition.toLocaleString()} {tuition.currency || 'USD'}
                      </span>
                    ) : (
                      <span className="cmp-val">N/A</span>
                    )}
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Currency</td>
              {programs.map((program) => {
                const tuition = Array.isArray(program.tuition) ? program.tuition[0] : program.tuition
                return (
                  <td key={program.id}>
                    <span className="cmp-val">{tuition?.currency || 'USD'}</span>
                  </td>
                )
              })}
            </tr>

            <tr className="cmp-section-row">
              <td colSpan={programs.length + 1}>ADMISSIONS</td>
            </tr>

            <tr>
              <td>Average GPA</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                const allGPAs = programs
                  .map(p => {
                    const r = Array.isArray(p.admission_requirements) ? p.admission_requirements[0] : p.admission_requirements
                    return r?.gpa_average
                  })
                  .filter(Boolean)
                const maxGPA = allGPAs.length > 0 ? Math.max(...allGPAs) : null
                const isBest = reqs?.gpa_average === maxGPA && maxGPA !== null

                return (
                  <td key={program.id}>
                    <span className={`cmp-val ${isBest ? 'best' : ''}`}>
                      {reqs?.gpa_average || 'N/A'}
                    </span>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Minimum GPA</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">{reqs?.gpa_minimum || 'N/A'}</span>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Average GMAT</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">{reqs?.gmat_average || 'N/A'}</span>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Average GRE</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">{reqs?.gre_average || 'N/A'}</span>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Work Experience (Avg)</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">
                      {reqs?.work_exp_years_avg ? `${reqs.work_exp_years_avg} years` : 'N/A'}
                    </span>
                  </td>
                )
              })}
            </tr>

            <tr className="cmp-section-row">
              <td colSpan={programs.length + 1}>APPLICATION</td>
            </tr>

            <tr>
              <td>GMAT/GRE Required</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    {reqs?.gmat_gre_required ? (
                      <span className="cmp-badge amber">Required</span>
                    ) : (
                      <span className="cmp-val">Not Required</span>
                    )}
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Letters of Rec</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">{reqs?.lor_count || 'N/A'}</span>
                  </td>
                )
              })}
            </tr>

            <tr>
              <td>Work Experience (Min)</td>
              {programs.map((program) => {
                const reqs = Array.isArray(program.admission_requirements)
                  ? program.admission_requirements[0]
                  : program.admission_requirements
                return (
                  <td key={program.id}>
                    <span className="cmp-val">
                      {reqs?.work_exp_years_min ? `${reqs.work_exp_years_min} years` : 'N/A'}
                    </span>
                  </td>
                )
              })}
            </tr>

            <tr className="cmp-section-row">
              <td colSpan={programs.length + 1}>DATA</td>
            </tr>

            <tr>
              <td>Freshness</td>
              {programs.map((program) => (
                <td key={program.id}>
                  <span className="freshness-pill" style={{background: '#16653415', color: '#166534', border: '1px solid #16653430'}}>
                    <span className="dot" style={{background: '#166534'}} />
                    Fresh
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td>School Website</td>
              {programs.map((program) => (
                <td key={program.id}>
                  {program.schools.website ? (
                    <a
                      href={program.schools.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cmp-val"
                      style={{color: 'var(--accent)'}}
                      aria-label={`Visit ${program.schools.name} website`}
                    >
                      Visit →
                    </a>
                  ) : (
                    <span className="cmp-val">N/A</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{textAlign: 'center', marginTop: '2rem'}}>
        <Link href="/programs" className="btn-primary">
          Browse More Programs
        </Link>
      </div>
        </div>
      </main>
    </>
  )
}
