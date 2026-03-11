import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About ScholarPath</h1>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              ScholarPath exists to solve a frustrating problem: researching graduate programs is broken.
              School websites are inconsistent, critical information is buried, and comparing programs
              side-by-side is nearly impossible.
            </p>
            <p className="text-gray-600">
              We're building a centralized platform with standardized data, verified freshness indicators,
              and honest transparency to help working professionals find their perfect graduate program.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>School websites use inconsistent information architecture</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Tuition, requirements, and deadlines are buried 5+ clicks deep</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>No way to compare programs side by side</span>
              </li>
              <li className="flex gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Working professionals waste hours navigating terrible UX</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Solution</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Standardized Data:</strong> Every program uses identical fields</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Verified Freshness:</strong> Every field shows when it was last verified</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Side-by-Side Comparison:</strong> Compare programs instantly</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Direct Contacts:</strong> Access to program advisors (gated behind signup)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Community Driven:</strong> User flagging and discussion boards (coming soon)</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-indigo-600 rounded-lg shadow-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Currently in MVP Stage</h2>
            <p className="text-indigo-100">
              We're actively building ScholarPath. Coverage: US + Canada graduate programs.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
