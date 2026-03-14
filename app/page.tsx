import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />

      <main>
        {/* Hero Section */}
        <div className="hero-wrap">
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-tag">
              <span>●</span> Graduate Program Research — US & Canada
            </div>
            <h1 className="hero-h1">
              Research grad programs<br />
              without the <em>noise.</em>
            </h1>
            <p className="hero-sub">
              ScholarPath centralises tuition, admissions data, deadlines, and advisor contacts for graduate programs across the US and Canada — so you can compare programs in minutes, not hours.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-n">196</div>
                <div className="hero-stat-l">Programs</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-n">43</div>
                <div className="hero-stat-l">Schools</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-n">3</div>
                <div className="hero-stat-l">Programs compared at once</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-n">US+CA</div>
                <div className="hero-stat-l">Geography</div>
              </div>
            </div>
            <div className="hero-actions">
              <Link href="/programs" className="btn-primary">
                Browse Programs →
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See how it works
              </a>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="how-strip" id="how-it-works">
          <div className="how-inner">
            <div className="how-title">How ScholarPath Works</div>
            <div className="how-steps">
              <div className="how-step">
                <div className="how-step-n">01</div>
                <div className="how-step-t">Search & Filter</div>
                <div className="how-step-d">Filter by degree, format, location, tuition, and GMAT requirement in seconds.</div>
              </div>
              <div className="how-step">
                <div className="how-step-n">02</div>
                <div className="how-step-t">Read Profiles</div>
                <div className="how-step-d">Every program has the same standardised fields — no more hunting through school websites.</div>
              </div>
              <div className="how-step">
                <div className="how-step-n">03</div>
                <div className="how-step-t">Compare Side-by-Side</div>
                <div className="how-step-d">Select up to 3 programs and compare every field in a structured table.</div>
              </div>
              <div className="how-step">
                <div className="how-step-n">04</div>
                <div className="how-step-t">Save & Decide</div>
                <div className="how-step-d">Save programs to your list. Make informed decisions with comprehensive data.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
