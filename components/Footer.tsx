import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-xl">S</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">ScholarPath</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base max-w-md mb-3 sm:mb-4">
              Graduate program research made simple. Compare MBA and professional master's programs side by side with verified data.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Built for professionals. US + Canada coverage.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition">Browse Programs</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition">Compare</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">About</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/test-db" className="hover:text-white transition">Database Test</Link>
              </li>
              <li>
                <a href="https://github.com/Mannnny/NewPathFinder" className="hover:text-white transition" target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">Support</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            © 2026 ScholarPath. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-white transition whitespace-nowrap">Privacy Policy</a>
            <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-white transition whitespace-nowrap">Terms of Service</a>
            <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-white transition whitespace-nowrap">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
