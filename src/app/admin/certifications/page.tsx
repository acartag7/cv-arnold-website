import type { Metadata } from 'next'
import { CertificationsEditor } from './CertificationsEditor'

export const metadata: Metadata = {
  title: 'Certifications | Admin',
  description: 'Manage your professional certifications',
}

export default function CertificationsPage() {
  return <CertificationsEditor />
}
