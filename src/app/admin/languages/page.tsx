import type { Metadata } from 'next'
import { LanguagesEditor } from './LanguagesEditor'

export const metadata: Metadata = {
  title: 'Languages | Admin',
  description: 'Manage your language proficiencies',
}

export default function LanguagesPage() {
  return <LanguagesEditor />
}
