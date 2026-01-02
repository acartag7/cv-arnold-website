'use client'

/**
 * Languages Editor Container
 *
 * Manages CRUD operations for language proficiencies.
 * Languages don't have IDs in the schema so we use name as key.
 *
 * Design: Stripe Dashboard Style
 */

import { useState, useCallback } from 'react'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import { AlertCircle, RefreshCw, ArrowLeft, Plus, Globe } from 'lucide-react'
import Link from 'next/link'
import { LanguageList } from './LanguageList'
import { LanguageFormModal } from './LanguageFormModal'
import { ConfirmDialog } from '@/components/admin'
import type { Language } from '@/types/cv'

export function LanguagesEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    language: Language | null
  }>({ isOpen: false, language: null })

  const handleAdd = useCallback(() => {
    setEditingLanguage(null)
    setIsFormOpen(true)
  }, [])

  const handleEdit = useCallback((language: Language) => {
    setEditingLanguage(language)
    setIsFormOpen(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingLanguage(null)
  }, [])

  const handleDeleteClick = useCallback((language: Language) => {
    setDeleteConfirm({ isOpen: true, language })
  }, [])

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, language: null })
  }, [])

  const handleSave = useCallback(
    (language: Language, originalName?: string) => {
      if (!data) return

      let updatedLanguages: Language[]
      const existingIndex = data.languages.findIndex(
        l => l.name === (originalName ?? language.name)
      )

      if (existingIndex >= 0) {
        updatedLanguages = [...data.languages]
        updatedLanguages[existingIndex] = language
      } else {
        updatedLanguages = [...data.languages, language]
      }

      updateData(
        { ...data, languages: updatedLanguages },
        {
          onSuccess: () => {
            toast.success(
              existingIndex >= 0
                ? 'Language updated successfully'
                : 'Language added successfully'
            )
            handleCloseForm()
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to save language'
            )
          },
        }
      )
    },
    [data, updateData, toast, handleCloseForm]
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!data || !deleteConfirm.language) return

    const updatedLanguages = data.languages.filter(
      l => l.name !== deleteConfirm.language!.name
    )

    updateData(
      { ...data, languages: updatedLanguages },
      {
        onSuccess: () => {
          toast.success('Language deleted successfully')
          handleDeleteCancel()
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to delete language'
          )
        },
      }
    )
  }, [data, deleteConfirm.language, updateData, toast, handleDeleteCancel])

  const handleReorder = useCallback(
    (reorderedLanguages: Language[]) => {
      if (!data) return

      updateData(
        { ...data, languages: reorderedLanguages },
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
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
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
              <Globe className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Languages
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your language proficiencies
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <Plus size={18} />
            Add Language
          </button>
        </div>

        {/* Languages list */}
        {data.languages.length > 0 ? (
          <LanguageList
            languages={data.languages}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
            isSaving={isSaving}
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Globe
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No languages added yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Add languages to showcase your multilingual abilities
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              <Plus size={18} />
              Add Language
            </button>
          </div>
        )}
      </div>

      {/* Form modal */}
      <LanguageFormModal
        isOpen={isFormOpen}
        language={editingLanguage}
        onSave={handleSave}
        onClose={handleCloseForm}
        existingLanguages={data.languages.map(l => l.name)}
        isSaving={isSaving}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Language"
        message={`Are you sure you want to delete "${deleteConfirm.language?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isSaving}
      />
    </div>
  )
}
