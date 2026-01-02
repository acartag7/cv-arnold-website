'use client'

/**
 * Skill Category Modal
 *
 * Modal form for adding or editing skill categories.
 *
 * @module app/admin/skills/SkillCategoryModal
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/admin'
import { Folder, FileText } from 'lucide-react'
import type { SkillCategory, Skill } from '@/types/cv'

interface SkillCategoryModalProps {
  isOpen: boolean
  category: SkillCategory | null
  onSave: (category: SkillCategory) => void
  onClose: () => void
  isSaving?: boolean
}

const formSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
})

type FormData = z.infer<typeof formSchema>

function generateId(): string {
  return `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function SkillCategoryModal({
  isOpen,
  category,
  onSave,
  onClose,
  isSaving,
}: SkillCategoryModalProps) {
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          icon: category.icon || '',
        })
      } else {
        reset({
          name: '',
          description: '',
          icon: '',
        })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit = (data: FormData) => {
    // Preserve existing skills when editing
    const skills: Skill[] = category?.skills || []

    const categoryData: SkillCategory = {
      id: category?.id || generateId(),
      name: data.name,
      skills,
      order: category?.order || 0,
    }

    // Add optional fields
    if (data.description) {
      categoryData.description = data.description
    }
    if (data.icon) {
      categoryData.icon = data.icon
    }

    onSave(categoryData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Add Category'}
      subtitle={
        isEditing ? `Editing ${category.name}` : 'Create a new skill category'
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
            form="category-form"
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
              'Add Category'
            )}
          </button>
        </>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {/* Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <Folder size={16} className="text-blue-500" />
            Category Name *
          </label>
          <input
            {...register('name')}
            className={`
              w-full px-4 py-2.5 bg-white dark:bg-slate-800
              border rounded-xl text-slate-900 dark:text-slate-100
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
              ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
            `}
            placeholder="e.g., Frontend Development"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            <FileText size={16} className="text-blue-500" />
            Description
          </label>
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
            placeholder="Brief description of this skill category..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Icon (optional) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Icon Name
            <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <input
            {...register('icon')}
            className="
              w-full px-4 py-2.5 bg-white dark:bg-slate-800
              border border-slate-200 dark:border-slate-600 rounded-xl
              text-slate-900 dark:text-slate-100
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
            "
            placeholder="e.g., code, server, database"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Lucide icon name to display next to the category
          </p>
        </div>
      </form>
    </Modal>
  )
}
