import type { Metadata } from 'next'
import { EducationEditor } from './EducationEditor'

export const metadata: Metadata = {
  title: 'Education | Admin',
  description: 'Manage your educational background',
}

export default function EducationPage() {
  return <EducationEditor />
}
