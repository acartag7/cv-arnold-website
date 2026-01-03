'use client'

/**
 * Achievement Form Modal
 *
 * Modal form for adding or editing achievements.
 *
 * @module app/admin/achievements/AchievementFormModal
 */

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, DatePicker, TagInput } from '@/components/admin'
import {
  Trophy,
  Building2,
  Calendar,
  Link as LinkIcon,
  FileText,
  Tag,
  Star,
} from 'lucide-react'
import { AchievementCategory, type Achievement } from '@/types/cv'
import { generateId } from '@/lib/format-utils'

interface AchievementFormModalProps {
  isOpen: boolean
  achievement: Achievement | null
  onSave: (achievement: Achievement) => void
  onClose: () => void
  isSaving?: boolean
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.nativeEnum(AchievementCategory),
  date: z.string().min(1, 'Date is required'),
  issuer: z.string().max(200),
  description: z.string().min(1, 'Description is required').max(1000),
  url: z.string().url('Must be a valid URL').or(z.literal('')),
  technologies: z.array(z.string()),
  featured: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

// Category options
const categoryOptions: {
  value: AchievementCategory
  label: string
  description: string
}[] = [
  {
    value: AchievementCategory.AWARD,
    label: 'Award',
    description: 'Recognition or prize',
  },
  {
    value: AchievementCategory.PUBLICATION,
    label: 'Publication',
    description: 'Article, paper, or book',
  },
  {
    value: AchievementCategory.SPEAKING,
    label: 'Speaking',
    description: 'Conference talk or presentation',
  },
  {
    value: AchievementCategory.PROJECT,
    label: 'Project',
    description: 'Notable project completion',
  },
  {
    value: AchievementCategory.CONTRIBUTION,
    label: 'Contribution',
    description: 'Open source or community',
  },
  {
    value: AchievementCategory.OTHER,
    label: 'Other',
    description: 'Miscellaneous achievement',
  },
]

export function AchievementFormModal({
  isOpen,
  achievement,
  onSave,
  onClose,
  isSaving = false,
}: AchievementFormModalProps) {
  const isEditing = !!achievement
  const [techSuggestions] = useState<string[]>([
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'Kubernetes',
    'GraphQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Next.js',
    'Go',
    'Rust',
  ])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: AchievementCategory.AWARD,
      date: new Date().toISOString().split('T')[0] ?? '',
      issuer: '',
      description: '',
      url: '',
      technologies: [],
      featured: false,
    },
  })

  const selectedCategory = watch('category')

  useEffect(() => {
    if (isOpen) {
      if (achievement) {
        reset({
          title: achievement.title,
          category: achievement.category,
          date: achievement.date,
          issuer: achievement.issuer || '',
          description: achievement.description,
          url: achievement.url || '',
          technologies: achievement.technologies || [],
          featured: achievement.featured ?? false,
        })
      } else {
        reset({
          title: '',
          category: AchievementCategory.AWARD,
          date: new Date().toISOString().split('T')[0] ?? '',
          issuer: '',
          description: '',
          url: '',
          technologies: [],
          featured: false,
        })
      }
    }
  }, [isOpen, achievement, reset])

  const onSubmit = (data: FormData) => {
    const achievementData: Achievement = {
      id: achievement?.id || generateId('ach'),
      title: data.title,
      category: data.category,
      date: data.date,
      description: data.description,
      order: achievement?.order ?? 0,
    }

    // Add optional fields
    if (data.issuer) {
      achievementData.issuer = data.issuer
    }
    if (data.url) {
      achievementData.url = data.url
    }
    if (data.technologies.length > 0) {
      achievementData.technologies = data.technologies
    }
    if (data.featured) {
      achievementData.featured = true
    }

    onSave(achievementData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Achievement' : 'Add Achievement'}
      subtitle={
        isEditing ? `Editing ${achievement.title}` : 'Add a new accomplishment'
      }
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="achievement-form"
            disabled={isSaving}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Add Achievement'
            )}
          </button>
        </>
      }
    >
      <form
        id="achievement-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Title & Category Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Trophy size={18} className="text-blue-500" />
            Achievement Details
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Title *
            </label>
            <input
              {...register('title')}
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                ${errors.title ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="Best Paper Award 2024"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categoryOptions.map(option => (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer
                    transition-all text-center
                    ${
                      selectedCategory === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }
                  `}
                >
                  <input
                    type="radio"
                    {...register('category')}
                    value={option.value}
                    className="sr-only"
                  />
                  <span
                    className={`
                      font-medium text-sm
                      ${
                        selectedCategory === option.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Date & Issuer Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Calendar size={18} className="text-blue-500" />
            When & Where
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Date *"
                  value={field.value}
                  onChange={field.onChange}
                  mode="month-year"
                  error={errors.date?.message}
                />
              )}
            />

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Building2 size={14} className="inline mr-1" />
                Issuing Organization
              </label>
              <input
                {...register('issuer')}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="IEEE, ACM, Company Name"
              />
            </div>
          </div>
        </section>

        {/* Description Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <FileText size={18} className="text-blue-500" />
            Description
          </div>

          <div>
            <textarea
              {...register('description')}
              rows={3}
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                resize-y min-h-[80px]
                ${errors.description ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="Describe your achievement and its significance..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </section>

        {/* URL Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <LinkIcon size={18} className="text-blue-500" />
            Reference Link
          </div>

          <div>
            <input
              {...register('url')}
              type="url"
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                ${errors.url ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="https://example.com/publication-or-award"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.url.message}
              </p>
            )}
          </div>
        </section>

        {/* Technologies Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Tag size={18} className="text-blue-500" />
            Related Technologies
          </div>

          <Controller
            name="technologies"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Add technologies..."
                suggestions={techSuggestions}
              />
            )}
          />
        </section>

        {/* Featured Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Star size={18} className="text-blue-500" />
            Visibility
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Feature this achievement (shows prominently on CV)
            </span>
          </label>
        </section>
      </form>
    </Modal>
  )
}
