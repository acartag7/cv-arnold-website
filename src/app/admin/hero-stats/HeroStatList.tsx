'use client'

/**
 * Hero Stat List Component
 *
 * Displays a sortable grid of hero statistics.
 *
 * @module app/admin/hero-stats/HeroStatList
 */

import { SortableList } from '@/components/admin'
import {
  Edit2,
  Trash2,
  Terminal,
  Shield,
  Cloud,
  Server,
  Code,
  Award,
  Users,
  Briefcase,
  Star,
  Trophy,
} from 'lucide-react'
import type { HeroStat } from '@/types/cv'

interface HeroStatListProps {
  stats: HeroStat[]
  onEdit: (stat: HeroStat) => void
  onDelete: (stat: HeroStat) => void
  onReorder: (stats: HeroStat[]) => void
  isSaving?: boolean
}

// Icon mapping
const iconMap: Record<HeroStat['icon'], typeof Terminal> = {
  terminal: Terminal,
  shield: Shield,
  cloud: Cloud,
  server: Server,
  code: Code,
  award: Award,
  users: Users,
  briefcase: Briefcase,
  star: Star,
  trophy: Trophy,
}

function HeroStatCard({
  stat,
  onEdit,
  onDelete,
  isSaving = false,
}: {
  stat: HeroStat
  onEdit: () => void
  onDelete: () => void
  isSaving?: boolean
}) {
  const Icon = iconMap[stat.icon]

  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-xl p-4
        transition-all
        hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600
        ${isSaving ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Icon
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div>
            {/* Value */}
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stat.value}
            </div>
            {/* Label */}
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
            aria-label={`Edit ${stat.label}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 disabled:opacity-50"
            aria-label={`Delete ${stat.label}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function HeroStatList({
  stats,
  onEdit,
  onDelete,
  onReorder,
  isSaving = false,
}: HeroStatListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SortableList
        items={stats}
        keyExtractor={stat => stat.id}
        onReorder={onReorder}
        renderItem={stat => (
          <HeroStatCard
            stat={stat}
            onEdit={() => onEdit(stat)}
            onDelete={() => onDelete(stat)}
            isSaving={isSaving}
          />
        )}
      />
    </div>
  )
}
