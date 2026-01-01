import type { Metadata } from 'next'
import {
  Inter,
  Playfair_Display,
  JetBrains_Mono,
  DM_Sans,
} from 'next/font/google'
import { ThemeProvider } from '@/components/providers'
import './globals.css'
import '../styles/high-contrast-improvements.css'

const inter = Inter({ subsets: ['latin'] })

// Design variant fonts
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

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
      <body
        className={`${inter.className} ${playfair.variable} ${jetbrainsMono.variable} ${dmSans.variable} antialiased`}
      >
        <ThemeProvider enableTransitions={true}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
