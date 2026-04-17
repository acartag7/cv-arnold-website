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

const SITE_URL = 'https://cv.arnoldcartagena.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Arnold Cartagena - Production AI Agents & Edictum',
  description:
    'Senior platform engineer building production AI agents, Edictum runtime governance, and internal AI factory orchestration for enterprise environments.',
  keywords: [
    'Production AI Agents',
    'Runtime Governance',
    'Tool-Call Safety',
    'AI Infrastructure',
    'Edictum',
    'AI Factory',
    'Workflow Gates',
    'Kafka',
    'Platform Engineering',
  ],
  authors: [{ name: 'Arnold Cartagena', url: SITE_URL }],
  creator: 'Arnold Cartagena',
  alternates: {
    canonical: '/',
    types: {
      'text/plain': [
        { url: '/llms.txt', title: 'LLM summary' },
        { url: '/llms-full.txt', title: 'Full CV (markdown)' },
      ],
    },
  },
  openGraph: {
    title: 'Arnold Cartagena - Production AI Agents & Edictum',
    description:
      'Production AI agents, Edictum runtime governance, and internal AI factory orchestration for enterprise environments.',
    url: SITE_URL,
    siteName: 'Arnold Cartagena',
    type: 'profile',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arnold Cartagena - Production AI Agents & Edictum',
    description:
      'Building Edictum — runtime governance for AI agents. Contracts enforce what tools can do, before they execute.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
    },
  },
}

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Arnold Cartagena',
  alternateName: 'acartag7',
  url: SITE_URL,
  jobTitle: 'Senior Platform Engineer — AI Deployment & Runtime Governance',
  description:
    'Senior Platform Engineer (Tech Lead, Kafka & API Platforms at Swiss Post) shipping AI-enhanced developer workflows at enterprise scale. Creator of Edictum, an open-source runtime governance library for AI agents, and co-author of Mind the GAP (arXiv, Feb 2026) on tool-call safety.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bern',
    addressCountry: 'CH',
  },
  knowsAbout: [
    'AI agent runtime governance',
    'Tool-call safety',
    'LLM agent safety',
    'MCP servers',
    'Platform engineering',
    'Kubernetes',
    'Kafka',
    'Confluent Cloud',
    'Infrastructure as Code',
    'Terraform',
    'AWS',
    'GCP',
    'Azure',
    'DevSecOps',
    'GitOps',
    'Observability',
    'HashiCorp Vault',
  ],
  sameAs: [
    'https://github.com/acartag7',
    'https://linkedin.com/in/arnold-cartagena',
    'https://edictum.ai',
    'https://github.com/edictum-ai/edictum',
    'https://github.com/edictum-ai/edictum-ts',
    'https://github.com/edictum-ai/edictum-go',
    'https://github.com/edictum-ai/edictum-openclaw',
    'https://arxiv.org/abs/2602.16943',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Swiss Post',
    url: 'https://www.post.ch',
  },
  affiliation: {
    '@type': 'Organization',
    name: 'Edictum',
    url: 'https://edictum.ai',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider enableTransitions={true}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
