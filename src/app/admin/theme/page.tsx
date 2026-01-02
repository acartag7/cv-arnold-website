import type { Metadata } from 'next'
import { ThemeEditor } from './ThemeEditor'

export const metadata: Metadata = {
  title: 'Theme | Admin',
  description: 'Customize your CV theme and color palette',
}

export default function ThemePage() {
  return <ThemeEditor />
}
