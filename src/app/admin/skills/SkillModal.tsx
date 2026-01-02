'use client'

/**
 * Skill Modal
 *
 * Modal form for adding or editing individual skills within a category.
 *
 * @module app/admin/skills/SkillModal
 */

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, DatePicker } from '@/components/admin'
import { Code, BarChart3, Calendar, Star } from 'lucide-react'
import { SkillLevel, type Skill } from '@/types/cv'

interface SkillModalProps {
  isOpen: boolean
  skill: Skill | null
  categoryId: string | null
  onSave: (skill: Skill, categoryId: string) => void
  onClose: () => void
  isSaving?: boolean
}

const formSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(100),
  level: z.nativeEnum(SkillLevel),
  yearsOfExperience: z.number().int().min(0).max(100).nullable(),
  lastUsed: z.string().nullable(),
  featured: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

// Skill level options
const skillLevels: { value: SkillLevel; label: string; description: string }[] =
  [
    {
      value: SkillLevel.BEGINNER,
      label: 'Beginner',
      description: 'Learning the basics',
    },
    {
      value: SkillLevel.INTERMEDIATE,
      label: 'Intermediate',
      description: 'Working knowledge',
    },
    {
      value: SkillLevel.ADVANCED,
      label: 'Advanced',
      description: 'Deep understanding',
    },
    { value: SkillLevel.EXPERT, label: 'Expert', description: 'Mastery level' },
  ]

export function SkillModal({
  isOpen,
  skill,
  categoryId,
  onSave,
  onClose,
  isSaving,
}: SkillModalProps) {
  const isEditing = !!skill

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
      name: '',
      level: SkillLevel.INTERMEDIATE,
      yearsOfExperience: null,
      lastUsed: null,
      featured: false,
    },
  })

  const selectedLevel = watch('level')

  useEffect(() => {
    if (isOpen) {
      if (skill) {
        reset({
          name: skill.name,
          level: skill.level,
          yearsOfExperience: skill.yearsOfExperience ?? null,
          lastUsed: skill.lastUsed ?? null,
          featured: skill.featured || false,
        })
      } else {
        reset({
          name: '',
          level: SkillLevel.INTERMEDIATE,
          yearsOfExperience: null,
          lastUsed: null,
          featured: false,
        })
      }
    }
  }, [isOpen, skill, reset])

  const onSubmit = (data: FormData) => {
    if (!categoryId) return

    const skillData: Skill = {
      name: data.name,
      level: data.level,
    }

    // Add optional fields
    if (data.yearsOfExperience !== null) {
      skillData.yearsOfExperience = data.yearsOfExperience
    }
    if (data.lastUsed) {
      skillData.lastUsed = data.lastUsed
    }
    if (data.featured) {
      skillData.featured = data.featured
    }

    onSave(skillData, categoryId)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Skill' : 'Add Skill'}
      subtitle={
        isEditing ? `Editing ${skill.name}` : 'Add a new skill to this category'
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
            form="skill-form"
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
              'Add Skill'
            )}
          </button>
        </>
      }
    >
      <form
        id="skill-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Code size={16} className="text-blue-500" />
            Skill Name *
          </label>
          <input
            {...register('name')}
            className={`
              w-full px-4 py-2.5 bg-white dark:bg-slate-800
              border rounded-xl text-slate-900 dark:text-slate-100
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
            `}
            placeholder="e.g., React, TypeScript, Node.js"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Proficiency Level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            <BarChart3 size={16} className="text-blue-500" />
            Proficiency Level *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {skillLevels.map(level => (
              <label
                key={level.value}
                className={`
                  relative flex items-center p-3 rounded-xl border-2 cursor-pointer
                  transition-all
                  ${
                    selectedLevel === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }
                `}
              >
                <input
                  type="radio"
                  {...register('level')}
                  value={level.value}
                  className="sr-only"
                />
                <div>
                  <span
                    className={`
                      font-medium
                      ${
                        selectedLevel === level.value
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    {level.label}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {level.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Calendar size={16} className="text-blue-500" />
            Years of Experience
            <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <Controller
            name="yearsOfExperience"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                min={0}
                max={100}
                value={field.value ?? ''}
                onChange={e => {
                  const val = e.target.value
                  field.onChange(val === '' ? null : parseInt(val, 10))
                }}
                className="
                  w-full px-4 py-2.5 bg-white dark:bg-slate-800
                  border border-slate-200 dark:border-slate-600 rounded-xl
                  text-slate-900 dark:text-slate-100
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                "
                placeholder="e.g., 5"
              />
            )}
          />
        </div>

        {/* Last Used */}
        <Controller
          name="lastUsed"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Last Used"
              value={field.value}
              onChange={field.onChange}
              mode="month-year"
              allowNull
              nullLabel="Currently using"
            />
          )}
        />

        {/* Featured Toggle */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Featured Skill
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                (Highlighted on CV)
              </span>
            </div>
            <input
              type="checkbox"
              {...register('featured')}
              className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500/30"
            />
          </label>
        </div>
      </form>
    </Modal>
  )
}
