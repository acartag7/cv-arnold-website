import type { Metadata } from 'next'
import { SkillsEditor } from './SkillsEditor'

export const metadata: Metadata = {
  title: 'Skills | Admin',
  description: 'Manage your skill categories and individual skills',
}

export default function SkillsPage() {
  return <SkillsEditor />
}
