import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main>
        <div className="profile-wrap">
      <Link href="/" className="back-btn">
        ← Back to Home
      </Link>

      <div className="profile-hdr">
        <div className="profile-logo">SP</div>
        <div className="profile-meta">
          <h1 className="profile-prog-name">About ScholarPath</h1>
          <div className="profile-pills">
            <span className="ppill accent">MVP Stage</span>
            <span className="ppill">US + Canada</span>
          </div>
        </div>
      </div>

      <div className="description-box">
        <p className="description-text">
          ScholarPath exists to solve a frustrating problem: researching graduate programs is broken.
          School websites are inconsistent, critical information is buried, and comparing programs
          side-by-side is nearly impossible. We're building a centralized platform with standardized data,
          verified freshness indicators, and honest transparency to help working professionals find their
          perfect graduate program.
        </p>
      </div>

      <div className="section-grid">
        <div className="data-section">
          <div className="data-section-title">The Problem</div>
          <div className="highlights-box">
            <div className="highlight-item">
              <span className="highlight-icon">✗</span>
              <span className="highlight-text">School websites use inconsistent information architecture</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✗</span>
              <span className="highlight-text">Tuition, requirements, and deadlines are buried 5+ clicks deep</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✗</span>
              <span className="highlight-text">No way to compare programs side by side</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✗</span>
              <span className="highlight-text">Working professionals waste hours navigating terrible UX</span>
            </div>
          </div>
        </div>

        <div className="data-section">
          <div className="data-section-title">Our Solution</div>
          <div className="highlights-box">
            <div className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">
                <strong>Standardized Data:</strong> Every program uses identical fields
              </span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">
                <strong>Verified Freshness:</strong> Every field shows when it was last verified
              </span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">
                <strong>Side-by-Side Comparison:</strong> Compare programs instantly
              </span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">
                <strong>Direct Contacts:</strong> Access to program advisors
              </span>
            </div>
            <div className="highlight-item">
              <span className="highlight-icon">✓</span>
              <span className="highlight-text">
                <strong>Community Driven:</strong> User flagging and discussion boards (coming soon)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="advisor-card">
        <div className="advisor-left">
          <div className="advisor-name">Want to Get Involved?</div>
          <div className="advisor-role">We're actively building ScholarPath</div>
          <div className="advisor-contact">
            <div className="advisor-phone">
              Current coverage: US + Canada graduate programs
            </div>
          </div>
        </div>
        <Link href="/programs" className="advisor-link">
          Browse Programs →
        </Link>
      </div>
        </div>
      </main>
    </>
  )
}
