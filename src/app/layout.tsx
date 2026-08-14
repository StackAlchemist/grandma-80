import type { Metadata } from 'next'
import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Margaret Olusola Odusoga JP. @ 80',
  description: 'You are cordially invited to a celebration of love, family, and timeless memories.',
  openGraph: {
    title: 'You Have Been Invited',
    description: 'Private Invitation Page',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
      <body className="bg-obsidian text-ivory antialiased">
        {children}
      </body>
    </html>
  )
}
