'use client'

/**
 * Site Config Editor
 *
 * Allows customization of site branding, navigation links,
 * footer text, and SEO metadata.
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
  Settings,
  Globe,
  Navigation,
  FileText,
  Search,
  Save,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import type { SiteConfig, SectionVisibility } from '@/types/cv'
import { DEFAULT_SECTION_VISIBILITY, loadSectionVisibility } from '@/types/cv'

const navLinkSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  href: z.string().min(1, 'URL is required').max(200),
  external: z.boolean().optional(),
})

const formSchema = z.object({
  branding: z.string().min(1, 'Branding is required').max(100),
  version: z.string().min(1, 'Version is required').max(20),
  footerText: z.string().max(200),
  seoTitle: z.string().max(100),
  seoDescription: z.string().max(300),
  seoKeywords: z.string().max(500),
  ogImage: z.string().max(500),
})

type FormData = z.infer<typeof formSchema>
type NavLink = z.infer<typeof navLinkSchema>

// Use build-time version from package.json as default
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'v0.1.0'

const defaultValues: FormData = {
  branding: '~/developer',
  version: appVersion,
  footerText: '© {{year}} All rights reserved.',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  ogImage: '',
}

export function SiteConfigEditor() {
  const { data, isLoading, error, refetch } = useAdminData()
  const { mutate: updateData, isPending: isSaving } = useUpdateData()
  const toast = useToast()

  // Nav links state (managed separately for easier manipulation)
  const [navLinks, setNavLinks] = useState<NavLink[]>([])
  const [newLink, setNewLink] = useState<NavLink>({
    label: '',
    href: '',
    external: false,
  })
  const [linkErrors, setLinkErrors] = useState<{
    label?: string
    href?: string
  }>({})

  // Section visibility state (all default to true/visible)
  const [sectionVisibility, setSectionVisibility] = useState<
    Required<SectionVisibility>
  >(DEFAULT_SECTION_VISIBILITY)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Load data into form
  useEffect(() => {
    if (data?.siteConfig) {
      reset({
        branding: data.siteConfig.branding,
        version: data.siteConfig.version,
        footerText: data.siteConfig.footerText || '',
        seoTitle: data.siteConfig.seo?.title || '',
        seoDescription: data.siteConfig.seo?.description || '',
        seoKeywords: data.siteConfig.seo?.keywords?.join(', ') || '',
        ogImage: data.siteConfig.seo?.ogImage || '',
      })
      setNavLinks(data.siteConfig.navLinks || [])
      // Load section visibility using type-safe helper (defaults all to true if not set)
      setSectionVisibility(
        loadSectionVisibility(data.siteConfig.sectionVisibility)
      )
    }
  }, [data, reset])

  const addNavLink = () => {
    const result = navLinkSchema.safeParse(newLink)
    if (!result.success) {
      const fieldErrors: { label?: string; href?: string } = {}
      result.error.issues.forEach(issue => {
        if (issue.path[0] === 'label') fieldErrors.label = issue.message
        if (issue.path[0] === 'href') fieldErrors.href = issue.message
      })
      setLinkErrors(fieldErrors)
      return
    }
    // Create a clean nav link object with proper typing
    const cleanLink: NavLink = {
      label: newLink.label,
      href: newLink.href,
    }
    if (newLink.external) {
      cleanLink.external = true
    }
    setNavLinks([...navLinks, cleanLink])
    setNewLink({ label: '', href: '', external: false })
    setLinkErrors({})
  }

  const removeNavLink = (index: number) => {
    setNavLinks(navLinks.filter((_, i) => i !== index))
  }

  const onSubmit = (formData: FormData) => {
    if (!data) return

    // Parse keywords from comma-separated string
    const keywords = formData.seoKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    const siteConfig: SiteConfig = {
      branding: formData.branding,
      version: formData.version,
    }

    // Add optional fields
    if (navLinks.length > 0) {
      // Clean nav links to remove undefined external properties
      siteConfig.navLinks = navLinks.map(link => {
        const cleanLink: { label: string; href: string; external?: boolean } = {
          label: link.label,
          href: link.href,
        }
        if (link.external) {
          cleanLink.external = true
        }
        return cleanLink
      })
    }
    if (formData.footerText) {
      siteConfig.footerText = formData.footerText
    }

    // Add SEO if any fields are set
    if (
      formData.seoTitle ||
      formData.seoDescription ||
      keywords.length > 0 ||
      formData.ogImage
    ) {
      siteConfig.seo = {}
      if (formData.seoTitle) siteConfig.seo.title = formData.seoTitle
      if (formData.seoDescription)
        siteConfig.seo.description = formData.seoDescription
      if (keywords.length > 0) siteConfig.seo.keywords = keywords
      if (formData.ogImage) siteConfig.seo.ogImage = formData.ogImage
    }

    // Add section visibility settings
    siteConfig.sectionVisibility = sectionVisibility

    updateData(
      { ...data, siteConfig },
      {
        onSuccess: () => {
          toast.success('Site config updated successfully')
        },
        onError: err => {
          toast.error(
            err instanceof Error ? err.message : 'Failed to save site config'
          )
        },
      }
    )
  }

  // Watch branding for preview
  const watchedBranding = watch('branding')
  const watchedVersion = watch('version')

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6 animate-pulse" />
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-11 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
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

  // Check if we have actual changes (including nav links and section visibility)
  const hasNavLinkChanges =
    JSON.stringify(navLinks) !== JSON.stringify(data.siteConfig?.navLinks || [])

  // Build default visibility for comparison using type-safe helper
  const defaultVisibility = loadSectionVisibility(
    data.siteConfig?.sectionVisibility
  )
  const hasSectionVisibilityChanges =
    JSON.stringify(sectionVisibility) !== JSON.stringify(defaultVisibility)

  const hasChanges = isDirty || hasNavLinkChanges || hasSectionVisibilityChanges

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
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Settings
                className="text-blue-600 dark:text-blue-400"
                size={24}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Site Config
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Branding, navigation, and SEO settings
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Branding Section */}
            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Globe size={18} className="text-blue-500" />
                  Branding
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Customize how your site appears in the header and browser tab
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Site Branding *
                  </label>
                  <input
                    {...register('branding')}
                    className={`
                      w-full px-4 py-2.5 bg-white dark:bg-slate-800
                      border rounded-xl text-slate-900 dark:text-slate-100 font-mono
                      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${errors.branding ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                    `}
                    placeholder="~/arnold.dev"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Displayed in the header as your site identity
                  </p>
                  {errors.branding && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.branding.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Version *
                  </label>
                  <input
                    {...register('version')}
                    className={`
                      w-full px-4 py-2.5 bg-white dark:bg-slate-800
                      border rounded-xl text-slate-900 dark:text-slate-100 font-mono
                      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                      ${errors.version ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                    `}
                    placeholder={appVersion}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Version badge shown in footer (defaults to package.json
                    version)
                  </p>
                  {errors.version && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.version.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Footer Text
                </label>
                <input
                  {...register('footerText')}
                  className="
                    w-full px-4 py-2.5 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600 rounded-xl
                    text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  "
                  placeholder="© {{year}} All rights reserved."
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Use {'{{year}}'} for dynamic year
                </p>
              </div>
            </section>

            {/* Navigation Links Section */}
            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Navigation size={18} className="text-blue-500" />
                  Navigation Links
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Add custom links to the header navigation (e.g., Blog,
                  Portfolio, GitHub)
                </p>
              </div>

              {/* Existing Links */}
              {navLinks.length > 0 && (
                <div className="space-y-2">
                  {navLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        {link.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {link.href}
                      </span>
                      {link.external && (
                        <ExternalLink size={12} className="text-slate-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => removeNavLink(index)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Link */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newLink.label}
                  onChange={e =>
                    setNewLink({ ...newLink, label: e.target.value })
                  }
                  className={`
                    flex-1 min-w-[120px] px-3 py-2 bg-white dark:bg-slate-800
                    border rounded-lg text-sm text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                    ${linkErrors.label ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                  `}
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={newLink.href}
                  onChange={e =>
                    setNewLink({ ...newLink, href: e.target.value })
                  }
                  className={`
                    flex-1 min-w-[200px] px-3 py-2 bg-white dark:bg-slate-800
                    border rounded-lg text-sm text-slate-900 dark:text-slate-100 font-mono
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                    ${linkErrors.href ? 'border-red-300 dark:border-red-600' : 'border-slate-200 dark:border-slate-600'}
                  `}
                  placeholder="https://..."
                />
                <label className="flex items-center gap-1.5 px-2">
                  <input
                    type="checkbox"
                    checked={newLink.external || false}
                    onChange={e =>
                      setNewLink({ ...newLink, external: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-xs text-slate-500">External</span>
                </label>
                <button
                  type="button"
                  onClick={addNavLink}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </section>

            {/* SEO Section */}
            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                  <Search size={18} className="text-blue-500" />
                  SEO Settings
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Optimize how your site appears in search results and social
                  media shares
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Title
                </label>
                <input
                  {...register('seoTitle')}
                  className="
                    w-full px-4 py-2.5 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600 rounded-xl
                    text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  "
                  placeholder="Arnold Cartagena - Platform Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  {...register('seoDescription')}
                  rows={2}
                  className="
                    w-full px-4 py-2.5 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600 rounded-xl
                    text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                    resize-y
                  "
                  placeholder="Platform engineer with 8+ years of experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Keywords
                </label>
                <input
                  {...register('seoKeywords')}
                  className="
                    w-full px-4 py-2.5 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600 rounded-xl
                    text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  "
                  placeholder="platform engineer, kubernetes, cloud, devops"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Comma-separated keywords
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  OG Image URL
                </label>
                <input
                  {...register('ogImage')}
                  type="url"
                  className="
                    w-full px-4 py-2.5 bg-white dark:bg-slate-800
                    border border-slate-200 dark:border-slate-600 rounded-xl
                    text-slate-900 dark:text-slate-100
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                  "
                  placeholder="https://example.com/og-image.png"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Image shown when sharing on social media (recommended:
                  1200×630px)
                </p>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving || !hasChanges}
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
            {/* Header Preview */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
              <h2 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                <FileText size={14} />
                Header Preview
              </h2>
              <div className="flex items-center justify-between">
                <div className="font-mono text-emerald-400 text-sm">
                  {watchedBranding || '~/developer'}
                </div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                  {watchedVersion || 'v2024.1'}
                </div>
              </div>
            </div>

            {/* Nav Preview */}
            {navLinks.length > 0 && (
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
                <h2 className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-2">
                  <Navigation size={14} />
                  Navigation
                </h2>
                <div className="flex flex-wrap gap-2">
                  {navLinks.map((link, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                    >
                      {link.label}
                      {link.external && (
                        <ExternalLink
                          size={10}
                          className="inline ml-1 text-slate-500"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
              <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Search size={14} />
                Search Result Preview
              </h2>
              <div className="space-y-1">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium truncate">
                  {watch('seoTitle') || 'Page Title'}
                </div>
                <div className="text-green-700 dark:text-green-500 text-xs font-mono truncate">
                  example.com
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
                  {watch('seoDescription') ||
                    'Meta description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
