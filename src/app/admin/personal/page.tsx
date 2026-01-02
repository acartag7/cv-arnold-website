import { Metadata } from 'next'
import { PersonalInfoEditor } from './PersonalInfoEditor'

export const metadata: Metadata = {
  title: 'Personal Info | Admin',
  description: 'Edit your personal information and profile details',
}

/**
 * Personal Information Editor Page
 *
 * Server component wrapper for the Personal Info editor.
 * The actual form is rendered client-side to handle form state.
 */
export default function PersonalInfoPage() {
  return <PersonalInfoEditor />
}

/**
 * Admin routes must be dynamic (not statically generated)
 * to read request headers for authentication
 */
export const dynamic = 'force-dynamic'
