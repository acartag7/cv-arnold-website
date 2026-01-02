import type { Metadata } from 'next'
import { SiteConfigEditor } from './SiteConfigEditor'

export const metadata: Metadata = {
  title: 'Site Config | Admin',
  description: 'Configure site branding, navigation, and SEO',
}

export default function SiteConfigPage() {
  return <SiteConfigEditor />
}
