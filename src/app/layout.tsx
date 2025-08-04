import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers'
import './globals.css'
import '../styles/high-contrast-improvements.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arnold Cartagena - Platform Engineering Lead',
  description:
    'Experienced Platform Engineering Lead specializing in cloud automation, cost optimization, and team leadership. Expert in Kubernetes, Infrastructure as Code, and modern platform practices.',
  keywords: [
    'Platform Engineering',
    'Kubernetes',
    'Cloud Architecture',
    'DevOps',
    'Infrastructure as Code',
    'Team Leadership',
  ],
  authors: [{ name: 'Arnold Cartagena' }],
  openGraph: {
    title: 'Arnold Cartagena - Platform Engineering Lead',
    description:
      'Expert Platform Engineering Lead with proven track record in cost optimization and team leadership',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider enableTransitions={true}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
