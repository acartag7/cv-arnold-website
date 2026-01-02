import type { Metadata } from 'next'
import { ExperienceEditor } from './ExperienceEditor'

export const metadata: Metadata = {
  title: 'Experience | Admin',
  description: 'Manage your work experience entries',
}

export default function ExperiencePage() {
  return <ExperienceEditor />
}
