'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Code,
  Award,
  GraduationCap,
  Languages,
  Trophy,
  ExternalLink,
  Download,
  RefreshCw,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { useAdminData, useExportData } from '@/hooks/useAdminData'

/**
 * Overview card for displaying section stats
 */
interface OverviewCardProps {
  title: string
  count: number
  icon: React.ElementType
  href: string
  color: string
}

function OverviewCard({
  title,
  count,
  icon: Icon,
  href,
  color,
}: OverviewCardProps) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            {count}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Link>
  )
}

/**
 * Quick action button
 */
interface QuickActionProps {
  label: string
  icon: React.ElementType
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

function QuickAction({
  label,
  icon: Icon,
  onClick,
  href,
  variant = 'secondary',
  disabled = false,
}: QuickActionProps) {
  const baseStyles = `
    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `
  const variantStyles =
    variant === 'primary'
      ? 'bg-semantic-primary text-white hover:bg-semantic-primary/90'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'

  const content = (
    <>
      <Icon size={16} />
      <span>{label}</span>
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={`${baseStyles} ${variantStyles}`}>
        {content}
      </Link>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles}`}
    >
      {content}
    </button>
  )
}

/**
 * Admin Dashboard Component
 *
 * Displays:
 * - Overview cards with section counts
 * - Quick actions (export, view site)
 * - Loading and error states
 */
export function AdminDashboard() {
  const { data, isLoading, error, refetch, isRefetching } = useAdminData()
  const { mutate: exportData, isPending: isExporting } = useExportData()

  // Calculate section counts from CV data
  const stats = useMemo(() => {
    if (!data) return null

    return {
      experience: data.experience?.length || 0,
      skills:
        data.skills?.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0) ||
        0,
      certifications: data.certifications?.length || 0,
      education: data.education?.length || 0,
      languages: data.languages?.length || 0,
      achievements: data.achievements?.length || 0,
    }
  }, [data])

  // Handle export
  const handleExport = () => {
    exportData('json', {
      onSuccess: blob => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `cv-data-${new Date().toISOString().split('T')[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
      },
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your CV content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuickAction
            label={isRefetching ? 'Refreshing...' : 'Refresh'}
            icon={RefreshCw}
            onClick={() => refetch()}
            disabled={isRefetching}
          />
        </div>
      </div>

      {/* Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OverviewCard
            title="Experience"
            count={stats.experience}
            icon={Briefcase}
            href="/admin/experience"
            color="bg-blue-500"
          />
          <OverviewCard
            title="Skills"
            count={stats.skills}
            icon={Code}
            href="/admin/skills"
            color="bg-green-500"
          />
          <OverviewCard
            title="Certifications"
            count={stats.certifications}
            icon={Award}
            href="/admin/certifications"
            color="bg-purple-500"
          />
          <OverviewCard
            title="Education"
            count={stats.education}
            icon={GraduationCap}
            href="/admin/education"
            color="bg-orange-500"
          />
          <OverviewCard
            title="Languages"
            count={stats.languages}
            icon={Languages}
            href="/admin/languages"
            color="bg-pink-500"
          />
          <OverviewCard
            title="Achievements"
            count={stats.achievements}
            icon={Trophy}
            href="/admin/achievements"
            color="bg-yellow-500"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <QuickAction
            label={isExporting ? 'Exporting...' : 'Export JSON'}
            icon={Download}
            onClick={handleExport}
            disabled={isExporting}
          />
          <QuickAction label="View Site" icon={ExternalLink} href="/" />
        </div>
      </div>

      {/* Last Updated Info */}
      {data && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={14} />
          <span>Data version: {data.version || 'Unknown'}</span>
        </div>
      )}
    </div>
  )
}
