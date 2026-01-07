'use client'

/**
 * Skills Editor Container
 *
 * Manages CRUD operations for skill categories and individual skills.
 * Two-level nested structure with sortable categories and skills.
 *
 * Design: Stripe Dashboard Style
 */

import { useState, useCallback } from 'react'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useSectionVisibility } from '@/hooks/useSectionVisibility'
import { useToast } from '@/components/ui/ToastProvider'
import { AlertCircle, RefreshCw, ArrowLeft, Plus, Code } from 'lucide-react'
import Link from 'next/link'
import { SkillCategoryList } from './SkillCategoryList'
import { SkillCategoryModal } from './SkillCategoryModal'
import { SkillModal } from './SkillModal'
import { ConfirmDialog } from '@/components/admin'
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle'
import type { SkillCategory, Skill } from '@/types/cv'

export function SkillsEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isMutating } = useUpdateData()
  const { handleVisibilityChange, isSaving: isVisibilitySaving } =
    useSectionVisibility({ data })
  const toast = useToast()

  // Combine saving states from mutations
  const isSaving = isMutating || isVisibilitySaving

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(
    null
  )

  // Skill modal state
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<{
    skill: Skill
    categoryId: string
  } | null>(null)
  const [addSkillToCategoryId, setAddSkillToCategoryId] = useState<
    string | null
  >(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'category' | 'skill'
    category?: SkillCategory
    skill?: Skill
    categoryId?: string
  }>({ isOpen: false, type: 'category' })

  // Category handlers
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null)
    setIsCategoryModalOpen(true)
  }, [])

  const handleEditCategory = useCallback((category: SkillCategory) => {
    setEditingCategory(category)
    setIsCategoryModalOpen(true)
  }, [])

  const handleCloseCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false)
    setEditingCategory(null)
  }, [])

  const handleDeleteCategoryClick = useCallback((category: SkillCategory) => {
    setDeleteConfirm({ isOpen: true, type: 'category', category })
  }, [])

  // Skill handlers
  const handleAddSkill = useCallback((categoryId: string) => {
    setAddSkillToCategoryId(categoryId)
    setEditingSkill(null)
    setIsSkillModalOpen(true)
  }, [])

  const handleEditSkill = useCallback((skill: Skill, categoryId: string) => {
    setEditingSkill({ skill, categoryId })
    setAddSkillToCategoryId(null)
    setIsSkillModalOpen(true)
  }, [])

  const handleCloseSkillModal = useCallback(() => {
    setIsSkillModalOpen(false)
    setEditingSkill(null)
    setAddSkillToCategoryId(null)
  }, [])

  const handleDeleteSkillClick = useCallback(
    (skill: Skill, categoryId: string) => {
      setDeleteConfirm({ isOpen: true, type: 'skill', skill, categoryId })
    },
    []
  )

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, type: 'category' })
  }, [])

  // Save category
  const handleSaveCategory = useCallback(
    (category: SkillCategory) => {
      if (!data) return

      const existingIndex = data.skills.findIndex(c => c.id === category.id)
      let updatedSkills: SkillCategory[]

      if (existingIndex >= 0) {
        updatedSkills = [...data.skills]
        updatedSkills[existingIndex] = category
      } else {
        const newCategory = { ...category, order: data.skills.length }
        updatedSkills = [...data.skills, newCategory]
      }

      updateData(
        { ...data, skills: updatedSkills },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Category updated successfully'
                : 'Category added successfully'
            )
            handleCloseCategoryModal()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save category'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseCategoryModal]
  )

  // Save skill
  const handleSaveSkill = useCallback(
    (skill: Skill, categoryId: string) => {
      if (!data) return

      const categoryIndex = data.skills.findIndex(c => c.id === categoryId)
      if (categoryIndex === -1) {
        toast.error('Category not found')
        return
      }

      const category = data.skills[categoryIndex]
      if (!category) return
      const existingIndex = category.skills.findIndex(
        s => s.name === skill.name
      )
      let updatedSkillsList: Skill[]

      if (editingSkill && editingSkill.skill.name !== skill.name) {
        // Renaming - check if new name exists
        if (category.skills.some(s => s.name === skill.name)) {
          toast.error('A skill with this name already exists in this category')
          return
        }
        // Replace old skill with new
        updatedSkillsList = category.skills.map(s =>
          s.name === editingSkill.skill.name ? skill : s
        )
      } else if (existingIndex >= 0) {
        // Update existing
        updatedSkillsList = [...category.skills]
        updatedSkillsList[existingIndex] = skill
      } else {
        // Add new
        updatedSkillsList = [...category.skills, skill]
      }

      const updatedCategory = { ...category, skills: updatedSkillsList }
      const updatedSkills = [...data.skills]
      updatedSkills[categoryIndex] = updatedCategory

      updateData(
        { ...data, skills: updatedSkills },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0 || editingSkill
                ? 'Skill updated successfully'
                : 'Skill added successfully'
            )
            handleCloseSkillModal()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save skill'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseSkillModal, editingSkill]
  )

  // Delete category
  const handleDeleteCategory = useCallback(() => {
    if (!data || !deleteConfirm.category) return

    const updatedSkills = data.skills
      .filter(c => c.id !== deleteConfirm.category!.id)
      .map((c, index) => ({ ...c, order: index }))

    updateData(
      { ...data, skills: updatedSkills },
      {
        onSuccess: () => {
          toast.success('Category deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete category'
          )
        },
      }
    )
  }, [data, deleteConfirm.category, updateData, toast, handleDeleteCancel])

  // Delete skill
  const handleDeleteSkill = useCallback(() => {
    if (!data || !deleteConfirm.skill || !deleteConfirm.categoryId) return

    const categoryIndex = data.skills.findIndex(
      c => c.id === deleteConfirm.categoryId
    )
    if (categoryIndex === -1) return

    const category = data.skills[categoryIndex]
    if (!category) return

    const updatedSkillsList = category.skills.filter(
      s => s.name !== deleteConfirm.skill!.name
    )

    const updatedCategory = { ...category, skills: updatedSkillsList }
    const updatedSkills = [...data.skills]
    updatedSkills[categoryIndex] = updatedCategory

    updateData(
      { ...data, skills: updatedSkills },
      {
        onSuccess: () => {
          toast.success('Skill deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete skill'
          )
        },
      }
    )
  }, [data, deleteConfirm, updateData, toast, handleDeleteCancel])

  // Reorder categories
  const handleReorderCategories = useCallback(
    (reorderedCategories: SkillCategory[]) => {
      if (!data) return

      const updatedSkills = reorderedCategories.map((cat, index) => ({
        ...cat,
        order: index,
      }))

      updateData(
        { ...data, skills: updatedSkills },
        {
          onSuccess: () => {
            toast.success('Order updated')
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to update order'
            )
          },
        }
      )
    },
    [data, updateData, toast]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="space-y-3">
                  <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(j => (
                      <div
                        key={j}
                        className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
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

  const sortedCategories = [...data.skills].sort((a, b) => a.order - b.order)

  // Get current visibility (default to true if not set)
  const isVisible = data.siteConfig?.sectionVisibility?.skills !== false

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

      {/* Section Visibility Toggle */}
      <div className="mb-6">
        <SectionVisibilityToggle
          sectionKey="skills"
          isVisible={isVisible}
          onChange={handleVisibilityChange}
          disabled={isSaving}
          label="Show Skills Section"
        />
      </div>

      {/* Main content */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Code className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Skills
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage skill categories and individual skills
              </p>
            </div>
          </div>

          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Categories list */}
        {sortedCategories.length > 0 ? (
          <SkillCategoryList
            categories={sortedCategories}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategoryClick}
            onAddSkill={handleAddSkill}
            onEditSkill={handleEditSkill}
            onDeleteSkill={handleDeleteSkillClick}
            onReorder={handleReorderCategories}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Code
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No skill categories yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add your first skill category to get started
            </p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              Add Category
            </button>
          </div>
        )}
      </div>

      {/* Category modal */}
      <SkillCategoryModal
        isOpen={isCategoryModalOpen}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={handleCloseCategoryModal}
        isSaving={isSaving}
      />

      {/* Skill modal */}
      <SkillModal
        isOpen={isSkillModalOpen}
        skill={editingSkill?.skill ?? null}
        categoryId={editingSkill?.categoryId ?? addSkillToCategoryId}
        onSave={handleSaveSkill}
        onClose={handleCloseSkillModal}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={
          deleteConfirm.type === 'category'
            ? handleDeleteCategory
            : handleDeleteSkill
        }
        onCancel={handleDeleteCancel}
        title={
          deleteConfirm.type === 'category' ? 'Delete Category' : 'Delete Skill'
        }
        message={
          deleteConfirm.type === 'category'
            ? `Are you sure you want to delete "${deleteConfirm.category?.name}"? All skills in this category will also be deleted.`
            : `Are you sure you want to delete "${deleteConfirm.skill?.name}"?`
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
