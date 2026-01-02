import type { Metadata } from 'next'
import { SectionTitlesEditor } from './SectionTitlesEditor'

export const metadata: Metadata = {
  title: 'Section Titles | Admin',
  description: 'Customize terminal-style section titles',
}

export default function SectionTitlesPage() {
  return <SectionTitlesEditor />
}
