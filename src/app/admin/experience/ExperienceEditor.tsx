'use client'

/**
 * Experience Editor Container
 *
 * Manages CRUD operations for work experience entries.
 * Handles data fetching, state management, and provides
 * the list and form components with necessary callbacks.
 *
 * Design: Stripe Dashboard Style
 * - Professional, enterprise-quality aesthetic
 * - Gradient accents with blue/indigo color scheme
 * - Sortable list with drag handles
 */

import { useState, useCallback } from 'react'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useSectionVisibility } from '@/hooks/useSectionVisibility'
import { useToast } from '@/components/ui/ToastProvider'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Plus,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'
import { ExperienceList } from './ExperienceList'
import { ExperienceFormModal } from './ExperienceFormModal'
import { ConfirmDialog } from '@/components/admin'
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle'
import type { Experience } from '@/types/cv'

export function ExperienceEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isMutating } = useUpdateData()
  const { handleVisibilityChange, isSaving: isVisibilitySaving } =
    useSectionVisibility({ data })
  const toast = useToast()

  // Combine saving states from mutations
  const isSaving = isMutating || isVisibilitySaving

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  )

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    experience: Experience | null
  }>({ isOpen: false, experience: null })

  // Open form for adding new experience
  const handleAdd = useCallback(() => {
    setEditingExperience(null)
    setIsFormOpen(true)
  }, [])

  // Open form for editing existing experience
  const handleEdit = useCallback((experience: Experience) => {
    setEditingExperience(experience)
    setIsFormOpen(true)
  }, [])

  // Close form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingExperience(null)
  }, [])

  // Open delete confirmation
  const handleDeleteClick = useCallback((experience: Experience) => {
    setDeleteConfirm({ isOpen: true, experience })
  }, [])

  // Close delete confirmation
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, experience: null })
  }, [])

  // Save experience (add or update)
  const handleSave = useCallback(
    (experience: Experience) => {
      if (!data) return

      const existingIndex = data.experience.findIndex(
        e => e.id === experience.id
      )
      let updatedExperience: Experience[]

      if (existingIndex >= 0) {
        // Update existing
        updatedExperience = [...data.experience]
        updatedExperience[existingIndex] = experience
      } else {
        // Add new - assign order based on array length
        const newExperience = {
          ...experience,
          order: data.experience.length,
        }
        updatedExperience = [...data.experience, newExperience]
      }

      updateData(
        { ...data, experience: updatedExperience },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Experience updated successfully'
                : 'Experience added successfully'
            )
            handleCloseForm()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save experience'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseForm]
  )

  // Delete experience
  const handleDeleteConfirm = useCallback(() => {
    if (!data || !deleteConfirm.experience) return

    const updatedExperience = data.experience
      .filter(e => e.id !== deleteConfirm.experience!.id)
      .map((e, index) => ({ ...e, order: index })) // Reorder remaining items

    updateData(
      { ...data, experience: updatedExperience },
      {
        onSuccess: () => {
          toast.success('Experience deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete experience'
          )
        },
      }
    )
  }, [data, deleteConfirm.experience, updateData, toast, handleDeleteCancel])

  // Reorder experiences (from drag-drop)
  const handleReorder = useCallback(
    (reorderedExperiences: Experience[]) => {
      if (!data) return

      // Update order field for each item
      const updatedExperience = reorderedExperiences.map((exp, index) => ({
        ...exp,
        order: index,
      }))

      updateData(
        { ...data, experience: updatedExperience },
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
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
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

  // Sort experiences by order
  const sortedExperiences = [...data.experience].sort(
    (a, b) => a.order - b.order
  )

  // Get current visibility (default to true if not set)
  const isVisible = data.siteConfig?.sectionVisibility?.experience !== false

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
          sectionKey="experience"
          isVisible={isVisible}
          onChange={handleVisibilityChange}
          disabled={isSaving}
          label="Show Experience Section"
        />
      </div>

      {/* Main content */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Briefcase
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Work Experience
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your professional experience entries
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="
              flex items-center gap-2 px-4 py-2.5
              bg-blue-600 hover:bg-blue-500
              text-white font-medium rounded-xl
              transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30
            "
          >
            <Plus size={18} />
            Add Experience
          </button>
        </div>

        {/* Experience list */}
        {sortedExperiences.length > 0 ? (
          <ExperienceList
            experiences={sortedExperiences}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Briefcase
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No experience entries yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add your first work experience to get started
            </p>
            <button
              onClick={handleAdd}
              className="
                inline-flex items-center gap-2 px-4 py-2
                bg-blue-600 hover:bg-blue-500
                text-white font-medium rounded-xl
                transition-colors
              "
            >
              <Plus size={18} />
              Add Experience
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <ExperienceFormModal
        isOpen={isFormOpen}
        experience={editingExperience}
        onSave={handleSave}
        onClose={handleCloseForm}
        isSaving={isSaving}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Experience"
        message={`Are you sure you want to delete "${deleteConfirm.experience?.position} at ${deleteConfirm.experience?.company}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
