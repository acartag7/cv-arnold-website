import type { Metadata } from 'next'
import { HeroStatsEditor } from './HeroStatsEditor'

export const metadata: Metadata = {
  title: 'Hero Stats | Admin',
  description: 'Manage homepage hero statistics',
}

export default function HeroStatsPage() {
  return <HeroStatsEditor />
}
