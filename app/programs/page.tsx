'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProgramsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [programs, setPrograms] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [compareList, setCompareList] = useState<string[]>([])

  // Filters
  const [query, setQuery] = useState(initialQuery)
  const [country, setCountry] = useState('All Countries')
  const [degreeType, setDegreeType] = useState('All Degrees')
  const [format, setFormat] = useState('All Formats')

  // Infinite scroll
  const [displayCount, setDisplayCount] = useState(50)
  const ITEMS_PER_PAGE = 50

  useEffect(() => {
    async function fetchPrograms() {
      const supabase = createClient()

      // Try full query with relations first; on 500 fall back to programs + schools only
      let data: any[] | null = null
      let error: any = null

      const { data: fullData, error: fullError } = await supabase
        .from('programs')
        .select(`
          *,
          schools (name, city, state_province, country),
          tuition (total_tuition, currency),
          admission_requirements (gpa_average, gmat_average)
        `)
        .eq('is_published', true)

      if (fullError) {
        const is500 = (fullError as any)?.status === 500 || (fullError as any)?.code === '500'
        if (is500) {
          // Fallback: retry without tuition/requirements relations
          const { data: simpleData, error: simpleError } = await supabase
            .from('programs')
            .select('*, schools (name, city, state_province, country)')
            .eq('is_published', true)
          if (!simpleError && simpleData) {
            data = simpleData
            error = null
          } else {
            data = simpleData
            error = simpleError
          }
        } else {
          data = fullData
          error = fullError
        }
      } else {
        data = fullData
        error = null
      }

      if (error) {
        console.error('Error fetching programs:', error)
      }
      if (data && data.length > 0) {
        setPrograms(data)
        setFiltered(data)
      }

      setLoading(false)
    }
    fetchPrograms()
  }, [])

  useEffect(() => {
    let result = programs
    if (query) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.schools?.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.degree_type?.toLowerCase().includes(query.toLowerCase())
      )
    }
    if (country !== 'All Countries') {
      result = result.filter(p => p.schools?.country === country)
    }
    if (degreeType !== 'All Degrees') {
      result = result.filter(p => p.degree_type === degreeType)
    }
    if (format !== 'All Formats') {
      result = result.filter(p => p.format === format)
    }

    setFiltered(result)
    // Reset display count when filters change
    setDisplayCount(50)
  }, [query, country, degreeType, format, programs])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.documentElement.scrollHeight

      // Load more when user is 800px from bottom
      if (scrollPosition >= pageHeight - 800 && displayCount < filtered.length) {
        setDisplayCount(prev => Math.min(prev + ITEMS_PER_PAGE, filtered.length))
      }
    }

    // Throttle scroll events for better performance
    let isScrolling: NodeJS.Timeout
    const throttledScroll = () => {
      clearTimeout(isScrolling)
      isScrolling = setTimeout(handleScroll, 100)
    }

    window.addEventListener('scroll', throttledScroll)
    return () => {
      window.removeEventListener('scroll', throttledScroll)
      clearTimeout(isScrolling)
    }
  }, [displayCount, filtered.length])

  const uniqueCountries = ['All Countries', ...Array.from(new Set(programs.map(p => p.schools?.country).filter(Boolean)))]
  const uniqueDegrees = ['All Degrees', ...Array.from(new Set(programs.map(p => p.degree_type).filter(Boolean)))]
  const uniqueFormats = ['All Formats', ...Array.from(new Set(programs.map(p => p.format).filter(Boolean)))]

  const hasFilters = query || country !== 'All Countries' || degreeType !== 'All Degrees' || format !== 'All Formats'

  const handleCompare = (programId: string) => {
    const newList = compareList.includes(programId)
      ? compareList.filter(id => id !== programId)
      : compareList.length < 3 ? [...compareList, programId] : compareList
    setCompareList(newList)
  }

  const getSchoolInitials = (name: string) => {
    return name?.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() || 'SCH'
  }

  return (
    <>
      <Navigation />

      <main>
        <div className="search-page">
          <div className="search-header">
            <div className="search-title">Graduate Programs</div>
            <div className="search-sub">US & Canada · {filtered.length} of {programs.length} programs</div>
          </div>

          <div className="searchbar">
            <span className="searchbar-icon" aria-hidden="true">🔍</span>
            <input
              type="search"
              placeholder="Search program, school, degree, city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Search programs"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="filter-country" className="filter-lbl">Country</label>
              <select id="filter-country" className="filter-sel" value={country} onChange={(e) => setCountry(e.target.value)}>
                {uniqueCountries.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-degree" className="filter-lbl">Degree</label>
              <select id="filter-degree" className="filter-sel" value={degreeType} onChange={(e) => setDegreeType(e.target.value)}>
                {uniqueDegrees.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="filter-format" className="filter-lbl">Format</label>
              <select id="filter-format" className="filter-sel" value={format} onChange={(e) => setFormat(e.target.value)}>
                {uniqueFormats.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            {hasFilters && (
              <button className="filter-clear" onClick={() => { setQuery(''); setCountry('All Countries'); setDegreeType('All Degrees'); setFormat('All Formats'); }}>
                Clear ×
              </button>
            )}
          </div>

          <div className="results-meta">
            <span>Showing <strong>{Math.min(displayCount, filtered.length)}</strong> of {filtered.length} programs{filtered.length !== programs.length ? ` (${programs.length} total)` : ''}</span>
            {displayCount < filtered.length && (
              <span style={{marginLeft: '1rem', color: 'var(--ink-4)', fontSize: '0.85rem'}}>
                Scroll down to load more...
              </span>
            )}
          </div>

          <div className="results-layout">
            {loading ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <div className="empty-t">Loading programs...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📋</div>
                <div className="empty-t">No programs match</div>
                <div className="empty-s">Try adjusting your filters</div>
                <div style={{marginTop: '1rem', fontSize: '0.85rem', color: '#666'}}>
                  (Total programs in database: {programs.length})
                </div>
              </div>
            ) : (
              <ul className="card-list" role="list">
                {filtered.slice(0, displayCount).map((program) => {
                  const tuition = Array.isArray(program.tuition) ? program.tuition[0] : program.tuition
                  const admReqs = Array.isArray(program.admission_requirements) ? program.admission_requirements[0] : program.admission_requirements
                  const isCompared = compareList.includes(program.id)

                  return (
                    <li
                      key={program.id}
                      className={`pcard ${isCompared ? 'in-compare' : ''}`}
                      onClick={() => router.push(`/programs/${program.slug}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => (e.key === "Enter" || e.key === " ") && router.push(`/programs/${program.slug}`)}
                      aria-label={`View ${program.name} at ${program.schools?.name}`}
                    >
                      <div className="pcard-top">
                        <div className="pcard-logo">{getSchoolInitials(program.schools?.name)}</div>
                        <div className="pcard-info">
                          <div className="pcard-school">
                            {program.schools?.name} · {program.schools?.city}, {program.schools?.state_province} {program.schools?.country === 'Canada' ? '🇨🇦' : ''}
                          </div>
                          <div className="pcard-name">{program.name}</div>
                        </div>
                        <div className="pcard-btns" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`pcard-btn ${isCompared ? 'compared' : ''}`}
                            onClick={() => handleCompare(program.id)}
                            aria-pressed={isCompared}
                            aria-label={isCompared ? `Remove ${program.schools?.name} ${program.degree_type} from comparison` : `Add ${program.schools?.name} ${program.degree_type} to comparison`}
                          >
                            {isCompared ? '✓ Comparing' : '+ Compare'}
                          </button>
                        </div>
                      </div>

                      <div className="pcard-data">
                        <div className="pstat">
                          <div className="pstat-val">{program.degree_type || '—'}</div>
                          <div className="pstat-key">Degree</div>
                        </div>
                        <div className="pstat">
                          <div className="pstat-val">{program.format || '—'}</div>
                          <div className="pstat-key">Format</div>
                        </div>
                        <div className="pstat">
                          <div className="pstat-val">{program.duration_months ? `${Math.round(program.duration_months / 12 * 10) / 10} yr` : '—'}</div>
                          <div className="pstat-key">Duration</div>
                        </div>
                        {tuition?.total_tuition && (
                          <div className="pstat">
                            <div className="pstat-val">${tuition.total_tuition.toLocaleString()}</div>
                            <div className="pstat-key">Total Tuition</div>
                          </div>
                        )}
                        {admReqs?.gpa_average && (
                          <div className="pstat">
                            <div className="pstat-val">{admReqs.gpa_average}</div>
                            <div className="pstat-key">Avg GPA</div>
                          </div>
                        )}
                        {admReqs?.gmat_average && (
                          <div className="pstat">
                            <div className="pstat-val">{admReqs.gmat_average}</div>
                            <div className="pstat-key">Avg GMAT</div>
                          </div>
                        )}
                      </div>

                      <div className="pcard-foot">
                        <div className="pcard-tags">
                          {program.degree_type && <span className="ptag">{program.degree_type}</span>}
                          {program.format && <span className="ptag">{program.format}</span>}
                          {program.schools?.country && <span className="ptag">{program.schools.country}</span>}
                        </div>
                        <span className="freshness-pill" style={{background: '#16653415', color: '#166534', border: '1px solid #16653430'}}>
                          <span className="dot" style={{background: '#166534'}} />
                          Verified
                        </span>
                      </div>
                    </li>
                  )
                })}

                {/* Loading more indicator - inside card list */}
                {!loading && displayCount < filtered.length && (
                  <li style={{listStyle: 'none', textAlign: 'center', padding: '2rem', color: 'var(--ink-4)'}}>
                    <div style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>⏳</div>
                    <div>Loading more programs...</div>
                  </li>
                )}

                {/* End of results indicator - inside card list */}
                {!loading && filtered.length > 0 && displayCount >= filtered.length && (
                  <li style={{listStyle: 'none', textAlign: 'center', padding: '2rem', color: 'var(--ink-4)', borderTop: '1px solid var(--rule)'}}>
                    <div style={{fontSize: '0.9rem'}}>✓ All {filtered.length} programs loaded</div>
                  </li>
                )}
              </ul>
            )}

            {/* Side Panel */}
            <div className="side-panel">
              <div className="panel">
                <div className="panel-head">
                  Compare Tray
                  <span style={{fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--ink-4)'}}>{compareList.length}/3</span>
                </div>
                {[0, 1, 2].map(i => {
                  const prog = programs.find(p => p.id === compareList[i])
                  return prog ? (
                    <div key={i} style={{padding: '0.6rem 0.75rem', borderRadius: 'var(--r)', border: '1px solid var(--teal)', background: 'var(--teal-bg)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <div>
                        <div style={{fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-4)'}}>{prog.schools?.name}</div>
                        <div style={{fontSize: '0.78rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3}}>{prog.name}</div>
                      </div>
                      <button style={{background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer', fontSize: '1rem', padding: '2px'}} onClick={() => handleCompare(prog.id)}>×</button>
                    </div>
                  ) : (
                    <div key={i} style={{padding: '0.6rem 0.75rem', borderRadius: 'var(--r)', border: '1px dashed var(--rule)', marginBottom: '6px', minHeight: '50px', display: 'flex', alignItems: 'center'}}>
                      <span style={{fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-4)'}}>Slot {i + 1} — add a program</span>
                    </div>
                  )
                })}
                <button
                  style={{width: '100%', padding: '0.65rem', borderRadius: 'var(--r)', fontWeight: 600, fontSize: '0.8rem', cursor: compareList.length < 2 ? 'not-allowed' : 'pointer', marginTop: '6px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: compareList.length >= 2 ? 'var(--teal)' : 'var(--paper-3)', color: compareList.length >= 2 ? 'white' : 'var(--ink-4)'}}
                  disabled={compareList.length < 2}
                  onClick={() => router.push(`/compare?programs=${compareList.join(',')}`)}
                >
                  {compareList.length < 2 ? `Need ${2 - compareList.length} more` : `Compare ${compareList.length} Programs →`}
                </button>
              </div>

              <div className="panel" style={{fontSize: '0.75rem', color: 'var(--ink-4)', lineHeight: 1.7}}>
                <div className="panel-head">About the data</div>
                All data is sourced from official school admissions pages and verified manually. Tuition figures reflect published rates — fees may add 5–15%.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
