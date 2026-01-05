'use client'

/**
 * Theme Editor
 *
 * Allows customization of the CV theme including preset selection
 * and custom color palette editing.
 *
 * Design: Stripe Dashboard Style
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminData, useUpdateData } from '@/hooks/useAdminData'
import { useToast } from '@/components/ui/ToastProvider'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Palette,
  Sun,
  Moon,
  Monitor,
  Save,
  Check,
} from 'lucide-react'
import Link from 'next/link'
import type { ThemeConfig, ColorPalette, PalettePreset } from '@/types/cv'

// Preset palettes
const presetPalettes: Record<
  Exclude<PalettePreset, 'custom'>,
  { name: string; dark: ColorPalette; light: ColorPalette }
> = {
  green: {
    name: 'Emerald',
    dark: {
      bg: '#0a0f0e',
      surface: '#111917',
      surfaceHover: '#1a2420',
      border: '#1e2e28',
      text: '#e8f5f0',
      textMuted: '#94a8a0',
      textDim: '#5a6b64',
      accent: '#10b981',
      accentDim: '#064e3b',
    },
    light: {
      bg: '#fafdfb',
      surface: '#ffffff',
      surfaceHover: '#f0fdf4',
      border: '#d1e7dd',
      text: '#0a1f1a',
      textMuted: '#3d5a50',
      textDim: '#6b8c7e',
      accent: '#059669',
      accentDim: '#d1fae5',
    },
  },
  blue: {
    name: 'Ocean',
    dark: {
      bg: '#0a0e14',
      surface: '#111821',
      surfaceHover: '#1a242e',
      border: '#1e2e3e',
      text: '#e8f0f5',
      textMuted: '#94a8b8',
      textDim: '#5a6b7e',
      accent: '#3b82f6',
      accentDim: '#1e3a5f',
    },
    light: {
      bg: '#fafcfd',
      surface: '#ffffff',
      surfaceHover: '#f0f7ff',
      border: '#d1e3f0',
      text: '#0a1a2e',
      textMuted: '#3d5a78',
      textDim: '#6b8cae',
      accent: '#2563eb',
      accentDim: '#dbeafe',
    },
  },
  purple: {
    name: 'Violet',
    dark: {
      bg: '#0e0a14',
      surface: '#161121',
      surfaceHover: '#201a2e',
      border: '#2e1e3e',
      text: '#f0e8f5',
      textMuted: '#a894b8',
      textDim: '#6b5a7e',
      accent: '#a855f7',
      accentDim: '#4c1d95',
    },
    light: {
      bg: '#fcfafd',
      surface: '#ffffff',
      surfaceHover: '#f5f0ff',
      border: '#e3d1f0',
      text: '#1a0a2e',
      textMuted: '#5a3d78',
      textDim: '#8c6bae',
      accent: '#9333ea',
      accentDim: '#f3e8ff',
    },
  },
  orange: {
    name: 'Amber',
    dark: {
      bg: '#140e0a',
      surface: '#211611',
      surfaceHover: '#2e1a1a',
      border: '#3e2e1e',
      text: '#f5f0e8',
      textMuted: '#b8a894',
      textDim: '#7e6b5a',
      accent: '#f59e0b',
      accentDim: '#78350f',
    },
    light: {
      bg: '#fdfcfa',
      surface: '#ffffff',
      surfaceHover: '#fff7ed',
      border: '#f0e3d1',
      text: '#2e1a0a',
      textMuted: '#78503d',
      textDim: '#ae8c6b',
      accent: '#d97706',
      accentDim: '#fef3c7',
    },
  },
}

const formSchema = z.object({
  defaultTheme: z.enum(['dark', 'light', 'system']),
  allowToggle: z.boolean(),
  activePreset: z.enum(['green', 'blue', 'purple', 'orange', 'custom']),
})

type FormData = z.infer<typeof formSchema>

export function ThemeEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()
  const [previewMode, setPreviewMode] = useState<'dark' | 'light'>('dark')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultTheme: 'system',
      allowToggle: true,
      activePreset: 'green',
    },
  })

  const activePreset = watch('activePreset')
  const defaultTheme = watch('defaultTheme')

  // Load data into form
  useEffect(() => {
    if (data?.themeConfig) {
      // Cast activePreset to expected type, with fallback to 'green'
      const validPresets = [
        'green',
        'blue',
        'purple',
        'orange',
        'custom',
      ] as const
      const currentPreset = data.themeConfig.activePreset
      const activePreset = validPresets.includes(
        currentPreset as (typeof validPresets)[number]
      )
        ? (currentPreset as (typeof validPresets)[number])
        : 'green'
      reset({
        defaultTheme: data.themeConfig.defaultTheme,
        allowToggle: data.themeConfig.allowToggle,
        activePreset,
      })
    }
  }, [data, reset])

  const onSubmit = (formData: FormData) => {
    if (!data) return

    const selectedPreset =
      formData.activePreset === 'custom'
        ? null
        : presetPalettes[formData.activePreset]

    const themeConfig: ThemeConfig = {
      defaultTheme: formData.defaultTheme,
      allowToggle: formData.allowToggle,
      activePreset: formData.activePreset,
      dark:
        selectedPreset?.dark ||
        data.themeConfig?.dark ||
        presetPalettes.green.dark,
      light:
        selectedPreset?.light ||
        data.themeConfig?.light ||
        presetPalettes.green.light,
    }

    updateData(
      { ...data, themeConfig },
      {
        onSuccess: () => {
          toast.success('Theme updated successfully')
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to save theme'
          )
        },
      }
    )
  }

  // Get current preview colors
  const getPreviewColors = (): ColorPalette => {
    if (activePreset === 'custom' && data?.themeConfig) {
      const colors =
        previewMode === 'dark' ? data.themeConfig.dark : data.themeConfig.light
      // Fall back to green preset if custom colors are not defined
      return colors || presetPalettes.green[previewMode]
    }
    const preset =
      presetPalettes[activePreset as Exclude<PalettePreset, 'custom'>]
    return preset
      ? previewMode === 'dark'
        ? preset.dark
        : preset.light
      : presetPalettes.green[previewMode]
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"
                />
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

  const previewColors = getPreviewColors()

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Palette
                  className="text-blue-600 dark:text-blue-400"
                  size={24}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Theme
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customize your CV color scheme
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Default Theme */}
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Default Theme
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'system', label: 'System', icon: Monitor },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'light', label: 'Light', icon: Sun },
                ].map(option => {
                  const Icon = option.icon
                  return (
                    <label
                      key={option.value}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer
                        transition-all
                        ${
                          defaultTheme === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        {...register('defaultTheme')}
                        value={option.value}
                        className="sr-only"
                      />
                      <Icon
                        size={18}
                        className={
                          defaultTheme === option.value
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500'
                        }
                      />
                      <span
                        className={
                          defaultTheme === option.value
                            ? 'text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {option.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>

            {/* Allow Toggle */}
            <section>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('allowToggle')}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/30"
                />
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Allow theme toggle
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Let visitors switch between dark and light mode
                  </div>
                </div>
              </label>
            </section>

            {/* Preset Selection */}
            <section className="space-y-4">
              <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Color Preset
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(
                  Object.entries(presetPalettes) as [
                    Exclude<PalettePreset, 'custom'>,
                    typeof presetPalettes.green,
                  ][]
                ).map(([key, preset]) => (
                  <label
                    key={key}
                    className={`
                        relative p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${
                          activePreset === key
                            ? 'border-blue-500'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }
                      `}
                  >
                    <input
                      type="radio"
                      {...register('activePreset')}
                      value={key}
                      className="sr-only"
                    />
                    <div
                      className="h-12 rounded-lg mb-2"
                      style={{ backgroundColor: preset.dark.accent }}
                    />
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {preset.name}
                    </div>
                    {activePreset === key && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving || !isDirty}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Preview Mode Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewMode('dark')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode === 'dark'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Moon size={14} />
                Dark
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('light')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewMode === 'light'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Sun size={14} />
                Light
              </button>
            </div>

            {/* Preview Card */}
            <div
              className="rounded-2xl border p-6 transition-colors"
              style={{
                backgroundColor: previewColors.bg,
                borderColor: previewColors.border,
              }}
            >
              <h2
                className="text-sm font-medium mb-4"
                style={{ color: previewColors.textMuted }}
              >
                Preview
              </h2>

              {/* Mock Hero */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: previewColors.surface }}
              >
                <div
                  className="text-lg font-bold mb-1"
                  style={{ color: previewColors.text }}
                >
                  John Doe
                </div>
                <div
                  className="text-sm font-mono"
                  style={{ color: previewColors.accent }}
                >
                  ~/developer
                </div>
              </div>

              {/* Mock Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['8+', '50+'].map((val, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 text-center"
                    style={{ backgroundColor: previewColors.surface }}
                  >
                    <div
                      className="text-xl font-bold"
                      style={{ color: previewColors.accent }}
                    >
                      {val}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: previewColors.textMuted }}
                    >
                      {i === 0 ? 'Years' : 'Projects'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Button */}
              <button
                className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: previewColors.accent }}
              >
                Contact Me
              </button>
            </div>

            {/* Color Swatches */}
            <div
              className="rounded-2xl border p-4"
              style={{
                backgroundColor: previewColors.surface,
                borderColor: previewColors.border,
              }}
            >
              <h3
                className="text-xs font-medium mb-3"
                style={{ color: previewColors.textMuted }}
              >
                Color Palette
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Accent', color: previewColors.accent },
                  { label: 'Text', color: previewColors.text },
                  { label: 'Muted', color: previewColors.textMuted },
                  { label: 'BG', color: previewColors.bg },
                  { label: 'Surface', color: previewColors.surface },
                  { label: 'Border', color: previewColors.border },
                ].map(({ label, color }) => (
                  <div key={label} className="text-center">
                    <div
                      className="w-full h-6 rounded-md border mb-1"
                      style={{
                        backgroundColor: color,
                        borderColor: previewColors.border,
                      }}
                    />
                    <div
                      className="text-xs"
                      style={{ color: previewColors.textDim }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
