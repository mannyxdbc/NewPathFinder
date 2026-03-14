'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="topbar" aria-label="Main navigation">
      <Link href="/" className="topbar-logo" aria-label="ScholarPath home">
        <div className="topbar-logo-dot" />
        ScholarPath
      </Link>
      <div className="topbar-nav" role="list">
        <Link
          href="/programs"
          className={`topbar-btn ${pathname === '/programs' ? 'active' : ''}`}
          aria-current={pathname === '/programs' ? 'page' : undefined}
        >
          Programs
        </Link>
        <div className="topbar-divider" />
        <Link
          href="/compare"
          className={`topbar-btn ${pathname === '/compare' ? 'active' : ''}`}
          aria-current={pathname === '/compare' ? 'page' : undefined}
        >
          Compare
        </Link>
        <div className="topbar-divider" />
        <Link
          href="/about"
          className={`topbar-btn ${pathname === '/about' ? 'active' : ''}`}
          aria-current={pathname === '/about' ? 'page' : undefined}
        >
          About
        </Link>
      </div>
    </nav>
  )
}
