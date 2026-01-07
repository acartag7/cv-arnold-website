'use client'

/**
 * Achievements Editor Container
 *
 * Manages CRUD operations for professional achievements.
 * Includes category filtering and featured toggle.
 *
 * Design: Stripe Dashboard Style
 */

import { useState, useCallback } from 'react'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useSectionVisibility } from '@/hooks/useSectionVisibility'
import { useToast } from '@/components/ui/ToastProvider'
import { AlertCircle, RefreshCw, ArrowLeft, Plus, Trophy } from 'lucide-react'
import Link from 'next/link'
import { AchievementList } from './AchievementList'
import { AchievementFormModal } from './AchievementFormModal'
import { ConfirmDialog } from '@/components/admin'
import { SectionVisibilityToggle } from '@/components/admin/SectionVisibilityToggle'
import type { Achievement } from '@/types/cv'

export function AchievementsEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isMutating } = useUpdateData()
  const { handleVisibilityChange, isSaving: isVisibilitySaving } =
    useSectionVisibility({ data })
  const toast = useToast()

  // Combine saving states from mutations
  const isSaving = isMutating || isVisibilitySaving

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    achievement: Achievement | null
  }>({ isOpen: false, achievement: null })

  const handleAdd = useCallback(() => {
    setEditingAchievement(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((achievement: Achievement) => {
    setEditingAchievement(achievement)
    setIsFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingAchievement(null)
  }, [])

  const handleDeleteClick = useCallback((achievement: Achievement) => {
    setDeleteConfirm({ isOpen: true, achievement })
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, achievement: null })
  }, [])

  const handleSave = useCallback(
    (achievement: Achievement) => {
      if (!data) return

      const existingIndex = data.achievements.findIndex(
        a => a.id === achievement.id
      )
      let updatedAchievements: Achievement[]

      if (existingIndex >= 0) {
        updatedAchievements = [...data.achievements]
        updatedAchievements[existingIndex] = achievement
      } else {
        const newAchievement = {
          ...achievement,
          order: data.achievements.length,
        }
        updatedAchievements = [...data.achievements, newAchievement]
      }

      updateData(
        { ...data, achievements: updatedAchievements },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Achievement updated successfully'
                : 'Achievement added successfully'
            )
            handleCloseForm()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save achievement'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseForm]
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!data || !deleteConfirm.achievement) return

    const updatedAchievements = data.achievements
      .filter(a => a.id !== deleteConfirm.achievement!.id)
      .map((a, index) => ({ ...a, order: index }))

    updateData(
      { ...data, achievements: updatedAchievements },
      {
        onSuccess: () => {
          toast.success('Achievement deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete achievement'
          )
        },
      }
    )
  }, [data, deleteConfirm.achievement, updateData, toast, handleDeleteCancel])

  const handleReorder = useCallback(
    (reorderedAchievements: Achievement[]) => {
      if (!data) return

      const updated = reorderedAchievements.map((achievement, index) => ({
        ...achievement,
        order: index,
      }))

      updateData(
        { ...data, achievements: updated },
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

  const handleToggleFeatured = useCallback(
    (achievement: Achievement) => {
      if (!data) return

      const updatedAchievements = data.achievements.map(a =>
        a.id === achievement.id ? { ...a, featured: !a.featured } : a
      )

      updateData(
        { ...data, achievements: updatedAchievements },
        {
          onSuccess: () => {
            toast.success(
              achievement.featured
                ? 'Removed from featured'
                : 'Added to featured'
            )
          },
          onError: err => {
            toast.error(err instanceof Error ? err.message : 'Failed to update')
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
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
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

  const sortedAchievements = [...data.achievements].sort(
    (a, b) => a.order - b.order
  )

  // Get current visibility (default to true if not set)
  const isVisible = data.siteConfig?.sectionVisibility?.achievements !== false

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
          sectionKey="achievements"
          isVisible={isVisible}
          onChange={handleVisibilityChange}
          disabled={isSaving}
          label="Show Achievements Section"
        />
      </div>

      {/* Main content */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Trophy className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Achievements
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your awards, publications, and accomplishments
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Plus size={18} />
            Add Achievement
          </button>
        </div>

        {/* Achievements list */}
        {sortedAchievements.length > 0 ? (
          <AchievementList
            achievements={sortedAchievements}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
            onToggleFeatured={handleToggleFeatured}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Trophy
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No achievements yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add awards, publications, and notable accomplishments
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              Add Achievement
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <AchievementFormModal
        isOpen={isFormOpen}
        achievement={editingAchievement}
        onSave={handleSave}
        onClose={handleCloseForm}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Achievement"
        message={`Are you sure you want to delete "${deleteConfirm.achievement?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
