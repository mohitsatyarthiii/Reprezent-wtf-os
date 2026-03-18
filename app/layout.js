import { Geist, Geist_Mono } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata = {
  title: 'Reprezent OS - Agency Operating System',
  description: 'Creator campaign management platform',
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '16x16',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '48x48',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '64x64',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '128x128',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '256x256',
      },
    ],
    shortcut: '/logo.png',
    apple: [
      {
        url: '/logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export default async function RootLayout({ children }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Multiple favicon sizes for different devices */}
        <link rel="icon" type="image/png" sizes="16x16" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/logo.png" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        
        {/* Shortcut icon */}
        <link rel="shortcut icon" href="/logo.png" />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen" style={{ 
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-foreground)'
          }}>
          {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}