'use client'

/**
 * Language Form Modal
 *
 * Modal form for adding or editing language proficiencies.
 *
 * @module app/admin/languages/LanguageFormModal
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/admin'
import { Globe, Hash, BarChart2, Star } from 'lucide-react'
import { LanguageProficiency, type Language } from '@/types/cv'

interface LanguageFormModalProps {
  isOpen: boolean
  language: Language | null
  onSave: (language: Language, originalName?: string) => void
  onClose: () => void
  existingLanguages: string[]
  isSaving?: boolean
}

const formSchema = z.object({
  name: z.string().min(1, 'Language name is required').max(100),
  code: z
    .string()
    .min(2, 'Language code is required')
    .max(5)
    .regex(
      /^[a-z]{2,5}$/i,
      'Must be a valid ISO 639-1 code (e.g., en, es, de)'
    ),
  proficiency: z.nativeEnum(LanguageProficiency),
  native: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

// Proficiency options with descriptions
const proficiencyOptions: {
  value: LanguageProficiency
  label: string
  description: string
}[] = [
  {
    value: LanguageProficiency.A1,
    label: 'A1 - Beginner',
    description: 'Basic phrases and simple interactions',
  },
  {
    value: LanguageProficiency.A2,
    label: 'A2 - Elementary',
    description: 'Simple everyday expressions',
  },
  {
    value: LanguageProficiency.B1,
    label: 'B1 - Intermediate',
    description: 'Can handle most travel situations',
  },
  {
    value: LanguageProficiency.B2,
    label: 'B2 - Upper Intermediate',
    description: 'Can interact fluently with natives',
  },
  {
    value: LanguageProficiency.C1,
    label: 'C1 - Advanced',
    description: 'Complex language use for work/study',
  },
  {
    value: LanguageProficiency.C2,
    label: 'C2 - Proficient',
    description: 'Near-native mastery',
  },
  {
    value: LanguageProficiency.NATIVE,
    label: 'Native',
    description: 'First language / mother tongue',
  },
]

// Common language codes for autocomplete hints
const commonLanguages: { name: string; code: string }[] = [
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Russian', code: 'ru' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Polish', code: 'pl' },
  { name: 'Swedish', code: 'sv' },
]

export function LanguageFormModal({
  isOpen,
  language,
  onSave,
  onClose,
  existingLanguages,
  isSaving = false,
}: LanguageFormModalProps) {
  const isEditing = !!language

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      proficiency: LanguageProficiency.B1,
      native: false,
    },
  })

  const selectedProficiency = watch('proficiency')
  const watchedName = watch('name')

  useEffect(() => {
    if (isOpen) {
      if (language) {
        reset({
          name: language.name,
          code: language.code,
          proficiency: language.proficiency,
          native: language.native ?? false,
        })
      } else {
        reset({
          name: '',
          code: '',
          proficiency: LanguageProficiency.B1,
          native: false,
        })
      }
    }
  }, [isOpen, language, reset])

  // Auto-fill code when name matches a common language
  useEffect(() => {
    if (!isEditing && watchedName) {
      const match = commonLanguages.find(
        l => l.name.toLowerCase() === watchedName.toLowerCase()
      )
      if (match) {
        setValue('code', match.code)
      }
    }
  }, [watchedName, isEditing, setValue])

  const onSubmit = (data: FormData) => {
    // Check for duplicate language name (except when editing the same language)
    if (!isEditing && existingLanguages.includes(data.name)) {
      return
    }

    const langData: Language = {
      name: data.name,
      code: data.code.toLowerCase(),
      proficiency: data.proficiency,
    }

    if (data.native) {
      langData.native = true
    }

    // Pass original name for editing to allow name changes
    onSave(langData, isEditing ? language?.name : undefined)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Language' : 'Add Language'}
      subtitle={
        isEditing
          ? `Editing ${language.name}`
          : 'Add a new language proficiency'
      }
      size="md"
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
            form="language-form"
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
              'Add Language'
            )}
          </button>
        </>
      }
    >
      <form
        id="language-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Language Name & Code */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Globe size={18} className="text-blue-500" />
            Language Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Language Name *
              </label>
              <input
                {...register('name')}
                list="language-suggestions"
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="English"
              />
              <datalist id="language-suggestions">
                {commonLanguages.map(lang => (
                  <option key={lang.code} value={lang.name} />
                ))}
              </datalist>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Language Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <Hash size={14} className="inline mr-1" />
                ISO 639-1 Code *
              </label>
              <input
                {...register('code')}
                maxLength={5}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100 font-mono uppercase
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.code ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="en"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.code.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Proficiency Level */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <BarChart2 size={18} className="text-blue-500" />
            Proficiency Level *
          </div>

          <div className="space-y-2">
            {proficiencyOptions.map(option => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                  transition-all
                  ${
                    selectedProficiency === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }
                `}
              >
                <input
                  type="radio"
                  {...register('proficiency')}
                  value={option.value}
                  className="sr-only"
                />
                <div
                  className={`
                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedProficiency === option.value
                        ? 'border-blue-500'
                        : 'border-slate-300 dark:border-slate-500'
                    }
                  `}
                >
                  {selectedProficiency === option.value && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`
                      font-medium text-sm
                      ${
                        selectedProficiency === option.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {option.label}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Native checkbox */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Star size={18} className="text-blue-500" />
            Additional
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('native')}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              This is my native language
            </span>
          </label>
        </section>
      </form>
    </Modal>
  )
}
