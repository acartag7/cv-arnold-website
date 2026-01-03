'use client'

/**
 * Hero Stats Editor Container
 *
 * Manages CRUD operations for homepage hero statistics.
 * Stats appear as metric cards on the hero section.
 *
 * Design: Stripe Dashboard Style
 */

import { useState, useCallback } from 'react'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Plus,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { HeroStatList } from './HeroStatList'
import { HeroStatFormModal } from './HeroStatFormModal'
import { ConfirmDialog } from '@/components/admin'
import type { HeroStat } from '@/types/cv'

export function HeroStatsEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStat, setEditingStat] = useState<HeroStat | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    stat: HeroStat | null
  }>({ isOpen: false, stat: null })

  const handleAdd = useCallback(() => {
    setEditingStat(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((stat: HeroStat) => {
    setEditingStat(stat)
    setIsFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingStat(null)
  }, [])

  const handleDeleteClick = useCallback((stat: HeroStat) => {
    setDeleteConfirm({ isOpen: true, stat })
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, stat: null })
  }, [])

  const handleSave = useCallback(
    (stat: HeroStat) => {
      if (!data) return

      const heroStats = data.heroStats || []
      const existingIndex = heroStats.findIndex(s => s.id === stat.id)
      let updatedStats: HeroStat[]

      if (existingIndex >= 0) {
        updatedStats = [...heroStats]
        updatedStats[existingIndex] = stat
      } else {
        const newStat = { ...stat, order: heroStats.length }
        updatedStats = [...heroStats, newStat]
      }

      updateData(
        { ...data, heroStats: updatedStats },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Stat updated successfully'
                : 'Stat added successfully'
            )
            handleCloseForm()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save stat'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseForm]
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!data || !deleteConfirm.stat) return

    const heroStats = data.heroStats || []
    const updatedStats = heroStats
      .filter(s => s.id !== deleteConfirm.stat!.id)
      .map((s, index) => ({ ...s, order: index }))

    updateData(
      { ...data, heroStats: updatedStats },
      {
        onSuccess: () => {
          toast.success('Stat deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete stat'
          )
        },
      }
    )
  }, [data, deleteConfirm.stat, updateData, toast, handleDeleteCancel])

  const handleReorder = useCallback(
    (reorderedStats: HeroStat[]) => {
      if (!data) return

      const updated = reorderedStats.map((stat, index) => ({
        ...stat,
        order: index,
      }))

      updateData(
        { ...data, heroStats: updated },
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
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
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

  const heroStats = data.heroStats || []
  const sortedStats = [...heroStats].sort((a, b) => a.order - b.order)

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

      {/* Main content */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <BarChart3
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Hero Stats
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage homepage statistics cards
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Plus size={18} />
            Add Stat
          </button>
        </div>

        {/* Stats list */}
        {sortedStats.length > 0 ? (
          <HeroStatList
            stats={sortedStats}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <BarChart3
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No hero stats yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add statistics to showcase on your homepage hero section
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              Add Stat
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <HeroStatFormModal
        isOpen={isFormOpen}
        stat={editingStat}
        onSave={handleSave}
        onClose={handleCloseForm}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Stat"
        message={`Are you sure you want to delete the "${deleteConfirm.stat?.label}" stat? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
