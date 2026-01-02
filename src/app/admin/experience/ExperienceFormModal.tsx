'use client'

/**
 * Experience Form Modal
 *
 * Modal form for adding or editing work experience entries.
 * Features comprehensive validation with react-hook-form and Zod.
 *
 * @module app/admin/experience/ExperienceFormModal
 */

import { useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, TagInput, DatePicker } from '@/components/admin'
import {
  Building2,
  MapPin,
  Calendar,
  FileText,
  Trophy,
  Code,
  Star,
  Plus,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react'
import { EmploymentType, type Experience } from '@/types/cv'

interface ExperienceFormModalProps {
  isOpen: boolean
  experience: Experience | null
  onSave: (experience: Experience) => void
  onClose: () => void
  isSaving?: boolean
}

// Employment type options - using enum values
const employmentTypes: { value: EmploymentType; label: string }[] = [
  { value: EmploymentType.FULL_TIME, label: 'Full-time' },
  { value: EmploymentType.PART_TIME, label: 'Part-time' },
  { value: EmploymentType.CONTRACT, label: 'Contract' },
  { value: EmploymentType.FREELANCE, label: 'Freelance' },
  { value: EmploymentType.INTERNSHIP, label: 'Internship' },
]

// Form schema (matches ExperienceSchema but adapted for form)
const formSchema = z
  .object({
    company: z.string().min(1, 'Company name is required').max(200),
    companyUrl: z.string().url('Must be a valid URL').or(z.literal('')),
    position: z.string().min(1, 'Position is required').max(200),
    type: z.nativeEnum(EmploymentType),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().nullable(),
    isCurrentRole: z.boolean(),
    location: z.object({
      city: z.string().max(100),
      country: z.string().max(100),
      remote: z.boolean(),
    }),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(5000),
    achievements: z.array(
      z.object({ value: z.string().min(5, 'At least 5 characters') })
    ),
    technologies: z.array(z.string()),
    featured: z.boolean(),
  })
  .refine(
    data => {
      if (data.isCurrentRole || !data.endDate) return true
      return new Date(data.startDate) <= new Date(data.endDate)
    },
    {
      message: 'Start date must be before end date',
      path: ['endDate'],
    }
  )

type FormData = z.infer<typeof formSchema>

// Generate unique ID
function generateId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get default form values
function getDefaultValues(): FormData {
  return {
    company: '',
    companyUrl: '',
    position: '',
    type: EmploymentType.FULL_TIME,
    startDate: new Date().toISOString().split('T')[0] ?? '',
    endDate: null,
    isCurrentRole: false,
    location: { city: '', country: '', remote: false },
    description: '',
    achievements: [],
    technologies: [],
    featured: false,
  }
}

export function ExperienceFormModal({
  isOpen,
  experience,
  onSave,
  onClose,
  isSaving,
}: ExperienceFormModalProps) {
  const isEditing = !!experience

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
    defaultValues: getDefaultValues(),
  })

  const {
    fields: achievementFields,
    append: addAchievement,
    remove: removeAchievement,
  } = useFieldArray({ control, name: 'achievements' })

  const isCurrentRole = watch('isCurrentRole')
  const isRemote = watch('location.remote')

  // Reset form when modal opens/closes or experience changes
  useEffect(() => {
    if (isOpen) {
      if (experience) {
        reset({
          company: experience.company,
          companyUrl: experience.companyUrl || '',
          position: experience.position,
          type: experience.type,
          startDate: experience.startDate,
          endDate: experience.endDate,
          isCurrentRole: experience.endDate === null,
          location: {
            city: experience.location.city || '',
            country: experience.location.country || '',
            remote: experience.location.remote,
          },
          description: experience.description,
          achievements: experience.achievements.map(a => ({ value: a })),
          technologies: experience.technologies,
          featured: experience.featured || false,
        })
      } else {
        reset(getDefaultValues())
      }
    }
  }, [isOpen, experience, reset])

  // Handle current role toggle
  useEffect(() => {
    if (isCurrentRole) {
      setValue('endDate', null)
    }
  }, [isCurrentRole, setValue])

  const onSubmit = (data: FormData) => {
    // Build location object, only including city/country if they have values
    const location: Experience['location'] = { remote: data.location.remote }
    if (data.location.city) {
      location.city = data.location.city
    }
    if (data.location.country) {
      location.country = data.location.country
    }

    // Build experience data, only including optional fields if they have values
    const experienceData: Experience = {
      id: experience?.id || generateId(),
      company: data.company,
      position: data.position,
      type: data.type,
      startDate: data.startDate,
      endDate: data.isCurrentRole ? null : data.endDate,
      location,
      description: data.description,
      achievements: data.achievements.map(a => a.value),
      technologies: data.technologies,
      order: experience?.order || 0,
      featured: data.featured,
    }

    // Add optional companyUrl if present
    if (data.companyUrl) {
      experienceData.companyUrl = data.companyUrl
    }

    onSave(experienceData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Experience' : 'Add Experience'}
      subtitle={
        isEditing
          ? `Editing ${experience.position}`
          : 'Add a new work experience entry'
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
            form="experience-form"
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
              'Add Experience'
            )}
          </button>
        </>
      }
    >
      <form
        id="experience-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Company & Position Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Building2 size={18} className="text-blue-500" />
            Company & Position
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Company *
              </label>
              <input
                {...register('company')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.company ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Anthropic"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.company.message}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Position *
              </label>
              <input
                {...register('position')}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.position ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="Senior Software Engineer"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.position.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                <LinkIcon size={14} className="inline mr-1" />
                Company Website
              </label>
              <input
                {...register('companyUrl')}
                type="url"
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border rounded-xl text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  ${errors.companyUrl ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                `}
                placeholder="https://anthropic.com"
              />
              {errors.companyUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.companyUrl.message}
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Employment Type *
              </label>
              <select
                {...register('type')}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
              >
                {employmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
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
                  nullLabel="Currently working here"
                  disabled={isCurrentRole}
                  error={errors.endDate?.message}
                />
              )}
            />
          </div>

          {/* Current role checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('isCurrentRole')}
              className="
                w-5 h-5 rounded border-slate-300 dark:border-slate-600
                text-blue-600 focus:ring-blue-500/30
              "
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              I currently work here
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
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                City
              </label>
              <input
                {...register('location.city')}
                disabled={isRemote}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                placeholder="San Francisco"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Country
              </label>
              <input
                {...register('location.country')}
                disabled={isRemote}
                className={`
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                placeholder="United States"
              />
            </div>
          </div>

          {/* Remote checkbox */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('location.remote')}
              className="
                w-5 h-5 rounded border-slate-300 dark:border-slate-600
                text-blue-600 focus:ring-blue-500/30
              "
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              This is a remote position
            </span>
          </label>
        </section>

        {/* Description Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <FileText size={18} className="text-blue-500" />
            Description
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Job Description *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={`
                w-full px-4 py-2.5 bg-white dark:bg-slate-800
                border rounded-xl text-slate-900 dark:text-slate-100
                transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                resize-y min-h-[100px]
                ${errors.description ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
              `}
              placeholder="Describe your role, responsibilities, and impact..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
              <Trophy size={18} className="text-blue-500" />
              Key Achievements
            </div>
            <button
              type="button"
              onClick={() => addAchievement({ value: '' })}
              className="
                flex items-center gap-1 px-3 py-1.5
                text-sm text-blue-600 dark:text-blue-400
                hover:bg-blue-50 dark:hover:bg-blue-900/30
                rounded-lg transition-colors
              "
            >
              <Plus size={16} />
              Add Achievement
            </button>
          </div>

          {achievementFields.length > 0 ? (
            <div className="space-y-3">
              {achievementFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <input
                    {...register(`achievements.${index}.value`)}
                    className={`
                      flex-1 px-4 py-2.5 bg-white dark:bg-slate-800
                      border rounded-xl text-slate-900 dark:text-slate-100
                      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${errors.achievements?.[index]?.value ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                    `}
                    placeholder="Increased team velocity by 40% through process improvements"
                  />
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="
                      p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/30
                      rounded-lg transition-colors
                    "
                    aria-label="Remove achievement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              No achievements added yet. Click &quot;Add Achievement&quot; to
              add your key accomplishments.
            </p>
          )}
        </section>

        {/* Technologies Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <Code size={18} className="text-blue-500" />
            Technologies
          </div>

          <Controller
            name="technologies"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Add technologies (e.g., React, TypeScript)..."
                suggestions={[
                  'JavaScript',
                  'TypeScript',
                  'React',
                  'Next.js',
                  'Node.js',
                  'Python',
                  'Go',
                  'Rust',
                  'PostgreSQL',
                  'MongoDB',
                  'Redis',
                  'Docker',
                  'Kubernetes',
                  'AWS',
                  'GCP',
                  'Azure',
                ]}
              />
            )}
          />
        </section>

        {/* Featured Toggle */}
        <section className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Featured Experience
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                (Highlighted on CV)
              </span>
            </div>
            <input
              type="checkbox"
              {...register('featured')}
              className="
                w-5 h-5 rounded border-slate-300 dark:border-slate-600
                text-amber-500 focus:ring-amber-500/30
              "
            />
          </label>
        </section>
      </form>
    </Modal>
  )
}
