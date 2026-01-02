'use client'

/**
 * Personal Info Editor Container
 *
 * Handles data fetching and provides the form with initial data.
 * This component manages loading, error states, and form submission.
 *
 * Design: Stripe Dashboard Style (chosen by user)
 * - Professional, enterprise-quality aesthetic
 * - Gradient accents with blue/indigo color scheme
 * - Rounded cards with subtle shadows
 */

import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PersonalInfoFormStripe } from './PersonalInfoFormStripe'
import type { PersonalInfo } from '@/types/cv'

export function PersonalInfoEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()
  const router = useRouter()

  // Loading state with skeleton matching form structure
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Back link skeleton */}
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />

        {/* Form skeleton matching Stripe style */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-3 mb-8">
              <div className="h-6 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
              <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>

            {/* Form card skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-11 bg-slate-100 dark:bg-slate-900 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500" size={24} />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Failed to load data
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Try again</span>
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const handleSubmit = async (personalInfo: PersonalInfo) => {
    updateData(
      { ...data, personalInfo },
      {
        onSuccess: () => {
          toast.success('Personal information updated successfully')
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to save changes'
          )
        },
      }
    )
  }

  const handleCancel = () => {
    router.push('/admin')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Stripe-style Form */}
      <PersonalInfoFormStripe
        defaultValues={data.personalInfo}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        onCancel={handleCancel}
      />
    </div>
  )
}
