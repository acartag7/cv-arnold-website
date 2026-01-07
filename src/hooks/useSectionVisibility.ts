'use client'

/**
 * Custom hook for managing section visibility in admin editors.
 *
 * Extracts the common pattern of toggling section visibility
 * in siteConfig.sectionVisibility to reduce duplication across
 * section editor components.
 */

import { useCallback } from 'react'
import { useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import type { CVData, SectionVisibilityKey } from '@/types/cv'

interface UseSectionVisibilityOptions {
  /** Current CV data */
  data: CVData | undefined
}

interface UseSectionVisibilityReturn {
  /** Handler for visibility toggle changes */
  handleVisibilityChange: (
    sectionKey: SectionVisibilityKey,
    isVisible: boolean
  ) => void
  /** Whether the visibility update is in progress */
  isSaving: boolean
}

/**
 * Hook to manage section visibility toggle in admin editors.
 *
 * @example
 * ```tsx
 * const { handleVisibilityChange, isSaving } = useSectionVisibility({ data })
 *
 * <SectionVisibilityToggle
 *   sectionKey="experience"
 *   isVisible={data?.siteConfig?.sectionVisibility?.experience !== false}
 *   onChange={handleVisibilityChange}
 *   disabled={isSaving}
 * />
 * ```
 */
export function useSectionVisibility({
  data,
}: UseSectionVisibilityOptions): UseSectionVisibilityReturn {
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  const handleVisibilityChange = useCallback(
    (sectionKey: SectionVisibilityKey, isVisible: boolean) => {
      if (!data) return

      // Preserve existing siteConfig or provide defaults for required fields
      const existingSiteConfig = data.siteConfig ?? {
        branding: '~/cv',
        version: 'v1.0.0',
      }

      const updatedSiteConfig = {
        ...existingSiteConfig,
        sectionVisibility: {
          ...existingSiteConfig.sectionVisibility,
          [sectionKey]: isVisible,
        },
      }

      updateData(
        { ...data, siteConfig: updatedSiteConfig },
        {
          onSuccess: () => {
            toast.success(
              isVisible
                ? 'Section is now visible on public site'
                : 'Section is now hidden from public site'
            )
          },
          onError: err => {
            toast.error(
              err instanceof Error ? err.message : 'Failed to update visibility'
            )
          },
        }
      )
    },
    [data, updateData, toast]
  )

  return {
    handleVisibilityChange,
    isSaving,
  }
}
