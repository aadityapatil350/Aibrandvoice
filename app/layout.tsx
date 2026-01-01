import './globals.css'
import type { Metadata } from 'next'
import AuthStateHandler from '@/components/auth/AuthStateHandler'

export const metadata: Metadata = {
  title: 'BrandVoice AI',
  description: 'AI-powered brand voice platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthStateHandler />
        {children}
      </body>
    </html>
  )
}
