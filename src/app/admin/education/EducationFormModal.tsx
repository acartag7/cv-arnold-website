'use client'

/**
 * Education Form Modal
 *
 * Modal form for adding or editing education entries.
 *
 * @module app/admin/education/EducationFormModal
 */

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, DatePicker } from '@/components/admin'
import {
  GraduationCap,
  Building2,
  Calendar,
  MapPin,
  Link as LinkIcon,
  FileText,
  BookOpen,
  Plus,
  X,
} from 'lucide-react'
import type { Education } from '@/types/cv'
import { generateId } from '@/lib/format-utils'

interface EducationFormModalProps {
  isOpen: boolean
  education: Education | null
  onSave: (education: Education) => void
  onClose: () => void
  isSaving?: boolean
}

const formSchema = z
  .object({
    institution: z.string().min(1, 'Institution name is required').max(200),
    institutionUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    degree: z.string().min(1, 'Degree is required').max(200),
    field: z.string().min(1, 'Field of study is required').max(200),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullable(),
    inProgress: z.boolean(),
    grade: z.string().max(50),
    city: z.string().max(100),
    country: z.string().max(100),
    description: z.string().max(1000),
    highlights: z.array(z.string()),
  })
  .refine(
    data => {
      if (data.inProgress || !data.endDate) return true
      return new Date(data.startDate) <= new Date(data.endDate)
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  )

type FormData = z.infer<typeof formSchema>

export function EducationFormModal({
  isOpen,
  education,
  onSave,
  onClose,
  isSaving = false,
}: EducationFormModalProps) {
  const isEditing = !!education
  const [newHighlight, setNewHighlight] = useState('')

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institution: '',
      institutionUrl: '',
      degree: '',
      field: '',
      startDate: new Date().toISOString().split('T')[0] ?? '',
      endDate: null,
      inProgress: false,
      grade: '',
      city: '',
      country: '',
      description: '',
      highlights: [],
    },
  })

  const inProgress = watch('inProgress')
  const highlights = watch('highlights')

  useEffect(() => {
    if (isOpen) {
      if (education) {
        reset({
          institution: education.institution,
          institutionUrl: education.institutionUrl || '',
          degree: education.degree,
          field: education.field,
          startDate: education.startDate,
          endDate: education.endDate,
          inProgress: education.endDate === null,
          grade: education.grade || '',
          city: education.location?.city || '',
          country: education.location?.country || '',
          description: education.description || '',
          highlights: education.highlights || [],
        })
      } else {
        reset({
          institution: '',
          institutionUrl: '',
          degree: '',
          field: '',
          startDate: new Date().toISOString().split('T')[0] ?? '',
          endDate: null,
          inProgress: false,
          grade: '',
          city: '',
          country: '',
          description: '',
          highlights: [],
        })
      }
      setNewHighlight('')
    }
  }, [isOpen, education, reset])

  useEffect(() => {
    if (inProgress) {
      setValue('endDate', null)
    }
  }, [inProgress, setValue])

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setValue('highlights', [...highlights, newHighlight.trim()])
      setNewHighlight('')
    }
  }

  const removeHighlight = (index: number) => {
    setValue(
      'highlights',
      highlights.filter((_, i) => i !== index)
    )
  }

  const onSubmit = (data: FormData) => {
    const eduData: Education = {
      id: education?.id || generateId('edu'),
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: data.startDate,
      endDate: data.inProgress ? null : data.endDate,
      order: education?.order ?? 0,
    }

    // Add optional fields
    if (data.institutionUrl) {
      eduData.institutionUrl = data.institutionUrl
    }
    if (data.grade) {
      eduData.grade = data.grade
    }
    if (data.city && data.country) {
      eduData.location = {
        city: data.city,
        country: data.country,
      }
    }
    if (data.description) {
      eduData.description = data.description
    }
    if (data.highlights.length > 0) {
      eduData.highlights = data.highlights
    }

    onSave(eduData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Education' : 'Add Education'}
      subtitle={
        isEditing
          ? `Editing ${education.degree}`
          : 'Add a new educational qualification'
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
            form="education-form"
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
              'Add Education'
            )}
          </button>
        </>
      }
    >
      <form
        id="education-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Institution Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Building2 size={18} className="text-blue-500" />
            Institution Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Institution Name *
              </label>
              <input
                {...register('institution')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.institution ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="University of Technology"
              />
              {errors.institution && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.institution.message}
                </p>
              )}
            </div>

            {/* Institution URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <LinkIcon size={14} className="inline mr-1" />
                Website
              </label>
              <input
                {...register('institutionUrl')}
                type="url"
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.institutionUrl ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="https://university.edu"
              />
              {errors.institutionUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.institutionUrl.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Degree Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <GraduationCap size={18} className="text-blue-500" />
            Qualification
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Degree *
              </label>
              <input
                {...register('degree')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.degree ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Bachelor of Science"
              />
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.degree.message}
                </p>
              )}
            </div>

            {/* Field of Study */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <BookOpen size={14} className="inline mr-1" />
                Field of Study *
              </label>
              <input
                {...register('field')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.field ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Computer Science"
              />
              {errors.field && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.field.message}
                </p>
              )}
            </div>
          </div>

          {/* Grade */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Grade/GPA
            </label>
            <input
              {...register('grade')}
              className="
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-600 rounded-xl
                text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              "
              placeholder="3.8/4.0 or First Class Honours"
            />
          </div>
        </section>

        {/* Dates Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Calendar size={18} className="text-blue-500" />
            Duration
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Start Date *"
                  value={field.value}
                  onChange={field.onChange}
                  mode="month-year"
                  error={errors.startDate?.message}
                />
              )}
            />

            {/* End Date */}
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="End Date"
                  value={field.value}
                  onChange={field.onChange}
                  mode="month-year"
                  allowNull
                  nullLabel="In progress"
                  disabled={inProgress}
                  error={errors.endDate?.message}
                />
              )}
            />
          </div>

          {/* In progress checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('inProgress')}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Currently studying here
            </span>
          </label>
        </section>

        {/* Location Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <MapPin size={18} className="text-blue-500" />
            Location
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                City
              </label>
              <input
                {...register('city')}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="Boston"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Country
              </label>
              <input
                {...register('country')}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="United States"
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
              placeholder="Brief description of your studies, focus areas, or notable achievements..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </section>

        {/* Highlights Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <BookOpen size={18} className="text-blue-500" />
            Highlights & Coursework
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addHighlight()
                  }
                }}
                className="
                  flex-1 px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="Add relevant coursework or highlight..."
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {highlights.length > 0 && (
              <div className="space-y-2">
                {highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                  >
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                      {highlight}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </form>
    </Modal>
  )
}
