'use client'

/**
 * Education Editor Container
 *
 * Manages CRUD operations for educational qualifications.
 * Follows the same pattern as Experience and Certifications editors.
 *
 * Design: Stripe Dashboard Style
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
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import { EducationList } from './EducationList'
import { EducationFormModal } from './EducationFormModal'
import { ConfirmDialog } from '@/components/admin'
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle'
import type { Education } from '@/types/cv'

export function EducationEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isMutating } = useUpdateData()
  const { handleVisibilityChange, isSaving: isVisibilitySaving } =
    useSectionVisibility({ data })
  const toast = useToast()

  // Combine saving states from mutations
  const isSaving = isMutating || isVisibilitySaving

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null
  )

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    education: Education | null
  }>({ isOpen: false, education: null })

  const handleAdd = useCallback(() => {
    setEditingEducation(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((education: Education) => {
    setEditingEducation(education)
    setIsFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingEducation(null)
  }, [])

  const handleDeleteClick = useCallback((education: Education) => {
    setDeleteConfirm({ isOpen: true, education })
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, education: null })
  }, [])

  const handleSave = useCallback(
    (education: Education) => {
      if (!data) return

      const existingIndex = data.education.findIndex(e => e.id === education.id)
      let updatedEducation: Education[]

      if (existingIndex >= 0) {
        updatedEducation = [...data.education]
        updatedEducation[existingIndex] = education
      } else {
        const newEdu = { ...education, order: data.education.length }
        updatedEducation = [...data.education, newEdu]
      }

      updateData(
        { ...data, education: updatedEducation },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Education updated successfully'
                : 'Education added successfully'
            )
            handleCloseForm()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save education'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseForm]
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!data || !deleteConfirm.education) return

    const updatedEducation = data.education
      .filter(e => e.id !== deleteConfirm.education!.id)
      .map((e, index) => ({ ...e, order: index }))

    updateData(
      { ...data, education: updatedEducation },
      {
        onSuccess: () => {
          toast.success('Education deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete education'
          )
        },
      }
    )
  }, [data, deleteConfirm.education, updateData, toast, handleDeleteCancel])

  const handleReorder = useCallback(
    (reorderedEducation: Education[]) => {
      if (!data) return

      const updated = reorderedEducation.map((edu, index) => ({
        ...edu,
        order: index,
      }))

      updateData(
        { ...data, education: updated },
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
              <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
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

  const sortedEducation = [...data.education].sort((a, b) => a.order - b.order)

  // Get current visibility (default to true if not set)
  const isVisible = data.siteConfig?.sectionVisibility?.education !== false

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
          sectionKey="education"
          isVisible={isVisible}
          onChange={handleVisibilityChange}
          disabled={isSaving}
          label="Show Education Section"
        />
      </div>

      {/* Main content */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <GraduationCap
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Education
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your educational background
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Plus size={18} />
            Add Education
          </button>
        </div>

        {/* Education list */}
        {sortedEducation.length > 0 ? (
          <EducationList
            educationList={sortedEducation}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <GraduationCap
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No education entries yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add your educational background to showcase your qualifications
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              Add Education
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <EducationFormModal
        isOpen={isFormOpen}
        education={editingEducation}
        onSave={handleSave}
        onClose={handleCloseForm}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Education"
        message={`Are you sure you want to delete "${deleteConfirm.education?.degree} at ${deleteConfirm.education?.institution}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
