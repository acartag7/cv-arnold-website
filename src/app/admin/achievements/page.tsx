import type { Metadata } from 'next'
import { AchievementsEditor } from './AchievementsEditor'

export const metadata: Metadata = {
  title: 'Achievements | Admin',
  description: 'Manage your professional achievements and accolades',
}

export default function AchievementsPage() {
  return <AchievementsEditor />
}
