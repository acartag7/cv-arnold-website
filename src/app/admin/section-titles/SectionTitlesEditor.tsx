'use client'

/**
 * Section Titles Editor
 *
 * Allows customization of terminal-style section titles.
 * These appear throughout the CV as file-like paths.
 *
 * Design: Stripe Dashboard Style
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Type,
  Terminal,
  Briefcase,
  Code,
  Award,
  Mail,
  Save,
} from 'lucide-react'
import Link from 'next/link'

const formSchema = z.object({
  heroPath: z.string().min(1, 'Hero path is required').max(100),
  experience: z.string().min(1, 'Experience title is required').max(100),
  skills: z.string().min(1, 'Skills title is required').max(100),
  certifications: z
    .string()
    .min(1, 'Certifications title is required')
    .max(100),
  contact: z.string().min(1, 'Contact title is required').max(100),
})

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
  heroPath: '~/platform-engineer',
  experience: 'experience.log',
  skills: 'skills.json',
  certifications: 'certifications.yaml',
  contact: './send_message.sh',
}

// Field configuration with icons and descriptions
const fieldConfig: {
  name: keyof FormData
  label: string
  icon: typeof Terminal
  placeholder: string
  description: string
}[] = [
  {
    name: 'heroPath',
    label: 'Hero Path',
    icon: Terminal,
    placeholder: '~/platform-engineer',
    description: 'Displayed in the hero section subtitle',
  },
  {
    name: 'experience',
    label: 'Experience Section',
    icon: Briefcase,
    placeholder: 'experience.log',
    description: 'Title for the work experience section',
  },
  {
    name: 'skills',
    label: 'Skills Section',
    icon: Code,
    placeholder: 'skills.json',
    description: 'Title for the skills section',
  },
  {
    name: 'certifications',
    label: 'Certifications Section',
    icon: Award,
    placeholder: 'certifications.yaml',
    description: 'Title for the certifications section',
  },
  {
    name: 'contact',
    label: 'Contact Section',
    icon: Mail,
    placeholder: './send_message.sh',
    description: 'Title for the contact form section',
  },
]

export function SectionTitlesEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Load data into form
  useEffect(() => {
    if (data?.sectionTitles) {
      reset({
        heroPath: data.sectionTitles.heroPath,
        experience: data.sectionTitles.experience,
        skills: data.sectionTitles.skills,
        certifications: data.sectionTitles.certifications,
        contact: data.sectionTitles.contact,
      })
    }
  }, [data, reset])

  const onSubmit = (formData: FormData) => {
    if (!data) return

    updateData(
      {
        ...data,
        sectionTitles: {
          heroPath: formData.heroPath,
          experience: formData.experience,
          skills: formData.skills,
          certifications: formData.certifications,
          contact: formData.contact,
        },
      },
      {
        onSuccess: () => {
          toast.success('Section titles updated successfully')
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to save section titles'
          )
        },
      }
    )
  }

  // Watch all fields for preview
  const watchedValues = watch()

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-11 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Type className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Section Titles
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customize terminal-style section headers
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fieldConfig.map(field => {
              const Icon = field.icon
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    <Icon size={14} className="inline mr-1.5" />
                    {field.label}
                  </label>
                  <input
                    {...register(field.name)}
                    className={`
                      w-full px-4 py-2.5 bg-white dark:bg-slate-800
                      border rounded-xl text-slate-900 dark:text-slate-100 font-mono
                      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${errors[field.name] ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                    `}
                    placeholder={field.placeholder}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {field.description}
                  </p>
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors[field.name]?.message}
                    </p>
                  )}
                </div>
              )
            })}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-slate-900 rounded-2xl border border-slate-700 p-6">
            <h2 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <Terminal size={14} />
              Preview
            </h2>
            <div className="space-y-4">
              {fieldConfig.map(field => (
                <div key={field.name} className="space-y-1">
                  <div className="text-xs text-slate-500">{field.label}</div>
                  <div className="font-mono text-emerald-400 text-sm">
                    {watchedValues[field.name] || field.placeholder}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
