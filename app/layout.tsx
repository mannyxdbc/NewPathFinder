import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ScholarPath - Graduate Program Research Made Simple',
  description: 'Compare MBA and graduate programs side by side. Structured data, verified contacts, and honest freshness indicators.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
